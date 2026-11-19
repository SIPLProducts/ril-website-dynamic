import { METRIC_TRENDS, type MetricTrend } from "@/lib/esg-metric-trends";

/** Top-level website menu items; their order is admin-controlled. */
export const MAIN_MENU = [
  { key: "about", label: "About Ramky" },
  { key: "management", label: "Management" },
  { key: "capabilities", label: "Capabilities" },
  { key: "sustainability", label: "Sustainability" },
  { key: "investors", label: "Investors" },
  { key: "accolades", label: "Accolades" },
  { key: "contact", label: "Contact" },
] as const;
export type MainMenuKey = (typeof MAIN_MENU)[number]["key"];

/** Image slots editable in admin; code images are used when a slot is empty. */
export const IMAGE_SLOTS = [
  { slot: "hero:environmental", label: "Environmental — side photo" },
  { slot: "hero:social", label: "Social — side photo" },
  { slot: "hero:governance", label: "Governance — side photo" },
  { slot: "hero:esg-reporting", label: "Sustainability (ESG) Reports — side photo" },
  { slot: "framework:2026", label: "Framework card — 2026" },
  { slot: "framework:BRSR", label: "Framework card — BRSR" },
  { slot: "framework:GRI", label: "Framework card — GRI" },
  { slot: "framework:SASB", label: "Framework card — SASB" },
] as const;

export interface PdfViewerSettings { allowDownload: boolean; downloadLabel: string; exploreLabel: string }
export interface SustainabilityNavItem { slug: string; label?: string }
export interface SiteSettings {
  esgTrends: MetricTrend[];
  /** slot → file reference (storage:... or URL) */
  images: Record<string, string>;
  mainMenu: MainMenuKey[];
  sustainabilityNav: SustainabilityNavItem[];
  pdfViewer: PdfViewerSettings;
}

export const DEFAULT_PDF: PdfViewerSettings = { allowDownload: true, downloadLabel: "Download Report", exploreLabel: "Explore" };
export const DEFAULT_SETTINGS: SiteSettings = {
  esgTrends: METRIC_TRENDS,
  images: {},
  mainMenu: MAIN_MENU.map((m) => m.key),
  sustainabilityNav: [],
  pdfViewer: DEFAULT_PDF,
};

type Row = { key: string; value: unknown };

/** Build settings from stored rows, falling back to code defaults for anything missing or malformed. */
export function parseSettings(rows: Row[]): SiteSettings {
  const get = (k: string) => rows.find((r) => r.key === k)?.value;
  const trends = get("esg_trends");
  const imgs = get("esg_images");
  const menu = get("main_menu");
  const sus = get("sustainability_nav");
  const pdf = get("pdf_viewer") as Partial<PdfViewerSettings> | undefined;
  const images: Record<string, string> = {};
  if (Array.isArray(imgs)) for (const i of imgs as { slot?: string; url?: string }[]) if (i?.slot && i.url) images[i.slot] = i.url;
  const keys = MAIN_MENU.map((m) => m.key) as string[];
  const menuOrder = Array.isArray(menu) ? (menu as string[]).filter((k) => keys.includes(k)) : [];
  return {
    esgTrends: Array.isArray(trends) && trends.length ? (trends as MetricTrend[]) : METRIC_TRENDS,
    images,
    mainMenu: [...menuOrder, ...keys.filter((k) => !menuOrder.includes(k))] as MainMenuKey[],
    sustainabilityNav: Array.isArray(sus) ? (sus as SustainabilityNavItem[]).filter((s) => s && typeof s.slug === "string") : [],
    pdfViewer: { ...DEFAULT_PDF, ...(pdf && typeof pdf === "object" ? pdf : {}) },
  };
}

/** Apply admin order and label overrides to the Sustainability tabs; unknown slugs are ignored, new tabs keep code order at the end. */
export function orderSustainability<T extends { slug: string; title: string }>(sections: T[], nav: SustainabilityNavItem[]): T[] {
  const ordered: T[] = [];
  for (const n of nav) {
    const s = sections.find((x) => x.slug === n.slug);
    if (s && !ordered.includes(s)) ordered.push(n.label?.trim() ? { ...s, title: n.label.trim() } : s);
  }
  return [...ordered, ...sections.filter((s) => !ordered.some((o) => o.slug === s.slug))];
}

/** CSS flex `order` for a main-menu item. */
export const menuOrder = (menu: MainMenuKey[], key: MainMenuKey) => ({ order: menu.indexOf(key) });
