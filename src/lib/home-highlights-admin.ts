import { useEffect, useState } from "react";
import type { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IR_BUCKET, STORAGE_PREFIX } from "@/lib/investor-relations";
import { resolveHomeAsset } from "@/lib/home-assets";

export async function uploadHomeFile(folder: string, file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `home/${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(IR_BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw new Error(error.message);
  return STORAGE_PREFIX + path;
}
export async function removeHomeFile(url: string | null | undefined) {
  if (url?.startsWith(STORAGE_PREFIX)) await supabase.storage.from(IR_BUCKET).remove([url.slice(STORAGE_PREFIX.length)]);
}
/** Preview for "storage:", "asset:" or plain URL values. */
export function useHomePreview(url: string | null | undefined) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    if (!url) { setSrc(null); return; }
    if (!url.startsWith(STORAGE_PREFIX)) { setSrc(resolveHomeAsset(url)); return; }
    supabase.storage.from(IR_BUCKET).createSignedUrl(url.slice(STORAGE_PREFIX.length), 3600).then(({ data }) => setSrc(data?.signedUrl ?? null));
  }, [url]);
  return src;
}
export const refreshHome = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ["admin-landmarks"] });
  qc.invalidateQueries({ queryKey: ["admin-home-sus"] });
  qc.invalidateQueries({ queryKey: ["admin-home-sus-stats"] });
  qc.invalidateQueries({ queryKey: ["admin-cap-settings"] });
  qc.invalidateQueries({ queryKey: ["home-highlights"] });
  qc.invalidateQueries({ queryKey: ["home-top"] });
};
