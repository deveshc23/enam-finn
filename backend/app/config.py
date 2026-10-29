"""
FINN Backend Configuration
Portfolio definitions, announcement classifications, and system settings.
"""

from pydantic import BaseModel
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# 16-Stock Mock Portfolio for ENAM Build Challenge
PORTFOLIO_STOCKS = [
    {
        "symbol": "RELIANCE",
        "ticker": "RELIANCE.NS",
        "name": "Reliance Industries Ltd",
        "sector": "Energy & Conglomerate",
        "mcap_category": "Large Cap",
    },
    {
        "symbol": "TCS",
        "ticker": "TCS.NS",
        "name": "Tata Consultancy Services Ltd",
        "sector": "IT Services",
        "mcap_category": "Large Cap",
    },
    {
        "symbol": "HDFCBANK",
        "ticker": "HDFCBANK.NS",
        "name": "HDFC Bank Ltd",
        "sector": "Banking & Financials",
        "mcap_category": "Large Cap",
    },
    {
        "symbol": "TRENT",
        "ticker": "TRENT.NS",
        "name": "Trent Ltd (Westside & Zudio)",
        "sector": "Consumer Discretionary / Retail",
        "mcap_category": "Large Cap Growth",
    },
    {
        "symbol": "DIXON",
        "ticker": "DIXON.NS",
        "name": "Dixon Technologies India Ltd",
        "sector": "Electronics Manufacturing (EMS)",
        "mcap_category": "Mid/Large Cap Growth",
    },
    {
        "symbol": "HAL",
        "ticker": "HAL.NS",
        "name": "Hindustan Aeronautics Ltd",
        "sector": "Defence & Aerospace",
        "mcap_category": "Large Cap PSU",
    },
    {
        "symbol": "TATAMOTORS",
        "ticker": "TATAMTRDVR.BO",
        "screener_slug": "TMCV",
        "name": "Tata Motors Ltd",
        "sector": "Automotive & EV",
        "mcap_category": "Large Cap",
    },
    {
        "symbol": "LT",
        "ticker": "LT.NS",
        "name": "Larsen & Toubro Ltd",
        "sector": "Capital Goods & Infra EPC",
        "mcap_category": "Large Cap",
    },
    {
        "symbol": "SUNPHARMA",
        "ticker": "SUNPHARMA.NS",
        "name": "Sun Pharmaceutical Industries Ltd",
        "sector": "Healthcare & Pharma",
        "mcap_category": "Large Cap",
    },
    {
        "symbol": "ZOMATO",
        "ticker": "ETERNAL.BO",
        "screener_slug": "ETERNAL",
        "name": "Zomato Ltd (Eternal)",
        "sector": "Consumer Internet & Quick Commerce",
        "mcap_category": "Large Cap Tech",
    },
    {
        "symbol": "SUZLON",
        "ticker": "SUZLON.NS",
        "name": "Suzlon Energy Ltd",
        "sector": "Renewable Energy",
        "mcap_category": "Mid Cap Turnaround",
    },
    {
        "symbol": "ITC",
        "ticker": "ITC.NS",
        "name": "ITC Ltd",
        "sector": "FMCG & Conglomerate",
        "mcap_category": "Large Cap",
    },
    {
        "symbol": "PIIND",
        "ticker": "PIIND.NS",
        "name": "PI Industries Ltd",
        "sector": "Agrochemicals & Specialty Chemicals",
        "mcap_category": "Large Cap",
    },
    {
        "symbol": "DLF",
        "ticker": "DLF.NS",
        "name": "DLF Ltd",
        "sector": "Real Estate Development",
        "mcap_category": "Large Cap",
    },
    {
        "symbol": "HDFCAMC",
        "ticker": "HDFCAMC.NS",
        "name": "HDFC Asset Management Company Ltd",
        "sector": "Asset Management & Capital Markets",
        "mcap_category": "Mid/Large Cap",
    },
    {
        "symbol": "KEC",
        "ticker": "KEC.NS",
        "name": "KEC International Ltd",
        "sector": "Power Transmission EPC",
        "mcap_category": "Mid Cap",
    },
]

# Ad-hoc generalization universe (outside portfolio for on-demand pull research)
ADHOC_STOCKS = [
    {
        "symbol": "CDSL",
        "ticker": "CDSL.NS",
        "name": "Central Depository Services (India) Ltd",
        "sector": "Market Infrastructure",
        "mcap_category": "Mid Cap",
    },
    {
        "symbol": "POLYCAB",
        "ticker": "POLYCAB.NS",
        "name": "Polycab India Ltd",
        "sector": "Cables & Electricals",
        "mcap_category": "Large Cap",
    },
    {
        "symbol": "KALYANKJIL",
        "ticker": "KALYANKJIL.NS",
        "name": "Kalyan Jewellers India Ltd",
        "sector": "Retail Jewellery",
        "mcap_category": "Mid Cap Growth",
    },
]

# 16 Corporate Announcement Categories as defined by ENAM Reference Companion
ANNOUNCEMENT_CATEGORIES = {
    "results": {"name": "Quarterly / Annual Results", "impact": "HIGH", "default_visible": True},
    "M&A": {"name": "Mergers & Acquisitions", "impact": "HIGH", "default_visible": True},
    "fund_raise": {"name": "Fund Raising / Capital Issues", "impact": "HIGH", "default_visible": True},
    "management_change": {"name": "Key Management Personnel Change", "impact": "HIGH", "default_visible": True},
    "litigation": {"name": "Litigation & Regulatory Orders", "impact": "HIGH", "default_visible": True},
    "capex": {"name": "Capital Expenditure Approval", "impact": "HIGH", "default_visible": True},
    "insider_trading": {"name": "Insider / Promoter Shareholding", "impact": "MEDIUM", "default_visible": True},
    "earnings_call": {"name": "Concall Notice / Transcript Link", "impact": "MEDIUM", "default_visible": True},
    "investor_meetings": {"name": "Investor Conference / 1-on-1", "impact": "MEDIUM", "default_visible": True},
    "credit_rating": {"name": "Credit Rating Action", "impact": "MEDIUM", "default_visible": True},
    "dividend": {"name": "Dividend Declaration", "impact": "MEDIUM", "default_visible": True},
    "bonus_split": {"name": "Bonus Issue / Stock Split", "impact": "MEDIUM", "default_visible": True},
    "press_release": {"name": "General Press Release / Order Win", "impact": "MEDIUM", "default_visible": True},
    "postal_ballot": {"name": "Postal Ballot Notice / Result", "impact": "LOW", "default_visible": False},
    "agm_egm": {"name": "AGM / EGM Notice & Proceedings", "impact": "LOW", "default_visible": False},
    "pledging": {"name": "Promoter Share Pledging Activity", "impact": "MEDIUM", "default_visible": True},
    "unclassified": {"name": "Routine Compliance Filings", "impact": "LOW", "default_visible": False},
}

# Default trigger alert thresholds
DEFAULT_VOLUME_SPIKE_FACTOR = 2.0  # 2x 20-day SMA
DEFAULT_PRICE_MOVE_THRESHOLD_PCT = 3.0  # +/- 3% in a single day
