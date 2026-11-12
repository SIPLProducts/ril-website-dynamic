import sanitizeHtml from "sanitize-html";
import type { CSSProperties } from "react";

/** Style for one card (or the page-wide default). Every field optional = use site look. */
export type CardStyle = {
  headerText?: string | undefined;
  headerSize?: number | undefined;
  headerWeight?: "normal" | "bold" | undefined;
  headerColor?: string | undefined;
  headerBg?: string | undefined;
  headerAlign?: "left" | "center" | "right" | "justify" | undefined;
  headerBorder?: string | undefined;
  cardBg?: string | undefined;
  cardBorder?: string | undefined;
  radius?: number | undefined;
  contentColor?: string | undefined;
  padding?: number | undefined;
  spacing?: number | undefined;
  bodyHtml?: string | undefined;
};
export type StrengthStyles = { page?: CardStyle; intro?: CardStyle; pillars?: Record<string, CardStyle> };

export const FONT_FAMILIES = ["Inter", "Georgia", "Arial", "Times New Roman", "Verdana", "Trebuchet MS", "Courier New"];
export const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48];

export const clamp = (n: number | undefined, lo: number, hi: number) =>
  typeof n === "number" && Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : undefined;
const color = (c?: string) => (c && /^#[0-9a-f]{3,8}$/i.test(c) ? c : undefined);

export function parseStyles(raw: unknown): StrengthStyles {
  if (typeof raw !== "string" || !raw.trim()) return {};
  try { const v = JSON.parse(raw); return v && typeof v === "object" ? v : {}; } catch { return {}; }
}

/** Card style merged over page defaults (per-card values win). */
export function merge(page: CardStyle | undefined, own: CardStyle | undefined): CardStyle {
  const out: CardStyle = { ...(page ?? {}) };
  for (const [k, v] of Object.entries(own ?? {})) if (v !== undefined && v !== "") (out as Record<string, unknown>)[k] = v;
  return out;
}

const px = (n: number) => `clamp(${Math.max(12, Math.round(n * 0.7))}px, ${(n / 16).toFixed(3)}rem + 0.4vw, ${n}px)`;

export function cardCss(s: CardStyle): CSSProperties {
  const pad = clamp(s.padding, 0, 64), r = clamp(s.radius, 0, 32);
  return {
    backgroundColor: color(s.cardBg),
    border: color(s.cardBorder) ? `1px solid ${color(s.cardBorder)}` : undefined,
    borderRadius: r !== undefined ? r : undefined,
    padding: pad !== undefined ? `clamp(${Math.round(pad / 2)}px, 3vw, ${pad}px)` : undefined,
    color: color(s.contentColor),
    overflow: r ? "hidden" : undefined,
  };
}
export function headerCss(s: CardStyle): CSSProperties {
  const size = clamp(s.headerSize, 12, 48);
  const bg = color(s.headerBg);
  return {
    fontSize: size ? px(size) : undefined,
    fontWeight: s.headerWeight === "normal" ? 400 : s.headerWeight === "bold" ? 700 : undefined,
    color: color(s.headerColor),
    backgroundColor: bg,
    textAlign: s.headerAlign,
    borderBottom: color(s.headerBorder) ? `2px solid ${color(s.headerBorder)}` : undefined,
    padding: bg || s.headerBorder ? "0.5rem 0.75rem" : undefined,
    borderRadius: bg ? 6 : undefined,
  };
}
export const spacingCss = (s: CardStyle): CSSProperties => {
  const g = clamp(s.spacing, 0, 64);
  return g !== undefined ? { marginTop: g } : {};
};

const okColor = [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i, /^inherit$/];
/** Allow-list cleaner for admin rich text — runs wherever the HTML is shown. */
export function cleanHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "s", "span", "ul", "ol", "li", "h3", "h4", "blockquote", "mark", "sub", "sup", "a", "hr", "div"],
    allowedAttributes: { "*": ["style"], a: ["href", "target", "rel", "style"], div: ["data-box", "style"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: { a: (tag, attribs) => ({ tagName: tag, attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" } }) },
    allowedStyles: {
      "*": {
        color: okColor,
        "font-family": [/^[\w\s"',-]+$/],
        "font-size": [/^\d{1,2}(px|rem|em)$/],
        "font-weight": [/^(normal|bold|[1-9]00)$/],
        "text-align": [/^(left|right|center|justify)$/],
        "background-color": okColor,
        border: [/^\d{1,2}px (solid|dashed|dotted|double) (#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\))$/i],
        "border-radius": [/^\d{1,2}px$/],
        padding: [/^\d{1,2}px$/],
        "line-height": [/^[0-3](\.\d{1,2})?$/],
        "margin-left": [/^\d{1,3}px$/],
      },
    },
  });
}
export const isHtml = (s: string) => /<\/?(p|ul|ol|li|strong|em|u|s|span|br|div|mark|sub|sup|a|hr)\b/i.test(s);

/** Whole-field "text box" look (Excel-like cell formatting), stored as a wrapping div. */
export type Box = { bg?: string | undefined; borderColor?: string | undefined; borderWidth?: number | undefined; borderStyle?: "solid" | "dashed" | "dotted" | "double" | undefined; radius?: number | undefined; padding?: number | undefined; lineHeight?: number | undefined; indent?: number | undefined };

export function boxCss(b: Box): string {
  const out: string[] = [];
  const c = color(b.bg); if (c) out.push(`background-color: ${c}`);
  const bc = color(b.borderColor), bw = clamp(b.borderWidth, 0, 10) ?? (bc ? 1 : 0);
  if (bc && bw) out.push(`border: ${bw}px ${b.borderStyle ?? "solid"} ${bc}`);
  const r = clamp(b.radius, 0, 32); if (r) out.push(`border-radius: ${r}px`);
  const p = clamp(b.padding, 0, 64); if (p) out.push(`padding: ${p}px`);
  const lh = clamp(b.lineHeight, 1, 3); if (lh) out.push(`line-height: ${lh}`);
  const ind = clamp(b.indent, 0, 200); if (ind) out.push(`margin-left: ${ind}px`);
  return out.join("; ");
}

export function wrapBox(html: string, b: Box): string {
  const css = boxCss(b);
  return css ? `<div data-box="1" style="${css}">${html}</div>` : html;
}

/** Splits a saved field back into inner HTML + box settings. */
export function splitBox(html: string): { inner: string; box: Box } {
  const m = /^<div data-box="1" style="([^"]*)">([\s\S]*)<\/div>$/.exec(html.trim());
  if (!m) return { inner: html, box: {} };
  const css = m[1]!, box: Box = {};
  const get = (k: string) => new RegExp(`(?:^|;)\\s*${k}:\\s*([^;]+)`).exec(css)?.[1]?.trim();
  const bg = get("background-color"); if (bg) box.bg = bg;
  const bd = get("border")?.split(" "); if (bd && bd.length === 3) { box.borderWidth = parseInt(bd[0]!); box.borderStyle = bd[1] as Box["borderStyle"]; box.borderColor = bd[2]!; }
  const n = (k: string) => { const v = get(k); return v ? parseFloat(v) : undefined; };
  const r = n("border-radius"), p = n("padding"), lh = n("line-height"), ind = n("margin-left");
  if (r) box.radius = r; if (p) box.padding = p; if (lh) box.lineHeight = lh; if (ind) box.indent = ind;
  return { inner: m[2]!, box };
}

/** Plain text of a field (for admin lists / alt text). */
export const plainText = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
