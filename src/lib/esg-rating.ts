/** NSE ESG rating shown on the Sustainability "ESG Rating" tab; stored in site_settings key "esg_rating". */
export type RatingYear = { year: string; score: string; note: string };
export type RatingPillar = { name: string; score: string; weight: string };
export type EsgRating = {
  agency: string;
  company: string;
  sector: string;
  reviewDate: string;
  category: string;
  categoryNote: string;
  ratings: RatingYear[];
  pillars: RatingPillar[];
  coreRating: string;
  synopsis: string;
  drivers: { pillar: string; points: string[] }[];
  pdf: string | null;
};

export const RATING_CATEGORIES: { name: string; band: string; note: string }[] = [
  { name: "Leader", band: "Top 10%", note: "Demonstrates exceptional ESG maturity with best-in-class practices." },
  { name: "Aspiring", band: "Next 25%", note: "Shows strong ESG commitment with steady progress and solid disclosures." },
  { name: "Adequate", band: "Next 35%", note: "Maintains adequate ESG credentials with modest but positive efforts." },
  { name: "Moderate", band: "Next 25%", note: "Displays basic ESG practices with limited strategic depth." },
  { name: "Lagging", band: "Bottom 5%", note: "Lacks ESG focus and shows weak performance with minimal progress." },
];

export const EMPTY_RATING: EsgRating = {
  agency: "NSE Sustainability Ratings & Analytics", company: "", sector: "", reviewDate: "", category: "", categoryNote: "",
  ratings: [], pillars: [], coreRating: "", synopsis: "", drivers: [], pdf: null,
};

const str = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");

export function parseRating(v: unknown): EsgRating | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const o = v as Record<string, unknown>;
  const arr = (x: unknown) => (Array.isArray(x) ? x.filter((i) => i && typeof i === "object") as Record<string, unknown>[] : []);
  return {
    agency: str(o["agency"]) || EMPTY_RATING.agency, company: str(o["company"]), sector: str(o["sector"]), reviewDate: str(o["reviewDate"]),
    category: str(o["category"]), categoryNote: str(o["categoryNote"]), coreRating: str(o["coreRating"]), synopsis: str(o["synopsis"]),
    ratings: arr(o["ratings"]).map((r) => ({ year: str(r["year"]), score: str(r["score"]), note: str(r["note"]) })).filter((r) => r.year),
    pillars: arr(o["pillars"]).map((r) => ({ name: str(r["name"]), score: str(r["score"]), weight: str(r["weight"]) })).filter((r) => r.name),
    drivers: arr(o["drivers"]).map((r) => ({ pillar: str(r["pillar"]), points: Array.isArray(r["points"]) ? (r["points"] as unknown[]).map(str).filter(Boolean) : [] })).filter((d) => d.pillar),
    pdf: str(o["pdf"]) || null,
  };
}

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

/** Read rating values from the text of an NSE ESG rating PDF. Fields it cannot find stay empty — never guessed. */
export function extractRating(text: string): Omit<EsgRating, "pdf"> {
  const flat = clean(text.replace(/\r/g, " "));
  const reviewDate = flat.match(/Last Review Date\s*:?\s*([0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+\d{4})/i)?.[1] ?? "";
  const catIdx = flat.search(/Rating Category/i);
  // Summary block: pillar labels, year labels and their numbers appear before "Rating Category", in reading order.
  const dateM = flat.match(/Last Review Date\s*:?\s*[0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+\d{4}/i);
  const startIdx = dateM && dateM.index! < catIdx ? dateM.index! + dateM[0].length : 0;
  const head = catIdx >= 0 ? flat.slice(startIdx, catIdx) : "";
  const years = [...head.matchAll(/FY\s?(\d{4})\s*(\*?)/gi)].map((m) => ({ year: `FY${m[1]}`, revised: !!m[2] }));
  const nums = [...head.replace(/FY\s?\d{4}/gi, " ").matchAll(/(?:^|\s)(\d{1,3})(?=\s|$)/g)].map((m) => m[1]!);
  const pillarNames = ["Environment", "Social", "Governance"];
  const hasPillars = /Environment\s*Score/i.test(head) && /Social\s*Score/i.test(head);
  const ratingNums = hasPillars ? nums.slice(3) : nums;
  const ratings: RatingYear[] = [];
  years.forEach((y, i) => {
    if (ratingNums[i] && !ratings.some((r) => r.year === y.year)) ratings.push({ year: y.year, score: ratingNums[i]!, note: y.revised ? "Revised" : "" });
  });
  ratings.sort((a, b) => b.year.localeCompare(a.year));

  const driven = [...flat.matchAll(/The score of (\d{1,3}) of (Environment|Social|Gover?n?ance) pillar[^:]*?is driven by:/gi)];
  const pillars: RatingPillar[] = pillarNames.map((name, i) => {
    const d = driven.find((m) => m[2]!.toLowerCase().startsWith(name.slice(0, 4).toLowerCase()));
    const w = flat.match(new RegExp(`${name === "Governance" ? "Gover?n?ance" : name}\\s*Weightage\\s*(\\d{1,3})\\s*%`, "i"));
    const score = d?.[1] ?? (hasPillars ? nums[i] ?? "" : "");
    return { name, score, weight: w ? `${w[1]}%` : "" };
  }).filter((p) => p.score);

  const drivers = driven.map((m, i) => {
    const from = m.index! + m[0].length;
    const to = i + 1 < driven.length ? driven[i + 1]!.index! : flat.length;
    const body = flat.slice(from, to).split(/©|ESG Rating Framework|Core ESG Rating|(?:Social|Gover?n?ance)\s*Weightage/i)[0]!;
    const name = pillarNames.find((n) => m[2]!.toLowerCase().startsWith(n.slice(0, 4).toLowerCase()))!;
    return { pillar: name, points: body.split("•").map(clean).filter((p) => p.length > 3) };
  }).filter((d) => d.points.length);

  const category = flat.match(/Rating Category\s*:?\s*(Leader|Aspiring|Adequate|Moderate|Lagging)/i)?.[1] ?? "";
  const cat = RATING_CATEGORIES.find((c) => c.name.toLowerCase() === category.toLowerCase());
  const core = flat.match(/core Rating of\s*(\d{1,3})/i)?.[1] ?? "";
  const synopsis = flat.match(/Rating Category\s*:?\s*\w+\s*(.+?)\s*We have assessed/i)?.[1] ?? "";
  const header = flat.match(/([A-Z][\w.&]*(?: [\w.&]+)*? (?:Ltd|Limited))\s+([A-Z][\w ]*?)\s*\|\s*([A-Z][\w ]*?)\s+\1/);
  return {
    agency: "NSE Sustainability Ratings & Analytics",
    company: header ? header[1]! : "", sector: header ? `${header[2]!.replace(header[1]!, "").trim()} | ${header[3]}` : "",
    reviewDate, category: cat?.name ?? "", categoryNote: cat?.note ?? "", ratings, pillars, coreRating: core,
    synopsis: clean(synopsis), drivers,
  };
}
