import { publishedFileUrl } from "@/lib/file-url";
import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type AboutContent = { eyebrow: string; title: string; subtitle: string; bannerImage: string | null; statement: string; image: string | null; extra: Record<string, string> };
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

    const resolve = publishedFileUrl;

    const content: AboutContent | null = cRes.data
      ? { eyebrow: cRes.data.eyebrow, title: cRes.data.title, subtitle: cRes.data.subtitle, bannerImage: resolve(cRes.data.banner_image_url), statement: cRes.data.statement, image: resolve(cRes.data.image_url), extra: (cRes.data.extra && typeof cRes.data.extra === "object" && !Array.isArray(cRes.data.extra) ? cRes.data.extra : {}) as Record<string, string> }
      : null;
    const clients: ClientItem[] = rows.map((r) => ({ id: r.id, image: resolve(r.image_url), description: r.description }));
    return { content, clients };
  });

export const aboutDataQuery = (slug: string) => queryOptions({ queryKey: ["about-data", slug], queryFn: () => getAboutData({ data: { slug } }) });
