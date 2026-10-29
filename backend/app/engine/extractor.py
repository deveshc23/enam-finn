"""
FINN Headline Financials Extractor
Extracts headline numbers (Revenue, EBITDA, PBT, PAT) and computes
deterministic QoQ and YoY growth rates and margin trends.
"""

from typing import Dict, Any, List, Optional


class FinancialExtractor:
    """Extracts headline P&L metrics and computes QoQ and YoY deltas deterministically."""

    @staticmethod
    def extract_headline_results(quarterly_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parses standardized quarterly table and computes:
        - Latest Quarter Numbers (Revenue, EBITDA, PBT, PAT)
        - QoQ % change (vs immediately previous quarter)
        - YoY % change (vs same quarter a year ago, i.e. 4 quarters prior)
        - EBITDA Margin % and PAT Margin %
        """
        headers = quarterly_data.get("headers", [])
        rows = quarterly_data.get("rows", {})

        if not headers or len(headers) < 2:
            return {"available": False, "reason": "Insufficient quarterly data"}

        latest_idx = -1
        qoq_idx = -2
        yoy_idx = -5 if len(headers) >= 5 else None

        latest_q = headers[latest_idx]
        qoq_q = headers[qoq_idx]
        yoy_q = headers[yoy_idx] if yoy_idx is not None else None

        sales_row = rows.get("Sales", [])
        ebitda_row = rows.get("Operating Profit", [])
        pbt_row = rows.get("Profit before tax", [])
        pat_row = rows.get("Net Profit", [])

        def get_val(row: List[Optional[float]], idx: Optional[int]) -> Optional[float]:
            if idx is None or not row or abs(idx) > len(row):
                return None
            return row[idx]

        def pct_change(cur: Optional[float], prev: Optional[float]) -> Optional[float]:
            if cur is None or prev is None or prev == 0:
                return None
            return round(((cur - prev) / abs(prev)) * 100, 2)

        # Extract values for the 4 headline figures
        cur_sales = get_val(sales_row, latest_idx)
        cur_ebitda = get_val(ebitda_row, latest_idx)
        cur_pbt = get_val(pbt_row, latest_idx)
        cur_pat = get_val(pat_row, latest_idx)

        prev_sales = get_val(sales_row, qoq_idx)
        prev_ebitda = get_val(ebitda_row, qoq_idx)
        prev_pbt = get_val(pbt_row, qoq_idx)
        prev_pat = get_val(pat_row, qoq_idx)

        yoy_sales = get_val(sales_row, yoy_idx)
        yoy_ebitda = get_val(ebitda_row, yoy_idx)
        yoy_pbt = get_val(pbt_row, yoy_idx)
        yoy_pat = get_val(pat_row, yoy_idx)

        # Calculate EBITDA Margin % and PAT Margin %
        ebitda_margin = round((cur_ebitda / cur_sales) * 100, 2) if cur_sales and cur_ebitda else None
        pat_margin = round((cur_pat / cur_sales) * 100, 2) if cur_sales and cur_pat else None

        return {
            "available": True,
            "period": latest_q,
            "comparison_periods": {
                "qoq_period": qoq_q,
                "yoy_period": yoy_q,
            },
            "headline_metrics": [
                {
                    "metric": "Revenue (Sales)",
                    "code": "REV",
                    "current": cur_sales,
                    "unit": "Cr",
                    "qoq_delta_pct": pct_change(cur_sales, prev_sales),
                    "yoy_delta_pct": pct_change(cur_sales, yoy_sales),
                },
                {
                    "metric": "EBITDA (Operating Profit)",
                    "code": "EBITDA",
                    "current": cur_ebitda,
                    "unit": "Cr",
                    "margin_pct": ebitda_margin,
                    "qoq_delta_pct": pct_change(cur_ebitda, prev_ebitda),
                    "yoy_delta_pct": pct_change(cur_ebitda, yoy_ebitda),
                },
                {
                    "metric": "PBT (Profit Before Tax)",
                    "code": "PBT",
                    "current": cur_pbt,
                    "unit": "Cr",
                    "qoq_delta_pct": pct_change(cur_pbt, prev_pbt),
                    "yoy_delta_pct": pct_change(cur_pbt, yoy_pbt),
                },
                {
                    "metric": "PAT (Net Profit)",
                    "code": "PAT",
                    "current": cur_pat,
                    "unit": "Cr",
                    "margin_pct": pat_margin,
                    "qoq_delta_pct": pct_change(cur_pat, prev_pat),
                    "yoy_delta_pct": pct_change(cur_pat, yoy_pat),
                },
            ],
            "margins": {
                "ebitda_margin_pct": ebitda_margin,
                "pat_margin_pct": pat_margin,
            },
        }
