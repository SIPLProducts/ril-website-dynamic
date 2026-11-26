import type { ImgHTMLAttributes } from "react";
import { useSiteSettings } from "@/lib/site-settings.functions";
import { shapeRatio, sizeWidth } from "@/lib/accolade-image";
import { imageDisplaySource, type ImageDisplay } from "@/lib/image-display";

/** Unconfigured images render exactly as before; configured photos share the award framing. */
export function AdjustableImage({ src, className, style, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const options = useSiteSettings().imageDisplays[imageDisplaySource(src)];
  if (!options || !src) return <img {...props} src={src} className={className} style={style} />;
  return <ImagePresentation {...props} src={src} className={className} style={style} options={options} />;
}
export function ImagePresentation({ src, className, style, options, ...props }: ImgHTMLAttributes<HTMLImageElement> & { options: ImageDisplay }) {
  const ratio = shapeRatio(options.shape);
  const positioned = /\babsolute\b/.test(className ?? "");
  const photo = <>
    {ratio && options.fit === "contain" && <img src={src} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 h-full w-full scale-110 object-cover opacity-60 blur-xl" />}
    <img {...props} src={src} className={`block w-full ${ratio ? "h-full" : "h-auto"} ${options.fit === "contain" ? "object-contain" : "object-cover"}`} style={{ aspectRatio: ratio ?? undefined }} />
  </>;
  if (positioned) return <span data-image-shape={options.shape} data-image-fit={options.fit} className={`${className ?? ""} isolate overflow-hidden bg-surface`} style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
    <span className="relative isolate block overflow-hidden" style={{ width: "100%", maxWidth: sizeWidth(options.size), aspectRatio: ratio ?? undefined }}>{photo}</span>
  </span>;
  return <span data-image-shape={options.shape} data-image-fit={options.fit} className={`${className ?? ""} block isolate overflow-hidden bg-surface`} style={{ ...style, position: "relative", width: "100%", height: "auto", maxWidth: sizeWidth(options.size), maxHeight: "none", aspectRatio: ratio ?? "auto" }}>{photo}</span>;
}