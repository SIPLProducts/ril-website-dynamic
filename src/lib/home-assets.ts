import lm1 from "@/assets/landmark-1.jpg.asset.json";
import lm2 from "@/assets/landmark-2.jpg.asset.json";
import lm3 from "@/assets/landmark-3.jpg.asset.json";
import lm4 from "@/assets/landmark-4.jpg.asset.json";
import lm7 from "@/assets/landmark-7.jpg.asset.json";
import namExpresswayCombined from "@/assets/nam-expressway-combined.jpg.asset.json";
import musiCombined from "@/assets/musi-two-photos.jpg.asset.json";
import odysseyCombined from "@/assets/odyssey-combined.jpg.asset.json";
import narelaCombined from "@/assets/narela-bawana-combined.jpg.asset.json";
import hummingbird from "@/assets/sustainability-hummingbird.mp4.asset.json";
import hummingbirdPoster from "@/assets/sustainability-hummingbird-poster.jpg.asset.json";

/** Bundled media referenced from the database as "asset:<key>" (the original website files). */
const ASSETS: Record<string, string> = {
  lm1: lm1.url, lm2: lm2.url, lm3: lm3.url, lm4: lm4.url, lm7: lm7.url,
  namExpresswayCombined: namExpresswayCombined.url, musiCombined: musiCombined.url,
  odysseyCombined: odysseyCombined.url, narelaCombined: narelaCombined.url,
  hummingbird: hummingbird.url, "hummingbird-poster": hummingbirdPoster.url,
};
export const ASSET_PREFIX = "asset:";
export const resolveHomeAsset = (u: string | null | undefined) =>
  !u ? null : u.startsWith(ASSET_PREFIX) ? ASSETS[u.slice(ASSET_PREFIX.length)] ?? null : u;
