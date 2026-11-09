import { publishedFileUrl } from "@/lib/file-url";
import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type HomeImage = { url: string | null; alt: string; position: string };
export type HomeTop = {
  slides: { id: string; project: string; headline: string; sub: string; alt: string; image: string | null }[];
  stats: { id: string; value: string; label: string }[];
  about: { eyebrow: string; title: string; paragraphs: string[]; highlights: { t: string; d: string }[]; images: HomeImage[] };
  journey: { eyebrow: string; title: string; milestones: { id: string; year: string; title: string; text: string }[] };
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

/** Image values: "storage:<path>" (served through the website), "asset:<key>" (resolved in the browser), or a URL. */
export const getHomeTop = createServerFn({ method: "GET" }).handler(async (): Promise<HomeTop> => {
  const sb = publicClient();
  const [s, st, j, t] = await Promise.all([
    sb.from("home_hero_slides").select("*").eq("published", true).order("sort_order"),
    sb.from("home_stats").select("*").eq("published", true).order("sort_order"),
    sb.from("home_journey_milestones").select("*").eq("published", true).order("sort_order"),
    sb.from("home_top").select("*").eq("id", 1).maybeSingle(),
  ]);
  const images = (Array.isArray(t.data?.about_images) ? t.data.about_images : []) as { url?: string; alt?: string; position?: string }[];
  const res = publishedFileUrl;
  const paras = Array.isArray(t.data?.about_paragraphs) ? (t.data.about_paragraphs as unknown[]).map(String) : [];
  const hl = Array.isArray(t.data?.about_highlights) ? (t.data.about_highlights as { t?: string; d?: string }[]) : [];
  return {
    slides: (s.data ?? []).map((r) => ({ id: r.id, project: r.project, headline: r.headline, sub: r.sub, alt: r.alt, image: res(r.image_url) })),
    stats: (st.data ?? []).map((r) => ({ id: r.id, value: r.value, label: r.label })),
    about: {
      eyebrow: t.data?.about_eyebrow ?? "Who we are", title: t.data?.about_title ?? "", paragraphs: paras,
      highlights: hl.map((h) => ({ t: String(h.t ?? ""), d: String(h.d ?? "") })),
      images: images.map((i) => ({ url: res(i.url), alt: String(i.alt ?? ""), position: String(i.position ?? "50% 50%") })),
    },
    journey: {
      eyebrow: t.data?.journey_eyebrow ?? "Our Journey", title: t.data?.journey_title ?? "",
      milestones: (j.data ?? []).map((r) => ({ id: r.id, year: r.year, title: r.title, text: r.text })),
    },
  };
});

export const homeTopQuery = () => queryOptions({ queryKey: ["home-top"], queryFn: () => getHomeTop(), staleTime: 60_000 });
