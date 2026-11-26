import { parseAccoladeImage, type AccoladeImage } from "@/lib/accolade-image";
import { publishedFileUrl } from "@/lib/file-url";

export type ImageDisplay = AccoladeImage;
export const imageDisplayKey = (src: string) => "media:" + (publishedFileUrl(src) ?? src);
export function parseImageDisplays(value: unknown): Record<string, ImageDisplay> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key]) => key.startsWith("media:")).map(([key, options]) => [key.slice(6), parseAccoladeImage(options)]));
}