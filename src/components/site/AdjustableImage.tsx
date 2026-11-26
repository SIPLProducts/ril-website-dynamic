import type { ImgHTMLAttributes } from "react";
import { useSiteSettings } from "@/lib/site-settings.functions";
import { shapeRatio, sizeWidth } from "@/lib/accolade-image";
import { publishedFileUrl } from "@/lib/file-url";

/** Unconfigured images render exactly as before; configured photos share the award framing. */
export function AdjustableImage({ src, className, style, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const options = useSiteSettings().imageDisplays[publishedFileUrl(src) ?? ""];
  if (!options || !src) return <img {...props} src={src} className={className} style={style} />;
  const ratio = shapeRatio(options.shape);
  const positioned = /\babsolute\b/.test(className ?? "");
  return <span data-image-shape={options.shape} data-image-fit={options.fit} className={`${className ?? ""} block isolate overflow-hidden bg-surface`} style={{ ...style, position: positioned ? "absolute" : "relative", width: "100%", height: positioned ? "100%" : "auto", maxWidth: positioned ? "100%" : sizeWidth(options.size), maxHeight: "none", aspectRatio: positioned ? undefined : ratio ?? undefined }}>
    {ratio && options.fit === "contain" && <img src={src} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 h-full w-full scale-110 object-cover opacity-60 blur-xl" />}
    <img {...props} src={src} className={`block w-full ${ratio || positioned ? "h-full" : "h-auto"} ${options.fit === "contain" ? "object-contain" : "object-cover"}`} style={{ aspectRatio: !positioned ? ratio ?? undefined : undefined }} />
  </span>;
}