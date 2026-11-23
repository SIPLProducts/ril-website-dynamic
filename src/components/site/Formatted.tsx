import { cleanHtml, isHtml } from "@/lib/strength-style";

const RICH = "[&_p]:m-0 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:underline";

/** Shows admin text: formatted (font, colour, size) when it was styled, otherwise plain. */
export function Formatted({ text, as: Tag = "span", className = "" }: { text: string; as?: "span" | "div"; className?: string }) {
  if (!isHtml(text)) return <Tag className={className}>{text}</Tag>;
  return <Tag className={`${RICH} ${className}`} dangerouslySetInnerHTML={{ __html: cleanHtml(text) }} />;
}
