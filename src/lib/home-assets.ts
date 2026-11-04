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
import leachateHyd from "@/assets/leachate-hyderabad.asset.json";
import srinagarBanihal from "@/assets/srinagar-banihal-expressway.jpg.asset.json";
import wtpNalgonda from "@/assets/wtp-nalgonda.jpg.asset.json";
import slide3 from "@/assets/slide-3.jpg.asset.json";
import namBridge from "@/assets/nam-bridge.jpg.asset.json";
import whoMain from "@/assets/who-we-are-main.jpg.asset.json";
import who1 from "@/assets/who-we-are-support-1.jpg.asset.json";
import who2 from "@/assets/who-we-are-support-2.jpg.asset.json";

/** Bundled media referenced from the database as "asset:<key>" (the original website files). */
const ASSETS: Record<string, string> = {
  lm1: lm1.url, lm2: lm2.url, lm3: lm3.url, lm4: lm4.url, lm7: lm7.url,
  namExpresswayCombined: namExpresswayCombined.url, musiCombined: musiCombined.url,
  odysseyCombined: odysseyCombined.url, narelaCombined: narelaCombined.url,
  hummingbird: hummingbird.url, "hummingbird-poster": hummingbirdPoster.url,
  "hero-leachate": leachateHyd.url, "hero-srinagar": srinagarBanihal.url, "hero-nalgonda": wtpNalgonda.url,
  "hero-slide3": slide3.url, "hero-nam": namBridge.url,
  "who-main": whoMain.url, "who-1": who1.url, "who-2": who2.url,
};
export const ASSET_PREFIX = "asset:";
export const resolveHomeAsset = (u: string | null | undefined) =>
  !u ? null : u.startsWith(ASSET_PREFIX) ? ASSETS[u.slice(ASSET_PREFIX.length)] ?? null : u;
