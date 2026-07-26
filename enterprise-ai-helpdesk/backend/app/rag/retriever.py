"""
backend/app/rag/retriever.py

Module 3 of the rag/ folder — retrieval layer for the AI knowledge-base chat.

Responsibilities:
    - Take a raw user question and turn it into a clean, ranked set of
      context chunks for chatbot.py to feed to the LLM
    - Sit on top of KBIndex (index.py): query rewriting, over-fetch + re-rank,
      cross-source dedup, and a relevance floor so the chatbot doesn't get
      handed garbage context when nothing in the KB is actually relevant
    - Support hybrid retrieval: vector search (semantic) + light keyword
      boosting (exact term overlap), since support queries are often short
      and contain exact product/error terms that pure embeddings can miss
    - Merge results across source types (kb articles, past ticket
      resolutions, docs) with source-aware weighting, since a resolved
      ticket about the exact same issue is often more useful than a
      generic KB article

Usage:
    from app.rag.retriever import Retriever

    retriever = Retriever()
    result = retriever.retrieve("customer says refund never showed up")
    for chunk in result.chunks:
        print(chunk.score, chunk.title, chunk.text[:100])
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Sequence, Set

from app.rag.index import KBIndex

logger = logging.getLogger(__name__)


# --------------------------------------------------------------------------- #
# Config
# --------------------------------------------------------------------------- #

@dataclass
class RetrieverConfig:
    top_k: int = 5
    # over-fetch multiplier before re-ranking/dedup trims back down to top_k
    fetch_multiplier: int = 4
    # chunks scoring below this cosine similarity are dropped entirely
    # rather than handed to the LLM as weak/misleading context
    min_score: float = 0.22
    # per-source relevance weighting applied on top of raw vector score
    source_weights: Dict[str, float] = field(
        default_factory=lambda: {
            "ticket_resolution": 1.15,  # a solved identical ticket is gold
            "kb": 1.0,
            "doc": 0.9,
        }
    )
    # keyword overlap boost: fraction of query tokens found verbatim in the
    # chunk, scaled by this weight and added to the vector score
    keyword_boost_weight: float = 0.15
    # cap how many chunks can come from the same doc_id, so one long KB
    # article doesn't crowd out everything else
    max_chunks_per_doc: int = 2


_STOPWORDS = {
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "to", "of", "and", "or", "for", "in", "on", "at", "with", "my", "i",
    "it", "this", "that", "how", "do", "does", "did", "can", "why", "what",
}


# --------------------------------------------------------------------------- #
# Result types
# --------------------------------------------------------------------------- #

@dataclass
class RetrievedChunk:
    chunk_id: str
    doc_id: str
    title: str
    url: str
    source: str
    text: str
    score: float          # final blended/re-ranked score
    raw_vector_score: float


@dataclass
class RetrievalResult:
    query: str
    chunks: List[RetrievedChunk]

    @property
    def is_empty(self) -> bool:
        return len(self.chunks) == 0

    def to_context_string(self, max_chars: int = 4000) -> str:
        """
        Render retrieved chunks into a single context block ready to splice
        into the chatbot's prompt (Module 4). Each chunk is tagged with its
        source so the LLM can cite it back to the user.
        """
        parts = []
        used = 0
        for i, chunk in enumerate(self.chunks, start=1):
            label = chunk.title or chunk.doc_id
            block = f"[{i}] Source: {label} ({chunk.source})\n{chunk.text}\n"
            if used + len(block) > max_chars:
                break
            parts.append(block)
            used += len(block)
        return "\n".join(parts)


# --------------------------------------------------------------------------- #
# Query normalization
# --------------------------------------------------------------------------- #

def _tokenize(text: str) -> List[str]:
    tokens = re.findall(r"[a-z0-9]+", text.lower())
    return [t for t in tokens if t not in _STOPWORDS and len(t) > 1]


def _clean_query(raw_query: str) -> str:
    """
    Light query cleanup: strip boilerplate ticket-signature noise ("Best
    regards, ...", email quoting artifacts) that would otherwise dilute the
    embedding. Full query rewriting (e.g. LLM-based reformulation) can be
    layered in later behind this same function.
    """
    q = raw_query.strip()
    q = re.sub(r"^(re|fwd)\s*:\s*", "", q, flags=re.IGNORECASE)
    q = re.sub(r"\s+", " ", q)
    return q


# --------------------------------------------------------------------------- #
# Retriever
# --------------------------------------------------------------------------- #

class Retriever:
    def __init__(
        self,
        index: Optional[KBIndex] = None,
        config: Optional[RetrieverConfig] = None,
    ):
        self.index = index or KBIndex.load_or_create()
        self.config = config or RetrieverConfig()

    def retrieve(
        self,
        raw_query: str,
        top_k: Optional[int] = None,
        source_filter: Optional[str] = None,
    ) -> RetrievalResult:
        """
        Main entry point. Returns a RetrievalResult ready for chatbot.py.

        top_k: override the configured default
        source_filter: restrict to one source type (see index.py upsert docs)
        """
        cfg = self.config
        k = top_k or cfg.top_k
        query = _clean_query(raw_query)

        if not query:
            return RetrievalResult(query=raw_query, chunks=[])

        fetch_k = max(k * cfg.fetch_multiplier, k)
        raw_hits = self.index.search(query, k=fetch_k, source_filter=source_filter)

        if not raw_hits:
            logger.info("Retriever: no hits for query=%r", query)
            return RetrievalResult(query=raw_query, chunks=[])

        query_tokens = set(_tokenize(query))
        reranked = self._rerank(raw_hits, query_tokens)
        deduped = self._dedup_and_cap(reranked)

        final = [c for c in deduped if c.score >= cfg.min_score][:k]

        logger.info(
            "Retriever: query=%r -> %d raw hits, %d after rerank/dedup, %d final",
            query, len(raw_hits), len(deduped), len(final),
        )
        return RetrievalResult(query=raw_query, chunks=final)

    # ------------------------------------------------------------------ #
    # Internals
    # ------------------------------------------------------------------ #

    def _rerank(
        self, raw_hits: List[dict], query_tokens: Set[str]
    ) -> List[RetrievedChunk]:
        cfg = self.config
        out: List[RetrievedChunk] = []

        for hit in raw_hits:
            vector_score = hit["score"]
            source = hit.get("source", "kb")
            weight = cfg.source_weights.get(source, 1.0)

            chunk_tokens = set(_tokenize(hit["text"]))
            overlap = (
                len(query_tokens & chunk_tokens) / len(query_tokens)
                if query_tokens
                else 0.0
            )
            keyword_boost = overlap * cfg.keyword_boost_weight

            final_score = (vector_score * weight) + keyword_boost

            out.append(
                RetrievedChunk(
                    chunk_id=hit["chunk_id"],
                    doc_id=hit["doc_id"],
                    title=hit.get("title", ""),
                    url=hit.get("url", ""),
                    source=source,
                    text=hit["text"],
                    score=round(final_score, 4),
                    raw_vector_score=vector_score,
                )
            )

        out.sort(key=lambda c: c.score, reverse=True)
        return out

    def _dedup_and_cap(
        self, chunks: List[RetrievedChunk]
    ) -> List[RetrievedChunk]:
        """
        - Drops near-duplicate chunks (same doc_id + near-identical text)
        - Caps how many chunks can come from a single doc_id so one long
          article doesn't dominate the context window
        """
        cfg = self.config
        seen_text_fingerprints: Set[str] = set()
        per_doc_count: Dict[str, int] = {}
        out: List[RetrievedChunk] = []

        for chunk in chunks:
            fingerprint = re.sub(r"\W+", "", chunk.text.lower())[:120]
            if fingerprint in seen_text_fingerprints:
                continue

            doc_count = per_doc_count.get(chunk.doc_id, 0)
            if doc_count >= cfg.max_chunks_per_doc:
                continue

            seen_text_fingerprints.add(fingerprint)
            per_doc_count[chunk.doc_id] = doc_count + 1
            out.append(chunk)

        return out

    # ------------------------------------------------------------------ #
    # Convenience: multi-query retrieval (useful for chatbot.py when it
    # wants to retrieve on both the latest message and a summarized thread)
    # ------------------------------------------------------------------ #

    def retrieve_multi(
        self, queries: Sequence[str], top_k: Optional[int] = None
    ) -> RetrievalResult:
        """
        Runs retrieval across several query variants (e.g. raw message +
        LLM-paraphrased query) and merges results, keeping the best score
        per chunk. Useful for improving recall on terse support messages.
        """
        cfg = self.config
        k = top_k or cfg.top_k
        best_by_chunk: Dict[str, RetrievedChunk] = {}

        for q in queries:
            result = self.retrieve(q, top_k=k)
            for chunk in result.chunks:
                existing = best_by_chunk.get(chunk.chunk_id)
                if existing is None or chunk.score > existing.score:
                    best_by_chunk[chunk.chunk_id] = chunk

        merged = sorted(best_by_chunk.values(), key=lambda c: c.score, reverse=True)
        deduped = self._dedup_and_cap(merged)[:k]
        return RetrievalResult(query=" | ".join(queries), chunks=deduped)