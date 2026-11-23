// Values copied verbatim from RIL_ESG_Comparison_FY24-25_vs_FY25-26_3.xlsx (sheet "ESG Data").
// null = not disclosed / not tracked in that year. FY 2023-24 is not in the sheet.
export type Polarity = "lower" | "higher" | "neutral";
export interface YearPoint {
  year: string;
  value: number | null;
  /** Shown instead of value when null, or alongside it when approximate. */
  note?: string;
  approximate?: boolean;
}

export interface MetricTrend {
  label: string;
  unit: string;
  polarity: Polarity;
  percent?: boolean;
  /** Ordered oldest → newest; the last two are compared. */
  years: YearPoint[];
  summary: string;
  source: string;
  /** Optional heading shown above the chart (defaults to "Trend"). */
  title?: string | undefined;
  /** Bar (default) or line chart. */
  chartType?: "bar" | "line";
  /** Id of the figure card (esg_items row) this chart sits under; chosen in admin. */
  metricId?: string | undefined;
}

type Pt = Omit<YearPoint, "year">;
const ND: Pt = { value: null, note: "Not disclosed" };
const NT: Pt = { value: null, note: "Not tracked" };

function t(label: string, unit: string, polarity: Polarity, fy25: Pt | number, fy26: Pt | number, summary: string, source: string, percent = false): MetricTrend {
  const p = (year: string, v: Pt | number): YearPoint => (typeof v === "number" ? { year, value: v } : { year, ...v });
  return { label, unit, polarity, percent, summary, source, years: [p("FY 2024–25", fy25), p("FY 2025–26", fy26)] };
}

export const METRIC_TRENDS: MetricTrend[] = [
  t("Reduction in Energy Consumption", "GJ", "lower", 210866, 164283, "Total energy consumed fell by 46,583 GJ year on year.", "BRSR 24-25 p.75; BRSR 25-26 p.123"),
  t("Reduction in Scope 1 & 2 Emissions", "tCO2e", "lower", 42663.87, 28890.265, "Scope 1: 7,068.59 → 2,337.84; Scope 2: 35,595.28 → 26,552.43 tCO2e.", "BRSR 24-25 p.77; BRSR 25-26 p.125"),
  t("Reduction in Water Consumption", "KL", "lower", 4887800, 810296, "FY 2025–26 excludes ~50.72 lakh KL third-party water at JNPC passed on to industries (boundary change) – not a like-for-like saving.", "BRSR 24-25 p.75; BRSR 25-26 p.124"),
  t("of Waste Generated Was Recycled", "%", "higher", NT, 98.4909465510878, "1,694.65 MT recycled of 1,720.615 MT generated in FY 2025–26. Waste was not tracked in FY 2024–25, so no comparison is available.", "BRSR 25-26 p.126-127", true),
  t("Environmental Compliance", "%", "higher", { value: 100, note: "No non-compliances, fines or penalties" }, { value: 100, note: "No non-compliances, fines or penalties" }, "Fully compliant in both years – no non-compliances, fines or penalties.", "BRSR 24-25 p.79; BRSR 25-26 p.128", true),
  t("Lives Impacted", "No.", "higher", ND, 45074, "45,074 lives impacted in FY 2025–26 (reported as 45,000+). Not disclosed for FY 2024–25.", "BRSR 25-26 p.133; AR 25-26 p.40"),
  t("CSR Activities", "No.", "higher", 42, { value: 50, approximate: true, note: "Reported as 50+" }, "42 projects listed in FY 2024–25; reported as 50+ in FY 2025–26. As the FY 2025–26 figure is approximate, no exact change is calculated.", "AR 24-25 p.49-51; AR 25-26 p.40"),
  t("CSR Spend", "₹ Mn", "neutral", 59.2, 58.3, "Spend equal to the 2% CSR obligation in both years.", "AR 24-25 p.34, 51; AR 25-26 p.76, 94-95"),
  t("Health Beneficiaries", "No.", "higher", ND, 26095, "26,095 health beneficiaries in FY 2025–26. Health spend: ₹13.41 Mn (FY 2024–25), ₹12.85 Mn (FY 2025–26).", "BRSR 25-26 p.133"),
  t("Students Supported", "No.", "higher", ND, 4686, "4,686 education beneficiaries in FY 2025–26. Education spend: ₹14.90 Mn (FY 2024–25), ₹14.83 Mn (FY 2025–26).", "BRSR 25-26 p.133"),
  t("People Skill-Trained", "No.", "higher", ND, 2140, "2,140 skill-development beneficiaries in FY 2025–26. Spend: ₹14.42 Mn (FY 2024–25), ₹17.65 Mn (FY 2025–26).", "BRSR 25-26 p.133"),
  t("Employees", "No.", "neutral", 1082, 1041, "Permanent employees (no direct workers).", "BRSR 24-25 p.54; BRSR 25-26 p.97"),
  t("Employee Health Insurance Coverage", "%", "higher", 100, 100, "Full coverage maintained in both years.", "BRSR 24-25 p.66; BRSR 25-26 p.111", true),
  t("Performance Reviews Completed", "%", "higher", 100, 100, "All performance reviews completed in both years.", "BRSR 24-25 p.68; BRSR 25-26 p.113", true),
  t("Workplace Fatalities", "No.", "lower", 0, 0, "Zero fatalities in both years; FY 2025–26 includes contract workforce.", "BRSR 24-25 p.69; BRSR 25-26 p.115"),
  t("POSH Complaints", "No.", "lower", 0, 0, "Zero POSH complaints in both years.", "BRSR 24-25 p.73; BRSR 25-26 p.121"),
  t("Employees Trained on Health & Safety", "%", "higher", 100, 87.223823246878, "FY 2024–25: 1,082 of 1,082 trained; FY 2025–26: 908 of 1,041 trained.", "BRSR 24-25 p.68; BRSR 25-26 p.113", true),
  t("Employees Covered by Equal Opportunity Policies", "%", "higher", 100, 100, "Policy applies company-wide in both years.", "BRSR 24-25 p.67; BRSR 25-26 p.112", true),
  t("Medical Coverage for Employees", "%", "higher", 100, 100, "Medi-claim coverage maintained for all employees.", "BRSR 24-25 p.66; BRSR 25-26 p.111", true),
  t("Procurement from MSMEs", "%", "higher", 10.3, 13.9, "Share of input material (by value) sourced from MSMEs.", "BRSR 24-25 p.80; BRSR 25-26 p.131", true),
  t("Operations Assessed for Health & Safety", "%", "higher", 100, 100, "All plants and offices assessed in both years.", "BRSR 24-25 p.70; BRSR 25-26 p.116", true),
];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
/** Chart for a figure card: an explicit admin link wins; unlinked charts fall back to a matching name. */
export function findTrendFor(card: { id?: string | undefined; label: string }, list: MetricTrend[] = METRIC_TRENDS) {
  if (card.id) {
    const linked = list.find((m) => m.metricId === card.id);
    if (linked) return linked;
  }
  const k = norm(card.label);
  return list.find((m) => !m.metricId && norm(m.label) === k);
}

export function getMetricTrend(label: string, list: MetricTrend[] = METRIC_TRENDS) {
  const k = norm(label);
  return list.find((m) => norm(m.label) === k);
}

export function formatTrendValue(m: MetricTrend, v: number) {
  if (m.percent) return `${v.toLocaleString("en-IN", { maximumFractionDigits: 1 })}%`;
  const s = v.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  if (m.unit === "₹ Mn") return `₹${v.toFixed(2)} Mn`;
  return m.unit === "No." ? s : `${s} ${m.unit}`;
}

export type TrendDirection = "improved" | "worsened" | "unchanged" | "changed" | "unavailable";
export interface TrendChange {
  direction: TrendDirection;
  delta?: number;
  pct?: number | undefined;
  text: string;
}

/** Change between the last two years. Never computed from missing or approximate values. */
export function computeChange(m: MetricTrend): TrendChange {
  const a = m.years[m.years.length - 2], b = m.years[m.years.length - 1];
  if (!a || !b) return { direction: "unavailable", text: "Comparison unavailable – only one year of data" };
  const vs = `vs ${a.year}`;
  if (a.value === null || b.value === null) return { direction: "unavailable", text: "Comparison unavailable – prior-year data not disclosed" };
  if (a.approximate || b.approximate) return { direction: "unavailable", text: "Exact change not calculated – approximate figure reported" };
  const delta = b.value - a.value;
  if (Math.abs(delta) < 1e-9) return { direction: "unchanged", delta: 0, pct: 0, text: `No change ${vs}` };
  const pct = a.value === 0 ? undefined : (delta / a.value) * 100;
  const up = delta > 0;
  const direction: TrendDirection = m.polarity === "neutral" ? "changed" : (up === (m.polarity === "higher") ? "improved" : "worsened");
  const arrow = up ? "▲" : "▼";
  const mag = m.percent
    ? `${Math.abs(delta).toFixed(1)} pp`
    : `${pct === undefined ? "" : Math.abs(pct).toFixed(1) + "% "}(${up ? "+" : "−"}${formatTrendValue(m, Math.abs(delta))})`;
  return { direction, delta, pct, text: `${arrow} ${up ? "Increase" : "Decrease"} of ${mag} ${vs}` };
}
