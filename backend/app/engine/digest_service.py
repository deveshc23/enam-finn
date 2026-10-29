"""
FINN Daily Windowed Digest Service
Aggregates corporate announcements across the portfolio, classifies them,
prioritizes high-signal filings, collapses routine noise, and enriches key events.
"""

from typing import Dict, Any, List, Optional
import time
from app.config import PORTFOLIO_STOCKS, ANNOUNCEMENT_CATEGORIES
from app.data.screener_client import ScreenerClient
from app.engine.classifier import FilingClassifier
from app.engine.extractor import FinancialExtractor
from app.engine.executive_enricher import ExecutiveEnricher


class DigestService:
    """Orchestrates the windowed digest across the mock portfolio."""

    def __init__(self, screener_client: Optional[ScreenerClient] = None):
        self.screener_client = screener_client or ScreenerClient()

    def generate_digest(
        self,
        window_days: int = 1,
        include_collapsed_routine: bool = False,
        sector_filter: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Builds prioritized digest across portfolio.
        Default window: 1 day (24 hours).
        """
        all_items: List[Dict[str, Any]] = []

        for stock in PORTFOLIO_STOCKS:
            sym = stock["symbol"]
            sector = stock["sector"]
            if sector_filter and sector_filter.lower() not in sector.lower():
                continue

            company_data = self.screener_client.get_company_data(sym)
            docs = company_data.get("documents", {})
            announcements = docs.get("announcements", [])
            quarters = company_data.get("quarterly_results", {})

            for ann in announcements:
                title = ann.get("title", "")
                url = ann.get("url", "")

                classification = FilingClassifier.classify_and_prioritize(title)

                item = {
                    "symbol": sym,
                    "company_name": stock["name"],
                    "sector": sector,
                    "title": title,
                    "url": url,
                    "category": classification["category"],
                    "category_name": classification["category_name"],
                    "impact": classification["impact"],
                    "priority_score": classification["priority_score"],
                    "is_routine_noise": classification["is_routine_noise"],
                    "one_liner": classification["one_liner"],
                    "enrichment": None,
                }

                # Contextual Enrichment
                if classification["category"] == "management_change":
                    item["enrichment"] = {
                        "type": "executive_profile",
                        "data": ExecutiveEnricher.enrich_management_change(title),
                    }
                elif classification["category"] == "results":
                    headline_res = FinancialExtractor.extract_headline_results(quarters)
                    if headline_res.get("available"):
                        item["enrichment"] = {
                            "type": "quarterly_results",
                            "data": headline_res,
                        }

                all_items.append(item)

        # Sort by priority score (High impact first), then symbol
        all_items.sort(key=lambda x: (x["priority_score"], x["symbol"]), reverse=True)

        high_impact = [x for x in all_items if x["impact"] == "HIGH"]
        medium_impact = [x for x in all_items if x["impact"] == "MEDIUM"]
        routine = [x for x in all_items if x["impact"] == "LOW"]

        visible_items = [x for x in all_items if (include_collapsed_routine or not x["is_routine_noise"])]

        return {
            "window_days": window_days,
            "total_announcements": len(all_items),
            "visible_announcements": len(visible_items),
            "high_impact_count": len(high_impact),
            "medium_impact_count": len(medium_impact),
            "routine_collapsed_count": len(routine),
            "items": visible_items,
            "routine_items": routine if not include_collapsed_routine else [],
        }
