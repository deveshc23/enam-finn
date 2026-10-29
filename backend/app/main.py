"""
FINN: Financial Investment Agent - Core Backend API
FastAPI service delivering Push Digests, Configurable Alerts, and 8-Module Primary Research.
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.config import (
    PORTFOLIO_STOCKS,
    ADHOC_STOCKS,
    ANNOUNCEMENT_CATEGORIES,
    DEFAULT_VOLUME_SPIKE_FACTOR,
    DEFAULT_PRICE_MOVE_THRESHOLD_PCT,
)
from app.data.market_client import MarketClient
from app.data.screener_client import ScreenerClient
from app.engine.digest_service import DigestService
from app.engine.alert_service import AlertService
from app.engine.pull_modules import PullResearchEngine
from app.engine.narrative_analyzer import NarrativeAnalyzer

app = FastAPI(
    title="FINN - Financial Investment Agent API",
    description="High-conviction public markets intelligence layer for ENAM Holdings Build Challenge.",
    version="1.0.0",
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instantiate singleton clients
market_client = MarketClient()
screener_client = ScreenerClient()
digest_service = DigestService(screener_client)
alert_service = AlertService(market_client, screener_client)


class AlertThresholdRequest(BaseModel):
    volume_spike_factor: float = Field(default=DEFAULT_VOLUME_SPIKE_FACTOR, ge=1.0, le=10.0)
    price_threshold_pct: float = Field(default=DEFAULT_PRICE_MOVE_THRESHOLD_PCT, ge=0.5, le=25.0)
    material_categories: Optional[List[str]] = None


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "FINN Financial Investment Agent", "version": "1.0.0"}


@app.get("/api/portfolio")
def get_portfolio():
    """Returns the mock portfolio with latest EOD market snapshots."""
    portfolio_with_market = []
    for stock in PORTFOLIO_STOCKS:
        metrics = market_client.get_market_metrics(stock["ticker"])
        portfolio_with_market.append({
            **stock,
            "current_price": metrics.get("current_price"),
            "day_change_pct": metrics.get("day_change_pct"),
            "volume_ratio": metrics.get("volume_ratio"),
            "as_of_date": metrics.get("as_of_date"),
        })
    return {
        "portfolio": portfolio_with_market,
        "adhoc_samples": ADHOC_STOCKS,
        "total_stocks": len(PORTFOLIO_STOCKS),
    }


@app.get("/api/digest")
def get_digest(
    window_days: int = Query(default=1, ge=1, le=30, description="Window in days (1 = 24h)"),
    include_routine: bool = Query(default=False, description="Whether to include routine collapsed noise"),
    sector: Optional[str] = Query(default=None, description="Optional sector filter"),
):
    """
    Push Mode 1: Windowed digest across portfolio.
    Filters and prioritizes announcements, collapses routine filings, and enriches key events.
    """
    return digest_service.generate_digest(
        window_days=window_days,
        include_collapsed_routine=include_routine,
        sector_filter=sector,
    )


@app.post("/api/alerts")
def evaluate_alerts(req: AlertThresholdRequest):
    """
    Push Mode 2: Triggered alerts evaluated against user-configured thresholds.
    Checks for volume spikes, price moves, and material corporate disclosures.
    """
    return alert_service.evaluate_all_alerts(
        volume_spike_factor=req.volume_spike_factor,
        price_threshold_pct=req.price_threshold_pct,
        material_categories=req.material_categories,
    )


@app.get("/api/research/{symbol}")
def get_company_research(symbol: str, force_refresh: bool = False):
    """
    Pull Mode: Generalized on-demand research dossier for ANY NSE/BSE symbol.
    Produces all 8 financial modules grounded exclusively in primary filings.
    """
    clean_sym = symbol.upper().replace(".NS", "").replace(".BO", "")
    raw_data = screener_client.get_company_data(clean_sym, force_refresh=force_refresh)

    if not raw_data or "error" in raw_data:
        raise HTTPException(
            status_code=404,
            detail=f"Unable to fetch primary filings for ticker '{clean_sym}'. Ensure it is a valid NSE/BSE symbol.",
        )

    dossier = PullResearchEngine.generate_research_dossier(clean_sym, raw_data)
    return dossier


@app.get("/api/narrative/{symbol}")
def get_narrative_vs_numbers(symbol: str):
    """
    Pull Mode Highlight: Narrative vs. Numbers audit.
    Compares past management concall promises against actual subsequent audited results.
    """
    clean_sym = symbol.upper().replace(".NS", "").replace(".BO", "")
    raw_data = screener_client.get_company_data(clean_sym)
    return NarrativeAnalyzer.analyze_company(clean_sym, raw_data)


@app.get("/api/categories")
def get_announcement_categories():
    """Returns the 16 corporate announcement classifications and their priority levels."""
    return ANNOUNCEMENT_CATEGORIES
