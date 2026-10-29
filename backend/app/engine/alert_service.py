"""
FINN Triggered Alert Service
Monitors configurable price/volume thresholds and material corporate announcements.
"""

from typing import Dict, Any, List, Optional
from app.config import (
    PORTFOLIO_STOCKS,
    DEFAULT_VOLUME_SPIKE_FACTOR,
    DEFAULT_PRICE_MOVE_THRESHOLD_PCT,
)
from app.data.market_client import MarketClient
from app.data.screener_client import ScreenerClient
from app.engine.classifier import FilingClassifier


class AlertService:
    """Evaluates configurable triggers across the portfolio."""

    def __init__(
        self,
        market_client: Optional[MarketClient] = None,
        screener_client: Optional[ScreenerClient] = None,
    ):
        self.market_client = market_client or MarketClient()
        self.screener_client = screener_client or ScreenerClient()

    def evaluate_all_alerts(
        self,
        volume_spike_factor: float = DEFAULT_VOLUME_SPIKE_FACTOR,
        price_threshold_pct: float = DEFAULT_PRICE_MOVE_THRESHOLD_PCT,
        material_categories: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Runs threshold checks across all portfolio stocks.
        Returns triggered alerts grouped by urgency and category.
        """
        if material_categories is None:
            material_categories = [
                "results",
                "M&A",
                "management_change",
                "fund_raise",
                "litigation",
                "capex",
            ]

        triggered_alerts: List[Dict[str, Any]] = []

        for stock in PORTFOLIO_STOCKS:
            sym = stock["symbol"]
            ticker = stock["ticker"]

            # 1. Market Data Quantitative Anomaly Check
            market_metrics = self.market_client.get_market_metrics(ticker)
            eval_res = self.market_client.evaluate_triggers(
                metrics=market_metrics,
                volume_threshold_factor=volume_spike_factor,
                price_threshold_pct=price_threshold_pct,
            )

            if eval_res["has_triggered"]:
                triggered_alerts.append({
                    "symbol": sym,
                    "company_name": stock["name"],
                    "sector": stock["sector"],
                    "alert_type": "MARKET_ANOMALY",
                    "severity": "HIGH" if eval_res["is_volume_anomaly"] and eval_res["is_price_anomaly"] else "MEDIUM",
                    "title": f"Unusual Market Activity: {sym}",
                    "details": eval_res["alert_reasons"],
                    "market_data": {
                        "price": market_metrics.get("current_price"),
                        "change_pct": market_metrics.get("day_change_pct"),
                        "volume": market_metrics.get("current_volume"),
                        "avg_volume_20d": market_metrics.get("avg_volume_20d"),
                        "volume_ratio": market_metrics.get("volume_ratio"),
                    },
                })

            # 2. Material Corporate Announcement Check
            comp_data = self.screener_client.get_company_data(sym)
            recent_anns = comp_data.get("documents", {}).get("announcements", [])[:3]

            for ann in recent_anns:
                title = ann.get("title", "")
                classification = FilingClassifier.classify_and_prioritize(title)

                if classification["category"] in material_categories:
                    triggered_alerts.append({
                        "symbol": sym,
                        "company_name": stock["name"],
                        "sector": stock["sector"],
                        "alert_type": "MATERIAL_FILING",
                        "severity": "HIGH",
                        "category": classification["category"],
                        "category_name": classification["category_name"],
                        "title": f"{classification['category_name']}: {sym}",
                        "details": [classification["one_liner"]],
                        "url": ann.get("url"),
                    })

        return {
            "thresholds_applied": {
                "volume_spike_factor": volume_spike_factor,
                "price_threshold_pct": price_threshold_pct,
                "material_categories": material_categories,
            },
            "total_alerts": len(triggered_alerts),
            "alerts": triggered_alerts,
        }
