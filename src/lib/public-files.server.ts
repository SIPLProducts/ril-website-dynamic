import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export function validFilePath(path: string): boolean {
  return !!path && !path.startsWith("/") && !path.includes("\\") && !/[\x00-\x1f\x7f]/.test(path)
    && path.split("/").every((segment) => !!segment && segment !== "." && segment !== "..");
}

/** Match only actual public-content fields. In particular, resumes and unreferenced uploads are never public. */
export async function isPublishedFile(sb: SupabaseClient<Database>, path: string): Promise<boolean> {
  if (!validFilePath(path)) return false;
  const ref = "storage:" + path;
  const matches = await Promise.all([
    sb.from("ir_documents").select("id").eq("url", ref).eq("published", true).limit(1),
    sb.from("group_companies").select("id").eq("logo_url", ref).eq("published", true).limit(1),
    sb.from("subsidiaries").select("id").eq("image_url", ref).eq("published", true).limit(1),
    sb.from("clientele").select("id").eq("image_url", ref).eq("published", true).limit(1),
    sb.from("accolades").select("id").eq("image_url", ref).eq("published", true).limit(1),
    sb.from("management_people").select("id").eq("image_url", ref).eq("published", true).limit(1),
    sb.from("business_verticals").select("slug").eq("image_url", ref).eq("published", true).limit(1),
    sb.from("landmark_projects").select("id").eq("image_url", ref).eq("published", true).limit(1),
    sb.from("home_hero_slides").select("id").eq("image_url", ref).eq("published", true).limit(1),
    sb.from("media_items").select("id").eq("document_url", ref).eq("published", true).limit(1),
    sb.from("careers_life_sections").select("id").eq("image_url", ref).eq("published", true).limit(1),
    sb.from("career_flyers").select("id").eq("image_url", ref).eq("published", true).limit(1),
    sb.from("career_flyers").select("id").eq("url", ref).eq("published", true).limit(1),
    sb.from("esg_items").select("id").eq("url", ref).eq("published", true).limit(1),
    sb.from("management_system_items").select("id").eq("doc_url", ref).eq("published", true).limit(1),
    sb.from("careers_landing_cards").select("id").eq("image_url", ref).eq("published", true).limit(1),
    sb.from("strength_pillars").select("id").eq("image_url", ref).eq("published", true).limit(1),
    sb.from("about_content").select("slug").eq("banner_image_url", ref).limit(1),
    sb.from("about_content").select("slug").eq("image_url", ref).limit(1),
    sb.from("esg_pages").select("slug").eq("banner_image_url", ref).limit(1),
    sb.from("home_sustainability").select("id").eq("id", 1).eq("video_url", ref).limit(1),
    sb.from("home_sustainability").select("id").eq("id", 1).eq("poster_url", ref).limit(1),
    sb.from("home_top").select("id").eq("id", 1).contains("about_images", [{ url: ref }]).limit(1),
  ]);
  return matches.some((result) => !result.error && (result.data?.length ?? 0) > 0);
}

export function publicFileClient(): SupabaseClient<Database> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"];
  if (!url || !key) throw new Error("File service is not configured");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
}