import { findTrendFor, formatTrendValue, getMetricTrend, type MetricTrend } from "@/lib/esg-metric-trends";

/** Convert only full employee coverage to counts; percentages cannot establish procurement amounts or operation totals. */
export function inclusionPresentation(metric: { id?: string | undefined; label: string; value: string }, trends: MetricTrend[]) {
  const trend = findTrendFor(metric, trends);
  if (!metric.value.includes("%") && !trend?.percent && trend?.unit !== "%") return { value: metric.value, trend };
  const employeeCoverage = metric.label === "Employees Covered by Equal Opportunity Policies" || metric.label === "Medical Coverage for Employees";
  const employees = getMetricTrend("Employees", trends);
  const countTrend: MetricTrend | undefined = trend ? {
    ...trend,
    unit: employeeCoverage ? "No." : metric.label === "Procurement from MSMEs" ? "₹ Mn" : "No.",
    percent: false,
    summary: "",
    years: trend.years.map((point) => {
      const total = employees?.years.find((year) => year.year === point.year);
      const value = employeeCoverage && point.value === 100 && total?.value != null && !total.approximate && !point.approximate ? total.value : null;
      return { year: point.year, value };
    }),
  } : undefined;
  const current = countTrend?.years.at(-1)?.value;
  return { value: current != null && countTrend ? formatTrendValue(countTrend, current) : "Not Disclosed", trend: countTrend };
}