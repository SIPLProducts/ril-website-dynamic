import { browserStorageUrl } from "@/lib/storage-url";
import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { IR_BUCKET, STORAGE_PREFIX } from "@/lib/investor-relations";
import type { MgmtGroup, MgmtPerson } from "@/lib/management";

/** Public read of all published Management people, grouped and ordered. */
export const getManagement = createServerFn({ method: "GET" }).handler(async () => {
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
  const { data, error } = await sb
    .from("management_people")
    .select("id,grp,slug,name,designation,image_url,sections,sort_order")
    .eq("published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  const rows = data ?? [];

  const paths = rows.map((r) => r.image_url).filter((u): u is string => !!u && u.startsWith(STORAGE_PREFIX)).map((u) => u.slice(STORAGE_PREFIX.length));
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data: s } = await sb.storage.from(IR_BUCKET).createSignedUrls(paths, 60 * 60 * 24);
    for (const x of s ?? []) if (x.path && x.signedUrl) signed.set(x.path, browserStorageUrl(x.signedUrl));
  }
  const resolve = (u: string | null) => (!u ? null : u.startsWith(STORAGE_PREFIX) ? signed.get(u.slice(STORAGE_PREFIX.length)) ?? null : u);

  const people: MgmtPerson[] = rows.map((r) => ({
    id: r.id,
    group: r.grp as MgmtGroup,
    slug: r.slug,
    name: r.name,
    designation: r.designation,
    image: resolve(r.image_url),
    sections: (r.sections && typeof r.sections === "object" && !Array.isArray(r.sections) ? r.sections : {}) as Record<string, string[]>,
  }));
  return people;
});

export const managementQuery = () => queryOptions({ queryKey: ["management"], queryFn: () => getManagement() });
