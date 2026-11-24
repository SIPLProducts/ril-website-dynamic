import { describe, expect, it } from "vitest";
import { inclusionPresentation } from "@/lib/esg-inclusion";
import { METRIC_TRENDS } from "@/lib/esg-metric-trends";

describe("Social Inclusion absolute figures", () => {
  it("shows 1,041 currently and 1,082 previously for full equal-opportunity employee coverage", () => {
    const result = inclusionPresentation({ label: "Employees Covered by Equal Opportunity Policies", value: "100%" }, METRIC_TRENDS);
    expect(result.value).toBe("1,041");
    expect(result.trend?.years.map((y) => y.value)).toEqual([1082, 1041]);
    expect(result.trend?.percent).toBe(false);
  });
  it("shows the same confirmed counts for medical employee coverage", () => {
    const result = inclusionPresentation({ label: "Medical Coverage for Employees", value: "100%" }, METRIC_TRENDS);
    expect(result.value).toBe("1,041");
    expect(result.trend?.years.map((y) => y.value)).toEqual([1082, 1041]);
  });
  it.each(["Procurement from MSMEs", "Operations Assessed for Health & Safety"])("never invents an absolute value for %s", (label) => {
    const result = inclusionPresentation({ label, value: "100%" }, METRIC_TRENDS);
    expect(result.value).toBe("Not Disclosed");
    expect(result.trend?.years.map((y) => y.value)).toEqual([null, null]);
  });
  it("retains admin-provided absolute figures and chart units", () => {
    const trend = { label: "Procurement from MSMEs", unit: "₹ Mn", percent: false, polarity: "higher" as const, years: [{ year: "FY 2024–25", value: 10 }, { year: "FY 2025–26", value: 12 }], summary: "", source: "" };
    const result = inclusionPresentation({ label: trend.label, value: "₹12 Mn" }, [trend]);
    expect(result.value).toBe("₹12 Mn");
    expect(result.trend).toBe(trend);
  });
});