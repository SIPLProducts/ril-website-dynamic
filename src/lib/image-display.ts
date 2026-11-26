import { parseAccoladeImage, type AccoladeImage } from "@/lib/accolade-image";
import { publishedFileUrl } from "@/lib/file-url";
import { resolveHomeAsset } from "@/lib/home-assets";
import { shapeRatio, sizeWidth } from "@/lib/accolade-image";
import type { CSSProperties } from "react";

export type ImageDisplay = AccoladeImage;
export function imageDisplaySource(src: string | null | undefined): string {
  const source = publishedFileUrl(resolveHomeAsset(src)) ?? "";
  if (/^https?:\/\//i.test(source)) {
    try {
      const url = new URL(source);
      if (url.pathname.startsWith("/files/")) return url.pathname;
    } catch { /* Keep non-upload references unchanged. */ }
  }
  return source;
}
export const imageDisplayKey = (src: string) => "media:" + imageDisplaySource(src);
/** Resize framed parents as well as the photo so portrait/square choices are not clipped. */
export function imageFrameStyle(src: string | null | undefined, displays: Record<string, ImageDisplay>): CSSProperties | undefined {
  const options = displays[imageDisplaySource(src)];
  if (!options) return undefined;
  return { height: "auto", minHeight: 0, aspectRatio: shapeRatio(options.shape) ?? "auto", width: "100%", maxWidth: sizeWidth(options.size) };
}
export function parseImageDisplays(value: unknown): Record<string, ImageDisplay> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key]) => key.startsWith("media:")).map(([key, options]) => [imageDisplaySource(key.slice(6)), parseAccoladeImage(options)]));
}