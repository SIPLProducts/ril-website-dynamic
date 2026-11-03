import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, BarChart3, ExternalLink, Pencil, Plus, Save, Trash2, X } from "lucide-react";
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

export const Route = createFileRoute("/admin/capabilities/sustainability")({
  ssr: false,
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  head: () => ({ meta: [{ title: "Sustainability Highlight — Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

type Stat = { id: string; value: string; label: string; note: string; published: boolean; sort_order: number };
const MAX_VIDEO = 20 * 1024 * 1024;

function Page() {
  const { staff } = Route.useRouteContext();
  return (
    <AdminShell staff={staff} active={{ kind: "module", module: "capabilities", section: "sustainability" }} crumbs={["Capabilities", "Sustainability Highlight"]}>
      <div className="space-y-6">
        <ContentEditor />
        <StatList />
      </div>
    </AdminShell>
  );
}

function ContentEditor() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-home-sus"], queryFn: async () => {
    const { data, error } = await supabase.from("home_sustainability").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    return data;
  } });
  const [f, setF] = useState({ eyebrow: "", title: "", body: "" });
  const [side, setSide] = useState<{ v: string; l: string }[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [poster, setPoster] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const videoSrc = useHomePreview(data?.video_url);
  const posterSrc = useHomePreview(data?.poster_url);
  useEffect(() => {
    if (!data) return;
    setF({ eyebrow: data.eyebrow, title: data.title, body: data.body });
    setSide(Array.isArray(data.side_stats) ? (data.side_stats as { v: string; l: string }[]) : []);
  }, [data]);
  async function save() {
    if (!f.title.trim()) { toast.error("Main heading is required"); return; }
    if (video && video.size > MAX_VIDEO) { toast.error("Video must be 20 MB or smaller"); return; }
    setSaving(true);
    try {
      let video_url = data?.video_url ?? null, poster_url = data?.poster_url ?? null;
      if (video) video_url = await uploadHomeFile("sustainability", video);
      if (poster) poster_url = await uploadHomeFile("sustainability", poster);
      const side_stats = side.map((x) => ({ v: x.v.trim(), l: x.l.trim() })).filter((x) => x.v);
      const { error } = await supabase.from("home_sustainability").upsert({ id: 1, eyebrow: f.eyebrow.trim(), title: f.title.trim(), body: f.body.trim(), side_stats, video_url, poster_url });
      if (error) throw new Error(error.message);
      if (video) await removeHomeFile(data?.video_url);
      if (poster) await removeHomeFile(data?.poster_url);
      setVideo(null); setPoster(null);
      toast.success("Saved — now live on the website"); refreshHome(qc);
    } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
  }
  async function useDefaultVideo() {
    const { error } = await supabase.from("home_sustainability").update({ video_url: "asset:hummingbird", poster_url: "asset:hummingbird-poster" }).eq("id", 1);
    if (error) { toast.error(error.message); return; }
    await removeHomeFile(data?.video_url); await removeHomeFile(data?.poster_url);
    toast.success("Original hummingbird video restored"); refreshHome(qc);
  }
  const custom = !!data?.video_url && !data.video_url.startsWith("asset:");
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Text &amp; video</h2>
          <p className="text-sm text-muted-foreground">The green Sustainability block with the video on the home page.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><a href="/#sustainability" target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> View on website</a></Button>
          <Button onClick={save} disabled={saving} className="neu-btn-gradient border-0"><Save className="size-4" /> {saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div><Label>Small heading</Label><Input maxLength={40} value={f.eyebrow} onChange={(e) => setF({ ...f, eyebrow: e.target.value })} /></div>
          <div><Label>Main heading *</Label><Input maxLength={160} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
          <div><Label>Paragraph</Label><Textarea rows={4} maxLength={800} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></div>
          <div>
            <div className="mb-2 flex items-center justify-between"><Label>Small figures beside the text</Label>
              <Button type="button" size="sm" variant="outline" onClick={() => setSide([...side, { v: "", l: "" }])}><Plus className="size-3.5" /> Add figure</Button></div>
            <div className="space-y-2">
              {side.map((x, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="Value e.g. ISO 14001" value={x.v} maxLength={30} onChange={(e) => setSide(side.map((y, k) => k === i ? { ...y, v: e.target.value } : y))} />
                  <Input placeholder="Label" value={x.l} maxLength={60} onChange={(e) => setSide(side.map((y, k) => k === i ? { ...y, l: e.target.value } : y))} />
                  <button aria-label="Remove" onClick={() => setSide(side.filter((_, k) => k !== i))} className="btn-grad-danger grid size-10 shrink-0 place-items-center rounded-md"><X className="size-4" /></button>
                </div>
              ))}
              {!side.length && <p className="text-xs text-muted-foreground">No figures. They are hidden on the website.</p>}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Current video</Label>
            {videoSrc ? <video src={videoSrc} poster={posterSrc ?? undefined} muted loop autoPlay playsInline className="mt-1 aspect-video w-full rounded border border-border object-cover" /> : <p className="text-sm text-muted-foreground">No video</p>}
            {custom && <Button type="button" size="sm" variant="outline" className="mt-2" onClick={useDefaultVideo}>Use original hummingbird video</Button>}
          </div>
          <div><Label>Upload new video (MP4, max 20 MB)</Label><FileDropzone file={video} onFile={setVideo} accept="video/mp4,video/webm" hint="Short, silent loop works best — it plays muted" /></div>
          <div><Label>Cover picture (optional, shown while the video loads)</Label><FileDropzone file={poster} onFile={setPoster} accept="image/png,image/jpeg,image/webp" /></div>
        </div>
      </div>
    </section>
  );
}

function StatList() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Stat | "new" | null>(null);
  const { data: rows = [] } = useQuery({ queryKey: ["admin-home-sus-stats"], queryFn: async () => {
    const { data, error } = await supabase.from("home_sustainability_stats").select("*").order("sort_order");
    if (error) throw error;
    return data as Stat[];
  } });
  const refresh = () => refreshHome(qc);
  async function toggle(r: Stat) {
    const { error } = await supabase.from("home_sustainability_stats").update({ published: !r.published }).eq("id", r.id);
    if (error) toast.error(error.message); else refresh();
  }
  async function move(i: number, dir: -1 | 1) {
    const a = rows[i], b = rows[i + dir];
    if (!a || !b) return;
    const [r1, r2] = await Promise.all([
      supabase.from("home_sustainability_stats").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("home_sustainability_stats").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    if (r1.error || r2.error) toast.error((r1.error ?? r2.error)!.message); else refresh();
  }
  async function remove(r: Stat) {
    if (!(await confirmDelete(`Delete "${r.value} — ${r.label}"?`))) return;
    const { error } = await supabase.from("home_sustainability_stats").delete().eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Figure deleted"); refresh();
  }
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 className="font-display text-xl font-bold">Bottom figures row</h2>
          <p className="text-sm text-muted-foreground">{rows.length} figures · shown 6 per row on large screens</p>
        </div>
        <Button onClick={() => setEditing("new")} className="neu-btn-gradient border-0"><Plus className="size-4" /> Add figure</Button>
      </div>
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">Label</th><th className="px-4 py-3">Note</th><th className="px-4 py-3">Live</th><th className="px-4 py-3 text-right">Actions</th></tr>
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
              <td className="px-4 py-2 font-semibold">{r.value}</td>
              <td className="px-4 py-2">{r.label}</td>
              <td className="px-4 py-2 text-xs text-muted-foreground">{r.note}</td>
              <td className="px-4 py-2"><Switch checked={r.published} onCheckedChange={() => toggle(r)} aria-label="Live" /></td>
              <td className="px-4 py-2">
                <div className="flex justify-end gap-2">
                  <button aria-label="Edit" onClick={() => setEditing(r)} className="btn-grad-edit grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Pencil className="size-4" /></button>
                  <button aria-label="Delete" onClick={() => remove(r)} className="btn-grad-danger grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Trash2 className="size-4" /></button>
                </div>
              </td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No figures yet. Click "Add figure".</td></tr>}
        </tbody>
      </table>
      {editing && <StatDialog row={editing === "new" ? null : editing} nextOrder={(rows.at(-1)?.sort_order ?? 0) + 1} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
    </section>
  );
}

function StatDialog({ row, nextOrder, onClose, onSaved }: { row: Stat | null; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ value: row?.value ?? "", label: row?.label ?? "", note: row?.note ?? "", published: row?.published ?? true });
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!f.value.trim()) { toast.error("Value is required"); return; }
    if (!f.label.trim()) { toast.error("Label is required"); return; }
    setSaving(true);
    const payload = { value: f.value.trim(), label: f.label.trim(), note: f.note.trim(), published: f.published };
    const { error } = row
      ? await supabase.from("home_sustainability_stats").update(payload).eq("id", row.id)
      : await supabase.from("home_sustainability_stats").insert({ ...payload, sort_order: nextOrder });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(f.published ? "Saved — now live on the website" : "Saved as hidden");
    onSaved();
  }
  return (
    <AdminDialog icon={BarChart3} wide title={row ? "Edit figure" : "Add figure"} subtitle="Home page Sustainability figures row" onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving} className="neu-btn-gradient border-0">{saving ? "Saving…" : row ? "Save changes" : "Add figure"}</Button></>}>
      <FormSection title="Figure">
        <div className="grid gap-4 sm:grid-cols-3">
          <div><Label>Value *</Label><Input value={f.value} maxLength={30} onChange={(e) => setF({ ...f, value: e.target.value })} placeholder="e.g. 22% Reduction" /></div>
          <div className="sm:col-span-2"><Label>Label *</Label><Input value={f.label} maxLength={80} onChange={(e) => setF({ ...f, label: e.target.value })} placeholder="e.g. Energy Consumption" /></div>
        </div>
        <div><Label>Short note</Label><Textarea rows={2} maxLength={200} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></div>
        <label className="flex items-center gap-3 text-sm"><Switch checked={f.published} onCheckedChange={(v) => setF({ ...f, published: v })} /> Live on website</label>
      </FormSection>
    </AdminDialog>
  );
}
