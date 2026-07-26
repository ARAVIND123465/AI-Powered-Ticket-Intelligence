"""
sentiment_analysis.py
----------------------
Module 6 of the Intelligent Ticket AI Classification system.

Analyzes the SENTIMENT / EMOTIONAL TONE of a ticket (and its follow-up
replies) to detect customer frustration early. Used to:
    - Feed into priority_prediction.py as an escalation signal
      (a "Frustrated" + "High" priority ticket can be auto-escalated)
    - Power CSAT / customer-health insights on the Analytics dashboard
    - Flag tickets for human review before an AI auto-response is sent

Design notes:
    - Uses VADER (via the lightweight `vaderSentiment` package) as the core
      polarity engine — good for short, informal, punctuation/caps-heavy
      support text ("THIS IS RIDICULOUS!!!"), and needs no training data or
      GPU, unlike a fine-tuned transformer.
    - Layers a frustration-specific keyword/pattern boost on top of VADER's
      compound score, since plain sentiment models often under-react to
      customer-support-specific frustration language (e.g. "third time
      asking", "still not fixed", "escalate this now").
    - Falls back to a small rule-based lexicon scorer if vaderSentiment
      isn't installed, so this module never hard-fails.

Usage (library, called from api/tickets.py or ai/insights.py):
    from app.ml.sentiment_analysis import SentimentAnalyzer

    analyzer = SentimentAnalyzer()
    result = analyzer.analyze("This is the third time I'm reporting this. Fix it now!")
    # result = {
    #     "sentiment": "Frustrated",
    #     "polarity_score": -0.82,
    #     "is_frustrated": True,
    #     "escalation_recommended": True
    # }

Usage (CLI):
    python sentiment_analysis.py --text "This is the third time I'm reporting this!"
"""

import argparse
import logging
import re
from functools import lru_cache
from typing import Optional

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("sentiment_analysis")

try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    VADER_AVAILABLE = True
except ImportError:
    VADER_AVAILABLE = False
    logger.warning("vaderSentiment not installed — using fallback lexicon scorer. "
                    "Add 'vaderSentiment' to requirements.txt for better accuracy.")

# Support-specific frustration signals VADER alone tends to under-weight.
FRUSTRATION_PHRASES = [
    "third time", "again and again", "still not fixed", "still not working",
    "how many times", "no one has responded", "no response", "waiting for days",
    "waiting for weeks", "escalate", "unacceptable", "ridiculous", "fed up",
    "sick of this", "worst support", "never had this issue", "cancel my",
    "speak to a manager", "this is a joke", "completely unacceptable",
]

# Minimal fallback lexicon used only if vaderSentiment isn't installed.
_POSITIVE_WORDS = {"thanks", "great", "awesome", "resolved", "appreciate", "good", "perfect", "excellent"}
_NEGATIVE_WORDS = {"bad", "broken", "issue", "problem", "error", "fail", "wrong", "slow", "down", "cannot", "can't"}


def _clean(text: str) -> str:
    return text.strip() if isinstance(text, str) else ""


def _frustration_boost(text: str) -> float:
    """Returns a negative boost (0 to -0.4) based on frustration phrases and formatting cues."""
    lower = text.lower()
    phrase_hits = sum(1 for p in FRUSTRATION_PHRASES if p in lower)

    caps_words = re.findall(r"\b[A-Z]{3,}\b", text)
    exclamations = text.count("!")

    boost = 0.0
    boost -= min(phrase_hits * 0.15, 0.3)
    boost -= min(len(caps_words) * 0.05, 0.1)
    boost -= min(exclamations * 0.03, 0.1)
    return max(boost, -0.4)


def _fallback_score(text: str) -> float:
    """Very simple lexicon-based polarity score in range [-1, 1], used only without VADER."""
    words = re.findall(r"[a-z']+", text.lower())
    if not words:
        return 0.0
    pos = sum(1 for w in words if w in _POSITIVE_WORDS)
    neg = sum(1 for w in words if w in _NEGATIVE_WORDS)
    total = pos + neg
    if total == 0:
        return 0.0
    return (pos - neg) / total


class SentimentAnalyzer:
    def __init__(
        self,
        frustrated_threshold: float = -0.5,
        negative_threshold: float = -0.15,
        positive_threshold: float = 0.15,
    ):
        self.frustrated_threshold = frustrated_threshold
        self.negative_threshold = negative_threshold
        self.positive_threshold = positive_threshold

        self._vader = SentimentIntensityAnalyzer() if VADER_AVAILABLE else None

    def _base_polarity(self, text: str) -> float:
        if self._vader is not None:
            return self._vader.polarity_scores(text)["compound"]
        return _fallback_score(text)

    def analyze(self, text: str, subject: str = "") -> dict:
        """
        Returns:
            sentiment               -> "Positive" | "Neutral" | "Negative" | "Frustrated"
            polarity_score           -> float in [-1, 1], lower = more negative
            is_frustrated             -> bool
            escalation_recommended    -> bool (True if Frustrated, suggests human review)
        """
        full_text = _clean(f"{subject} {text}")

        if not full_text:
            return {
                "sentiment": "Neutral",
                "polarity_score": 0.0,
                "is_frustrated": False,
                "escalation_recommended": False,
            }

        base_score = self._base_polarity(full_text)
        boost = _frustration_boost(full_text)
        final_score = max(-1.0, min(1.0, base_score + boost))

        if final_score <= self.frustrated_threshold:
            sentiment = "Frustrated"
        elif final_score <= self.negative_threshold:
            sentiment = "Negative"
        elif final_score >= self.positive_threshold:
            sentiment = "Positive"
        else:
            sentiment = "Neutral"

        is_frustrated = sentiment == "Frustrated"

        return {
            "sentiment": sentiment,
            "polarity_score": round(final_score, 4),
            "is_frustrated": is_frustrated,
            "escalation_recommended": is_frustrated,
        }

    def analyze_thread(self, messages: list[str]) -> dict:
        """
        Analyzes a full ticket conversation thread (list of message strings,
        oldest -> newest) and detects whether sentiment is DETERIORATING,
        which is often a stronger escalation signal than a single message.
        """
        if not messages:
            return {"trend": "Neutral", "scores": [], "is_deteriorating": False}

        scores = [self.analyze(m)["polarity_score"] for m in messages]

        is_deteriorating = False
        if len(scores) >= 2:
            # Compare first-half average vs second-half average
            mid = len(scores) // 2
            first_half_avg = sum(scores[:mid or 1]) / max(mid, 1)
            second_half_avg = sum(scores[mid:]) / max(len(scores) - mid, 1)
            is_deteriorating = second_half_avg < first_half_avg - 0.2

        latest = scores[-1]
        if latest <= self.frustrated_threshold:
            trend = "Frustrated"
        elif latest <= self.negative_threshold:
            trend = "Negative"
        elif latest >= self.positive_threshold:
            trend = "Positive"
        else:
            trend = "Neutral"

        return {
            "trend": trend,
            "scores": scores,
            "is_deteriorating": is_deteriorating,
        }


@lru_cache(maxsize=1)
def get_sentiment_analyzer() -> SentimentAnalyzer:
    return SentimentAnalyzer()


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
def parse_args():
    parser = argparse.ArgumentParser(description="Analyze sentiment of ticket text.")
    parser.add_argument("--text", required=True, help="Ticket description or message text")
    parser.add_argument("--subject", default="", help="Optional ticket subject")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    analyzer = get_sentiment_analyzer()
    result = analyzer.analyze(args.text, args.subject)

    print("\n--- Sentiment Analysis Result ---")
    print(f"Text                    : {args.text}")
    print(f"Sentiment               : {result['sentiment']}")
    print(f"Polarity score          : {result['polarity_score']}")
    print(f"Frustrated?             : {result['is_frustrated']}")
    print(f"Escalation recommended? : {result['escalation_recommended']}")