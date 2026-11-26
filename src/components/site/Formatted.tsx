import { cleanHtml, isHtml } from "@/lib/strength-style";

const RICH = "[&_p]:m-0 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:underline";

/** Shows admin text: formatted (font, colour, size) when it was styled, otherwise plain. */
export function Formatted({ text: raw, as: Tag = "span", className = "" }: { text: string | number | null | undefined; as?: "span" | "div"; className?: string }) {
  const text = raw == null ? "" : String(raw);
  if (!isHtml(text)) return <Tag className={className}>{text}</Tag>;
  let html = cleanHtml(text);
  // Inline spots (inside headings/paragraphs) can't hold paragraphs; keep line breaks instead.
  if (Tag === "span") html = html.replace(/<\/(p|div)>\s*<(p|div)[^>]*>/gi, "<br>").replace(/<\/?(p|div)[^>]*>/gi, "");
  return <Tag className={`${RICH} ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
