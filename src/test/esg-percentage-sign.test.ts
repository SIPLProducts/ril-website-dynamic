import { describe, expect, it } from "vitest";
import { findTrendFor, getMetricTrend, percentageSign, trendSign, type MetricTrend } from "@/lib/esg-metric-trends";
import { GRAPH_COLUMNS, graphRows, parseGraphRows } from "@/lib/esg-excel";

describe("Environmental displayed percentage signs", () => {
  it("classifies 22%, 32%, 83% and 100% as positive", () => {
    for (const value of ["22%", "32%", "83%", "100%"]) {
      expect(percentageSign(value)).toBe("positive");
    }
  });
  it("classifies negative percentages as negative", () => {
    expect(percentageSign("-22%")).toBe("negative");
    expect(percentageSign("−32%")).toBe("negative");
  });
  it("leaves zero, missing and non-percentage values neutral", () => {
    for (const value of ["0%", "", "Not disclosed", "2026"]) {
      expect(percentageSign(value)).toBe("neutral");
    }
  });
});

describe("Environmental numerical year-on-year direction", () => {
  it.each([
    ["22%", "Reduction in Energy Consumption"],
    ["32%", "Reduction in Scope 1 & 2 Emissions"],
    ["83%", "Reduction in Water Consumption"],
  ])("classifies the %s headline as negative from its falling data", (_headline, label) => {
    const trend = getMetricTrend(label);
    expect(trend).toBeDefined();
    expect(trendSign(trend)).toBe("negative");
  });
  it("classifies unchanged 100% compliance as neutral", () => {
    expect(trendSign(getMetricTrend("Environmental Compliance"))).toBe("neutral");
  });
  it("classifies an increase as positive regardless of benefit", () => {
    const trend = getMetricTrend("Reduction in Energy Consumption");
    if (!trend) throw new Error("Missing energy trend");
    expect(trendSign({ ...trend, years: [{ year: "FY 2024–25", value: 164283 }, { year: "FY 2025–26", value: 210866 }] })).toBe("positive");
  });
  it("does not invent change for missing or approximate values", () => {
    expect(trendSign(undefined)).toBe("neutral");
    expect(trendSign(getMetricTrend("of Waste Generated Was Recycled"))).toBe("neutral");
    const trend: MetricTrend = { label: "Approximate", unit: "GJ", polarity: "lower", years: [{ year: "FY 2024–25", value: 100 }, { year: "FY 2025–26", value: 80, approximate: true }], summary: "", source: "" };
    expect(trendSign(trend)).toBe("neutral");
  });
  it("uses the same negative direction for an Excel-imported, explicitly linked figure", () => {
    const energy = getMetricTrend("Reduction in Energy Consumption");
    if (!energy) throw new Error("Missing energy trend");
    const card = { id: "energy-card", title: energy.label };
    const imported = parseGraphRows([...GRAPH_COLUMNS], graphRows([card], [energy]), [card]);
    const linked = findTrendFor({ id: card.id, label: "Renamed energy figure" }, imported);
    expect(linked?.years.map((y) => y.value)).toEqual([210866, 164283]);
    expect(trendSign(linked)).toBe("negative");
  });
});