import { describe, expect, it } from "vitest";
import { METRIC_TRENDS, computeChange, getMetricTrend } from "@/lib/esg-metric-trends";

describe("ESG metric trends", () => {
  it("has all 21 metrics", () => expect(METRIC_TRENDS).toHaveLength(21));
  it("energy decrease is an improvement of 22.1%", () => {
    const c = computeChange(getMetricTrend("Reduction in Energy Consumption")!);
    expect(c.direction).toBe("improved");
    expect(c.pct!.toFixed(1)).toBe("-22.1");
  });
  it("H&S training drop is a worsening of 12.8 pp", () => {
    const c = computeChange(getMetricTrend("Employees Trained on Health & Safety")!);
    expect(c.direction).toBe("worsened");
    expect(c.delta!.toFixed(1)).toBe("-12.8");
  });
  it("MSME procurement rises 3.6 pp", () => {
    const c = computeChange(getMetricTrend("Procurement from MSMEs")!);
    expect(c.direction).toBe("improved");
    expect(c.delta!.toFixed(1)).toBe("3.6");
  });
  it("approximate 50+ CSR activities is not used for a calculation", () => {
    expect(computeChange(getMetricTrend("CSR Activities")!).direction).toBe("unavailable");
  });
  it("missing prior year is not treated as zero", () => {
    expect(computeChange(getMetricTrend("Lives Impacted")!).direction).toBe("unavailable");
    expect(getMetricTrend("Lives Impacted")!.years["FY 2024–25"].value).toBeNull();
  });
  it("FY 2023-24 is unavailable everywhere", () => {
    for (const m of METRIC_TRENDS) expect(m.years["FY 2023–24"].value).toBeNull();
  });
});
