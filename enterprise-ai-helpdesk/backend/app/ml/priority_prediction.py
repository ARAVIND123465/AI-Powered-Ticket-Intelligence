"""
priority_prediction.py
-----------------------
Module 3 of the Intelligent Ticket AI Classification system.

Predicts the PRIORITY / URGENCY of a support ticket:
    Low | Medium | High | Critical

Combines:
    1. TF-IDF text signal from subject + description
    2. Hand-crafted urgency keyword/rule features (e.g. "production down",
       "urgent", "cannot work", "security breach")
    3. Structured metadata (category, whether it's a VIP/business-critical
       requester, etc.) if available

Artifacts produced:
    models/priority_model.pkl
    models/priority_vectorizer.pkl
    models/priority_label_encoder.pkl

Train:
    python priority_prediction.py train --train datasets/train.csv --test datasets/test.csv

Predict (CLI):
    python priority_prediction.py predict --subject "Production server down" \
                                            --description "Checkout service is down for all users"

Predict (library, used by api/tickets.py):
    from app.ml.priority_prediction import PriorityPredictor
    predictor = PriorityPredictor()
    result = predictor.predict(subject=..., description=..., category="Network")
"""

import argparse
import logging
import os
import pickle
import re
from functools import lru_cache
from typing import Optional

import numpy as np
import pandas as pd
from scipy.sparse import hstack, csr_matrix
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import classification_report, accuracy_score, f1_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("priority_prediction")

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models")
MODEL_PATH = os.path.join(MODEL_DIR, "priority_model.pkl")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "priority_vectorizer.pkl")
ENCODER_PATH = os.path.join(MODEL_DIR, "priority_label_encoder.pkl")

# Keyword signals that strongly correlate with high urgency.
CRITICAL_KEYWORDS = [
    "production down", "system down", "outage", "cannot access", "security breach",
    "data loss", "all users affected", "complete failure", "server down",
    "payment failing", "cannot login", "critical", "urgent", "asap", "emergency",
]
HIGH_KEYWORDS = [
    "not working", "broken", "error", "blocked", "cannot work", "high priority",
    "multiple users", "deadline", "important",
]


# --------------------------------------------------------------------------- #
# Feature engineering
# --------------------------------------------------------------------------- #
def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"http\S+|www\.\S+", " ", text)
    text = re.sub(r"\S+@\S+", " ", text)
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def keyword_features(text: str) -> list[float]:
    """Returns [critical_hits, high_hits, exclamation_count, text_length]."""
    text_lower = text.lower()
    critical_hits = sum(1 for kw in CRITICAL_KEYWORDS if kw in text_lower)
    high_hits = sum(1 for kw in HIGH_KEYWORDS if kw in text_lower)
    exclamations = text_lower.count("!")
    length = min(len(text_lower.split()), 200) / 200.0  # normalized 0-1
    return [critical_hits, high_hits, exclamations, length]


def build_features(df: pd.DataFrame, vectorizer: TfidfVectorizer, fit: bool = False):
    """Builds combined TF-IDF + hand-crafted feature matrix."""
    subject = df.get("subject", pd.Series([""] * len(df))).fillna("")
    description = df.get("description", pd.Series([""] * len(df))).fillna("")
    raw_text = subject + " " + description
    cleaned = raw_text.apply(clean_text)

    if fit:
        tfidf_matrix = vectorizer.fit_transform(cleaned)
    else:
        tfidf_matrix = vectorizer.transform(cleaned)

    kw_matrix = np.array([keyword_features(t) for t in raw_text])
    kw_sparse = csr_matrix(kw_matrix)

    combined = hstack([tfidf_matrix, kw_sparse]).tocsr()
    return combined


# --------------------------------------------------------------------------- #
# Training
# --------------------------------------------------------------------------- #
def train(train_path: str, test_path: Optional[str], model_dir: str):
    os.makedirs(model_dir, exist_ok=True)

    logger.info("Loading training data from %s", train_path)
    train_df = pd.read_csv(train_path)

    if "priority" not in train_df.columns:
        raise ValueError("train.csv must contain a 'priority' column as the label.")

    train_df = train_df.dropna(subset=["priority"])

    if test_path and os.path.exists(test_path):
        test_df = pd.read_csv(test_path).dropna(subset=["priority"])
    else:
        logger.info("No test.csv found — splitting train.csv 80/20 instead.")
        train_df, test_df = train_test_split(
            train_df, test_size=0.2, random_state=42, stratify=train_df["priority"]
        )

    label_encoder = LabelEncoder()
    y_train = label_encoder.fit_transform(train_df["priority"].astype(str))
    y_test = label_encoder.transform(test_df["priority"].astype(str))
    logger.info("Priority classes: %s", list(label_encoder.classes_))

    vectorizer = TfidfVectorizer(
        max_features=15000, ngram_range=(1, 2), min_df=2, stop_words="english"
    )
    X_train = build_features(train_df, vectorizer, fit=True)
    X_test = build_features(test_df, vectorizer, fit=False)

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=25,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="weighted")
    logger.info("Accuracy: %.4f | Weighted F1: %.4f", acc, f1)
    logger.info(
        "\n%s",
        classification_report(y_test, y_pred, target_names=label_encoder.classes_, zero_division=0),
    )

    _save(model, MODEL_PATH)
    _save(vectorizer, VECTORIZER_PATH)
    _save(label_encoder, ENCODER_PATH)

    return {"accuracy": acc, "f1_weighted": f1}


def _save(obj, path):
    with open(path, "wb") as f:
        pickle.dump(obj, f)
    logger.info("Saved -> %s", path)


# --------------------------------------------------------------------------- #
# Inference class
# --------------------------------------------------------------------------- #
class PriorityPredictor:
    def __init__(
        self,
        model_path: str = MODEL_PATH,
        vectorizer_path: str = VECTORIZER_PATH,
        encoder_path: str = ENCODER_PATH,
    ):
        self.model = self._load(model_path, "priority model")
        self.vectorizer = self._load(vectorizer_path, "priority vectorizer")
        self.label_encoder = self._load(encoder_path, "priority label encoder")

    @staticmethod
    def _load(path: str, name: str):
        if not os.path.exists(path):
            raise FileNotFoundError(
                f"Could not find {name} at '{path}'. Run priority_prediction.py train first."
            )
        with open(path, "rb") as f:
            return pickle.load(f)

    def predict(self, subject: str, description: str = "", category: Optional[str] = None) -> dict:
        df = pd.DataFrame([{"subject": subject, "description": description}])
        X = build_features(df, self.vectorizer, fit=False)

        probabilities = self.model.predict_proba(X)[0]
        pred_idx = int(np.argmax(probabilities))
        priority = self.label_encoder.inverse_transform([pred_idx])[0]
        confidence = round(float(probabilities[pred_idx]), 4)

        # Rule-based safety net: force "Critical" if strong keyword signal
        # even if the model is unsure, so nothing catastrophic slips through.
        raw_text = f"{subject} {description}".lower()
        critical_hits = sum(1 for kw in CRITICAL_KEYWORDS if kw in raw_text)
        if critical_hits >= 2 and priority not in ("Critical", "High"):
            priority = "Critical"
            confidence = max(confidence, 0.75)

        return {
            "priority": priority,
            "confidence": confidence,
            "all_probabilities": {
                label: round(float(prob), 4)
                for label, prob in zip(self.label_encoder.classes_, probabilities)
            },
        }


@lru_cache(maxsize=1)
def get_priority_predictor() -> PriorityPredictor:
    return PriorityPredictor()


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
def parse_args():
    parser = argparse.ArgumentParser(description="Train or run the ticket priority predictor.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    train_parser = subparsers.add_parser("train", help="Train the priority model")
    train_parser.add_argument("--train", default="datasets/train.csv")
    train_parser.add_argument("--test", default="datasets/test.csv")
    train_parser.add_argument("--model-dir", default=MODEL_DIR)

    predict_parser = subparsers.add_parser("predict", help="Predict priority for one ticket")
    predict_parser.add_argument("--subject", required=True)
    predict_parser.add_argument("--description", default="")
    predict_parser.add_argument("--category", default=None)

    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()

    if args.command == "train":
        metrics = train(args.train, args.test, args.model_dir)
        logger.info("Training complete: %s", metrics)

    elif args.command == "predict":
        predictor = get_priority_predictor()
        result = predictor.predict(args.subject, args.description, args.category)
        print("\n--- Priority Prediction ---")
        print(f"Subject    : {args.subject}")
        print(f"Priority   : {result['priority']}")
        print(f"Confidence : {result['confidence']*100:.2f}%")
        print("All probabilities:")
        for label, prob in result["all_probabilities"].items():
            print(f"  - {label}: {prob*100:.2f}%")