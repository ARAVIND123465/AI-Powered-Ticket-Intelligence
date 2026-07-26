"""
classify_ticket.py
-------------------
Module 2 of the Intelligent Ticket AI Classification system.

Loads the artifacts produced by train_classifier.py:
    models/ticket_classifier.pkl
    models/tfidf_vectorizer.pkl
    models/label_encoder.pkl

and exposes a simple, importable API for real-time inference — meant to be
called from api/tickets.py when a ticket is created, or from api/chatbot.py.

Usage (as a library):
    from app.ml.classify_ticket import TicketClassifier

    classifier = TicketClassifier()
    result = classifier.predict(
        subject="VPN not connecting",
        description="I can't connect to the office VPN since this morning."
    )
    # result = {
    #     "category": "Network",
    #     "confidence": 0.87,
    #     "top_predictions": [
    #         {"category": "Network", "confidence": 0.87},
    #         {"category": "Software", "confidence": 0.08},
    #         {"category": "Hardware", "confidence": 0.03},
    #     ]
    # }

Usage (CLI, for quick testing):
    python classify_ticket.py --subject "VPN not connecting" \
                               --description "Can't connect since this morning"
"""

import argparse
import logging
import os
import pickle
import re
from functools import lru_cache
from typing import Optional

import numpy as np

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("classify_ticket")

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models")

CLASSIFIER_PATH = os.path.join(MODEL_DIR, "ticket_classifier.pkl")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl")
ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.pkl")


def clean_text(text: str) -> str:
    """Must mirror the preprocessing used in train_classifier.py."""
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"http\S+|www\.\S+", " ", text)
    text = re.sub(r"\S+@\S+", " ", text)
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


class TicketClassifier:
    """
    Thin wrapper around the trained TF-IDF + classifier pipeline.
    Loads artifacts once and reuses them for every prediction (singleton-style
    via the module-level get_classifier() cache below).
    """

    def __init__(
        self,
        classifier_path: str = CLASSIFIER_PATH,
        vectorizer_path: str = VECTORIZER_PATH,
        encoder_path: str = ENCODER_PATH,
        confidence_threshold: float = 0.35,
    ):
        self.confidence_threshold = confidence_threshold
        self.model = self._load(classifier_path, "classifier")
        self.vectorizer = self._load(vectorizer_path, "vectorizer")
        self.label_encoder = self._load(encoder_path, "label encoder")

    @staticmethod
    def _load(path: str, name: str):
        if not os.path.exists(path):
            raise FileNotFoundError(
                f"Could not find {name} at '{path}'. "
                f"Run train_classifier.py first to generate model artifacts."
            )
        with open(path, "rb") as f:
            obj = pickle.load(f)
        logger.info("Loaded %s from %s", name, path)
        return obj

    def predict(
        self,
        subject: str,
        description: str = "",
        top_k: int = 3,
    ) -> dict:
        """
        Predict the category of a ticket.

        Returns a dict with:
            category            -> best predicted label
            confidence           -> probability of the best label (0-1)
            is_confident          -> whether confidence passes self.confidence_threshold
            top_predictions       -> list of {category, confidence} for top_k classes
        """
        text = clean_text(f"{subject} {description}")

        if not text.strip():
            return {
                "category": "Uncategorized",
                "confidence": 0.0,
                "is_confident": False,
                "top_predictions": [],
            }

        X = self.vectorizer.transform([text])

        # Both LogisticRegression and the CalibratedClassifierCV(LinearSVC)
        # from train_classifier.py support predict_proba.
        probabilities = self.model.predict_proba(X)[0]

        top_indices = np.argsort(probabilities)[::-1][:top_k]
        top_predictions = [
            {
                "category": self.label_encoder.inverse_transform([idx])[0],
                "confidence": round(float(probabilities[idx]), 4),
            }
            for idx in top_indices
        ]

        best = top_predictions[0]

        return {
            "category": best["category"],
            "confidence": best["confidence"],
            "is_confident": best["confidence"] >= self.confidence_threshold,
            "top_predictions": top_predictions,
        }

    def predict_batch(self, tickets: list[dict]) -> list[dict]:
        """
        Classify multiple tickets at once.
        tickets: list of {"subject": str, "description": str}
        """
        return [
            self.predict(t.get("subject", ""), t.get("description", ""))
            for t in tickets
        ]


# --------------------------------------------------------------------------- #
# Module-level cached singleton — avoids reloading pickle files on every
# request when called from FastAPI endpoints.
# --------------------------------------------------------------------------- #
@lru_cache(maxsize=1)
def get_classifier() -> TicketClassifier:
    return TicketClassifier()


# --------------------------------------------------------------------------- #
# CLI entry point for quick manual testing
# --------------------------------------------------------------------------- #
def parse_args():
    parser = argparse.ArgumentParser(description="Classify a single ticket from the CLI.")
    parser.add_argument("--subject", required=True, help="Ticket subject line")
    parser.add_argument("--description", default="", help="Ticket description/body")
    parser.add_argument("--top-k", type=int, default=3, help="Number of top predictions to show")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    clf = get_classifier()
    result = clf.predict(args.subject, args.description, top_k=args.top_k)

    print("\n--- Ticket Classification Result ---")
    print(f"Subject     : {args.subject}")
    print(f"Category    : {result['category']}")
    print(f"Confidence  : {result['confidence']*100:.2f}%")
    print(f"Confident?  : {result['is_confident']}")
    print("Top predictions:")
    for pred in result["top_predictions"]:
        print(f"  - {pred['category']}: {pred['confidence']*100:.2f}%")