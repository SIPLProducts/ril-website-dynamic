import { publishedFileUrl } from "@/lib/file-url";
import { safeRandomUUID } from "@/lib/uuid";
import { useEffect, useState } from "react";
import type { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IR_BUCKET, STORAGE_PREFIX } from "@/lib/investor-relations";

export type VerticalRow = {
  slug: string; title: string; card_text: string; description: string; icon: string;
  image_url: string | null; image_alt: string; published: boolean; sort_order: number;
};
export type ProjectRow = {
  id: string; vertical_slug: string; name: string; location: string; client: string;
  status: "Ongoing" | "O&M" | "Completed"; published: boolean; sort_order: number;
};
export const STATUSES = ["Ongoing", "O&M", "Completed"] as const;

export async function fetchVerticals() {
  const { data, error } = await supabase.from("business_verticals").select("*").order("sort_order");
  if (error) throw error;
  return data as VerticalRow[];
}

export async function uploadCapabilityImage(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `capabilities/${safeRandomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(IR_BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw new Error(error.message);
  return STORAGE_PREFIX + path;
}
export async function removeStored(url: string | null) {
  if (url?.startsWith(STORAGE_PREFIX)) await supabase.storage.from(IR_BUCKET).remove([url.slice(STORAGE_PREFIX.length)]);
}
export function useStoredPreview(url: string | null) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    if (!url) { setSrc(null); return; }
    if (!url.startsWith(STORAGE_PREFIX)) { setSrc(url); return; }
    supabase.storage.from(IR_BUCKET).createSignedUrl(url.slice(STORAGE_PREFIX.length), 3600).then(({ data }) => setSrc(data?.signedUrl ?? publishedFileUrl(url)), () => setSrc(publishedFileUrl(url)));
  }, [url]);
  return src;
}
export const slugify = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
export const refreshCapabilities = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ["admin-verticals"] });
  qc.invalidateQueries({ queryKey: ["admin-projects"] });
  qc.invalidateQueries({ queryKey: ["admin-cap-settings"] });
  qc.invalidateQueries({ queryKey: ["capabilities"] });
};
