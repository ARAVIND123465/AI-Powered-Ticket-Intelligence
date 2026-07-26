"""
train_classifier.py
--------------------
Module 1 of the Intelligent Ticket AI Classification system.

Trains a TF-IDF + ML classifier that predicts the CATEGORY of an incoming
support ticket (e.g. "Network", "Hardware", "Software", "Access Request",
"Billing", etc.) based on its subject + description text.

Artifacts produced (used later by classify_ticket.py):
    models/ticket_classifier.pkl
    models/tfidf_vectorizer.pkl
    models/label_encoder.pkl

Run:
    python train_classifier.py --train datasets/train.csv --test datasets/test.csv
"""

import argparse
import logging
import os
import pickle
import re

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score, f1_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("train_classifier")

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "models")


# --------------------------------------------------------------------------- #
# Text preprocessing
# --------------------------------------------------------------------------- #
def clean_text(text: str) -> str:
    """Basic cleanup for ticket text before vectorization."""
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r"http\S+|www\.\S+", " ", text)          # URLs
    text = re.sub(r"\S+@\S+", " ", text)                    # emails
    text = re.sub(r"[^a-z0-9\s]", " ", text)                # punctuation/special chars
    text = re.sub(r"\s+", " ", text).strip()
    return text


def build_corpus(df: pd.DataFrame) -> pd.Series:
    """Combine subject + description into a single text field."""
    subject = df.get("subject", "")
    description = df.get("description", "")
    combined = (subject.fillna("") + " " + description.fillna(""))
    return combined.apply(clean_text)


# --------------------------------------------------------------------------- #
# Training pipeline
# --------------------------------------------------------------------------- #
def train(train_path: str, test_path: str | None, model_dir: str, model_type: str):
    os.makedirs(model_dir, exist_ok=True)

    logger.info("Loading training data from %s", train_path)
    train_df = pd.read_csv(train_path)

    if "category" not in train_df.columns:
        raise ValueError("train.csv must contain a 'category' column as the label.")

    train_df = train_df.dropna(subset=["category"])
    X_text = build_corpus(train_df)
    y_raw = train_df["category"].astype(str)

    # If no separate test file is provided, split train.csv
    if test_path and os.path.exists(test_path):
        test_df = pd.read_csv(test_path)
        test_df = test_df.dropna(subset=["category"])
        X_test_text = build_corpus(test_df)
        y_test_raw = test_df["category"].astype(str)
        X_train_text, y_train_raw = X_text, y_raw
    else:
        logger.info("No test.csv found — splitting train.csv 80/20 instead.")
        X_train_text, X_test_text, y_train_raw, y_test_raw = train_test_split(
            X_text, y_raw, test_size=0.2, random_state=42, stratify=y_raw
        )

    # Encode labels
    label_encoder = LabelEncoder()
    y_train = label_encoder.fit_transform(y_train_raw)
    y_test = label_encoder.transform(y_test_raw)

    logger.info("Classes: %s", list(label_encoder.classes_))

    # Vectorize
    vectorizer = TfidfVectorizer(
        max_features=20000,
        ngram_range=(1, 2),
        min_df=2,
        sublinear_tf=True,
        stop_words="english",
    )
    X_train = vectorizer.fit_transform(X_train_text)
    X_test = vectorizer.transform(X_test_text)

    # Model selection
    logger.info("Training model type: %s", model_type)
    if model_type == "svm":
        base_model = LinearSVC(C=1.0, class_weight="balanced", max_iter=5000)
        model = CalibratedClassifierCV(base_model, cv=3)  # adds predict_proba support
    else:
        model = LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            C=2.0,
            multi_class="auto",
        )

    model.fit(X_train, y_train)

    # Evaluation
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="weighted")

    logger.info("Accuracy: %.4f | Weighted F1: %.4f", acc, f1)
    logger.info(
        "\n%s",
        classification_report(
            y_test, y_pred, target_names=label_encoder.classes_, zero_division=0
        ),
    )

    # Persist artifacts
    _save_pickle(model, os.path.join(model_dir, "ticket_classifier.pkl"))
    _save_pickle(vectorizer, os.path.join(model_dir, "tfidf_vectorizer.pkl"))
    _save_pickle(label_encoder, os.path.join(model_dir, "label_encoder.pkl"))

    logger.info("Artifacts saved to %s", os.path.abspath(model_dir))
    return {"accuracy": acc, "f1_weighted": f1}


def _save_pickle(obj, path: str):
    with open(path, "wb") as f:
        pickle.dump(obj, f)
    logger.info("Saved -> %s", path)


# --------------------------------------------------------------------------- #
# CLI entry point
# --------------------------------------------------------------------------- #
def parse_args():
    parser = argparse.ArgumentParser(description="Train the ticket category classifier.")
    parser.add_argument("--train", default="datasets/train.csv", help="Path to train.csv")
    parser.add_argument("--test", default="datasets/test.csv", help="Path to test.csv (optional)")
    parser.add_argument("--model-dir", default=MODEL_DIR, help="Where to save model artifacts")
    parser.add_argument(
        "--model-type",
        choices=["logreg", "svm"],
        default="logreg",
        help="Underlying classifier: logreg (fast, probas) or svm (often higher accuracy)",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    metrics = train(args.train, args.test, args.model_dir, args.model_type)
    logger.info("Training complete: %s", metrics)