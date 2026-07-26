"""
backend/app/rag/embeddings.py

Module 1 of the rag/ folder — embedding generation for the AI knowledge-base chat.

Responsibilities:
    - Turn raw text (KB articles, ticket resolutions, docs chunks) into dense vectors
    - Provide a single, swappable interface (`EmbeddingModel`) so the rest of the
      RAG pipeline (FAISS index, retriever, chatbot) never cares which backend
      actually produced the vectors
    - Prefer a local sentence-transformers model (fast, free, no network calls at
      query time); fall back to OpenAI-compatible embeddings API if configured;
      fall back again to a deterministic hashing-based embedder so the pipeline
      never hard-crashes in dev/CI environments without either dependency
    - Batch + cache friendly, since KB re-indexing can involve thousands of chunks

Usage:
    from app.rag.embeddings import get_embedding_model

    model = get_embedding_model()
    vectors = model.embed_texts(["How do I reset my password?", "Refund policy"])
    query_vec = model.embed_query("password reset help")
"""

from __future__ import annotations

import hashlib
import logging
import os
import struct
from dataclasses import dataclass, field
from typing import List, Optional, Sequence

logger = logging.getLogger(__name__)


# --------------------------------------------------------------------------- #
# Config
# --------------------------------------------------------------------------- #

@dataclass
class EmbeddingConfig:
    """Configuration for the embedding backend, resolved from env vars with
    sane defaults so the module works out of the box in local dev."""

    # sentence-transformers model name (used if the package is installed)
    st_model_name: str = field(
        default_factory=lambda: os.getenv(
            "EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2"
        )
    )
    # Dimensionality of the fallback hashing embedder — MiniLM is 384-dim,
    # so we match it by default to keep FAISS index configs interchangeable.
    fallback_dim: int = field(
        default_factory=lambda: int(os.getenv("EMBEDDING_FALLBACK_DIM", "384"))
    )
    # OpenAI-compatible embeddings API (optional secondary backend)
    openai_api_key: Optional[str] = field(
        default_factory=lambda: os.getenv("OPENAI_API_KEY")
    )
    openai_model: str = field(
        default_factory=lambda: os.getenv(
            "OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"
        )
    )
    batch_size: int = field(
        default_factory=lambda: int(os.getenv("EMBEDDING_BATCH_SIZE", "64"))
    )
    normalize: bool = True  # L2-normalize vectors so cosine == dot product


# --------------------------------------------------------------------------- #
# Backend interface
# --------------------------------------------------------------------------- #

class EmbeddingModel:
    """Common interface every embedding backend implements. Keeps the rest of
    the RAG pipeline (index.py, retriever.py) decoupled from backend choice."""

    dim: int
    backend_name: str = "base"

    def embed_texts(self, texts: Sequence[str]) -> List[List[float]]:
        raise NotImplementedError

    def embed_query(self, text: str) -> List[float]:
        """Single-text convenience wrapper. Some backends (e.g. OpenAI's
        `text-embedding-3-*` family) support asymmetric query/document
        prefixes — override this in subclasses if that's desired."""
        return self.embed_texts([text])[0]

    @staticmethod
    def _normalize(vec: List[float]) -> List[float]:
        norm = sum(v * v for v in vec) ** 0.5
        if norm == 0:
            return vec
        return [v / norm for v in vec]


# --------------------------------------------------------------------------- #
# Backend 1: sentence-transformers (preferred — local, free, decent quality)
# --------------------------------------------------------------------------- #

class SentenceTransformerEmbedding(EmbeddingModel):
    backend_name = "sentence-transformers"

    def __init__(self, config: EmbeddingConfig):
        from sentence_transformers import SentenceTransformer  # lazy import

        self._model = SentenceTransformer(config.st_model_name)
        self.dim = self._model.get_sentence_embedding_dimension()
        self._normalize_vecs = config.normalize

    def embed_texts(self, texts: Sequence[str]) -> List[List[float]]:
        if not texts:
            return []
        vectors = self._model.encode(
            list(texts),
            batch_size=64,
            normalize_embeddings=self._normalize_vecs,
            show_progress_bar=False,
        )
        return [v.tolist() for v in vectors]


# --------------------------------------------------------------------------- #
# Backend 2: OpenAI-compatible embeddings API
# --------------------------------------------------------------------------- #

class OpenAIEmbedding(EmbeddingModel):
    backend_name = "openai"

    # Known output dims for common OpenAI embedding models
    _DIMS = {
        "text-embedding-3-small": 1536,
        "text-embedding-3-large": 3072,
        "text-embedding-ada-002": 1536,
    }

    def __init__(self, config: EmbeddingConfig):
        from openai import OpenAI  # lazy import

        self._client = OpenAI(api_key=config.openai_api_key)
        self._model_name = config.openai_model
        self.dim = self._DIMS.get(config.openai_model, 1536)
        self._normalize_vecs = config.normalize

    def embed_texts(self, texts: Sequence[str]) -> List[List[float]]:
        if not texts:
            return []
        # Guard against pathologically long single inputs blowing the token limit
        cleaned = [t if t.strip() else " " for t in texts]
        resp = self._client.embeddings.create(
            model=self._model_name,
            input=cleaned,
        )
        vectors = [d.embedding for d in resp.data]
        if self._normalize_vecs:
            vectors = [self._normalize(v) for v in vectors]
        return vectors


# --------------------------------------------------------------------------- #
# Backend 3: dependency-free deterministic fallback
# --------------------------------------------------------------------------- #

class HashingEmbedding(EmbeddingModel):
    """
    Zero-dependency embedder used when neither sentence-transformers nor an
    OpenAI key is available (e.g. fresh dev checkout, CI, offline demo).

    Not semantically rich — it's a feature-hashed bag-of-words — but it is:
      - deterministic (same text always -> same vector)
      - fast, no network, no GPU
      - good enough for keyword-heavy KB search to keep the pipeline alive
        and testable end-to-end before a real model is wired in

    This should NOT be relied on for production-quality retrieval; it's a
    safety net so `get_embedding_model()` never raises ImportError.
    """

    backend_name = "hashing-fallback"

    def __init__(self, config: EmbeddingConfig):
        self.dim = config.fallback_dim
        self._normalize_vecs = config.normalize

    def _hash_token(self, token: str) -> int:
        digest = hashlib.md5(token.encode("utf-8")).digest()
        # unpack first 4 bytes as an unsigned int, mod into vector range
        (h,) = struct.unpack("I", digest[:4])
        return h % self.dim

    def _embed_one(self, text: str) -> List[float]:
        vec = [0.0] * self.dim
        tokens = text.lower().split()
        if not tokens:
            return vec
        for tok in tokens:
            idx = self._hash_token(tok)
            # sign hashing trick reduces collision bias
            sign = 1.0 if (self._hash_token("sign:" + tok) % 2 == 0) else -1.0
            vec[idx] += sign
        if self._normalize_vecs:
            vec = self._normalize(vec)
        return vec

    def embed_texts(self, texts: Sequence[str]) -> List[List[float]]:
        return [self._embed_one(t) for t in texts]


# --------------------------------------------------------------------------- #
# Factory / singleton
# --------------------------------------------------------------------------- #

_cached_model: Optional[EmbeddingModel] = None


def get_embedding_model(force_backend: Optional[str] = None) -> EmbeddingModel:
    """
    Resolve and cache the best available embedding backend.

    Priority order (unless force_backend is given):
        1. sentence-transformers (local, free, good quality)
        2. OpenAI embeddings API (if OPENAI_API_KEY is set)
        3. Hashing fallback (always works, lower quality)

    force_backend: one of "sentence-transformers" | "openai" | "hashing"
        Useful for tests that want to pin a specific backend.
    """
    global _cached_model
    if _cached_model is not None and force_backend is None:
        return _cached_model

    config = EmbeddingConfig()

    candidates = (
        [force_backend]
        if force_backend
        else ["sentence-transformers", "openai", "hashing"]
    )

    for backend in candidates:
        try:
            if backend == "sentence-transformers":
                model: EmbeddingModel = SentenceTransformerEmbedding(config)
            elif backend == "openai":
                if not config.openai_api_key:
                    raise RuntimeError("OPENAI_API_KEY not set")
                model = OpenAIEmbedding(config)
            elif backend == "hashing":
                model = HashingEmbedding(config)
            else:
                raise ValueError(f"Unknown embedding backend: {backend}")

            logger.info(
                "Embedding backend selected: %s (dim=%d)", model.backend_name, model.dim
            )
            if force_backend is None:
                _cached_model = model
            return model

        except Exception as exc:  # noqa: BLE001 - intentional broad fallback chain
            logger.warning("Embedding backend '%s' unavailable: %s", backend, exc)
            continue

    # Should be unreachable since "hashing" never raises, but guard anyway.
    raise RuntimeError("No embedding backend could be initialized.")


def embed_kb_chunks(
    chunks: Sequence[str], batch_size: Optional[int] = None
) -> List[List[float]]:
    """
    Convenience batch-embedding entry point for index.py (Module 2) when
    (re)building the FAISS index over a large set of KB chunks.
    """
    model = get_embedding_model()
    config = EmbeddingConfig()
    bs = batch_size or config.batch_size

    all_vectors: List[List[float]] = []
    for i in range(0, len(chunks), bs):
        batch = chunks[i : i + bs]
        all_vectors.extend(model.embed_texts(batch))
    return all_vectors