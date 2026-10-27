import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { IR_BUCKET, STORAGE_PREFIX } from "@/lib/investor-relations";

export type PublicAward = {
  id: string; awardDate: string; title: string; category: string | null; organisation: string;
  project: string | null; description: string | null; image: string | null; altText: string | null; sortOrder: number;
};

/** Public read of live awards; storage images become signed URLs. */
export const getAccolades = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const sb = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data, error } = await sb.from("accolades").select("*").eq("published", true).order("award_date", { ascending: false }).order("sort_order");
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const paths = rows.map((r) => r.image_url).filter((u): u is string => !!u?.startsWith(STORAGE_PREFIX)).map((u) => u.slice(STORAGE_PREFIX.length));
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data: s } = await sb.storage.from(IR_BUCKET).createSignedUrls(paths, 60 * 60 * 24);
    const browserBase = process.env["VITE_SUPABASE_URL"] ?? process.env["SUPABASE_URL"]!;
    for (const x of s ?? []) if (x.path && x.signedUrl) signed.set(x.path, x.signedUrl.replace(process.env["SUPABASE_URL"]!, browserBase));
  }
  const resolve = (u: string | null) => (!u ? null : u.startsWith(STORAGE_PREFIX) ? signed.get(u.slice(STORAGE_PREFIX.length)) ?? null : u);
  return rows.map<PublicAward>((r) => ({
    id: r.id, awardDate: r.award_date, title: r.title, category: r.category, organisation: r.organisation,
    project: r.project, description: r.description, image: resolve(r.image_url), altText: r.alt_text, sortOrder: r.sort_order,
  }));
});

export const accoladesQuery = () => queryOptions({ queryKey: ["accolades-public"], queryFn: () => getAccolades() });
