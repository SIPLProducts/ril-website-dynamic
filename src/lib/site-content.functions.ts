import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { IR_BUCKET, STORAGE_PREFIX } from "@/lib/investor-relations";
import type { MediaItem, MediaType } from "@/lib/media";
import type { CareersData, RecruitmentFlyer, Vacancy } from "@/lib/careers";

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

export type CsrData = {
  eyebrow: string; title: string; subtitle: string; intro: string; ctaLabel: string; ctaUrl: string;
  areas: { id: string; title: string; text: string }[];
};

export const getCsr = createServerFn({ method: "GET" }).handler(async (): Promise<CsrData | null> => {
  const sb = publicClient();
  const [c, a] = await Promise.all([
    sb.from("csr_content").select("*").eq("id", 1).maybeSingle(),
    sb.from("csr_areas").select("id,title,body").eq("published", true).order("sort_order"),
  ]);
  if (c.error) throw new Error(c.error.message);
  if (!c.data) return null;
  return {
    eyebrow: c.data.eyebrow, title: c.data.title, subtitle: c.data.subtitle, intro: c.data.intro,
    ctaLabel: c.data.cta_label, ctaUrl: c.data.cta_url,
    areas: (a.data ?? []).map((r) => ({ id: r.id, title: r.title, text: r.body })),
  };
});
export const csrQuery = () => queryOptions({ queryKey: ["csr"], queryFn: () => getCsr() });

export type MediaData = {
  page: { eyebrow: string; title: string; intro: string; cardTitle: string; cardSubtitle: string; cardText: string } | null;
  items: MediaItem[];
};

export const getMedia = createServerFn({ method: "GET" }).handler(async (): Promise<MediaData> => {
  const sb = publicClient();
  const [p, i] = await Promise.all([
    sb.from("media_page").select("*").eq("id", 1).maybeSingle(),
    sb.from("media_items").select("*").eq("published", true).order("sort_order"),
  ]);
  if (p.error) throw new Error(p.error.message);
  if (i.error) throw new Error(i.error.message);
  const rows = i.data ?? [];
  const paths = rows.map((r) => r.document_url).filter((u): u is string => !!u?.startsWith(STORAGE_PREFIX)).map((u) => u.slice(STORAGE_PREFIX.length));
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data: s } = await sb.storage.from(IR_BUCKET).createSignedUrls(paths, 60 * 60 * 24);
    const browserBase = process.env["VITE_SUPABASE_URL"] ?? process.env["SUPABASE_URL"]!;
    for (const x of s ?? []) if (x.path && x.signedUrl) signed.set(x.path, x.signedUrl.replace(process.env["SUPABASE_URL"]!, browserBase));
  }
  const doc = (u: string | null) => (!u ? undefined : u.startsWith(STORAGE_PREFIX) ? signed.get(u.slice(STORAGE_PREFIX.length)) : u);
  const items: MediaItem[] = rows.map((r) => {
    const paragraphs = Array.isArray(r.paragraphs) ? (r.paragraphs as unknown[]).filter((x): x is string => typeof x === "string" && !!x.trim()) : [];
    const m: MediaItem = { id: r.id, title: r.title, type: r.item_type as MediaType, published: true };
    if (r.item_date) m.date = r.item_date;
    if (r.kicker) m.kicker = r.kicker;
    if (r.summary) m.summary = r.summary;
    if (paragraphs.length) m.paragraphs = paragraphs;
    if (r.source) m.source = r.source;
    const d = doc(r.document_url);
    if (d) m.documentUrl = d;
    if (r.external_url) m.externalUrl = r.external_url;
    if (r.link_label) m.linkLabel = r.link_label;
    return m;
  });
  const page = p.data
    ? { eyebrow: p.data.eyebrow, title: p.data.title, intro: p.data.intro, cardTitle: p.data.card_title, cardSubtitle: p.data.card_subtitle, cardText: p.data.card_text }
    : null;
  return { page, items };
});
export const mediaQuery = () => queryOptions({ queryKey: ["media"], queryFn: () => getMedia() });

const strs = (v: unknown) => (Array.isArray(v) ? (v as unknown[]).filter((x): x is string => typeof x === "string" && !!x.trim()) : []);

export const getCareers = createServerFn({ method: "GET" }).handler(async (): Promise<CareersData> => {
  const sb = publicClient();
  const [c, s, v, f] = await Promise.all([
    sb.from("careers_life_content").select("*").eq("id", 1).maybeSingle(),
    sb.from("careers_life_sections").select("*").eq("published", true).order("sort_order"),
    sb.from("career_vacancies").select("*").eq("published", true).order("sort_order"),
    sb.from("career_flyers").select("*").eq("published", true).order("sort_order"),
  ]);
  for (const r of [c, s, v, f]) if (r.error) throw new Error(r.error.message);
  const paths = [...(s.data ?? []), ...(f.data ?? [])].map((r) => r.image_url).filter((u): u is string => !!u?.startsWith(STORAGE_PREFIX)).map((u) => u.slice(STORAGE_PREFIX.length));
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data: sg } = await sb.storage.from(IR_BUCKET).createSignedUrls(paths, 60 * 60 * 24);
    const browserBase = process.env["VITE_SUPABASE_URL"] ?? process.env["SUPABASE_URL"]!;
    for (const x of sg ?? []) if (x.path && x.signedUrl) signed.set(x.path, x.signedUrl.replace(process.env["SUPABASE_URL"]!, browserBase));
  }
  const img = (u: string | null) => (!u ? undefined : u.startsWith(STORAGE_PREFIX) ? signed.get(u.slice(STORAGE_PREFIX.length)) : u);
  const opt = <T,>(o: T) => Object.fromEntries(Object.entries(o as object).filter(([, x]) => x !== undefined && x !== null && x !== "" && !(Array.isArray(x) && !x.length))) as T;
  return {
    purpose: { vision: c.data?.vision ?? "", mission: c.data?.mission ?? "", valuesIntro: c.data?.values_intro ?? "", values: strs(c.data?.values_list) },
    positionsIntro: c.data?.positions_intro ?? "",
    sections: (s.data ?? []).map((r) => opt({ id: r.id, title: r.title, paragraphs: strs(r.paragraphs), imageUrl: img(r.image_url) })),
    vacancies: (v.data ?? []).map((r) => opt({
      id: r.req_id || r.id, title: r.title, location: r.location, division: r.division, publishedDate: r.published_date,
      experience: r.experience, qualification: r.qualification, employmentType: r.employment_type, deadline: r.deadline,
      vacancies: r.vacancies ?? undefined, description: r.description, responsibilities: strs(r.responsibilities), skills: strs(r.skills), status: "open" as const,
    })) as Vacancy[],
    flyers: (f.data ?? []).map((r) => opt({ id: r.id, title: r.title, url: r.url, imageUrl: img(r.image_url), roles: strs(r.roles), status: "open" as const })) as RecruitmentFlyer[],
  };
});
export const careersQuery = () => queryOptions({ queryKey: ["careers"], queryFn: () => getCareers() });
