import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { IR_BUCKET, STORAGE_PREFIX } from "@/lib/investor-relations";
import type { BusinessProject, ProjectStatus } from "@/lib/business-projects";

export type CapabilityVertical = {
  slug: string; title: string; cardText: string; description: string; icon: string;
  image: string | null; imageAlt: string; projects: BusinessProject[];
};
export type CapabilitiesData = { eyebrow: string; title: string; intro: string; verticals: CapabilityVertical[] };

const STATUS_ORDER: Record<ProjectStatus, number> = { Ongoing: 0, "O&M": 1, Completed: 2 };

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
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
}

export const getCapabilities = createServerFn({ method: "GET" }).handler(async (): Promise<CapabilitiesData> => {
  const sb = publicClient();
  const [s, v, p] = await Promise.all([
    sb.from("capabilities_settings").select("*").eq("id", 1).maybeSingle(),
    sb.from("business_verticals").select("*").eq("published", true).order("sort_order"),
    sb.from("business_projects").select("vertical_slug,name,location,client,status").eq("published", true).order("sort_order"),
  ]);
  if (v.error) throw new Error("Could not load capabilities");
  const rows = v.data ?? [];
  const paths = rows.map((r) => r.image_url).filter((u): u is string => !!u?.startsWith(STORAGE_PREFIX)).map((u) => u.slice(STORAGE_PREFIX.length));
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data } = await sb.storage.from(IR_BUCKET).createSignedUrls(paths, 60 * 60 * 24);
    const browserBase = process.env["VITE_SUPABASE_URL"] ?? process.env["SUPABASE_URL"]!;
    for (const x of data ?? []) if (x.path && x.signedUrl) signed.set(x.path, x.signedUrl.replace(process.env["SUPABASE_URL"]!, browserBase));
  }
  return {
    eyebrow: s.data?.eyebrow ?? "Capabilities",
    title: s.data?.title ?? "Multi-Disciplinary Spectrum",
    intro: s.data?.intro ?? "",
    verticals: rows.map((r) => ({
      slug: r.slug, title: r.title, cardText: r.card_text, description: r.description, icon: r.icon, imageAlt: r.image_alt,
      image: !r.image_url ? null : r.image_url.startsWith(STORAGE_PREFIX) ? signed.get(r.image_url.slice(STORAGE_PREFIX.length)) ?? null : r.image_url,
      projects: (p.data ?? []).filter((x) => x.vertical_slug === r.slug).map((x) => ({ name: x.name, location: x.location, client: x.client, status: x.status as ProjectStatus }))
        .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]),
    })),
  };
});

export const capabilitiesQuery = () => queryOptions({ queryKey: ["capabilities"], queryFn: () => getCapabilities(), staleTime: 60_000 });
