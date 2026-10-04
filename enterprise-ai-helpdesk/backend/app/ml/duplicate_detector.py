"""
duplicate_detector.py
----------------------
Module 4 of the Intelligent Ticket AI Classification system.

Detects whether a newly submitted ticket is a likely DUPLICATE of an
already-open ticket, using TF-IDF + cosine similarity over ticket text.

Design notes:
    - Uses the same lightweight TF-IDF approach as the other modules so it
      has no extra runtime dependency (no external embedding API call needed
      for this check). For semantic/RAG-style duplicate detection across a
      larger corpus, see rag/embeddings.py + rag/faiss_index.py instead —
      this module is for FAST, real-time duplicate checks at ticket-creation
      time against currently OPEN tickets only.
    - Rebuilds its TF-IDF index from the open tickets pulled from the DB
      (via ticket_service.py) or from a provided list, so it always reflects
      current state instead of a stale trained artifact.

Usage (library, called from api/tickets.py when a ticket is created):
    from app.ml.duplicate_detector import DuplicateDetector

    detector = DuplicateDetector(similarity_threshold=0.6)
    detector.fit(open_tickets)   # list of {"id": ..., "subject": ..., "description": ...}
    result = detector.check(new_subject, new_description)
    # result = {
    #     "is_duplicate": True,
    #     "matches": [
    #         {"ticket_id": 4231, "similarity": 0.82, "subject": "VPN not connecting"},
    #         ...
    #     ]
    # }

Usage (CLI, for quick manual testing against a CSV of tickets):
    python duplicate_detector.py --tickets datasets/historical_tickets.csv \
                                   --subject "VPN not connecting" \
                                   --description "Cannot connect to office VPN"
"""

import argparse
import logging
import re
from typing import Optional

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("duplicate_detector")


def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"http\S+|www\.\S+", " ", text)
    text = re.sub(r"\S+@\S+", " ", text)
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


class DuplicateDetector:
    """
    Fit this on the current set of OPEN tickets, then check new incoming
    tickets against them. Meant to be re-fit periodically (e.g. every time
    a ticket is created/closed) rather than persisted as a static artifact,
    since "open tickets" changes constantly.
    """

    def __init__(self, similarity_threshold: float = 0.50, max_matches: int = 5):
        self.similarity_threshold = similarity_threshold
        self.max_matches = max_matches
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix = None
        self.embeddings_matrix = None
        self.tickets: list[dict] = []

    def fit(self, tickets: list[dict]):
        """
        tickets: list of dicts, each with at least:
            {"id": <ticket_id>, "subject": <str>, "description": <str>}
        Only OPEN / unresolved tickets should be passed in here.
        """
        self.tickets = tickets

        if not tickets:
            self.vectorizer = None
            self.tfidf_matrix = None
            self.embeddings_matrix = None
            logger.info("No open tickets provided — duplicate index is empty.")
            return

        corpus = [
            clean_text(f"{t.get('subject', '')} {t.get('description', '')}")
            for t in tickets
        ]

        self.vectorizer = TfidfVectorizer(
            max_features=10000, ngram_range=(1, 2), min_df=1, stop_words="english"
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)

        # Compute semantic embeddings for hybrid matching
        try:
            from app.rag.embeddings import get_embedding_model
            model = get_embedding_model()
            self.embeddings_matrix = np.array(model.embed_texts(corpus))
        except Exception as e:
            logger.info("Semantic embedding skipped in duplicate detector: %s", e)
            self.embeddings_matrix = None

        logger.info("Duplicate index built from %d open tickets.", len(tickets))

    def check(self, subject: str, description: str = "") -> dict:
        """
        Compares the new ticket text against the fitted open-ticket index.
        Returns is_duplicate=True if any existing ticket exceeds the
        similarity_threshold.
        """
        if self.vectorizer is None or self.tfidf_matrix is None or not self.tickets:
            return {"is_duplicate": False, "matches": []}

        query_text = clean_text(f"{subject} {description}")
        if not query_text.strip():
            return {"is_duplicate": False, "matches": []}

        query_vec = self.vectorizer.transform([query_text])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix)[0]

        # Blend with semantic embeddings
        if self.embeddings_matrix is not None and len(self.embeddings_matrix) > 0:
            try:
                from app.rag.embeddings import get_embedding_model
                model = get_embedding_model()
                q_emb = np.array(model.embed_query(query_text))
                sem_sims = np.dot(self.embeddings_matrix, q_emb)
                # Take max of lexical TF-IDF and semantic similarity
                similarities = np.maximum(similarities, sem_sims)
            except Exception as e:
                logger.info("Semantic similarity fallback in check: %s", e)

        top_indices = np.argsort(similarities)[::-1][: self.max_matches]

        matches = []
        for idx in top_indices:
            score = float(similarities[idx])
            if score >= self.similarity_threshold:
                ticket = self.tickets[idx]
                matches.append(
                    {
                        "ticket_id": ticket.get("id"),
                        "subject": ticket.get("subject"),
                        "similarity": round(score, 4),
                    }
                )

        return {
            "is_duplicate": len(matches) > 0,
            "matches": matches,
        }


# --------------------------------------------------------------------------- #
# CLI entry point — useful for testing against historical_tickets.csv
# --------------------------------------------------------------------------- #
def parse_args():
    parser = argparse.ArgumentParser(description="Check a ticket against existing tickets for duplicates.")
    parser.add_argument("--tickets", default="datasets/historical_tickets.csv", help="CSV of existing tickets")
    parser.add_argument("--subject", required=True, help="Subject of the new ticket")
    parser.add_argument("--description", default="", help="Description of the new ticket")
    parser.add_argument("--threshold", type=float, default=0.6, help="Cosine similarity threshold")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()

    df = pd.read_csv(args.tickets)
    if "id" not in df.columns:
        df["id"] = df.index

    open_tickets = df.to_dict(orient="records")

    detector = DuplicateDetector(similarity_threshold=args.threshold)
    detector.fit(open_tickets)
    result = detector.check(args.subject, args.description)

    print("\n--- Duplicate Detection Result ---")
    print(f"New ticket subject : {args.subject}")
    print(f"Is duplicate?       : {result['is_duplicate']}")
    if result["matches"]:
        print("Similar tickets found:")
        for m in result["matches"]:
            print(f"  - #{m['ticket_id']} \"{m['subject']}\" (similarity: {m['similarity']*100:.1f}%)")
    else:
        print("No similar open tickets found.")