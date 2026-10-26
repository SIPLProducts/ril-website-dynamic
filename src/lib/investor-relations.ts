// Investor Relations content model. All data here is SAMPLE content shaped so a
// future admin panel can supply the same structure (categories → sub-tabs → documents).

export type IrDocument = {
  id: string;
  title: string;
  type: string;
  date: string; // ISO yyyy-mm-dd
  year?: string; // "FY 2026–27" or "2026"
  quarter?: "Q1" | "Q2" | "Q3" | "Q4";
  category?: string; // e.g. Regulation 46 disclosure category
  version?: string;
  description?: string;
  url: string;
  published: boolean;
};

export type IrLayout = "quarterly" | "yearly" | "repository" | "contacts";

export type IrSubTab = { slug: string; label: string; layout: IrLayout; documents: IrDocument[]; children?: IrSubTab[] };
export type IrCategory = { slug: string; label: string; summary: string; subTabs: IrSubTab[] };

export type IrContact = { heading: string; lines: { label?: string; value: string; href?: string }[] };

import qrQ1_2022 from "@/assets/qr-Q1_2022-23.pdf.asset.json";
import qrQ1_2023 from "@/assets/qr-Q1_2023-24.pdf.asset.json";
import qrQ1_2024 from "@/assets/qr-Q1_2024-25.pdf.asset.json";
import qrQ1_2025 from "@/assets/qr-Q1_2025-26.pdf.asset.json";
import qrQ1_2026 from "@/assets/qr-Q1_26-27.pdf.asset.json";
import qrQ2_2022 from "@/assets/qr-Q2_2022-23.pdf.asset.json";
import qrQ2_2023 from "@/assets/qr-Q2_2023-24.pdf.asset.json";
import qrQ2_2024 from "@/assets/qr-Q2_2024-25.pdf.asset.json";
import qrQ2_2025 from "@/assets/qr-Q2_2025-26.pdf.asset.json";
import qrQ3_2024 from "@/assets/qr-Q3_2024-25.pdf.asset.json";
import qrQ3_2022 from "@/assets/qr-Q3_2022-23.pdf.asset.json";
import qrQ3_2023 from "@/assets/qr-Q3_2023-24.pdf.asset.json";
import qrQ3_2025 from "@/assets/qr-Q3_2025-26.pdf.asset.json";
import qrQ4_2022 from "@/assets/qr-Q4_2022-23.pdf.asset.json";
import qrQ4_2023 from "@/assets/qr-Q4_2023-24.pdf.asset.json";
import qrQ4_2024 from "@/assets/qr-Q4_2024-25.pdf.asset.json";
import qrQ4_2025 from "@/assets/qr-Q4_2025-26.pdf.asset.json";

const SAMPLE_PDF = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

/** Real uploaded Quarterly Results PDFs, keyed by `FY label|quarter`. Remaining entries stay sample placeholders until uploaded. */
const REAL_QUARTERLY_RESULTS: Record<string, string> = {
  "FY 2022–23|Q1": qrQ1_2022.url,
  "FY 2023–24|Q1": qrQ1_2023.url,
  "FY 2024–25|Q1": qrQ1_2024.url,
  "FY 2025–26|Q1": qrQ1_2025.url,
  "FY 2026–27|Q1": qrQ1_2026.url,
  "FY 2022–23|Q2": qrQ2_2022.url,
  "FY 2023–24|Q2": qrQ2_2023.url,
  "FY 2024–25|Q2": qrQ2_2024.url,
  "FY 2025–26|Q2": qrQ2_2025.url,
  "FY 2024–25|Q3": qrQ3_2024.url,
  "FY 2022–23|Q3": qrQ3_2022.url,
  "FY 2023–24|Q3": qrQ3_2023.url,
  "FY 2025–26|Q3": qrQ3_2025.url,
  "FY 2022–23|Q4": qrQ4_2022.url,
  "FY 2023–24|Q4": qrQ4_2023.url,
  "FY 2024–25|Q4": qrQ4_2024.url,
  "FY 2025–26|Q4": qrQ4_2025.url,
};

/** Financial year starts in April. Returns start years, current first, plus previous `count`. */
export function rollingFyStarts(count = 8, now = new Date()) {
  const start = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return Array.from({ length: count + 1 }, (_, i) => start - i);
}
export const fyLabel = (start: number) => `FY ${start}–${String((start + 1) % 100).padStart(2, "0")}`;
export const rollingCalendarYears = (count = 8, now = new Date()) =>
  Array.from({ length: count + 1 }, (_, i) => String(now.getFullYear() - i));

let seq = 0;
const doc = (d: Omit<IrDocument, "id" | "url" | "published">): IrDocument => ({
  id: `doc-${++seq}`,
  url: SAMPLE_PDF,
  published: true,
  ...d,
});

const QUARTER_END: Record<"Q1" | "Q2" | "Q3" | "Q4", [number, number]> = { Q1: [0, 7], Q2: [0, 10], Q3: [1, 1], Q4: [1, 4] };
const pad = (n: number) => String(n).padStart(2, "0");

function quarterlyDocs() {
  const now = new Date();
  const out: IrDocument[] = [];
  for (const fy of rollingFyStarts()) {
    for (const q of ["Q1", "Q2", "Q3", "Q4"] as const) {
      const [yOff, month] = QUARTER_END[q];
      const date = new Date(fy + yOff, month, 12);
      if (date > now) continue; // not yet published
      const iso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-12`;
      const types = ["Financial Results", "Limited Review Report", "Investor Presentation", "Press Release"];
      for (const type of types) {
        const d = doc({ title: `${type} – ${q} ${fyLabel(fy)}`, type, date: iso, year: fyLabel(fy), quarter: q });
        const real = type === "Financial Results" ? REAL_QUARTERLY_RESULTS[`${fyLabel(fy)}|${q}`] : undefined;
        out.push(real ? { ...d, url: real } : d);
      }
    }
  }
  return out;
}

/** Centralised year list used by every year-wise module: current FY + previous 8. */
export const rollingFyLabels = () => rollingFyStarts().map(fyLabel);

/** Sample year-wise documents. `month` is the month (0-11, relative to FY start year) of publication. */
function yearly(types: string[], label: string, month = 8, onlyFy?: number[]) {
  const now = new Date();
  return rollingFyStarts().flatMap((fy) => {
    if (onlyFy && !onlyFy.includes(fy)) return [];
    const date = new Date(fy, month, 20);
    if (date > now) return [];
    const iso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-20`;
    return types.map((type) => doc({ title: `${type} – ${label} ${fyLabel(fy)}`, type, date: iso, year: fyLabel(fy) }));
  });
}
const cur = () => rollingFyStarts()[0] ?? new Date().getFullYear();

const asNeeded = (slug: string, label: string, documents: IrDocument[]): IrSubTab => ({ slug, label, layout: "repository", documents });
const yearWise = (slug: string, label: string, documents: IrDocument[]): IrSubTab => ({ slug, label, layout: "yearly", documents });

export const IR_CATEGORIES: IrCategory[] = [
  {
    slug: "financials",
    label: "Financials",
    summary: "Quarterly results and subsidiary financial statements for the current and previous eight financial years.",
    subTabs: [
      { slug: "quarterly-results", label: "Quarterly Results", layout: "quarterly", documents: quarterlyDocs() },
      yearWise("subsidiary-financial-statements", "Subsidiary Financial Statements", yearly(["Subsidiary Financial Statements", "Auditor's Report"], "Subsidiaries", 15)),
    ],
  },
  {
    slug: "corporate-governance",
    label: "Corporate Governance",
    summary: "Board and committee composition, corporate policies and corporate governance reports.",
    subTabs: [
      asNeeded("board-and-committees", "Board & Committees", [
        doc({ title: "Board Composition", type: "Board", date: "2026-05-14", description: "Current composition of the Board of Directors." }),
        doc({ title: "Composition of Board Committees", type: "Committee", date: "2026-05-14", description: "Audit, Nomination & Remuneration, Stakeholders' Relationship and CSR committees." }),
        doc({ title: "Terms of Appointment of Independent Directors", type: "Board", date: "2025-08-02" }),
      ]),
      asNeeded("policies", "Policies", [
        doc({ title: "Code of Conduct for Board & Senior Management", type: "Policy", date: "2025-11-03" }),
        doc({ title: "Whistle Blower / Vigil Mechanism Policy", type: "Policy", date: "2025-06-18" }),
        doc({ title: "Related Party Transaction Policy", type: "Policy", date: "2025-04-11" }),
        doc({ title: "Nomination & Remuneration Policy", type: "Policy", date: "2024-10-29" }),
        doc({ title: "Policy for Determination of Material Events", type: "Policy", date: "2024-02-08" }),
        doc({ title: "Dividend Distribution Policy", type: "Policy", date: "2023-05-25" }),
      ]),
      yearWise("cg-report", "CG Report", [...yearly(["Corporate Governance Report"], "Q2", 9), ...yearly(["Corporate Governance Report"], "Q1", 6)]),
    ],
  },
  {
    slug: "shareholders-information",
    label: "Shareholders Information",
    summary: "Constitutional documents, general meetings, statutory reports and shareholder services.",
    subTabs: [
      asNeeded("moa-and-aoa", "MOA & AOA", [
        doc({ title: "Memorandum of Association", type: "MOA", date: "2024-09-26", version: "v3 (amended)" }),
        doc({ title: "Articles of Association", type: "AOA", date: "2024-09-26", version: "v3 (amended)" }),
      ]),
      {
        slug: "general-meeting",
        label: "General Meeting",
        layout: "yearly",
        documents: [],
        children: [
          yearWise("agm", "AGM", yearly(["AGM Notice", "Annual Report", "Proceedings", "Voting Results", "Scrutinizer Report", "Newspaper Advertisement"], "AGM", 8)),
          yearWise("egm", "EGM", yearly(["EGM Notice", "Explanatory Statement", "Voting Results", "Scrutinizer Report"], "EGM", 11, [cur() - 2, cur() - 5])),
          yearWise("postal-ballot", "Postal Ballot", yearly(["Postal Ballot Notice", "Explanatory Statement", "Voting Results", "Newspaper Advertisement"], "Postal Ballot", 9, [cur() - 1, cur() - 3, cur() - 6])),
        ],
      },
      yearWise("annual-report", "Annual Report", yearly(["Annual Report"], "", 16)),
      yearWise("brsr", "BRSR", yearly(["Business Responsibility & Sustainability Report"], "", 16, [cur() - 1, cur() - 2, cur() - 3, cur() - 4])),
      yearWise("annual-return", "Annual Return", yearly(["Annual Return (Form MGT-7)"], "", 20)),
      yearWise("csr", "CSR", yearly(["CSR Annual Action Plan", "CSR Report"], "", 16)),
      yearWise("credit-rating", "Credit Rating", yearly(["Credit Rating Intimation"], "", 13)),
      yearWise("dividend", "Dividend", yearly(["Dividend Intimation", "Unclaimed Dividend Statement"], "", 9, [cur() - 1, cur() - 2])),
      yearWise("investor-calls", "Investor Calls", yearly(["Investor Presentation", "Earnings Call Transcript", "Call Recording", "Press Release"], "Earnings Call", 10)),
      {
        ...asNeeded("regulation-46", "Regulation 46", [
          doc({ title: "Details of Business", type: "Disclosure", category: "Investor information", date: "2026-04-10", description: "Overview of business segments and operations." }),
          doc({ title: "Familiarisation Programme for Independent Directors", type: "Disclosure", category: "Corporate governance disclosures", date: "2025-04-22" }),
          doc({ title: "Shareholding Pattern – Latest Quarter", type: "Disclosure", category: "Shareholding information", date: "2026-07-15" }),
          doc({ title: "Credit Rating Intimation", type: "Disclosure", category: "Financial information", date: "2025-12-09" }),
          doc({ title: "Contact Details for Investor Grievances", type: "Disclosure", category: "Investor information", date: "2025-10-01" }),
          doc({ title: "Schedule of Analyst / Institutional Investor Meets", type: "Disclosure", category: "Investor information", date: "2026-02-20" }),
        ]),
      },
      { slug: "investor-contacts", label: "Investor Contacts", layout: "contacts", documents: [] },
    ],
  },
  {
    slug: "stock-exchange-filings",
    label: "Stock Exchange Filings",
    summary: "Announcements, disclosures and shareholding pattern filed with the stock exchanges.",
    subTabs: [
      yearWise("announcements-and-disclosures", "Announcements & Disclosures", [
        ...yearly(["Outcome of Board Meeting", "Intimation of Board Meeting"], "", 7),
        ...yearly(["Disclosure under Regulation 30", "Trading Window Closure"], "", 2),
      ]),
      yearWise("shareholding-pattern", "Shareholding Pattern", (["Q1", "Q2", "Q3", "Q4"] as const).flatMap((q, i) =>
        yearly(["Shareholding Pattern"], q, [6, 9, 12, 15][i]).map((d) => ({ ...d, quarter: q })),
      )),
    ],
  },
];

// Sample contact details — replace with the company's verified information.
export const IR_CONTACTS: IrContact[] = [
  { heading: "Registered Office", lines: [{ value: "Ramky Infrastructure Limited" }, { value: "Ramky Grandiose, Ramky Towers Complex, Gachibowli, Hyderabad – 500 032, Telangana, India" }] },
  {
    heading: "Investor Relations Contact",
    lines: [
      { label: "Name", value: "Company Secretary & Compliance Officer" },
      { label: "Email", value: "investors@ramky.com", href: "mailto:investors@ramky.com" },
      { label: "Phone", value: "+91 40 0000 0000", href: "tel:+914000000000" },
    ],
  },
  {
    heading: "Registrar & Share Transfer Agent",
    lines: [
      { label: "Name", value: "Registrar name to be confirmed" },
      { label: "Email", value: "rta@example.com", href: "mailto:rta@example.com" },
      { label: "Phone", value: "+91 00 0000 0000" },
      { label: "Website", value: "www.example.com", href: "https://www.example.com" },
    ],
  },
];

export function resolveIr(cat?: string, sub?: string, meet?: string) {
  const category = IR_CATEGORIES.find((c) => c.slug === cat) ?? IR_CATEGORIES[0]!;
  const subTab = category.subTabs.find((s) => s.slug === sub) ?? category.subTabs[0]!;
  const leaf = subTab.children ? (subTab.children.find((c) => c.slug === meet) ?? subTab.children[0]!) : subTab;
  return { category, subTab, leaf };
}

// ---------- Live (database-backed) content ----------

/** A database document row as returned by the investor data server function. */
export type IrDocumentRow = {
  id: string;
  section_key: string;
  title: string;
  doc_type: string;
  doc_date: string;
  fy_year: string | null;
  quarter: string | null;
  disclosure_category: string | null;
  version: string | null;
  description: string | null;
  url: string;
  published: boolean;
  sort_order: number;
};

/** Every editable document section ("leaf"), keyed `category/subTab[/child]`. */
export type IrSection = { key: string; categoryLabel: string; label: string; layout: IrLayout };
export const IR_SECTIONS: IrSection[] = IR_CATEGORIES.flatMap((c) =>
  c.subTabs.flatMap((s) =>
    s.children
      ? s.children.map((l) => ({ key: `${c.slug}/${s.slug}/${l.slug}`, categoryLabel: c.label, label: `${s.label} – ${l.label}`, layout: l.layout }))
      : s.layout === "contacts" ? [] : [{ key: `${c.slug}/${s.slug}`, categoryLabel: c.label, label: s.label, layout: s.layout }],
  ),
);

export const rowToDoc = (r: IrDocumentRow): IrDocument => ({
  id: r.id,
  title: r.title,
  type: r.doc_type,
  date: r.doc_date,
  year: r.fy_year ?? undefined,
  quarter: (r.quarter as IrDocument["quarter"]) ?? undefined,
  category: r.disclosure_category ?? undefined,
  version: r.version ?? undefined,
  description: r.description ?? undefined,
  url: r.url,
  published: r.published,
});

/** Same tab structure as IR_CATEGORIES, with documents supplied from the database. */
export function withDocuments(rows: IrDocumentRow[]): IrCategory[] {
  const by = new Map<string, IrDocument[]>();
  for (const r of rows) by.set(r.section_key, [...(by.get(r.section_key) ?? []), rowToDoc(r)]);
  return IR_CATEGORIES.map((c) => ({
    ...c,
    subTabs: c.subTabs.map((s) => ({
      ...s,
      documents: by.get(`${c.slug}/${s.slug}`) ?? [],
      children: s.children?.map((l) => ({ ...l, documents: by.get(`${c.slug}/${s.slug}/${l.slug}`) ?? [] })),
    })),
  }));
}

export function resolveIn(categories: IrCategory[], cat?: string, sub?: string, meet?: string) {
  const category = categories.find((c) => c.slug === cat) ?? categories[0]!;
  const subTab = category.subTabs.find((s) => s.slug === sub) ?? category.subTabs[0]!;
  const leaf = subTab.children ? (subTab.children.find((c) => c.slug === meet) ?? subTab.children[0]!) : subTab;
  return { category, subTab, leaf };
}

/** Files uploaded through the admin portal are stored as `storage:<path>` in the investor-documents bucket. */
export const STORAGE_PREFIX = "storage:";
export const IR_BUCKET = "investor-documents";
