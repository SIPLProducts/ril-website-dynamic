import { findTrendFor, type MetricTrend } from "@/lib/esg-metric-trends";

export type GraphPage = "environmental" | "social";
export interface GraphCard { id: string; title: string }
export const GRAPH_COLUMNS = ["Metric ID", "Metric name", "Financial year", "Value", "Note", "Approximate", "Unit", "Chart title", "Chart type", "Direction", "Percentage", "Summary", "Source"] as const;
export type GraphCell = string | number | boolean | null;
export type GraphRow = GraphCell[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const text = (v: GraphCell | undefined) => v == null ? "" : String(v).trim();

export function graphRows(cards: GraphCard[], trends: MetricTrend[]): GraphRow[] {
  return cards.flatMap((card) => {
    const m = findTrendFor({ id: card.id, label: card.title }, trends);
    const years = m?.years.length ? m.years : [{ year: "FY 2024–25", value: null }, { year: "FY 2025–26", value: null }];
    return years.map((y) => [card.id, m?.label ?? card.title, y.year, y.value, y.note ?? "", y.approximate ? "Yes" : "No", m?.unit ?? "No.", m?.title ?? "", m?.chartType ?? "bar", m?.polarity ?? "neutral", m?.percent ? "Yes" : "No", m?.summary ?? "", m?.source ?? ""]);
  });
}

/** Validate the complete import before returning any updates. Blank values remain unavailable, never zero. */
export function parseGraphRows(headers: GraphRow, rows: GraphRow[], cards: GraphCard[]): MetricTrend[] {
  if (headers.length !== GRAPH_COLUMNS.length || GRAPH_COLUMNS.some((c, i) => text(headers[i]) !== c)) {
    throw new Error(`Columns do not match. Download the sample sheet and keep all ${GRAPH_COLUMNS.length} column headings unchanged and in order.`);
  }
  const groups = new Map<string, MetricTrend>();
  const errors: string[] = [];
  const metadata = new Map<string, string>();
  rows.forEach((row, i) => {
    if (row.every((v) => text(v) === "")) return;
    const n = i + 2;
    try {
      if (row.length > GRAPH_COLUMNS.length && row.slice(GRAPH_COLUMNS.length).some((v) => text(v))) throw new Error("Unexpected extra columns");
      const id = text(row[0]);
      const card = cards.find((c) => c.id === id);
      if (!card) throw new Error("Metric ID does not belong to this page. Download a fresh sample sheet");
      const label = text(row[1]);
      if (!label) throw new Error("Metric name is empty");
      const fy = text(row[2]).match(/^FY\s+(\d{4})[–-](\d{2})$/);
      if (!fy?.[1] || !fy[2] || (Number(fy[1]) + 1) % 100 !== Number(fy[2])) throw new Error("Financial year must use FY 2025–26 or FY 2025-26 format");
      const year = `FY ${fy[1]}–${fy[2]}`;
      const raw = text(row[3]);
      if (raw && !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)) throw new Error("Value must be a number or blank (no commas or % symbol)");
      const value = raw ? Number(raw) : null;
      if (value !== null && !Number.isFinite(value)) throw new Error("Value must be a finite number");
      const yesNo = (idx: number) => {
        const s = text(row[idx]).toLowerCase();
        if (!["yes", "no", "true", "false"].includes(s)) throw new Error(`${GRAPH_COLUMNS[idx]} must be Yes or No`);
        return s === "yes" || s === "true";
      };
      const approximate = yesNo(5), percent = yesNo(10);
      if (percent && value !== null && (value < 0 || value > 100)) throw new Error("Percentage values must be between 0 and 100 (enter 98.5, not 0.985)");
      const unit = text(row[6]);
      const title = text(row[7]);
      const chartType = text(row[8]).toLowerCase();
      if (chartType !== "bar" && chartType !== "line") throw new Error("Chart type must be bar or line");
      const polarity = text(row[9]).toLowerCase();
      if (polarity !== "lower" && polarity !== "higher" && polarity !== "neutral") throw new Error("Direction must be lower, higher or neutral");
      const summary = text(row[11]), source = text(row[12]);
      const signature = JSON.stringify([label, unit, title, chartType, polarity, percent, summary, source]);
      if (metadata.has(id) && metadata.get(id) !== signature) throw new Error("Chart settings must be identical across years for the same Metric ID");
      metadata.set(id, signature);
      const m = groups.get(id) ?? { metricId: id, label, unit, title, chartType, polarity, percent, summary, source, years: [] };
      if (m.years.some((y) => y.year === year)) throw new Error("Duplicate Metric ID and financial year");
      m.years.push({ year, value, note: text(row[4]) || (value === null ? "Not disclosed" : ""), approximate });
      groups.set(id, m);
    } catch (e) { errors.push(`Row ${n}: ${e instanceof Error ? e.message : "Invalid data"}`); }
  });
  if (errors.length) throw new Error(errors.slice(0, 20).join("\n") + (errors.length > 20 ? `\n…and ${errors.length - 20} more errors` : ""));
  if (!groups.size) throw new Error("The sheet contains no graph data");
  return [...groups.values()].map((m) => ({ ...m, years: [...m.years].sort((a, b) => a.year.localeCompare(b.year)) }));
}

/** Replace only included charts; never change graphs belonging to another section. */
export function mergeGraphImport(current: MetricTrend[], imported: MetricTrend[], cards: GraphCard[]): MetricTrend[] {
  const ids = new Set(imported.map((m) => m.metricId));
  const names = new Set(cards.filter((c) => ids.has(c.id)).map((c) => norm(c.title)));
  return [...current.filter((m) => m.metricId ? !ids.has(m.metricId) : !names.has(norm(m.label))), ...imported];
}

async function excel() { return (await import("exceljs")).default; }
export async function makeGraphWorkbook(page: GraphPage, cards: GraphCard[], trends: MetricTrend[]): Promise<ArrayBuffer> {
  const Excel = await excel();
  const wb = new Excel.Workbook();
  wb.creator = "Ramky Infrastructure";
  const help = wb.addWorksheet("Instructions");
  const instructions = [
    `${page === "social" ? "Social" : "Environmental"} — graph import sample`,
    "Edit the Graph Data sheet. Keep its sheet name and all column headings unchanged.",
    "The sample contains current graph values, not invented examples. Blank values are Not disclosed, never zero.",
    "Keep Metric ID unchanged; it links each chart to a figure card on this page. New cards appear in a fresh download.",
    "Use one row per metric and financial year, such as FY 2025–26. Copy a row to add a year; duplicate metric/year rows are rejected.",
    "Value: plain numbers without commas, units or % symbols. Percentages use 0–100 (98.5 means 98.5%). Zero is a real zero.",
    "Approximate and Percentage: Yes or No. Chart type: bar or line. Direction: lower, higher or neutral.",
    "Metric name, Unit, Chart title, Chart type, Direction, Percentage, Summary and Source must match across years for each metric.",
    "Note may differ per year. Blank Chart title keeps the default. Summary and Source are optional.",
    "Upload previews every included chart before saving. Saving replaces all years for included metrics only; omitted metrics and the other page are preserved.",
    "Use values only: formulas, dates, merged cells, macro files and unsupported cell types are not accepted.",
    "Save as .xlsx. The downloaded data comes from your current saved website settings; review summaries when figures change.",
  ];
  help.getColumn(1).width = 115;
  instructions.forEach((s, i) => { const r = help.addRow([s]); r.font = { name: "Arial", size: i === 0 ? 16 : 11, bold: i === 0 }; r.alignment = { wrapText: true, vertical: "middle" }; r.height = i === 0 ? 34 : 42; });
  const sheet = wb.addWorksheet("Graph Data", { views: [{ state: "frozen", ySplit: 1, xSplit: 2 }] });
  sheet.addRow([...GRAPH_COLUMNS]);
  graphRows(cards, trends).forEach((r) => sheet.addRow(r));
  sheet.columns.forEach((col, i) => { col.width = [40, 50, 20, 20, 50, 16, 16, 28, 16, 16, 16, 70, 60][i] ?? 20; });
  sheet.autoFilter = { from: "A1", to: "M1" };
  sheet.eachRow((row, i) => {
    row.font = { name: "Arial", size: 11, color: { argb: i === 1 ? "FFFFFFFF" : "FF222222" }, bold: i === 1 };
    row.alignment = { vertical: "top", wrapText: true };
    row.height = i === 1 ? 30 : 44;
    if (i === 1) row.eachCell((cell) => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF166534" } }; });
    else {
      row.getCell(4).numFmt = "0.########";
      for (const col of [6, 11]) row.getCell(col).dataValidation = { type: "list", allowBlank: false, formulae: ['"Yes,No"'], showErrorMessage: true, error: "Choose Yes or No" };
      row.getCell(9).dataValidation = { type: "list", formulae: ['"bar,line"'], showErrorMessage: true };
      row.getCell(10).dataValidation = { type: "list", formulae: ['"lower,higher,neutral"'], showErrorMessage: true };
    }
  });
  return await wb.xlsx.writeBuffer() as ArrayBuffer;
}

export async function readGraphWorkbook(buffer: ArrayBuffer, cards: GraphCard[]): Promise<MetricTrend[]> {
  const Excel = await excel();
  const wb = new Excel.Workbook();
  await wb.xlsx.load(buffer);
  const sheet = wb.getWorksheet("Graph Data");
  if (!sheet) throw new Error('Missing "Graph Data" sheet. Download the sample sheet first.');
  if (sheet.rowCount > 5001 || sheet.columnCount > 20) throw new Error("Sheet exceeds the limit of 5,000 rows or contains extra columns");
  const rows: GraphRow[] = [];
  for (let i = 1; i <= sheet.rowCount; i++) {
    const r: GraphRow = [];
    const row = sheet.getRow(i);
    for (let j = 1; j <= Math.max(GRAPH_COLUMNS.length, sheet.columnCount); j++) {
      const cell = row.getCell(j);
      const value = cell.value;
      if (cell.isMerged || (value !== null && typeof value === "object")) throw new Error(`Row ${i}, column ${j}: use plain text or numbers, not formulas, merged cells or dates`);
      r.push(value == null ? null : value);
    }
    while (r.length > GRAPH_COLUMNS.length && r.at(-1) === null) r.pop();
    rows.push(r);
  }
  const headers = rows.shift();
  if (!headers) throw new Error("Empty sheet");
  return parseGraphRows(headers, rows, cards);
}
