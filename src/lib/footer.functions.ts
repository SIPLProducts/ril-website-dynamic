import { browserStorageUrl } from "@/lib/storage-url";
import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { IR_BUCKET, STORAGE_PREFIX } from "@/lib/investor-relations";

export type FooterData = {
  settings: {
    description: string; address: string; phone: string; email: string; tagline: string; copyrightName: string;
    groupEyebrow: string; groupTitle: string; groupSubtitle: string;
  };
  columns: { id: string; title: string; links: { id: string; label: string; href: string; newTab: boolean }[] }[];
  companies: { id: string; name: string; url: string | null; logo: string | null }[];
};

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

export const getFooter = createServerFn({ method: "GET" }).handler(async (): Promise<FooterData | null> => {
  const sb = publicClient();
  const [s, c, l, g] = await Promise.all([
    sb.from("footer_settings").select("*").eq("id", 1).maybeSingle(),
    sb.from("footer_columns").select("id,title").eq("published", true).order("sort_order"),
    sb.from("footer_links").select("id,column_id,label,href,new_tab").eq("published", true).order("sort_order"),
    sb.from("group_companies").select("id,name,url,logo_url").eq("published", true).order("sort_order"),
  ]);
  if (s.error || !s.data) return null;
  const rows = g.data ?? [];
  const paths = rows.map((r) => r.logo_url).filter((u): u is string => !!u?.startsWith(STORAGE_PREFIX)).map((u) => u.slice(STORAGE_PREFIX.length));
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data } = await sb.storage.from(IR_BUCKET).createSignedUrls(paths, 60 * 60 * 24);
    for (const x of data ?? []) if (x.path && x.signedUrl) signed.set(x.path, browserStorageUrl(x.signedUrl));
  }
  const d = s.data;
  return {
    settings: {
      description: d.description, address: d.address, phone: d.phone, email: d.email, tagline: d.tagline,
      copyrightName: d.copyright_name, groupEyebrow: d.group_eyebrow, groupTitle: d.group_title, groupSubtitle: d.group_subtitle,
    },
    columns: (c.data ?? []).map((col) => ({
      id: col.id, title: col.title,
      links: (l.data ?? []).filter((x) => x.column_id === col.id).map((x) => ({ id: x.id, label: x.label, href: x.href, newTab: x.new_tab })),
    })),
    companies: rows.map((r) => ({
      id: r.id, name: r.name, url: r.url,
      logo: !r.logo_url ? null : r.logo_url.startsWith(STORAGE_PREFIX) ? signed.get(r.logo_url.slice(STORAGE_PREFIX.length)) ?? null : r.logo_url,
    })),
  };
});

export const footerQuery = () => queryOptions({ queryKey: ["footer"], queryFn: () => getFooter(), staleTime: 60_000 });
