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

const okColor = [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i];
/** Allow-list cleaner for admin rich text — runs wherever the HTML is shown. */
export function cleanHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "s", "span", "ul", "ol", "li", "h3", "h4", "blockquote"],
    allowedAttributes: { "*": ["style"] },
    allowedStyles: {
      "*": {
        color: okColor,
        "font-family": [/^[\w\s"',-]+$/],
        "font-size": [/^\d{1,2}(px|rem|em)$/],
        "font-weight": [/^(normal|bold|[1-9]00)$/],
        "text-align": [/^(left|right|center|justify)$/],
      },
    },
  });
}
export const isHtml = (s: string) => /<\/?(p|ul|ol|li|strong|em|u|span|br)\b/i.test(s);
