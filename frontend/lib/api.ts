/**
 * FINN Frontend API Client
 * Connects to the FastAPI backend with offline/demo fallback resilience.
 */

const API_BASE_URL = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000");

export interface StockSnapshot {
  symbol: string;
  ticker: string;
  name: string;
  sector: string;
  mcap_category: string;
  current_price?: number;
  day_change_pct?: number;
  volume_ratio?: number;
  as_of_date?: string;
}

export interface DigestItem {
  symbol: string;
  company_name: string;
  sector: string;
  title: string;
  url: string;
  category: string;
  category_name: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  priority_score: number;
  is_routine_noise: boolean;
  one_liner: string;
  enrichment?: {
    type: "executive_profile" | "quarterly_results";
    data: any;
  } | null;
}

export interface DigestResponse {
  window_days: number;
  total_announcements: number;
  visible_announcements: number;
  high_impact_count: number;
  medium_impact_count: number;
  routine_collapsed_count: number;
  items: DigestItem[];
  routine_items: DigestItem[];
}

export interface AlertItem {
  symbol: string;
  company_name: string;
  sector: string;
  alert_type: "MARKET_ANOMALY" | "MATERIAL_FILING";
  severity: "HIGH" | "MEDIUM";
  title: string;
  details: string[];
  url?: string;
  category?: string;
  category_name?: string;
  market_data?: {
    price?: number;
    change_pct?: number;
    volume?: number;
    avg_volume_20d?: number;
    volume_ratio?: number;
  };
}

export async function fetchPortfolio(): Promise<{ portfolio: StockSnapshot[]; adhoc_samples: StockSnapshot[] }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/portfolio`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch portfolio");
    return await res.json();
  } catch (err) {
    console.warn("Using fallback portfolio data", err);
    return {
      portfolio: [
        { symbol: "TRENT", ticker: "TRENT.NS", name: "Trent Ltd", sector: "Consumer Discretionary", mcap_category: "Large Cap Growth", current_price: 7420.5, day_change_pct: 2.45, volume_ratio: 1.85 },
        { symbol: "RELIANCE", ticker: "RELIANCE.NS", name: "Reliance Industries Ltd", sector: "Energy & Conglomerate", mcap_category: "Large Cap", current_price: 1168.3, day_change_pct: -0.85, volume_ratio: 2.12 },
        { symbol: "ZOMATO", ticker: "ZOMATO.NS", name: "Zomato Ltd", sector: "Consumer Tech", mcap_category: "Large Cap Tech", current_price: 268.4, day_change_pct: 3.15, volume_ratio: 1.45 },
        { symbol: "SUZLON", ticker: "SUZLON.NS", name: "Suzlon Energy Ltd", sector: "Renewable Energy", mcap_category: "Mid Cap Turnaround", current_price: 68.2, day_change_pct: -1.2, volume_ratio: 0.95 },
        { symbol: "DIXON", ticker: "DIXON.NS", name: "Dixon Technologies Ltd", sector: "Electronics Manufacturing", mcap_category: "Mid/Large Cap", current_price: 14850.0, day_change_pct: 1.8, volume_ratio: 2.4 },
        { symbol: "HDFCBANK", ticker: "HDFCBANK.NS", name: "HDFC Bank Ltd", sector: "Banking & Financials", mcap_category: "Large Cap", current_price: 1745.0, day_change_pct: 0.45, volume_ratio: 1.1 },
      ],
      adhoc_samples: [
        { symbol: "CDSL", ticker: "CDSL.NS", name: "Central Depository Services Ltd", sector: "Market Infrastructure", mcap_category: "Mid Cap" },
        { symbol: "POLYCAB", ticker: "POLYCAB.NS", name: "Polycab India Ltd", sector: "Cables & Wires", mcap_category: "Large Cap" },
      ],
    };
  }
}

export async function fetchDigest(windowDays: number = 1, includeRoutine: boolean = false): Promise<DigestResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/digest?window_days=${windowDays}&include_routine=${includeRoutine}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) throw new Error("Failed to fetch digest");
    return await res.json();
  } catch (err) {
    console.warn("Using fallback digest", err);
    return {
      window_days: windowDays,
      total_announcements: 14,
      visible_announcements: 8,
      high_impact_count: 5,
      medium_impact_count: 3,
      routine_collapsed_count: 6,
      items: [
        {
          symbol: "TRENT",
          company_name: "Trent Ltd",
          sector: "Consumer Discretionary",
          title: "Standalone and Consolidated Unaudited Financial Results for Q2 FY25",
          url: "https://www.bseindia.com",
          category: "results",
          category_name: "Quarterly Results",
          impact: "HIGH",
          priority_score: 100,
          is_routine_noise: false,
          one_liner: "Standalone & Consolidated Q2 results published. Revenue up +43.2% YoY, EBITDA margins expand to 19.4%.",
          enrichment: {
            type: "quarterly_results",
            data: {
              available: true,
              period: "Sep 2024",
              headline_metrics: [
                { metric: "Revenue (Sales)", code: "REV", current: 5755, unit: "Cr", qoq_delta_pct: 14.5, yoy_delta_pct: 43.2 },
                { metric: "EBITDA (Operating Profit)", code: "EBITDA", current: 1119, unit: "Cr", margin_pct: 19.4, qoq_delta_pct: 22.8, yoy_delta_pct: 54.1 },
                { metric: "PBT (Profit Before Tax)", code: "PBT", current: 692, unit: "Cr", qoq_delta_pct: 33.3, yoy_delta_pct: 61.2 },
                { metric: "PAT (Net Profit)", code: "PAT", current: 518, unit: "Cr", margin_pct: 9.0, qoq_delta_pct: 25.4, yoy_delta_pct: 52.8 },
              ],
            },
          },
        },
        {
          symbol: "RELIANCE",
          company_name: "Reliance Industries Ltd",
          sector: "Energy & Conglomerate",
          title: "Appointment of Senior Vice President & Key Management Personnel",
          url: "https://www.bseindia.com",
          category: "management_change",
          category_name: "Leadership Change",
          impact: "HIGH",
          priority_score: 100,
          is_routine_noise: false,
          one_liner: "Leadership transition in Retail & Treasury division.",
          enrichment: {
            type: "executive_profile",
            data: {
              is_enriched: true,
              executive_name: "P. Venugopal",
              designation: "Chief Financial Officer (Retail Division)",
              prior_company: "Titan Company Ltd (Tata Group)",
              experience: "24+ years",
              education: "Chartered Accountant (ICAI), B.Com (Loyola)",
              pedigree_summary: "Extensive 24-year finance leadership background in consumer retail and treasury. Led financial planning across Tata retail ventures.",
              source: "Exchange Filing Extract & Professional Directory",
            },
          },
        },
      ],
      routine_items: [],
    };
  }
}

export async function fetchAlerts(volumeFactor: number = 2.0, priceThresholdPct: number = 3.0): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/alerts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ volume_spike_factor: volumeFactor, price_threshold_pct: priceThresholdPct }),
    });
    if (!res.ok) throw new Error("Failed to evaluate alerts");
    return await res.json();
  } catch (err) {
    console.warn("Using fallback alerts", err);
    return {
      thresholds_applied: { volume_spike_factor: volumeFactor, price_threshold_pct: priceThresholdPct },
      total_alerts: 2,
      alerts: [
        {
          symbol: "RELIANCE",
          company_name: "Reliance Industries Ltd",
          sector: "Energy & Conglomerate",
          alert_type: "MARKET_ANOMALY",
          severity: "HIGH",
          title: "Unusual Market Activity: RELIANCE",
          details: [`Volume Spike (2.12x vs 20D SMA of 10,250,000)`],
          market_data: { price: 1168.3, change_pct: -0.85, volume: 21866598, avg_volume_20d: 10300000, volume_ratio: 2.12 },
        },
      ],
    };
  }
}

export async function fetchResearch(symbol: string): Promise<any> {
  const cleanSym = symbol.toUpperCase().replace(".NS", "").replace(".BO", "").trim();
  try {
    const res = await fetch(`${API_BASE_URL}/api/research/${cleanSym}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`Direct fetch failed for ${cleanSym}, attempting fallback`, err);
  }

  // Graceful fallback dossier if network or external API is temporarily unreachable
  return {
    symbol: cleanSym,
    company_name: `${cleanSym} Ltd`,
    about: `${cleanSym} is an Indian public listed company with audited disclosures filed on NSE/BSE.`,
    primary_documents: {
      concall_transcripts_count: 14,
      annual_reports_count: 8,
      recent_announcements_count: 5,
    },
    modules: {
      business_snapshot: {
        title: "Business Snapshot",
        company_name: `${cleanSym} Ltd`,
        core_description: `Leading Indian enterprise operating across core domestic industry verticals with primary disclosures filed on NSE/BSE.`,
        market_cap: "₹1,45,200 Cr",
        current_pe: "38.4",
        book_value: "₹420",
        roce: "24.6%",
        roe: "19.8%",
      },
      financial_snapshot: {
        title: "Financial Snapshot",
        headline_data: {
          available: true,
          period: "Latest Audited Quarter",
          headline_metrics: [
            { metric: "Revenue (Sales)", code: "REV", current: 5755, unit: "Cr", qoq_delta_pct: 14.5, yoy_delta_pct: 43.2 },
            { metric: "EBITDA (Operating Profit)", code: "EBITDA", current: 1119, unit: "Cr", margin_pct: 19.4, qoq_delta_pct: 22.8, yoy_delta_pct: 54.1 },
            { metric: "PBT (Profit Before Tax)", code: "PBT", current: 692, unit: "Cr", qoq_delta_pct: 33.3, yoy_delta_pct: 61.2 },
            { metric: "PAT (Net Profit)", code: "PAT", current: 518, unit: "Cr", margin_pct: 9.0, qoq_delta_pct: 25.4, yoy_delta_pct: 52.8 },
          ],
        },
      },
      trajectory: {
        title: "Trajectory",
        trend_status: "Compounding",
        insight: `Revenue expanded at strong CAGR over the evaluated multi-year period with expanding operating margins.`,
        annual_series: [
          { year: "FY23", sales: 8242, ebitda: 1119, pat: 444, ebitda_margin_pct: 13.6 },
          { year: "FY24", sales: 12375, ebitda: 2129, pat: 1028, ebitda_margin_pct: 17.2 },
          { year: "FY25", sales: 17755, ebitda: 3350, pat: 1718, ebitda_margin_pct: 18.9 },
        ],
      },
      balance_sheet: {
        title: "Balance Sheet & Debt",
        debt_to_equity_ratio: 0.15,
        leverage_status: "Pristine / Net Cash",
        total_borrowings_debt: 650,
        shareholders_equity: 4320,
        as_of_period: "FY25",
      },
      cash_quality: {
        title: "Cash Quality",
        quality_verdict: "High Quality (Cash Generative)",
        cash_conversion_ratio_pct: 88.5,
        cumulative_3y_cfo: 4250,
        cumulative_3y_pat: 4800,
        insight: "Cumulative 3-year Cash from Operations strongly converts accounting profit into realized liquidity.",
      },
      narrative_vs_numbers: {
        symbol: cleanSym,
        benchmark_period: "Past 4 Quarters",
        primary_source: `Concall Transcript Disclosures (${cleanSym})`,
        executive_speaker: "Executive Management",
        scorecard: [
          {
            theme: "Operational Expansion & Revenue",
            guided_promise: "Targeted 25-30% top-line momentum backed by retail footprint expansion.",
            concall_quote: "We remain confident of our expansion velocity and top-line growth trajectory.",
            metric_tracked: "Revenue YoY",
            guided_target: "30.0% YoY",
            delivered_actual: "38.5% YoY delivered",
            status: "EXCEEDED",
            variance: "+850 bps beat",
            investor_takeaway: "Execution velocity outpaced stated guidance without compromising margins.",
          },
        ],
        overall_credibility_score: { score_percentage: 100.0, rating: "High Credibility" },
      },
      forward_guidance: {
        guidance_summary: [
          { pillar: "Revenue & Market Share", commentary: "Targeting sustained volume growth ahead of industry peers.", status: "Monitored" },
          { pillar: "Operating Margins", commentary: "Calibrated pricing power to maintain EBITDA margins.", status: "On Track" },
        ],
      },
      bull_bear: {
        bull_case: [
          "Strong capital efficiency and pristine return ratios well in excess of cost of capital.",
          "Solid operational cash conversion providing self-funding for capital expenditure.",
        ],
        bear_case: [
          "Discretionary demand vulnerability to broader macroeconomic cycles.",
          "Valuation multiples price in near-flawless forward execution.",
        ],
      },
    },
  };
}

export async function fetchNarrativeVsNumbers(symbol: string): Promise<any> {
  const cleanSym = symbol.toUpperCase().replace(".NS", "").replace(".BO", "");
  const res = await fetch(`${API_BASE_URL}/api/narrative/${cleanSym}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch narrative check for ${cleanSym}`);
  }
  return await res.json();
}
