import { publishedFileUrl } from "@/lib/file-url";
import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type LandmarkSlide = { id: string; name: string; detail: string; image: string | null; fit: "cover" | "contain" };
export type HomeHighlights = {
  landmarkEyebrow: string; landmarkTitle: string; landmarks: LandmarkSlide[];
  sustainability: {
    eyebrow: string; title: string; body: string; sideStats: { v: string; l: string }[];
    video: string | null; poster: string | null; stats: { id: string; v: string; l: string; d: string }[];
  };
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

/** Stored values: "storage:<path>" (uploaded, served through the website), "asset:<key>" (bundled default, resolved in the browser), or a URL. */
export const getHomeHighlights = createServerFn({ method: "GET" }).handler(async (): Promise<HomeHighlights> => {
  const sb = publicClient();
  const [c, l, h, s] = await Promise.all([
    sb.from("capabilities_settings").select("landmark_eyebrow,landmark_title").eq("id", 1).maybeSingle(),
    sb.from("landmark_projects").select("*").eq("published", true).order("sort_order"),
    sb.from("home_sustainability").select("*").eq("id", 1).maybeSingle(),
    sb.from("home_sustainability_stats").select("*").eq("published", true).order("sort_order"),
  ]);
  const res = publishedFileUrl;
  const side = Array.isArray(h.data?.side_stats) ? (h.data.side_stats as { v?: string; l?: string }[]) : [];
  return {
    landmarkEyebrow: c.data?.landmark_eyebrow ?? "Projects that shape places",
    landmarkTitle: c.data?.landmark_title ?? "Landmark Engineering",
    landmarks: (l.data ?? []).map((r) => ({ id: r.id, name: r.name, detail: r.detail, image: res(r.image_url), fit: r.fit === "contain" ? "contain" : "cover" })),
    sustainability: {
      eyebrow: h.data?.eyebrow ?? "Sustainability",
      title: h.data?.title ?? "",
      body: h.data?.body ?? "",
      sideStats: side.map((x) => ({ v: String(x.v ?? ""), l: String(x.l ?? "") })),
      video: res(h.data?.video_url),
      poster: res(h.data?.poster_url),
      stats: (s.data ?? []).map((r) => ({ id: r.id, v: r.value, l: r.label, d: r.note })),
    },
  };
});

export const homeHighlightsQuery = () => queryOptions({ queryKey: ["home-highlights"], queryFn: () => getHomeHighlights(), staleTime: 60_000 });
