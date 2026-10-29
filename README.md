# FINN: Financial Investment Agent
### ENAM Holdings AI Engineer Build Challenge Prototype

FINN is a mobile-first financial investment agent built for high-conviction public-market equity investors in Indian markets (NSE/BSE).

---

## Key Highlights

- **Dual Interaction Architecture**:
  - **PUSH Mode**: 24-hour windowed digest prioritizing high-signal filings (Quarterly Results, M&A, Leadership moves) while burying routine compliance noise. Real-time configurable threshold alerts (Volume $> 2.0\times$ 20D SMA, Price move $> \pm 3\%$).
  - **PULL Mode**: On-demand deep-dive grounded **strictly in primary sources** (Annual Reports, Concall Transcripts, Exchange Filings).
- **The Showcase: Narrative vs. Numbers**:
  - Automatically audits past management concall promises against actual audited results delivered over subsequent quarters.
- **Strictly Grounded & Hallucination-Free**:
  - All numerical metrics (QoQ, YoY, EBITDA Margins, Cash Conversion, Debt/Equity, Volume vs 20D SMA) are computed deterministically.
- **Universal Generalization**:
  - Pre-configured with a 16-stock mock portfolio, and generalises dynamically to **any** NSE ticker (e.g. `CDSL`, `POLYCAB`, `HAL`, etc.).
- **Mobile-First UX (Zero "AI Slop")**:
  - High information density, scannable cards, interactive threshold sliders, and dedicated mobile frame view.

---

## Project Structure

```
enam_project/
├── backend/                  # FastAPI Intelligence Core
│   ├── app/
│   │   ├── config.py         # 16-stock portfolio & 16 announcement classifications
│   │   ├── main.py           # FastAPI routes & endpoints
│   │   ├── data/
│   │   │   ├── market_client.py    # yfinance EOD price, volume, 20D SMA
│   │   │   └── screener_client.py  # Primary source financial statements & concalls
│   │   └── engine/
│   │       ├── classifier.py       # 16-category filing classifier & priority ranker
│   │       ├── extractor.py        # Headline quarterly P&L parser (Rev, EBITDA, PBT, PAT)
│   │       ├── narrative_analyzer.py # Concall guidance vs Delivered actuals (Star feature)
│   │       ├── pull_modules.py     # All 8 financial modules
│   │       └── digest_service.py   # Windowed digest orchestrator
│   ├── requirements.txt
│   └── run.py                # Server runner (port 8000)
├── frontend/                 # Mobile-First Next.js 14 Client
│   ├── components/           # MobileFrame, DigestFeed, AlertCenter, ResearchPull, NarrativeVsNumbers
│   └── app/                  # App Router, Layout, Styling
├── docs/
│   ├── COVERING_NOTE.md      # Email covering note for assessment@enam.com
│   └── ARCHITECTURE.md       # Full technical architecture specification
└── README.md
```

---

## Quickstart Guide

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python run.py
```
Backend runs at `http://localhost:8000`. Test via `http://localhost:8000/health`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run build
npm start
```
Frontend runs at `http://localhost:3000`.

---

## Submission Details
- **Email**: `assessment@enam.com`
- **Subject**: `ENAM - IIT screening - 2027`
- **Documentation**: See `docs/COVERING_NOTE.md` and `docs/ARCHITECTURE.md`.
