/** Resolutions offered for home page slide photos. "original" keeps the uploaded file as is. */
export const IMAGE_RESOLUTIONS = [
  { value: "original", label: "Original (no change)", w: 0, h: 0 },
  { value: "1280x720", label: "HD — 1280 × 720", w: 1280, h: 720 },
  { value: "1600x900", label: "HD+ — 1600 × 900", w: 1600, h: 900 },
  { value: "1920x1080", label: "Full HD — 1920 × 1080", w: 1920, h: 1080 },
  { value: "2560x1440", label: "2K — 2560 × 1440", w: 2560, h: 1440 },
  { value: "3840x2160", label: "4K — 3840 × 2160", w: 3840, h: 2160 },
] as const;
export type ImageResolution = (typeof IMAGE_RESOLUTIONS)[number]["value"];
export const DEFAULT_RESOLUTION: ImageResolution = "1920x1080";

/** Target size that fits inside the box without stretching or upscaling. */
export function fitSize(srcW: number, srcH: number, res: string): { w: number; h: number } {
  const r = IMAGE_RESOLUTIONS.find((x) => x.value === res);
  if (!r || !r.w || srcW <= 0 || srcH <= 0) return { w: srcW, h: srcH };
  const scale = Math.min(1, r.w / srcW, r.h / srcH);
  return { w: Math.round(srcW * scale), h: Math.round(srcH * scale) };
}

/** Resize an image file in the browser to the chosen resolution (keeps proportions). */
export async function resizeImage(file: File, res: string): Promise<File> {
  if (res === "original" || !file.type.startsWith("image/") || file.type === "image/svg+xml") return file;
  const bmp = await createImageBitmap(file);
  const { w, h } = fitSize(bmp.width, bmp.height, res);
  if (w === bmp.width && h === bmp.height) { bmp.close(); return file; }
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  c.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((ok) => c.toBlob(ok, type, 0.9));
  if (!blob) return file;
  const name = file.name.replace(/\.[^.]+$/, "") + (type === "image/png" ? ".png" : ".jpg");
  return new File([blob], name, { type });
}
