import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Landmark, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getStaff } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDialog, FileDropzone, FormSection } from "@/components/admin/AdminDialog";
import { confirmDelete } from "@/components/admin/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { refreshHome, removeHomeFile, uploadHomeFile, useHomePreview } from "@/lib/home-highlights-admin";

export const Route = createFileRoute("/admin/capabilities/landmarks")({
  ssr: false,
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  head: () => ({ meta: [{ title: "Landmark Projects — Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

type Slide = { id: string; name: string; detail: string; image_url: string | null; fit: string; published: boolean; sort_order: number };

function Page() {
  const { staff } = Route.useRouteContext();
  return (
    <AdminShell staff={staff} active={{ kind: "module", module: "capabilities", section: "landmarks" }} crumbs={["Capabilities", "Landmark Projects"]}>
      <div className="space-y-6">
        <HeadingEditor />
        <SlideList />
      </div>
    </AdminShell>
  );
}

function HeadingEditor() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-cap-settings"], queryFn: async () => {
    const { data, error } = await supabase.from("capabilities_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    return data;
  } });
  const [f, setF] = useState({ landmark_eyebrow: "", landmark_title: "" });
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setF({ landmark_eyebrow: data.landmark_eyebrow, landmark_title: data.landmark_title }); }, [data]);
  async function save() {
    if (!f.landmark_title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    const { error } = await supabase.from("capabilities_settings").update({ landmark_eyebrow: f.landmark_eyebrow.trim(), landmark_title: f.landmark_title.trim() }).eq("id", 1);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved — now live on the website"); refreshHome(qc);
  }
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Section heading</h2>
          <p className="text-sm text-muted-foreground">The heading above the big project slideshow on the home page.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><a href="/#projects" target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> View on website</a></Button>
          <Button onClick={save} disabled={saving} className="neu-btn-gradient border-0"><Save className="size-4" /> {saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label>Small heading</Label><Input maxLength={60} value={f.landmark_eyebrow} onChange={(e) => setF({ ...f, landmark_eyebrow: e.target.value })} placeholder="Projects that shape places" /></div>
        <div><Label>Title *</Label><Input maxLength={100} value={f.landmark_title} onChange={(e) => setF({ ...f, landmark_title: e.target.value })} placeholder="Landmark Engineering" /></div>
      </div>
    </section>
  );
}

function Thumb({ url }: { url: string | null }) {
  const src = useHomePreview(url);
  return src ? <img src={src} alt="" className="h-12 w-20 rounded border border-border object-cover" /> : <div className="grid h-12 w-20 place-items-center rounded border border-dashed border-border text-[10px] text-muted-foreground">No photo</div>;
}

function SlideList() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Slide | "new" | null>(null);
  const { data: rows = [] } = useQuery({ queryKey: ["admin-landmarks"], queryFn: async () => {
    const { data, error } = await supabase.from("landmark_projects").select("*").order("sort_order");
    if (error) throw error;
    return data as Slide[];
  } });
  const refresh = () => refreshHome(qc);
  async function toggle(r: Slide) {
    const { error } = await supabase.from("landmark_projects").update({ published: !r.published }).eq("id", r.id);
    if (error) toast.error(error.message); else refresh();
  }
  async function move(i: number, dir: -1 | 1) {
    const a = rows[i], b = rows[i + dir];
    if (!a || !b) return;
    const [r1, r2] = await Promise.all([
      supabase.from("landmark_projects").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("landmark_projects").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    if (r1.error || r2.error) toast.error((r1.error ?? r2.error)!.message); else refresh();
  }
  async function remove(r: Slide) {
    if (!(await confirmDelete(`Delete "${r.name}"?`))) return;
    const { error } = await supabase.from("landmark_projects").delete().eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    await removeHomeFile(r.image_url);
    toast.success("Slide deleted"); refresh();
  }
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 className="font-display text-xl font-bold">Slides</h2>
          <p className="text-sm text-muted-foreground">{rows.length} slides · the slideshow moves to the next one every 6 seconds</p>
        </div>
        <Button onClick={() => setEditing("new")} className="neu-btn-gradient border-0"><Plus className="size-4" /> Add slide</Button>
      </div>
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Photo</th><th className="px-4 py-3">Project</th><th className="px-4 py-3">Photo fit</th><th className="px-4 py-3">Live</th><th className="px-4 py-3 text-right">Actions</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className="border-t border-border align-middle">
              <td className="px-4 py-2">
                <div className="flex gap-1">
                  <button aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="rounded border border-border p-1 disabled:opacity-30"><ArrowUp className="size-3.5" /></button>
                  <button aria-label="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)} className="rounded border border-border p-1 disabled:opacity-30"><ArrowDown className="size-3.5" /></button>
                </div>
              </td>
              <td className="px-4 py-2"><Thumb url={r.image_url} /></td>
              <td className="px-4 py-2"><p className="font-medium">{r.name}</p><p className="line-clamp-1 text-xs text-muted-foreground">{r.detail}</p></td>
              <td className="px-4 py-2 text-muted-foreground">{r.fit === "contain" ? "Show whole photo" : "Fill"}</td>
              <td className="px-4 py-2"><Switch checked={r.published} onCheckedChange={() => toggle(r)} aria-label="Live" /></td>
              <td className="px-4 py-2">
                <div className="flex justify-end gap-2">
                  <button aria-label="Edit" onClick={() => setEditing(r)} className="btn-grad-edit grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Pencil className="size-4" /></button>
                  <button aria-label="Delete" onClick={() => remove(r)} className="btn-grad-danger grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Trash2 className="size-4" /></button>
                </div>
              </td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No slides yet. Click "Add slide".</td></tr>}
        </tbody>
      </table>
      {editing && <SlideDialog row={editing === "new" ? null : editing} nextOrder={(rows.at(-1)?.sort_order ?? 0) + 1} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
    </section>
  );
}

function SlideDialog({ row, nextOrder, onClose, onSaved }: { row: Slide | null; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ name: row?.name ?? "", detail: row?.detail ?? "", fit: row?.fit ?? "cover", published: row?.published ?? true });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const current = useHomePreview(row?.image_url);
  async function save() {
    if (!f.name.trim()) { toast.error("Project name is required"); return; }
    if (!file && !row?.image_url) { toast.error("Please upload a photo"); return; }
    setSaving(true);
    try {
      let image_url = row?.image_url ?? null;
      if (file) image_url = await uploadHomeFile("landmarks", file);
      const payload = { name: f.name.trim(), detail: f.detail.trim(), fit: f.fit, published: f.published, image_url };
      const { error } = row
        ? await supabase.from("landmark_projects").update(payload).eq("id", row.id)
        : await supabase.from("landmark_projects").insert({ ...payload, sort_order: nextOrder });
      if (error) throw new Error(error.message);
      if (file && row?.image_url) await removeHomeFile(row.image_url);
      toast.success(f.published ? "Saved — now live on the website" : "Saved as hidden");
      onSaved();
    } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
  }
  return (
    <AdminDialog icon={Landmark} wide title={row ? "Edit slide" : "Add slide"} subtitle="A slide in the Landmark Engineering slideshow" onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving} className="neu-btn-gradient border-0">{saving ? "Saving…" : row ? "Save changes" : "Add slide"}</Button></>}>
      <FormSection title="Slide details">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Project name *</Label><Input value={f.name} maxLength={160} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div>
            <Label>Photo fit</Label>
            <select value={f.fit} onChange={(e) => setF({ ...f, fit: e.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="cover">Fill (crops edges)</option>
              <option value="contain">Show whole photo (no cropping)</option>
            </select>
          </div>
        </div>
        <div><Label>Description</Label><Textarea rows={4} maxLength={800} value={f.detail} onChange={(e) => setF({ ...f, detail: e.target.value })} /></div>
        <label className="flex items-center gap-3 text-sm"><Switch checked={f.published} onCheckedChange={(v) => setF({ ...f, published: v })} /> Live on website</label>
      </FormSection>
      <FormSection title={row ? "Photo (upload a new one to replace)" : "Photo *"}>
        {current && !file && <img src={current} alt="Current" className="h-24 max-w-[260px] rounded border border-border object-cover" />}
        <FileDropzone file={file} onFile={setFile} accept="image/png,image/jpeg,image/webp" hint="Wide landscape photo (about 21:9) looks best" />
      </FormSection>
    </AdminDialog>
  );
}
