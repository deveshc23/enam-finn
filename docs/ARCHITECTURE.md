# FINN System Architecture & Technical Specifications

---

## 1. System Overview

FINN is an AI-powered intelligence layer designed for public-market equity investment teams. It is built as a decoupled, mobile-first client paired with a high-performance Python FastAPI service.

```
┌─────────────────────────────────────────────────────────────┐
│                 Client Viewport (Next.js 14)                │
│  [Digest Feed]   [Trigger Alerts]   [Pull 8-Module Engine]  │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON REST API
┌──────────────────────────────▼──────────────────────────────┐
│                    FastAPI Core Service                     │
│  • Classification & Priority Ranking (16 Categories)        │
│  • Anomaly Detector (Volume Spike vs 20D SMA, Day % Delta)  │
│  • Headline Results Parser (Revenue, EBITDA, PBT, PAT)      │
│  • Narrative vs Numbers Analyzer (Guidance Scorecard)       │
│  • Executive Biographical Enricher                          │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
    ┌───────────▼──────────┐      ┌───────────▼───────────┐
    │  Screener / BSE Feeds│      │     Yahoo Finance     │
    │  • Quarterly P&L     │      │  • EOD Close Price    │
    │  • Concall Transcripts│     │  • Daily Volume       │
    │  • Annual Reports    │      │  • 20-Day SMA Volume  │
    └──────────────────────┘      └───────────────────────┘
```

---

## 2. Mock Portfolio Design (16 Holdings)

The mock portfolio captures varied operating profiles, ownership structures, and capital allocation models:

1. **RELIANCE.NS** (Energy / Conglomerate) - Large Cap anchor, telecom capex inflection.
2. **TCS.NS** (IT Services) - Global exporter, currency & margin play.
3. **HDFCBANK.NS** (Banking) - Post-merger credit-to-deposit ratio transition.
4. **TRENT.NS** (Consumer Retail) - Hyper-growth, Zudio retail store economics.
5. **DIXON.NS** (EMS / Electronics) - PLI scheme execution, capex vs operating cash conversion.
6. **HAL.NS** (Defence PSU) - Multi-year sovereign defence order book.
7. **TATAMOTORS.NS** (Auto & EV) - CV upcycle and JLR free cash flow generation.
8. **LT.NS** (Capital Goods / EPC) - Barometer for domestic Indian capex.
9. **SUNPHARMA.NS** (Pharma) - Specialty US pipeline vs generic pricing.
10. **ZOMATO.NS** (Consumer Tech) - Blinkit quick-commerce unit economics and platform EBITDA.
11. **SUZLON.NS** (Renewables) - Debt-free turnaround and turbine installations.
12. **ITC.NS** (FMCG / Conglomerate) - Cigarettes cash cow, hotel demerger.
13. **PIIND.NS** (Agrochem) - Custom synthesis (CSM) export cycles.
14. **DLF.NS** (Real Estate) - Luxury residential pre-sales vs cash collections.
15. **HDFCAMC.NS** (Asset Management) - Financialization of Indian household savings.
16. **KEC.NS** (Power T&D) - Working capital cycle days and EPC execution.

**Generalization Test Set (outside portfolio)**:
- `CDSL.NS` (Market Infrastructure)
- `POLYCAB.NS` (Cables & Wires)
- `KALYANKJIL.NS` (Retail Jewellery)

---

## 3. Data Pipelines & Computation Layer

### A. Deterministic Math Engine
- **Volume Ratio**: $\text{Ratio} = \frac{\text{Current Session Volume}}{\text{20-Day Simple Moving Average}}$
- **Single-Day Price Delta**: $\Delta P\% = \frac{P_{\text{close}} - P_{\text{prev}}}{P_{\text{prev}}} \times 100$
- **Headline Financials**:
  - $\text{QoQ Delta} = \frac{\text{Metric}_t - \text{Metric}_{t-1}}{|\text{Metric}_{t-1}|} \times 100$
  - $\text{YoY Delta} = \frac{\text{Metric}_t - \text{Metric}_{t-4}}{|\text{Metric}_{t-4}|} \times 100$
  - $\text{EBITDA Margin} = \frac{\text{EBITDA}}{\text{Revenue}} \times 100$
- **Cash Conversion Efficiency**: $\text{Conversion} = \frac{\sum_{3\text{y}} \text{CFO}}{\sum_{3\text{y}} \text{PAT}} \times 100$
- **Debt-to-Equity (D/E)**: $\text{D/E} = \frac{\text{Total Borrowings}}{\text{Equity Capital} + \text{Reserves}}$

### B. Intelligent Primary Document Processing
- Scrapes normalized HTML financial tables and document links from Screener.in.
- Parses Concall transcript PDFs, investor presentation PPTs, and BSE exchange announcement PDFs.
- Caches scraped tables on disk with configurable TTL to achieve sub-50ms repeat retrieval times.

---

## 4. API Endpoints Contract

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service health status |
| `GET` | `/api/portfolio` | 16-stock universe with live EOD prices and daily % changes |
| `GET` | `/api/digest` | Windowed announcement digest with priority filtering |
| `POST` | `/api/alerts` | Triggered alerts evaluated against configurable thresholds |
| `GET` | `/api/research/{symbol}` | 8-module on-demand primary research dossier for ANY NSE ticker |
| `GET` | `/api/narrative/{symbol}` | Guidance audit (Concall promises vs delivered financial actuals) |
| `GET` | `/api/categories` | Metadata for the 16 standard announcement categories |
