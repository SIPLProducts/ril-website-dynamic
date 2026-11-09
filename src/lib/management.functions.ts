import { publishedFileUrl } from "@/lib/file-url";
import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
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

  const resolve = publishedFileUrl;

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
