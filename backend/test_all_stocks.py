"""
Test all portfolio and ad-hoc stocks through Screener and Market clients.
"""

import sys
import io
from app.config import PORTFOLIO_STOCKS, ADHOC_STOCKS
from app.data.screener_client import ScreenerClient
from app.data.market_client import MarketClient
from app.engine.pull_modules import PullResearchEngine
from app.engine.digest_service import DigestService
from app.engine.alert_service import AlertService

# Ensure UTF-8 output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

sc = ScreenerClient()
mc = MarketClient()

print("=== 1. TESTING SCREENER DATA EXTRACTION & PULL MODULES ===")
for s in PORTFOLIO_STOCKS:
    sym = s["symbol"]
    try:
        data = sc.get_company_data(sym)
        if not data or "error" in data:
            print(f"[FAIL] {sym}: Screener error - {data.get('error') if data else 'Empty'}")
            continue
        dossier = PullResearchEngine.generate_research_dossier(sym, data)
        name = dossier.get("company_name", "N/A")
        q_count = len(data.get("quarterly_results", {}).get("headers", []))
        concall_count = len(data.get("documents", {}).get("concalls", []))
        ann_count = len(data.get("documents", {}).get("announcements", []))
        print(f"[OK] {sym:<12} | {name:<35} | Quarters: {q_count:<2} | Concalls: {concall_count:<2} | Anns: {ann_count:<2}")
    except Exception as e:
        print(f"[EXCEPTION] {sym}: {type(e).__name__} - {e}")

print("\n=== 2. TESTING AD-HOC GENERALIZATION STOCKS ===")
for s in ADHOC_STOCKS:
    sym = s["symbol"]
    try:
        data = sc.get_company_data(sym)
        if not data or "error" in data:
            print(f"[FAIL] {sym}: Screener error - {data.get('error') if data else 'Empty'}")
            continue
        dossier = PullResearchEngine.generate_research_dossier(sym, data)
        name = dossier.get("company_name", "N/A")
        print(f"[OK] {sym:<12} | {name:<35}")
    except Exception as e:
        print(f"[EXCEPTION] {sym}: {type(e).__name__} - {e}")

print("\n=== 3. TESTING DIGEST GENERATION ===")
try:
    ds = DigestService(sc)
    digest = ds.generate_digest(window_days=1, include_collapsed_routine=False)
    print(f"[OK] Digest generated: {digest['total_announcements']} total, {digest['visible_announcements']} visible, {digest['routine_collapsed_count']} routine buried")
except Exception as e:
    print(f"[EXCEPTION] Digest generation failed: {type(e).__name__} - {e}")

print("\n=== 4. TESTING ALERT EVALUATION ===")
try:
    als = AlertService(mc, sc)
    alerts = als.evaluate_all_alerts(volume_spike_factor=2.0, price_threshold_pct=3.0)
    print(f"[OK] Alerts evaluated: {alerts['total_alerts']} triggered anomalies")
except Exception as e:
    print(f"[EXCEPTION] Alert evaluation failed: {type(e).__name__} - {e}")
