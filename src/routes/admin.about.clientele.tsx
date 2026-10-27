import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Building2, ImagePlus, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getStaff } from "@/lib/admin-auth";
import { IR_BUCKET, STORAGE_PREFIX } from "@/lib/investor-relations";
import { clientImageError, imageFileError } from "@/lib/admin-validation";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDialog, FieldError, FileDropzone, FormSection } from "@/components/admin/AdminDialog";
import { confirmDelete } from "@/components/admin/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const SLUG = "clientele";

export const Route = createFileRoute("/admin/about/clientele")({
  ssr: false,
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  component: Page,
});

type ClientRow = { id: string; image_url: string | null; description: string; published: boolean; sort_order: number };

async function uploadImage(file: File, folder: string) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `about/${folder}/${crypto.randomUUID()}.${ext}`;
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

function Page() {
  const { staff } = Route.useRouteContext();
  return (
    <AdminShell staff={staff} active={{ kind: "about", section: SLUG }} crumbs={["About Us", "Clientele"]}>
      <div className="space-y-6">
        <ContentEditor />
        <ClientList />
      </div>
    </AdminShell>
  );
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

function ContentEditor() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-about", SLUG], queryFn: async () => {
    const { data, error } = await supabase.from("about_content").select("*").eq("slug", SLUG).maybeSingle();
    if (error) throw error;
    return data;
  } });
  const [f, setF] = useState({ eyebrow: "", title: "", subtitle: "", statement: "", banner_image_url: null as string | null, image_url: null as string | null });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setF({ eyebrow: data.eyebrow, title: data.title, subtitle: data.subtitle, statement: data.statement, banner_image_url: data.banner_image_url, image_url: data.image_url }); }, [data]);

  async function save() {
    const err = imageFileError(bannerFile, false) ?? imageFileError(imgFile, false);
    if (err) { toast.error(err); return; }
    if (!f.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const next = { ...f };
      if (bannerFile) next.banner_image_url = await uploadImage(bannerFile, "banner");
      if (imgFile) next.image_url = await uploadImage(imgFile, "section");
      const { error } = await supabase.from("about_content").upsert({ slug: SLUG, ...next });
      if (error) throw new Error(error.message);
      if (data?.banner_image_url && data.banner_image_url !== next.banner_image_url) await removeStored(data.banner_image_url);
      if (data?.image_url && data.image_url !== next.image_url) await removeStored(data.image_url);
      setBannerFile(null); setImgFile(null);
      toast.success("Saved — now live on the website");
      qc.invalidateQueries({ queryKey: ["admin-about", SLUG] });
      qc.invalidateQueries({ queryKey: ["about-data", SLUG] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); } finally { setSaving(false); }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Clientele page content</h2>
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
    </section>
  );
}

function Thumb({ url }: { url: string | null }) {
  const src = usePreview(url);
  return <div className="grid h-12 w-20 place-items-center overflow-hidden rounded border border-border bg-background">{src ? <img src={src} alt="" className="max-h-full max-w-full object-contain" /> : <span className="text-[10px] text-muted-foreground">No logo</span>}</div>;
}

function ClientList() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ClientRow | "new" | null>(null);
  const { data: rows = [] } = useQuery({ queryKey: ["admin-clientele"], queryFn: async () => {
    const { data, error } = await supabase.from("clientele").select("id,image_url,description,published,sort_order").order("sort_order");
    if (error) throw error;
    return data as ClientRow[];
  } });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-clientele"] }); qc.invalidateQueries({ queryKey: ["about-data", SLUG] }); };

  async function toggle(r: ClientRow) {
    const { error } = await supabase.from("clientele").update({ published: !r.published }).eq("id", r.id);
    if (error) toast.error(error.message); else refresh();
  }
  async function move(i: number, dir: -1 | 1) {
    const a = rows[i], b = rows[i + dir];
    if (!a || !b) return;
    const [r1, r2] = await Promise.all([
      supabase.from("clientele").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("clientele").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    if (r1.error || r2.error) toast.error("Could not reorder"); else refresh();
  }
  async function remove(r: ClientRow) {
    if (!(await confirmDelete(`Delete "${r.description || "this client"}"?`))) return;
    const { error } = await supabase.from("clientele").delete().eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    await removeStored(r.image_url);
    toast.success("Client deleted"); refresh();
  }

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 className="font-display text-xl font-bold">Our Clientele</h2>
          <p className="text-sm text-muted-foreground">{rows.length} clients · image required, description optional</p>
        </div>
        <Button onClick={() => setEditing("new")} className="neu-btn-gradient border-0"><Plus className="size-4" /> Add Client</Button>
      </div>
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Logo</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Live</th><th className="px-4 py-3 text-right">Actions</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className="border-t border-border">
              <td className="px-4 py-2">
                <div className="flex gap-1">
                  <button aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="rounded border border-border p-1 disabled:opacity-30"><ArrowUp className="size-3.5" /></button>
                  <button aria-label="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)} className="rounded border border-border p-1 disabled:opacity-30"><ArrowDown className="size-3.5" /></button>
                </div>
              </td>
              <td className="px-4 py-2"><Thumb url={r.image_url} /></td>
              <td className="px-4 py-2 font-medium">{r.description || <span className="text-muted-foreground">—</span>}</td>
              <td className="px-4 py-2"><Switch checked={r.published} onCheckedChange={() => toggle(r)} aria-label="Published" /></td>
              <td className="px-4 py-2">
                <div className="flex justify-end gap-2">
                  <button aria-label="Edit" onClick={() => setEditing(r)} className="btn-grad-edit grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Pencil className="size-4" /></button>
                  <button aria-label="Delete" onClick={() => remove(r)} className="btn-grad-danger grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Trash2 className="size-4" /></button>
                </div>
              </td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No clients yet.</td></tr>}
        </tbody>
      </table>
      {editing && <ClientDialog row={editing === "new" ? null : editing} nextOrder={(rows.at(-1)?.sort_order ?? 0) + 1} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
    </section>
  );
}

function ClientDialog({ row, nextOrder, onClose, onSaved }: { row: ClientRow | null; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState(row?.description ?? "");
  const [published, setPublished] = useState(row?.published ?? true);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const preview = usePreview(row?.image_url ?? null);

  async function save() {
    const e = clientImageError(file, row?.image_url ?? null);
    setErr(e);
    if (e) return;
    setSaving(true);
    try {
      const image_url = file ? await uploadImage(file, "clients") : row!.image_url;
      const payload = { image_url, description: description.trim(), published };
      const { error } = row
        ? await supabase.from("clientele").update(payload).eq("id", row.id)
        : await supabase.from("clientele").insert({ ...payload, sort_order: nextOrder });
      if (error) throw new Error(error.message);
      if (file && row?.image_url) await removeStored(row.image_url);
      toast.success(published ? "Saved — now live on the website" : "Saved as draft");
      onSaved();
    } catch (x) { toast.error(x instanceof Error ? x.message : "Save failed"); } finally { setSaving(false); }
  }

  return (
    <AdminDialog icon={Building2} title={row ? "Edit client" : "Add client"} subtitle="Shown in Our Clientele on the website" onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving} className="neu-btn-gradient border-0">{saving ? "Saving…" : row ? "Save changes" : "Add client"}</Button></>}>
      <FormSection title="Client logo">
        {preview && !file && <img src={preview} alt="" className="h-20 w-auto rounded border border-border bg-background object-contain p-2" />}
        <FileDropzone file={file} onFile={(f) => { setFile(f); setErr(null); }} accept="image/png,image/jpeg,image/webp,image/svg+xml" hint={`PNG, JPG, WebP or SVG, up to 5 MB${row?.image_url ? " — leave empty to keep current" : " — required"}`} />
        <FieldError msg={err ?? undefined} />
      </FormSection>
      <FormSection title="Details">
        <div><Label>Description <span className="text-muted-foreground">(optional)</span></Label><Textarea rows={2} maxLength={300} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. National Highways Authority of India (NHAI)" /></div>
        <label className="flex items-center gap-3 text-sm"><Switch checked={published} onCheckedChange={setPublished} /> Live on website</label>
      </FormSection>
    </AdminDialog>
  );
}
