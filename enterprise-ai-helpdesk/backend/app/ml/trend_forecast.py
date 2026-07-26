"""
trend_forecast.py
------------------
Module 5 of the Intelligent Ticket AI Classification system.

Forecasts future ticket VOLUME (overall, and broken down per category) based
on historical ticket creation timestamps. Powers the Analytics / Dashboard
pages (trend charts, "expected tickets next week", capacity planning).

Two forecasting backends are supported:
    1. "prophet"  -> uses Facebook/Meta Prophet if installed (best quality,
                     handles seasonality/holidays well). Optional dependency.
    2. "simple"   -> dependency-free fallback: weighted moving average +
                     linear trend extrapolation. Always available.

The module auto-falls-back to "simple" if Prophet isn't installed, so this
never hard-fails in environments where Prophet wasn't added to
requirements.txt.

Usage (library, called from api/analytics.py or api/dashboard.py):
    from app.ml.trend_forecast import TicketTrendForecaster

    forecaster = TicketTrendForecaster()
    forecaster.fit(tickets_df)          # DataFrame with 'created_at' [, 'category']
    forecast = forecaster.forecast(days_ahead=14)
    per_category = forecaster.forecast_by_category(days_ahead=14)

Usage (CLI):
    python trend_forecast.py --tickets datasets/historical_tickets.csv --days-ahead 14
"""

import argparse
import logging
from typing import Optional

import numpy as np
import pandas as pd

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("trend_forecast")

try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
except ImportError:
    PROPHET_AVAILABLE = False


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #
def _daily_counts(df: pd.DataFrame, date_col: str = "created_at") -> pd.DataFrame:
    """Aggregate raw ticket rows into a daily ticket-count time series."""
    dates = pd.to_datetime(df[date_col], errors="coerce").dropna()
    daily = dates.dt.floor("D").value_counts().sort_index()

    # Fill missing days with 0 so the series has no gaps
    full_range = pd.date_range(daily.index.min(), daily.index.max(), freq="D")
    daily = daily.reindex(full_range, fill_value=0)

    return pd.DataFrame({"ds": daily.index, "y": daily.values})


def _simple_forecast(series: pd.DataFrame, days_ahead: int, window: int = 7) -> pd.DataFrame:
    """
    Dependency-free forecast: weighted moving average of the last `window`
    days combined with a linear trend fitted over the last 4*window days,
    projected forward. Robust fallback when Prophet isn't available.
    """
    y = series["y"].values
    n = len(y)

    if n < 2:
        # Not enough history — just repeat the last known value (or 0)
        last_val = y[-1] if n else 0
        future_dates = pd.date_range(
            series["ds"].max() + pd.Timedelta(days=1), periods=days_ahead, freq="D"
        )
        return pd.DataFrame({"ds": future_dates, "yhat": [last_val] * days_ahead})

    window = min(window, n)
    recent_avg = np.average(y[-window:], weights=np.linspace(1, 2, window))

    # Linear trend over the recent history
    trend_window = min(n, window * 4)
    x = np.arange(trend_window)
    y_trend = y[-trend_window:]
    slope, intercept = np.polyfit(x, y_trend, 1)

    future_dates = pd.date_range(
        series["ds"].max() + pd.Timedelta(days=1), periods=days_ahead, freq="D"
    )

    predictions = []
    for i in range(days_ahead):
        trend_component = slope * (trend_window + i) + intercept
        # Blend recent average with trend projection, clipped at 0
        pred = max(0.0, 0.5 * recent_avg + 0.5 * trend_component)
        predictions.append(round(pred, 2))

    return pd.DataFrame({"ds": future_dates, "yhat": predictions})


def _prophet_forecast(series: pd.DataFrame, days_ahead: int) -> pd.DataFrame:
    model = Prophet(
        daily_seasonality=False,
        weekly_seasonality=True,
        yearly_seasonality=len(series) > 365,
        interval_width=0.8,
    )
    model.fit(series)
    future = model.make_future_dataframe(periods=days_ahead, freq="D")
    forecast = model.predict(future)
    result = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(days_ahead)
    result["yhat"] = result["yhat"].clip(lower=0).round(2)
    return result.reset_index(drop=True)


# --------------------------------------------------------------------------- #
# Main forecaster class
# --------------------------------------------------------------------------- #
class TicketTrendForecaster:
    def __init__(self, backend: str = "auto", date_col: str = "created_at", category_col: str = "category"):
        self.date_col = date_col
        self.category_col = category_col
        self.df: Optional[pd.DataFrame] = None

        if backend == "auto":
            self.backend = "prophet" if PROPHET_AVAILABLE else "simple"
        elif backend == "prophet" and not PROPHET_AVAILABLE:
            logger.warning("Prophet not installed — falling back to 'simple' backend.")
            self.backend = "simple"
        else:
            self.backend = backend

        logger.info("Using forecasting backend: %s", self.backend)

    def fit(self, df: pd.DataFrame):
        if self.date_col not in df.columns:
            raise ValueError(f"DataFrame must contain a '{self.date_col}' column.")
        self.df = df.copy()

    def _run_forecast(self, series: pd.DataFrame, days_ahead: int) -> pd.DataFrame:
        if self.backend == "prophet":
            return _prophet_forecast(series, days_ahead)
        return _simple_forecast(series, days_ahead)

    def forecast(self, days_ahead: int = 14) -> list[dict]:
        """Overall ticket volume forecast (all categories combined)."""
        if self.df is None:
            raise RuntimeError("Call fit(df) before forecast().")

        series = _daily_counts(self.df, self.date_col)
        result = self._run_forecast(series, days_ahead)

        return [
            {
                "date": row["ds"].strftime("%Y-%m-%d"),
                "predicted_tickets": float(row["yhat"]),
            }
            for _, row in result.iterrows()
        ]

    def forecast_by_category(self, days_ahead: int = 14, min_history_days: int = 5) -> dict:
        """Per-category forecast, e.g. for a stacked trend chart."""
        if self.df is None:
            raise RuntimeError("Call fit(df) before forecast_by_category().")
        if self.category_col not in self.df.columns:
            logger.warning("No '%s' column found — skipping category breakdown.", self.category_col)
            return {}

        results = {}
        for category, group in self.df.groupby(self.category_col):
            series = _daily_counts(group, self.date_col)
            if len(series) < min_history_days:
                continue  # not enough history for a meaningful forecast
            forecast_result = self._run_forecast(series, days_ahead)
            results[category] = [
                {
                    "date": row["ds"].strftime("%Y-%m-%d"),
                    "predicted_tickets": float(row["yhat"]),
                }
                for _, row in forecast_result.iterrows()
            ]
        return results

    def detect_spike(self, days_ahead: int = 7, spike_threshold: float = 1.5) -> dict:
        """
        Flags whether an unusual VOLUME SPIKE is predicted relative to the
        recent baseline — useful for a dashboard alert/banner.
        """
        series = _daily_counts(self.df, self.date_col)
        baseline = float(np.mean(series["y"].values[-14:])) if len(series) >= 1 else 0.0
        forecast = self._run_forecast(series, days_ahead)
        predicted_avg = float(forecast["yhat"].mean())

        is_spike = baseline > 0 and predicted_avg >= baseline * spike_threshold
        return {
            "baseline_avg_daily": round(baseline, 2),
            "predicted_avg_daily": round(predicted_avg, 2),
            "is_spike_predicted": is_spike,
            "spike_ratio": round(predicted_avg / baseline, 2) if baseline > 0 else None,
        }


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
def parse_args():
    parser = argparse.ArgumentParser(description="Forecast ticket volume trends.")
    parser.add_argument("--tickets", default="datasets/historical_tickets.csv")
    parser.add_argument("--date-col", default="created_at")
    parser.add_argument("--category-col", default="category")
    parser.add_argument("--days-ahead", type=int, default=14)
    parser.add_argument("--backend", choices=["auto", "prophet", "simple"], default="auto")
    parser.add_argument("--by-category", action="store_true", help="Also forecast per category")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()

    df = pd.read_csv(args.tickets)
    forecaster = TicketTrendForecaster(
        backend=args.backend, date_col=args.date_col, category_col=args.category_col
    )
    forecaster.fit(df)

    overall = forecaster.forecast(days_ahead=args.days_ahead)
    print(f"\n--- Overall Ticket Volume Forecast (next {args.days_ahead} days) ---")
    for point in overall:
        print(f"  {point['date']}: {point['predicted_tickets']} tickets")

    spike = forecaster.detect_spike(days_ahead=args.days_ahead)
    print(f"\nBaseline daily avg   : {spike['baseline_avg_daily']}")
    print(f"Predicted daily avg  : {spike['predicted_avg_daily']}")
    print(f"Spike predicted?     : {spike['is_spike_predicted']}")

    if args.by_category:
        print("\n--- Per-Category Forecast ---")
        per_category = forecaster.forecast_by_category(days_ahead=args.days_ahead)
        for category, points in per_category.items():
            avg = np.mean([p["predicted_tickets"] for p in points])
            print(f"  {category}: avg {avg:.1f} tickets/day predicted")