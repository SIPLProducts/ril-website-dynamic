import { supabase } from "@/integrations/supabase/client";
import { imageDisplayKey, type ImageDisplay } from "@/lib/image-display";
import { resizeImage } from "@/lib/image-resolution";
import type { Json } from "@/integrations/supabase/types";

const uploads = new WeakMap<File, ImageDisplay>();
export function registerImageOptions(file: File, options: ImageDisplay) { uploads.set(file, options); }
export const hasImageOptions = (file: File) => uploads.has(file);
export async function prepareImageUpload(file: File) {
  const options = uploads.get(file);
  if (!options || file.type === "image/gif") return file;
  const resized = await resizeImage(file, options.resolution);
  uploads.set(resized, options);
  return resized;
}

/** Merge only this photo, retrying if another editor saved in the meantime. */
export async function saveImageDisplay(src: string, options: ImageDisplay | null) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data, error } = await supabase.from("site_settings").select("value,updated_at").eq("key", "accolade_images").maybeSingle();
    if (error) throw error;
    const value: Record<string, Json | undefined> = data?.value && typeof data.value === "object" && !Array.isArray(data.value) ? { ...data.value } : {};
    if (options) value[imageDisplayKey(src)] = { ...options };
    else delete value[imageDisplayKey(src)];
    if (data) {
      const result = await supabase.from("site_settings").update({ value }).eq("key", "accolade_images").eq("updated_at", data.updated_at).select("key");
      if (result.error) throw result.error;
      if (result.data?.length) return;
    } else {
      const result = await supabase.from("site_settings").insert({ key: "accolade_images", value });
      if (!result.error) return;
      if (result.error.code !== "23505") throw result.error;
    }
  }
  throw new Error("Another editor is saving photos. Please try again.");
}
export async function saveUploadedImageOptions(file: File, src: string) {
  const options = uploads.get(file);
  if (options && file.type.startsWith("image/")) await saveImageDisplay(src, options);
}