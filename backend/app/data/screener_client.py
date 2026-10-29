"""
FINN Screener.in Primary Source Data Client
Extracts primary corporate filings, concall transcripts, annual reports,
and multi-year financial statements for any NSE/BSE listed company.
"""

import requests
from bs4 import BeautifulSoup
import re
import os
import json
import time
from typing import Dict, Any, List, Optional

CACHE_DIR = os.path.join(os.path.dirname(__file__), "..", "cache", "screener")
os.makedirs(CACHE_DIR, exist_ok=True)

# Known market aliases for recent corporate demergers / rebrandings
SYMBOL_ALIASES = {
    "TATAMOTORS": "TMCV",
    "TATA MOTORS": "TMCV",
    "ZOMATO": "ETERNAL",
}


class ScreenerClient:
    """Client for pulling primary corporate data, transcripts, and financials from Screener.in."""

    def __init__(self, cache_ttl_seconds: int = 86400):  # 24 hour cache default
        self.cache_ttl = cache_ttl_seconds
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        }

    def _get_cache_path(self, symbol: str) -> str:
        clean_symbol = symbol.upper().replace(".NS", "").replace(".BO", "")
        return os.path.join(CACHE_DIR, f"{clean_symbol}.json")

    def get_company_data(self, symbol: str, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Fetch complete financial statements, documents, and profile for any ticker.
        Generalizes to any NSE ticker, with dynamic slug resolution for rebranded/demerged entities.
        """
        raw_sym = symbol.upper().replace(".NS", "").replace(".BO", "").strip()
        clean_symbol = SYMBOL_ALIASES.get(raw_sym, raw_sym)
        cache_path = self._get_cache_path(raw_sym)

        now = time.time()
        if not force_refresh and os.path.exists(cache_path):
            try:
                with open(cache_path, "r", encoding="utf-8") as f:
                    cached_obj = json.load(f)
                    if now - cached_obj.get("timestamp", 0) < self.cache_ttl:
                        data = cached_obj.get("data", {})
                        if data and not data.get("error"):
                            return data
            except Exception:
                pass

        # 1. Try direct symbol (consolidated, then standalone)
        data = self._scrape_screener(clean_symbol, consolidated=True)
        if not data or not data.get("company_name") or data.get("error"):
            data = self._scrape_screener(clean_symbol, consolidated=False)

        # 2. If direct symbol failed (e.g. TATAMOTORS -> TMCV, ZOMATO -> ETERNAL), resolve via search API
        if not data or not data.get("company_name") or data.get("error"):
            resolved_slug = self._resolve_symbol_via_search(clean_symbol)
            if resolved_slug and resolved_slug != clean_symbol:
                data = self._scrape_screener(resolved_slug, consolidated=True)
                if not data or not data.get("company_name"):
                    data = self._scrape_screener(resolved_slug, consolidated=False)

        if data and not data.get("error"):
            data["symbol"] = clean_symbol  # preserve original requested symbol
            try:
                with open(cache_path, "w", encoding="utf-8") as f:
                    json.dump({"timestamp": now, "data": data}, f, indent=2, ensure_ascii=False)
            except Exception:
                pass

        return data

    def _resolve_symbol_via_search(self, query: str) -> Optional[str]:
        """Queries Screener's search API to find the exact company slug for any ticker or name."""
        try:
            url = f"https://www.screener.in/api/company/search/?q={query}"
            resp = requests.get(url, headers=self.headers, timeout=6)
            if resp.status_code == 200:
                results = resp.json()
                if results and len(results) > 0:
                    matched_url = results[0].get("url", "")
                    # URL format: /company/{SLUG}/consolidated/ or /company/{SLUG}/
                    parts = [p for p in matched_url.split("/") if p and p != "company" and p != "consolidated"]
                    if parts:
                        return parts[0]
        except Exception:
            pass
        return None

    def _scrape_screener(self, symbol: str, consolidated: bool = True) -> Dict[str, Any]:
        view_path = "consolidated/" if consolidated else ""
        url = f"https://www.screener.in/company/{symbol}/{view_path}"
        try:
            resp = requests.get(url, headers=self.headers, timeout=12)
            if resp.status_code != 200:
                if consolidated:
                    # Retry standalone
                    return self._scrape_screener(symbol, consolidated=False)
                return {}

            soup = BeautifulSoup(resp.text, "html.parser")

            # 1. Company Profile & Ratios
            profile = self._parse_profile(soup, symbol)

            # 2. Quarterly Results Table (Revenue, EBITDA, PBT, PAT, margins)
            quarterly_results = self._parse_table_section(soup, "quarters")

            # 3. Annual Profit & Loss Table
            pnl_results = self._parse_table_section(soup, "profit-loss")

            # 4. Balance Sheet
            balance_sheet = self._parse_table_section(soup, "balance-sheet")

            # 5. Cash Flows
            cash_flows = self._parse_table_section(soup, "cash-flow")

            # 6. Ratios Table
            ratios = self._parse_table_section(soup, "ratios")

            # 7. Documents (Concalls, Announcements, Annual Reports)
            documents = self._parse_documents(soup)

            return {
                "symbol": symbol,
                "company_name": profile.get("name", symbol),
                "about": profile.get("about", ""),
                "ratios_top": profile.get("top_ratios", {}),
                "quarterly_results": quarterly_results,
                "profit_loss": pnl_results,
                "balance_sheet": balance_sheet,
                "cash_flows": cash_flows,
                "ratios": ratios,
                "documents": documents,
                "source_url": url,
            }
        except Exception as e:
            return {"symbol": symbol, "error": str(e)}

    def _parse_profile(self, soup: BeautifulSoup, symbol: str) -> Dict[str, Any]:
        name_tag = soup.find("h1")
        name = name_tag.get_text().strip() if name_tag else symbol

        about_tag = soup.find("div", class_="about")
        about = ""
        if about_tag:
            p = about_tag.find("p")
            about = p.get_text().strip() if p else about_tag.get_text().strip()

        # Top key ratios (Market Cap, Current Price, High/Low, P/E, Book Value, ROCE, ROE)
        top_ratios = {}
        ratios_ul = soup.find("ul", id="top-ratios")
        if ratios_ul:
            for li in ratios_ul.find_all("li"):
                name_span = li.find("span", class_="name")
                val_span = li.find("span", class_="nowrap")
                if name_span and val_span:
                    k = name_span.get_text().strip()
                    v = val_span.get_text().replace("\n", " ").strip()
                    top_ratios[k] = v

        return {"name": name, "about": about, "top_ratios": top_ratios}

    def _parse_table_section(self, soup: BeautifulSoup, section_id: str) -> Dict[str, Any]:
        """Parses standardized financial tables (Quarters, P&L, Balance Sheet, Cash Flow)."""
        section = soup.find("section", id=section_id)
        if not section:
            return {"headers": [], "rows": {}}

        table = section.find("table")
        if not table:
            return {"headers": [], "rows": {}}

        # Parse column headers (Quarter / Year dates)
        headers = []
        thead = table.find("thead")
        if thead:
            for th in thead.find_all("th"):
                text = th.get_text().strip()
                if text:
                    headers.append(text)

        rows: Dict[str, List[Optional[float]]] = {}
        tbody = table.find("tbody")
        if tbody:
            for tr in tbody.find_all("tr"):
                tds = tr.find_all("td")
                if not tds:
                    continue
                row_label = tds[0].get_text().replace("+", "").strip()
                values = []
                for td in tds[1:]:
                    val_str = td.get_text().strip().replace(",", "").replace("%", "")
                    try:
                        val = float(val_str)
                    except ValueError:
                        val = None
                    values.append(val)
                rows[row_label] = values

        return {"headers": headers, "rows": rows}

    def _parse_documents(self, soup: BeautifulSoup) -> Dict[str, List[Dict[str, str]]]:
        """Parses Concalls, Annual Reports, and Corporate Announcements from primary sources."""
        docs_section = soup.find("section", id="documents")
        results = {
            "concalls": [],
            "annual_reports": [],
            "announcements": [],
        }

        if not docs_section:
            return results

        # 1. Concalls (Transcripts, PPTs, Audio links)
        concalls_div = docs_section.find("div", class_="concalls")
        if concalls_div:
            # Concalls are arranged in list items with dates and links
            items = concalls_div.find_all("li")
            for item in items:
                date_text = ""
                # Date is usually in raw text or child span
                for child in item.children:
                    if isinstance(child, str) and child.strip():
                        date_text = child.strip()
                        break
                links = []
                for a in item.find_all("a"):
                    links.append({"title": a.get_text().strip(), "url": a.get("href", "")})
                if links:
                    results["concalls"].append({
                        "period_date": date_text,
                        "links": links,
                    })

        # 2. Annual Reports
        ar_div = docs_section.find("div", class_="annual-reports")
        if ar_div:
            for a in ar_div.find_all("a"):
                title = a.get_text().strip()
                url = a.get("href", "")
                if url:
                    results["annual_reports"].append({"title": title, "url": url})

        # 3. Announcements
        ann_div = docs_section.find("div", class_="documents")
        if ann_div:
            for a in ann_div.find_all("a"):
                url = a.get("href", "")
                if not url or "bseindia.com" not in url or "corp-announcements" in url:
                    continue
                full_text = a.get_text().strip()
                # Split description and date if possible
                results["announcements"].append({
                    "title": full_text,
                    "url": url,
                })

        return results
