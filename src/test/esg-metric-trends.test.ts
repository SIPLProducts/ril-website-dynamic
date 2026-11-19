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
    expect(getMetricTrend("Lives Impacted")!.years.find((y) => y.year === "FY 2024–25")!.value).toBeNull();
  });
  it("charts compare FY 2024–25 with FY 2025–26 only", () => {
    for (const m of METRIC_TRENDS) expect(m.years.map((y) => y.year)).toEqual(["FY 2024–25", "FY 2025–26"]);
  });
  it("a newly added year is compared with the year before it", () => {
    const m = getMetricTrend("Procurement from MSMEs")!;
    const c = computeChange({ ...m, years: [...m.years, { year: "FY 2026–27", value: 12.9 }] });
    expect(c.direction).toBe("worsened");
    expect(c.text).toContain("vs FY 2025–26");
  });
});

import { orderSustainability, parseSettings } from "@/lib/site-settings";
describe("admin website settings", () => {
  it("menu order from admin is applied and missing items are appended", () => {
    const s = parseSettings([{ key: "main_menu", value: ["accolades", "about"] }]);
    expect(s.mainMenu.slice(0, 3)).toEqual(["accolades", "about", "management"]);
    expect(s.mainMenu).toHaveLength(7);
  });
  it("sustainability tabs follow admin order and renamed labels", () => {
    const out = orderSustainability([{ slug: "policies", title: "Policies" }, { slug: "social", title: "Social" }], [{ slug: "social", label: "People" }]);
    expect(out.map((o) => o.title)).toEqual(["People", "Policies"]);
  });
  it("download can be switched off", () => {
    expect(parseSettings([{ key: "pdf_viewer", value: { allowDownload: false } }]).pdfViewer.allowDownload).toBe(false);
    expect(parseSettings([]).pdfViewer.allowDownload).toBe(true);
  });
});
