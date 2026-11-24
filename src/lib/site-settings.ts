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
  { slot: "hero:environmental", label: "Environmental — banner photo" },
  { slot: "hero:social", label: "Social — banner photo" },
  { slot: "hero:governance", label: "Governance — banner photo" },
  { slot: "hero:esg-reporting", label: "Sustainability (ESG) Reports — banner photo" },
  { slot: "framework:2026", label: "Framework card — 2026" },
  { slot: "framework:BRSR", label: "Framework card — BRSR" },
  { slot: "framework:GRI", label: "Framework card — GRI" },
  { slot: "framework:SASB", label: "Framework card — SASB" },
] as const;

export interface PdfViewerSettings { allowDownload: boolean; downloadLabel: string; exploreLabel: string }
export interface SustainabilityNavItem { slug: string; label?: string }
export interface EsgLabels { metrics?: string; detail?: string; downloads?: string }
/** Default section headings per Sustainability page; admin overrides replace them when non-empty. */
export function esgLabel(labels: Record<string, EsgLabels>, slug: string, part: keyof EsgLabels): string {
  const v = labels[slug]?.[part]?.trim();
  if (v) return v;
  if (part === "metrics") return slug === "esg-reporting" ? "Frameworks" : "Key Metrics";
  if (part === "detail") return slug === "policies" ? "Company Policies" : "In Detail";
  return "Downloads";
}
/** Site-wide look chosen in admin; empty values keep the built-in design. */
export interface ThemeSettings { headingFont: string; bodyFont: string; primary: string; orange: string; green: string; textColor: string; baseSize: string }
export const DEFAULT_THEME: ThemeSettings = { headingFont: "", bodyFont: "", primary: "", orange: "", green: "", textColor: "", baseSize: "" };
export const THEME_FONTS = ["Archivo", "Hind", "Montserrat", "Roboto", "Open Sans", "Lato", "Poppins", "Source Sans 3", "Merriweather", "Playfair Display", "Noto Sans", "Nunito"] as const;
export const THEME_SIZES = [{ value: "14px", label: "Small" }, { value: "16px", label: "Normal" }, { value: "17px", label: "Large" }, { value: "18px", label: "Extra large" }] as const;
const HEX = /^#[0-9a-f]{6}$/i;
/** Clean a stored theme: only known fonts, hex colours and listed sizes survive. */
export function cleanTheme(v: unknown): ThemeSettings {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const font = (x: unknown) => (typeof x === "string" && (THEME_FONTS as readonly string[]).includes(x) ? x : "");
  const col = (x: unknown) => (typeof x === "string" && HEX.test(x) ? x : "");
  const size = typeof o["baseSize"] === "string" && THEME_SIZES.some((z) => z.value === o["baseSize"]) ? (o["baseSize"] as string) : "";
  return { headingFont: font(o["headingFont"]), bodyFont: font(o["bodyFont"]), primary: col(o["primary"]), orange: col(o["orange"]), green: col(o["green"]), textColor: col(o["textColor"]), baseSize: size };
}
/** CSS overriding the design tokens for the chosen theme ("" when nothing is set). */
export function themeCss(t: ThemeSettings): string {
  const r: string[] = [];
  if (t.headingFont) r.push(`--font-display: "${t.headingFont}", ui-sans-serif, system-ui, sans-serif`);
  if (t.bodyFont) r.push(`--font-sans: "${t.bodyFont}", ui-sans-serif, system-ui, sans-serif`);
  if (t.primary) r.push(`--primary: ${t.primary}`);
  if (t.orange) r.push(`--brand-orange: ${t.orange}`);
  if (t.green) r.push(`--brand-green: ${t.green}`);
  if (t.textColor) r.push(`--foreground: ${t.textColor}`);
  let css = r.length ? `:root{${r.join(";")}}` : "";
  if (t.headingFont) css += `h1,h2,h3,h4,h5,h6,.font-display{font-family:var(--font-display)}`;
  if (t.bodyFont) css += `body,.font-sans{font-family:var(--font-sans)}`;
  if (t.baseSize) css += `html{font-size:${t.baseSize}}`;
  return css;
}
/** Google Fonts link for chosen fonts not already loaded by default. */
export function themeFontsHref(t: ThemeSettings): string {
  const f = [...new Set([t.headingFont, t.bodyFont].filter((x) => x && x !== "Archivo" && x !== "Hind"))];
  return f.length ? `https://fonts.googleapis.com/css2?${f.map((x) => `family=${x.replace(/ /g, "+")}:wght@400;500;600;700`).join("&")}&display=swap` : "";
}
export interface SiteSettings {
  theme: ThemeSettings;
  esgLabels: Record<string, EsgLabels>;
  esgTrends: MetricTrend[];
  /** slot → file reference (storage:... or URL) */
  images: Record<string, string>;
  mainMenu: MainMenuKey[];
  sustainabilityNav: SustainabilityNavItem[];
  pdfViewer: PdfViewerSettings;
}

export const DEFAULT_PDF: PdfViewerSettings = { allowDownload: true, downloadLabel: "Download Report", exploreLabel: "Explore" };
export const DEFAULT_SETTINGS: SiteSettings = {
  theme: DEFAULT_THEME,
  esgLabels: {},
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
  const lab = get("esg_labels");
  return {
    theme: cleanTheme(get("theme")),
    esgLabels: lab && typeof lab === "object" && !Array.isArray(lab) ? (lab as Record<string, EsgLabels>) : {},
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
