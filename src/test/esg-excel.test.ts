import { describe, expect, it } from "vitest";
import { GRAPH_COLUMNS, graphRows, parseGraphRows, mergeGraphImport, makeGraphWorkbook, readGraphWorkbook, type GraphRow } from "@/lib/esg-excel";
import type { MetricTrend } from "@/lib/esg-metric-trends";

const cards = [{ id: "env-energy", title: "Energy" }];
const trend: MetricTrend = { metricId: "env-energy", label: "Energy", unit: "GJ", polarity: "lower", summary: "", source: "", years: [{ year: "FY 2024–25", value: 210866 }, { year: "FY 2025–26", value: 164283 }] };
const rows = () => graphRows(cards, [trend]);
const parse = (r: GraphRow[]) => parseGraphRows([...GRAPH_COLUMNS], r, cards);

describe("Excel Sustainability graphs", () => {
  it("imports exact numbers and links them to their figure card", () => {
    expect(parse(rows())[0]).toMatchObject({ metricId: "env-energy", years: [{ year: "FY 2024–25", value: 210866 }, { year: "FY 2025–26", value: 164283 }] });
  });
  it("keeps missing data null rather than zero", () => {
    const r = rows(); const a = r[0]; if (!a) throw new Error("Missing fixture"); a[3] = null;
    expect(parse(r)[0]?.years[0]?.value).toBeNull();
  });
  it("preserves an actual zero", () => {
    const r = rows(); const a = r[0]; if (!a) throw new Error("Missing fixture"); a[3] = 0;
    expect(parse(r)[0]?.years[0]?.value).toBe(0);
  });
  it("rejects mismatched headers", () => {
    expect(() => parseGraphRows(["Wrong", ...GRAPH_COLUMNS.slice(1)], rows(), cards)).toThrow("Columns do not match");
  });
  it("rejects a metric from the other page", () => {
    expect(() => parseGraphRows([...GRAPH_COLUMNS], rows(), [{ id: "social-lives", title: "Lives" }])).toThrow("does not belong to this page");
  });
  it("rejects duplicate metric-year rows", () => {
    const r = rows(); const a = r[0]; if (!a) throw new Error("Missing fixture");
    expect(() => parse([...r, a])).toThrow("Duplicate");
  });
  it("rejects non-numeric values rather than silently clearing them", () => {
    const r = rows(); const a = r[0]; if (!a) throw new Error("Missing fixture"); a[3] = "abc";
    expect(() => parse(r)).toThrow("Value must be a number");
  });
  it("rejects conflicting chart settings across years", () => {
    const r = rows(); const a = r[0]; if (!a) throw new Error("Missing fixture"); a[8] = "line";
    expect(() => parse(r)).toThrow("identical across years");
  });
  it("sorts added financial years chronologically", () => {
    const r = rows(); const a = r[0]; if (!a) throw new Error("Missing fixture"); a[2] = "FY 2026-27";
    expect(parse(r)[0]?.years.map((y) => y.year)).toEqual(["FY 2025–26", "FY 2026–27"]);
  });
  it("preserves Social and omitted charts while replacing imported Environmental years", () => {
    const social = { ...trend, metricId: "social-lives", label: "Lives" };
    const omitted = { ...trend, metricId: "env-water", label: "Water" };
    const update = { ...trend, years: [{ year: "FY 2025–26", value: 72 }] };
    expect(mergeGraphImport([trend, social, omitted], [update], cards)).toEqual([social, omitted, update]);
  });
  it("replaces name-matched defaults without duplicating the graph", () => {
    const { metricId: _id, ...unlinked } = trend;
    expect(mergeGraphImport([unlinked], [trend], cards)).toEqual([trend]);
  });
  it("round-trips the sample workbook through the same importer", async () => {
    const buffer = await makeGraphWorkbook("environmental", cards, [trend]);
    expect((await readGraphWorkbook(buffer, cards))[0]?.years).toMatchObject(trend.years);
  });
  it("imports chart title, line type and notes from Excel", () => {
    const r = rows();
    for (const a of r) { a[7] = "Energy comparison"; a[8] = "line"; }
    expect(parse(r)[0]).toMatchObject({ title: "Energy comparison", chartType: "line" });
  });
  it("rejects percentages beyond 100", () => {
    const r = rows(); for (const a of r) { a[10] = "Yes"; }
    expect(() => parse(r)).toThrow("between 0 and 100");
  });
});
