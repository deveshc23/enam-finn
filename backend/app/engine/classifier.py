"""
FINN Filing Classifier and Prioritization Engine
Classifies corporate exchange announcements into the 16 standard categories
and assigns priority ranking (HIGH, MEDIUM, LOW/ROUTINE).
"""

import re
from typing import Dict, Any, Tuple
from app.config import ANNOUNCEMENT_CATEGORIES

# Priority weighting map
PRIORITY_SCORES = {
    "HIGH": 100,
    "MEDIUM": 50,
    "LOW": 10,
}

# Heuristic keyword matchers for ultra-fast, zero-cost classification
CATEGORY_RULES = [
    (
        "results",
        r"(financial results|audited results|unaudited results|quarterly results|board meeting.*results|financial statements)",
        "Financial Results disclosure for the quarter.",
    ),
    (
        "management_change",
        r"(resignation|appointment|cessation|superannuation|re-appointment|chief executive officer|chief financial officer|managing director|kmp|key managerial personnel|director.*resigns|cfo|ceo)",
        "Leadership / Key Management Personnel transition.",
    ),
    (
        "M&A",
        r"(acquisition|merger|demerger|amalgamation|joint venture|scheme of arrangement|divestment|slump sale|stake in)",
        "Strategic M&A, demerger, or joint-venture transaction.",
    ),
    (
        "fund_raise",
        r"(fund raising|rights issue|qip|qualified institutional|preferential allotment|commercial paper|ncd|issuance of debentures|buyback)",
        "Capital raising or debt issuance announcement.",
    ),
    (
        "litigation",
        r"(litigation|penalty|order passed|show cause|sebi|tribunal|nclt|gst demand|tax demand|arbitration|appeal)",
        "Regulatory, tax, or legal dispute order.",
    ),
    (
        "capex",
        r"(capex|capital expenditure|expansion of capacity|new plant|new manufacturing facility|commercial production)",
        "Capital expenditure / capacity expansion approval.",
    ),
    (
        "earnings_call",
        r"(earnings call|concall|conference call|transcript of concall|audio recording of earnings call|investor call)",
        "Quarterly earnings concall schedule or transcript disclosure.",
    ),
    (
        "dividend",
        r"(interim dividend|final dividend|special dividend|record date.*dividend)",
        "Cash dividend declaration with record date.",
    ),
    (
        "bonus_split",
        r"(bonus issue|sub-division of shares|stock split|face value.*split)",
        "Corporate action: share count alteration.",
    ),
    (
        "credit_rating",
        r"(credit rating|crisil|care|icra|ind-ra|rating reaffirmed|rating upgraded|rating downgraded)",
        "Credit rating revision or reaffirmation.",
    ),
    (
        "insider_trading",
        r"(insider trading|regulation 7\(2\)|promoter.*acquired shares|promoter.*sold shares|sast)",
        "Promoter / insider shareholding change.",
    ),
    (
        "pledging",
        r"(pledge|release of pledge|encumbrance|revocation of pledge)",
        "Promoter share encumbrance / pledge update.",
    ),
    (
        "investor_meetings",
        r"(analyst meet|institutional investor|investor conference|schedule of analyst|one on one meeting)",
        "Schedule or presentation of institutional investor interactions.",
    ),
    (
        "press_release",
        r"(press release|media release|order win|contract awarded|partnership with|mou)",
        "Commercial update, order win, or corporate press release.",
    ),
    (
        "postal_ballot",
        r"(postal ballot|scrutinizer report|voting results of postal ballot)",
        "Shareholder postal ballot proceedings / results.",
    ),
    (
        "agm_egm",
        r"(annual general meeting|extraordinary general meeting|agm notice|egm notice|proceedings of agm)",
        "Shareholders general meeting notice / voting outcome.",
    ),
]


class FilingClassifier:
    """Classifies exchange filings and prioritizes them for the daily investor digest."""

    @staticmethod
    def classify_and_prioritize(title: str, description: str = "") -> Dict[str, Any]:
        combined_text = f"{title} {description}".lower()

        matched_category = "unclassified"
        summary_rationale = "Routine administrative exchange submission."

        for cat, pattern, rationale in CATEGORY_RULES:
            if re.search(pattern, combined_text):
                matched_category = cat
                summary_rationale = rationale
                break

        category_meta = ANNOUNCEMENT_CATEGORIES.get(
            matched_category,
            {"name": "Routine Compliance", "impact": "LOW", "default_visible": False},
        )
        impact = category_meta["impact"]
        priority_score = PRIORITY_SCORES.get(impact, 10)

        # Distinguish between actionable items and noise
        is_routine_noise = impact == "LOW"

        # Generate a high-signal one-line pitch
        one_liner = FilingClassifier._generate_one_liner(matched_category, title)

        return {
            "category": matched_category,
            "category_name": category_meta["name"],
            "impact": impact,
            "priority_score": priority_score,
            "is_routine_noise": is_routine_noise,
            "default_visible": category_meta["default_visible"],
            "one_liner": one_liner,
            "rationale": summary_rationale,
        }

    @staticmethod
    def _generate_one_liner(category: str, raw_title: str) -> str:
        clean = re.sub(r"\s+", " ", raw_title).strip()
        if category == "results":
            return "Quarterly earnings results and financial disclosure filed with exchange."
        elif category == "management_change":
            return "Top-level leadership change disclosed. Review appointment/resignation details."
        elif category == "M&A":
            return "Strategic acquisition, stake transfer, or merger agreement disclosed."
        elif category == "fund_raise":
            return "Capital raising / securities issuance notification."
        elif category == "litigation":
            return "Regulatory / legal penalty or adjudicating order received."
        elif category == "capex":
            return "Fresh capital expenditure or plant capacity expansion approved."
        elif category == "dividend":
            return "Cash dividend declared. Check record date for eligibility."
        elif category == "earnings_call":
            return "Earnings conference call announced with investor link / transcript."
        elif category == "press_release":
            return "Company press release on strategic developments or order wins."
        return clean[:120] + ("..." if len(clean) > 120 else "")
