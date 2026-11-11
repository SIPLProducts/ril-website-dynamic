// Self-hosting: copy every /__l5e/assets-v1/... file referenced by the app or SQL seeds into
// dist/public so the server serves them locally (no outbound internet needed).
import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

const ORIGIN = process.env.ASSET_ORIGIN || "https://ril-website-dynamic.lovable.app";
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
let ok = 0, fail = 0;
for (const u of urls) {
  const dest = join(OUT, decodeURIComponent(u));
  if (existsSync(dest)) { ok++; continue; }
  try {
    const r = await fetch(ORIGIN + u);
    if (!r.ok) throw new Error(String(r.status));
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
    ok++;
  } catch (e) { fail++; console.warn("FAILED", u, e.message); }
}
console.log(`Bundled ${ok}/${urls.size} images & files into ${OUT}/__l5e (${fail} failed)`);
if (fail) process.exitCode = 1;
