import { safeRandomUUID } from "@/lib/uuid";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ImagePlus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { IR_BUCKET, STORAGE_PREFIX } from "@/lib/investor-relations";
import { imageFileError } from "@/lib/admin-validation";
import { FileDropzone, FormSection } from "@/components/admin/AdminDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

async function uploadImage(file: File, folder: string) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `about/${folder}/${safeRandomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(IR_BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw new Error(error.message);
  return STORAGE_PREFIX + path;
}
async function removeStored(url: string | null) {
  if (url?.startsWith(STORAGE_PREFIX)) await supabase.storage.from(IR_BUCKET).remove([url.slice(STORAGE_PREFIX.length)]);
}
function usePreview(url: string | null) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    if (!url) { setSrc(null); return; }
    if (!url.startsWith(STORAGE_PREFIX)) { setSrc(url); return; }
    supabase.storage.from(IR_BUCKET).createSignedUrl(url.slice(STORAGE_PREFIX.length), 3600).then(({ data }) => setSrc(data?.signedUrl ?? null));
  }, [url]);
  return src;
}

function ImageField({ label, url, file, onFile, onRemove }: { label: string; url: string | null; file: File | null; onFile: (f: File | null) => void; onRemove: () => void }) {
  const preview = usePreview(url);
  const local = file ? URL.createObjectURL(file) : null;
  const shown = local ?? preview;
  return (
    <div>
      <Label>{label} <span className="text-muted-foreground">(optional)</span></Label>
      <div className="mt-2 grid gap-3 sm:grid-cols-[10rem_1fr]">
        <div className="grid h-28 place-items-center overflow-hidden rounded-lg border border-border bg-surface">
          {shown ? <img src={shown} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="size-7 text-muted-foreground" />}
        </div>
        <div className="space-y-2">
          <FileDropzone file={file} onFile={onFile} accept="image/png,image/jpeg,image/webp" hint="PNG, JPG or WebP, up to 5 MB" />
          {url && !file && <Button type="button" size="sm" variant="outline" onClick={onRemove}><Trash2 className="size-4" /> Remove image</Button>}
        </div>
      </div>
    </div>
  );
}

export function AboutContentEditor({ slug, label }: { slug: string; label: string }) {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-about", slug], queryFn: async () => {
    const { data, error } = await supabase.from("about_content").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    return data;
  } });
  const [f, setF] = useState({ eyebrow: "", title: "", subtitle: "", statement: "", banner_image_url: null as string | null, image_url: null as string | null, extra: {} as Record<string, string> });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setF({ eyebrow: data.eyebrow, title: data.title, subtitle: data.subtitle, statement: data.statement, banner_image_url: data.banner_image_url, image_url: data.image_url, extra: (data.extra && typeof data.extra === "object" && !Array.isArray(data.extra) ? data.extra : {}) as Record<string, string> }); }, [data]);

  async function save() {
    const err = imageFileError(bannerFile, false) ?? imageFileError(imgFile, false);
    if (err) { toast.error(err); return; }
    if (!f.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const next = { ...f };
      if (bannerFile) next.banner_image_url = await uploadImage(bannerFile, "banner");
      if (imgFile) next.image_url = await uploadImage(imgFile, "section");
      const { error } = await supabase.from("about_content").upsert({ slug: slug, ...next });
      if (error) throw new Error(error.message);
      if (data?.banner_image_url && data.banner_image_url !== next.banner_image_url) await removeStored(data.banner_image_url);
      if (data?.image_url && data.image_url !== next.image_url) await removeStored(data.image_url);
      setBannerFile(null); setImgFile(null);
      toast.success("Saved — now live on the website");
      qc.invalidateQueries({ queryKey: ["admin-about", slug] });
      qc.invalidateQueries({ queryKey: ["about-data", slug] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); } finally { setSaving(false); }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">{label} page content</h2>
          <p className="text-sm text-muted-foreground">Top banner and the About Ramky block.</p>
        </div>
        <Button onClick={save} disabled={saving} className="neu-btn-gradient border-0"><Save className="size-4" /> {saving ? "Saving…" : "Save"}</Button>
      </div>
      <FormSection title="Top banner">
        <div className="grid gap-4 sm:grid-cols-3">
          <div><Label>Small heading</Label><Input value={f.eyebrow} maxLength={80} onChange={(e) => setF({ ...f, eyebrow: e.target.value })} /></div>
          <div><Label>Title</Label><Input value={f.title} maxLength={80} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
          <div><Label>Subtitle</Label><Input value={f.subtitle} maxLength={200} onChange={(e) => setF({ ...f, subtitle: e.target.value })} /></div>
        </div>
        <ImageField label="Background image" url={f.banner_image_url} file={bannerFile} onFile={setBannerFile} onRemove={() => setF({ ...f, banner_image_url: null })} />
      </FormSection>
      <FormSection title="About Ramky">
        <div><Label>Description</Label><Textarea rows={4} maxLength={2000} value={f.statement} onChange={(e) => setF({ ...f, statement: e.target.value })} /></div>
        <ImageField label="Image" url={f.image_url} file={imgFile} onFile={setImgFile} onRemove={() => setF({ ...f, image_url: null })} />
      </FormSection>
      {slug === "management-systems" && (<>
        <FormSection title="Certified Systems section">
          <ExtraFields f={f.extra} set={(extra) => setF({ ...f, extra })} items={[["certEyebrow", "Small heading"], ["certTitle", "Main heading"], ["certIntro", "Intro paragraph", true]]} />
        </FormSection>
        <FormSection title="Our Commitment section">
          <ExtraFields f={f.extra} set={(extra) => setF({ ...f, extra })} items={[["commitEyebrow", "Small heading"], ["commitTitle", "Main heading"], ["commitIntro", "Intro paragraph", true], ["tagline", "Bottom line"]]} />
        </FormSection>
      </>)}
      {slug === "strength-strategies" && (<>
        <FormSection title="Pillars section">
          <ExtraFields f={f.extra} set={(extra) => setF({ ...f, extra })} items={[["pillarsTitle", "Section heading"]]} />
        </FormSection>
        <FormSection title="Intro section (shown below the pillars)">
          <ExtraFields f={f.extra} set={(extra) => setF({ ...f, extra })} items={[["introTitle", "Heading"], ["introTagline", "Tagline"], ["introSubtitle", "Sub heading"], ["introBody", "Paragraphs (blank line between paragraphs)", true]]} />
        </FormSection>
      </>)}
    </section>
  );
}


function ExtraFields({ f, set, items }: { f: Record<string, string>; set: (v: Record<string, string>) => void; items: [string, string, boolean?][] }) {
  return (
    <div className="grid gap-4">
      {items.map(([k, label, long]) => (
        <div key={k}><Label>{label}</Label>
          {long ? <Textarea rows={3} maxLength={1500} value={f[k] ?? ""} onChange={(e) => set({ ...f, [k]: e.target.value })} />
            : <Input value={f[k] ?? ""} maxLength={160} onChange={(e) => set({ ...f, [k]: e.target.value })} />}
        </div>
      ))}
    </div>
  );
}
