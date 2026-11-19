import { createServerFn } from "@tanstack/react-start";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { DEFAULT_SETTINGS, parseSettings, type SiteSettings } from "@/lib/site-settings";

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async (): Promise<SiteSettings> => {
  const url = process.env["SUPABASE_URL"]; const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return DEFAULT_SETTINGS;
  const sb = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const h = new Headers(init?.headers);
      if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
      h.set("apikey", key);
      return fetch(input, { ...init, headers: h });
    } },
  });
  const { data, error } = await sb.from("site_settings").select("key,value");
  if (error) { console.error("site_settings", error.message); return DEFAULT_SETTINGS; }
  return parseSettings(data ?? []);
});

export const siteSettingsQuery = () => queryOptions({ queryKey: ["site-settings"], queryFn: () => getSiteSettings(), staleTime: 30_000 });
export const useSiteSettings = () => useQuery(siteSettingsQuery()).data ?? DEFAULT_SETTINGS;
