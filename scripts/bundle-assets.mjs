// Self-hosting: copy every /__l5e/assets-v1/... file referenced by the app or SQL seeds into
// dist/public so the server serves them locally (no outbound internet needed).
// Retries slow downloads and never fails the build (set SKIP_ASSET_BUNDLE=1 to skip).
import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

if (process.env.SKIP_ASSET_BUNDLE === "1") { console.log("Asset bundling skipped"); process.exit(0); }
const ORIGINS = [process.env.ASSET_ORIGIN || "https://ril-website-dynamic.lovable.app",
  "https://id-preview--a0d81829-f7da-46aa-90b9-e21b318b353f.lovable.app"];
const OUT = "dist/public";
const RE = /\/__l5e\/assets-v1\/[0-9a-f-]{36}\/[^"'\s)<>\\]+/g;
const urls = new Set();
function walk(d) {
  if (!existsSync(d)) return;
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (f === "node_modules" || f === ".git" || f === "dist") continue;
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(json|tsx?|sql|css|mjs|js)$/.test(f)) for (const m of readFileSync(p, "utf8").matchAll(RE)) urls.add(m[0]);
  }
}
["src", "drizzle", "deploy", "supabase"].forEach(walk);

async function download(u) {
  let last;
  for (const origin of ORIGINS) for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(origin + u, { signal: AbortSignal.timeout(60000) });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return Buffer.from(await r.arrayBuffer());
    } catch (e) { last = e; await new Promise((s) => setTimeout(s, 1500)); }
  }
  throw last;
}

let ok = 0; const failed = [];
for (const u of urls) {
  const dest = join(OUT, decodeURIComponent(u));
  if (existsSync(dest)) { ok++; continue; }
  try {
    const buf = await download(u);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, buf);
    ok++;
  } catch (e) { failed.push(u); console.warn("SKIPPED (will retry next build)", u, e?.message); }
}
console.log(`Bundled ${ok}/${urls.size} images & files into ${OUT}/__l5e (${failed.length} skipped)`);
if (failed.length) console.log("Build is still OK. Run npm run build again to fetch the skipped files.");
process.exitCode = 0;
