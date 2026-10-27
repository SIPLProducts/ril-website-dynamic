import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { IR_BUCKET, STORAGE_PREFIX } from "@/lib/investor-relations";

export type AboutContent = { eyebrow: string; title: string; subtitle: string; bannerImage: string | null; statement: string; image: string | null };
export type ClientItem = { id: string; image: string | null; description: string };

/** Public read of editable About page content (and clientele list for the clientele page). */
export const getAboutData = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().max(60) }).parse(d))
  .handler(async ({ data }) => {
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
    const [cRes, lRes] = await Promise.all([
      sb.from("about_content").select("*").eq("slug", data.slug).maybeSingle(),
      data.slug === "clientele"
        ? sb.from("clientele").select("id,image_url,description,sort_order").eq("published", true).order("sort_order")
        : Promise.resolve({ data: [], error: null }),
    ]);
    if (cRes.error) throw new Error(cRes.error.message);
    if (lRes.error) throw new Error(lRes.error.message);
    const rows = lRes.data ?? [];

    const urls = [cRes.data?.banner_image_url, cRes.data?.image_url, ...rows.map((r) => r.image_url)];
    const paths = urls.filter((u): u is string => !!u && u.startsWith(STORAGE_PREFIX)).map((u) => u.slice(STORAGE_PREFIX.length));
    const signed = new Map<string, string>();
    if (paths.length) {
      const { data: s } = await sb.storage.from(IR_BUCKET).createSignedUrls(paths, 60 * 60 * 24);
      const browserBase = process.env["VITE_SUPABASE_URL"] ?? process.env["SUPABASE_URL"]!;
      for (const x of s ?? []) if (x.path && x.signedUrl) signed.set(x.path, x.signedUrl.replace(process.env["SUPABASE_URL"]!, browserBase));
    }
    const resolve = (u: string | null | undefined) => (!u ? null : u.startsWith(STORAGE_PREFIX) ? signed.get(u.slice(STORAGE_PREFIX.length)) ?? null : u);

    const content: AboutContent | null = cRes.data
      ? { eyebrow: cRes.data.eyebrow, title: cRes.data.title, subtitle: cRes.data.subtitle, bannerImage: resolve(cRes.data.banner_image_url), statement: cRes.data.statement, image: resolve(cRes.data.image_url) }
      : null;
    const clients: ClientItem[] = rows.map((r) => ({ id: r.id, image: resolve(r.image_url), description: r.description }));
    return { content, clients };
  });

export const aboutDataQuery = (slug: string) => queryOptions({ queryKey: ["about-data", slug], queryFn: () => getAboutData({ data: { slug } }) });
