import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const getHiddenPages = createServerFn({ method: "GET" }).handler(async (): Promise<string[]> => {
  const url = process.env["SUPABASE_URL"]; const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return [];
  const sb = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const h = new Headers(init?.headers);
      if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
      h.set("apikey", key);
      return fetch(input, { ...init, headers: h });
    } },
  });
  const { data, error } = await sb.from("page_visibility").select("key").eq("published", false);
  if (error) { console.error("page_visibility", error.message); return []; }
  return (data ?? []).map((r) => r.key);
});

export const hiddenPagesQuery = () => queryOptions({ queryKey: ["hidden-pages"], queryFn: () => getHiddenPages(), staleTime: 30_000 });
