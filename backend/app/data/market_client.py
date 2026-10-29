"""
FINN Market Data Client
Fetches EOD price, volume, 20-day SMA, and detects unusual trading anomalies.
"""

import yfinance as yf
import pandas as pd
from typing import Dict, Any, List, Optional
import time
import json
import os

CACHE_FILE = os.path.join(os.path.dirname(__file__), "..", "cache", "market_cache.json")


class MarketClient:
    """Client for retrieving market data and computing deterministic anomaly metrics."""

    def __init__(self, cache_ttl_seconds: int = 900):
        self.cache_ttl = cache_ttl_seconds
        self._memory_cache: Dict[str, Dict[str, Any]] = {}
        self._load_cache()

    def _load_cache(self):
        try:
            if os.path.exists(CACHE_FILE):
                with open(CACHE_FILE, "r", encoding="utf-8") as f:
                    self._memory_cache = json.load(f)
        except Exception:
            self._memory_cache = {}

    def _save_cache(self):
        try:
            os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
            with open(CACHE_FILE, "w", encoding="utf-8") as f:
                json.dump(self._memory_cache, f, indent=2)
        except Exception:
            pass

    def get_market_metrics(self, ticker: str, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Fetch current price, volume, 20D SMA volume, daily change, and anomaly flags.
        Ensures ticker has '.NS' suffix for NSE if not provided.
        """
        if not ticker.endswith(".NS") and not ticker.endswith(".BO"):
            formatted_ticker = f"{ticker}.NS"
        else:
            formatted_ticker = ticker

        now = time.time()
        cached = self._memory_cache.get(formatted_ticker)
        if not force_refresh and cached and (now - cached.get("timestamp", 0) < self.cache_ttl):
            return cached["data"]

        try:
            stock = yf.Ticker(formatted_ticker)
            # Fetch 35 trading days to safely calculate 20-day SMA
            hist = stock.history(period="3mo")

            if hist.empty or len(hist) < 2:
                # Fallback to basic info if available
                return self._fallback_metrics(formatted_ticker)

            hist = hist.sort_index()
            latest = hist.iloc[-1]
            prev = hist.iloc[-2]

            current_close = float(latest["Close"])
            prev_close = float(prev["Close"])
            day_change_pct = round(((current_close - prev_close) / prev_close) * 100, 2)
            current_volume = int(latest["Volume"])

            # 20-day volume moving average (excluding today to prevent skew)
            window_slice = hist["Volume"].iloc[-21:-1] if len(hist) > 21 else hist["Volume"].iloc[:-1]
            avg_volume_20d = int(window_slice.mean()) if len(window_slice) > 0 else current_volume
            volume_ratio = round(current_volume / avg_volume_20d, 2) if avg_volume_20d > 0 else 1.0

            high_52w = float(hist["High"].max())
            low_52w = float(hist["Low"].min())

            data = {
                "symbol": formatted_ticker.replace(".NS", "").replace(".BO", ""),
                "ticker": formatted_ticker,
                "current_price": round(current_close, 2),
                "previous_close": round(prev_close, 2),
                "day_change_pct": day_change_pct,
                "current_volume": current_volume,
                "avg_volume_20d": avg_volume_20d,
                "volume_ratio": volume_ratio,
                "high_52w": round(high_52w, 2),
                "low_52w": round(low_52w, 2),
                "as_of_date": str(latest.name.date()),
            }

            self._memory_cache[formatted_ticker] = {
                "timestamp": now,
                "data": data,
            }
            self._save_cache()
            return data

        except Exception as e:
            # Fallback gracefully
            return self._fallback_metrics(formatted_ticker, error=str(e))

    def evaluate_triggers(
        self,
        metrics: Dict[str, Any],
        volume_threshold_factor: float = 2.0,
        price_threshold_pct: float = 3.0,
    ) -> Dict[str, Any]:
        """Evaluate if current stock state violates user-configured alert thresholds."""
        is_volume_anomaly = metrics.get("volume_ratio", 1.0) >= volume_threshold_factor
        is_price_anomaly = abs(metrics.get("day_change_pct", 0.0)) >= price_threshold_pct

        alert_types = []
        if is_volume_anomaly:
            alert_types.append(
                f"Volume Spike ({metrics['volume_ratio']}x vs 20D SMA of {metrics['avg_volume_20d']:,})"
            )
        if is_price_anomaly:
            direction = "Surge" if metrics["day_change_pct"] > 0 else "Drop"
            alert_types.append(
                f"Significant Price {direction} ({metrics['day_change_pct']:+0.2f}% vs threshold ±{price_threshold_pct}%)"
            )

        return {
            "has_triggered": is_volume_anomaly or is_price_anomaly,
            "is_volume_anomaly": is_volume_anomaly,
            "is_price_anomaly": is_price_anomaly,
            "alert_reasons": alert_types,
            "metrics": metrics,
        }

    def _fallback_metrics(self, ticker: str, error: Optional[str] = None) -> Dict[str, Any]:
        sym = ticker.replace(".NS", "").replace(".BO", "")
        return {
            "symbol": sym,
            "ticker": ticker,
            "current_price": 0.0,
            "previous_close": 0.0,
            "day_change_pct": 0.0,
            "current_volume": 0,
            "avg_volume_20d": 0,
            "volume_ratio": 1.0,
            "high_52w": 0.0,
            "low_52w": 0.0,
            "as_of_date": "N/A",
            "fallback": True,
            "error": error,
        }
