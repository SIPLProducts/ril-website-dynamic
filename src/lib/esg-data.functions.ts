import { publishedFileUrl } from "@/lib/file-url";
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { hasCommittee, parseCommittee } from "@/lib/esg-committee";
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
      sb.from("esg_items").select("id,kind,group_title,title,value,body,year,url,sort_order").eq("page_slug", data.slug).eq("published", true).order("sort_order"),
    ]);
    if (pRes.error) throw new Error(pRes.error.message);
    if (iRes.error) throw new Error(iRes.error.message);
    const page = pRes.data;
    if (!page) return null;
    const items = iRes.data ?? [];

    const resolve = publishedFileUrl;

    const metrics = items.filter((i) => i.kind === "metric");
    const groups: EsgMetricGroup[] = [];
    for (const m of metrics.filter((m) => m.group_title)) {
      let g = groups.find((x) => x.title === m.group_title);
      if (!g) groups.push((g = { title: m.group_title!, metrics: [] }));
      g.metrics.push({ id: m.id, value: m.value, label: m.title });
    }
    const govRows = items.filter((i) => i.kind === "governance_item");
    const govItems = govRows.map((i) => i.title);
    const govDetails = Object.fromEntries(govRows.filter((i) => i.body.trim()).map((i) => [i.title, i.body]));
    const reports = items.filter((i) => i.kind === "report").map((r) => ({ title: r.title, description: r.body, year: r.year, url: resolve(r.url) }));
    const committee = parseCommittee(page.committee);
    return {
      committee: hasCommittee(committee) ? committee : undefined,
      slug: page.slug,
      title: page.title,
      eyebrow: page.eyebrow,
      hero: page.hero,
      metricsPeriod: page.metrics_period || undefined,
      metrics: metrics.filter((m) => !m.group_title).map((m) => ({ id: m.id, value: m.value, label: m.title, url: data.slug === "esg-reporting" ? resolve(m.url) : null })),
      metricGroups: groups.length ? groups : undefined,
      governance: page.highlight_value || govItems.length
        ? { highlight: { title: page.highlight_title, value: page.highlight_value, label: page.highlight_label }, items: govItems, details: govDetails }
        : undefined,
      accordions: items.filter((i) => i.kind === "accordion").map((a) => ({ title: a.title, body: a.body, imageUrl: data.slug === "environmental" || data.slug === "social" ? resolve(a.url) : null })),
      reports: reports.length || data.slug === "esg-reporting" ? reports : undefined,
      bannerImage: resolve(page.banner_image_url),
    };
  });
