/** Per-award photo display options, chosen in Admin → Accolades and stored in site_settings key "accolade_images" ({ [awardId]: options }). */
export const ACCOLADE_SHAPES = [
  { value: "auto", label: "Auto — keep the photo's own shape", ratio: null },
  { value: "landscape", label: "Landscape (4:3)", ratio: "4 / 3" },
  { value: "wide", label: "Wide landscape (16:9)", ratio: "16 / 9" },
  { value: "square", label: "Square (1:1)", ratio: "1 / 1" },
  { value: "portrait", label: "Portrait (3:4)", ratio: "3 / 4" },
  { value: "tall", label: "Tall portrait (2:3)", ratio: "2 / 3" },
] as const;
export const ACCOLADE_FITS = [
  { value: "contain", label: "Show the whole photo (no cropping)" },
  { value: "cover", label: "Fill the frame (edges may be trimmed)" },
] as const;
export const ACCOLADE_SIZES = [
  { value: "small", label: "Small", width: "14rem" },
  { value: "medium", label: "Medium", width: "20rem" },
  { value: "large", label: "Large", width: "28rem" },
] as const;

export type AccoladeImage = { shape: string; fit: "contain" | "cover"; size: string; resolution: string };
export const DEFAULT_ACCOLADE_IMAGE: AccoladeImage = { shape: "auto", fit: "contain", size: "medium", resolution: "original" };

/** Reads one award's options; unknown or missing values fall back to defaults. */
export function parseAccoladeImage(v: unknown): AccoladeImage {
  const o = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const pick = <T extends { value: string }>(list: readonly T[], x: unknown, d: string) => (list.some((i) => i.value === x) ? (x as string) : d);
  return {
    shape: pick(ACCOLADE_SHAPES, o["shape"], "auto"),
    fit: pick(ACCOLADE_FITS, o["fit"], "contain") as AccoladeImage["fit"],
    size: pick(ACCOLADE_SIZES, o["size"], "medium"),
    resolution: typeof o["resolution"] === "string" ? o["resolution"] : "original",
  };
}
export const shapeRatio = (shape: string) => ACCOLADE_SHAPES.find((s) => s.value === shape)?.ratio ?? null;
export const sizeWidth = (size: string) => ACCOLADE_SIZES.find((s) => s.value === size)?.width ?? "20rem";
