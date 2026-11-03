import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { IR_BUCKET, STORAGE_PREFIX } from "@/lib/investor-relations";
import type { EsgMetricGroup, EsgSection } from "@/lib/esg-sections";

/** Public read of one Sustainability (ESG) page with its live items; returns null for unknown pages. */
export const getEsgPage = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().max(60) }).parse(d))
  .handler(async ({ data }): Promise<EsgSection | null> => {
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
    const [pRes, iRes] = await Promise.all([
      sb.from("esg_pages").select("*").eq("slug", data.slug).maybeSingle(),
      sb.from("esg_items").select("kind,group_title,title,value,body,year,url,sort_order").eq("page_slug", data.slug).eq("published", true).order("sort_order"),
    ]);
    if (pRes.error) throw new Error(pRes.error.message);
    if (iRes.error) throw new Error(iRes.error.message);
    const page = pRes.data;
    if (!page) return null;
    const items = iRes.data ?? [];

    const urls = [page.banner_image_url, ...items.map((i) => i.url)];
    const paths = urls.filter((u): u is string => !!u && u.startsWith(STORAGE_PREFIX)).map((u) => u.slice(STORAGE_PREFIX.length));
    const signed = new Map<string, string>();
    if (paths.length) {
      const { data: s } = await sb.storage.from(IR_BUCKET).createSignedUrls(paths, 60 * 60 * 24);
      const browserBase = process.env["VITE_SUPABASE_URL"] ?? process.env["SUPABASE_URL"]!;
      for (const x of s ?? []) if (x.path && x.signedUrl) signed.set(x.path, x.signedUrl.replace(process.env["SUPABASE_URL"]!, browserBase));
    }
    const resolve = (u: string | null | undefined) => (!u ? null : u.startsWith(STORAGE_PREFIX) ? signed.get(u.slice(STORAGE_PREFIX.length)) ?? null : u);

    const metrics = items.filter((i) => i.kind === "metric");
    const groups: EsgMetricGroup[] = [];
    for (const m of metrics.filter((m) => m.group_title)) {
      let g = groups.find((x) => x.title === m.group_title);
      if (!g) groups.push((g = { title: m.group_title!, metrics: [] }));
      g.metrics.push({ value: m.value, label: m.title });
    }
    const govItems = items.filter((i) => i.kind === "governance_item").map((i) => i.title);
    const reports = items.filter((i) => i.kind === "report").map((r) => ({ title: r.title, description: r.body, year: r.year, url: resolve(r.url) }));
    return {
      slug: page.slug,
      title: page.title,
      eyebrow: page.eyebrow,
      hero: page.hero,
      metricsPeriod: page.metrics_period || undefined,
      metrics: metrics.filter((m) => !m.group_title).map((m) => ({ value: m.value, label: m.title })),
      metricGroups: groups.length ? groups : undefined,
      governance: page.highlight_value || govItems.length
        ? { highlight: { title: page.highlight_title, value: page.highlight_value, label: page.highlight_label }, items: govItems }
        : undefined,
      accordions: items.filter((i) => i.kind === "accordion").map((a) => ({ title: a.title, body: a.body })),
      reports: reports.length || data.slug === "esg-reporting" ? reports : undefined,
      bannerImage: resolve(page.banner_image_url),
    };
  });
