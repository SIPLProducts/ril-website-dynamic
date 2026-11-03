import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, ListChecks, Pencil, Plus, Save, Trash2, Wrench } from "lucide-react";
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
import { CAPABILITY_ICONS, iconFor, imageFor } from "@/lib/capability-defaults";
import { fetchVerticals, refreshCapabilities, removeStored, slugify, uploadCapabilityImage, useStoredPreview, type VerticalRow } from "@/lib/capabilities-admin";

export const Route = createFileRoute("/admin/capabilities/")({
  ssr: false,
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  head: () => ({ meta: [{ title: "Capability Cards — Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const { staff } = Route.useRouteContext();
  return (
    <AdminShell staff={staff} active={{ kind: "module", module: "capabilities", section: "cards" }} crumbs={["Capabilities", "Capability Cards"]}>
      <div className="space-y-6">
        <HeadingEditor />
        <VerticalList />
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
  const [f, setF] = useState({ eyebrow: "", title: "", intro: "" });
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setF({ eyebrow: data.eyebrow, title: data.title, intro: data.intro }); }, [data]);
  async function save() {
    if (!f.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    const { error } = await supabase.from("capabilities_settings").upsert({ id: 1, eyebrow: f.eyebrow.trim(), title: f.title.trim(), intro: f.intro.trim() });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved — now live on the website"); refreshCapabilities(qc);
  }
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Section heading</h2>
          <p className="text-sm text-muted-foreground">The heading above the capability cards on the home page.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><a href="/#businesses" target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> View on website</a></Button>
          <Button onClick={save} disabled={saving} className="neu-btn-gradient border-0"><Save className="size-4" /> {saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><Label>Small heading</Label><Input maxLength={40} value={f.eyebrow} onChange={(e) => setF({ ...f, eyebrow: e.target.value })} placeholder="Capabilities" /></div>
        <div><Label>Title *</Label><Input maxLength={100} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Multi-Disciplinary Spectrum" /></div>
        <div><Label>Intro line</Label><Input maxLength={200} value={f.intro} onChange={(e) => setF({ ...f, intro: e.target.value })} /></div>
      </div>
    </section>
  );
}

function Thumb({ row }: { row: VerticalRow }) {
  const uploaded = useStoredPreview(row.image_url);
  const src = imageFor(row.slug, row.image_url ? uploaded : null);
  return src ? <img src={src} alt="" className="h-12 w-20 rounded border border-border object-cover" /> : <div className="grid h-12 w-20 place-items-center rounded border border-dashed border-border text-[10px] text-muted-foreground">No image</div>;
}

function VerticalList() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<VerticalRow | "new" | null>(null);
  const { data: rows = [] } = useQuery({ queryKey: ["admin-verticals"], queryFn: fetchVerticals });
  const { data: counts = {} } = useQuery({ queryKey: ["admin-projects", "counts"], queryFn: async () => {
    const { data, error } = await supabase.from("business_projects").select("vertical_slug");
    if (error) throw error;
    const m: Record<string, number> = {};
    for (const r of data) m[r.vertical_slug] = (m[r.vertical_slug] ?? 0) + 1;
    return m;
  } });
  const refresh = () => refreshCapabilities(qc);
  async function toggle(r: VerticalRow) {
    const { error } = await supabase.from("business_verticals").update({ published: !r.published }).eq("slug", r.slug);
    if (error) toast.error(error.message); else refresh();
  }
  async function move(i: number, dir: -1 | 1) {
    const a = rows[i], b = rows[i + dir];
    if (!a || !b) return;
    const [r1, r2] = await Promise.all([
      supabase.from("business_verticals").update({ sort_order: b.sort_order }).eq("slug", a.slug),
      supabase.from("business_verticals").update({ sort_order: a.sort_order }).eq("slug", b.slug),
    ]);
    if (r1.error || r2.error) toast.error((r1.error ?? r2.error)!.message); else refresh();
  }
  async function remove(r: VerticalRow) {
    const n = counts[r.slug] ?? 0;
    if (!(await confirmDelete(`Delete "${r.title}"?`, n ? `This also deletes its ${n} projects. This cannot be undone.` : "This cannot be undone."))) return;
    const { error } = await supabase.from("business_verticals").delete().eq("slug", r.slug);
    if (error) { toast.error(error.message); return; }
    await removeStored(r.image_url);
    toast.success("Capability deleted"); refresh();
  }
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 className="font-display text-xl font-bold">Capability cards</h2>
          <p className="text-sm text-muted-foreground">{rows.length} capabilities · each card opens its own projects page on the website</p>
        </div>
        <Button onClick={() => setEditing("new")} className="neu-btn-gradient border-0"><Plus className="size-4" /> Add capability</Button>
      </div>
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Image</th><th className="px-4 py-3">Capability</th><th className="px-4 py-3">Projects</th><th className="px-4 py-3">Live</th><th className="px-4 py-3 text-right">Actions</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const Icon = iconFor(r.icon);
            return (
            <tr key={r.slug} className="border-t border-border align-middle">
              <td className="px-4 py-2">
                <div className="flex gap-1">
                  <button aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="rounded border border-border p-1 disabled:opacity-30"><ArrowUp className="size-3.5" /></button>
                  <button aria-label="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)} className="rounded border border-border p-1 disabled:opacity-30"><ArrowDown className="size-3.5" /></button>
                </div>
              </td>
              <td className="px-4 py-2"><Thumb row={r} /></td>
              <td className="px-4 py-2">
                <p className="flex items-center gap-2 font-medium"><Icon className="size-4 text-brand-blue" />{r.title}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{r.card_text}</p>
              </td>
              <td className="px-4 py-2">
                <Link to="/admin/capabilities/projects" search={{ v: r.slug }} className="inline-flex items-center gap-1.5 text-brand-orange hover:underline"><ListChecks className="size-4" />{counts[r.slug] ?? 0} projects</Link>
              </td>
              <td className="px-4 py-2"><Switch checked={r.published} onCheckedChange={() => toggle(r)} aria-label="Live" /></td>
              <td className="px-4 py-2">
                <div className="flex justify-end gap-2">
                  <button aria-label="Edit" onClick={() => setEditing(r)} className="btn-grad-edit grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Pencil className="size-4" /></button>
                  <button aria-label="Delete" onClick={() => remove(r)} className="btn-grad-danger grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Trash2 className="size-4" /></button>
                </div>
              </td>
            </tr>
            );
          })}
          {!rows.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No capabilities yet. Click "Add capability".</td></tr>}
        </tbody>
      </table>
      {editing && <VerticalDialog row={editing === "new" ? null : editing} existing={rows.map((r) => r.slug)} nextOrder={(rows.at(-1)?.sort_order ?? 0) + 1} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
    </section>
  );
}

function VerticalDialog({ row, existing, nextOrder, onClose, onSaved }: { row: VerticalRow | null; existing: string[]; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    title: row?.title ?? "", slug: row?.slug ?? "", card_text: row?.card_text ?? "", description: row?.description ?? "",
    icon: row?.icon ?? "building", image_alt: row?.image_alt ?? "", published: row?.published ?? true,
  });
  const [slugTouched, setSlugTouched] = useState(!!row);
  const [file, setFile] = useState<File | null>(null);
  const [clearImage, setClearImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const uploaded = useStoredPreview(row?.image_url ?? null);
  const current = row ? imageFor(row.slug, row.image_url ? uploaded : null) : null;
  const slug = slugTouched ? slugify(f.slug) : slugify(f.title);
  async function save() {
    if (!f.title.trim()) { toast.error("Title is required"); return; }
    if (!slug) { toast.error("Page link is required"); return; }
    if (slug !== row?.slug && existing.includes(slug)) { toast.error("Another capability already uses this page link"); return; }
    if (!f.card_text.trim()) { toast.error("Card text is required"); return; }
    if (!row && !file) { toast.error("Please upload a card image"); return; }
    setSaving(true);
    try {
      let image_url = clearImage ? null : row?.image_url ?? null;
      if (file) image_url = await uploadCapabilityImage(file);
      const payload = { slug, title: f.title.trim(), card_text: f.card_text.trim(), description: f.description.trim(), icon: f.icon, image_alt: f.image_alt.trim(), published: f.published, image_url };
      const { error } = row
        ? await supabase.from("business_verticals").update(payload).eq("slug", row.slug)
        : await supabase.from("business_verticals").insert({ ...payload, sort_order: nextOrder });
      if (error) throw new Error(error.message);
      if ((file || clearImage) && row?.image_url) await removeStored(row.image_url);
      toast.success(f.published ? "Saved — now live on the website" : "Saved as hidden");
      onSaved();
    } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
  }
  return (
    <AdminDialog icon={Wrench} wide title={row ? "Edit capability" : "Add capability"} subtitle="A card on the home page and its own projects page" onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving} className="neu-btn-gradient border-0">{saving ? "Saving…" : row ? "Save changes" : "Add capability"}</Button></>}>
      <FormSection title="Card details">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Title *</Label><Input value={f.title} maxLength={80} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Water & Wastewater" /></div>
          <div>
            <Label>Page link *</Label>
            <Input value={slug} maxLength={60} onChange={(e) => { setSlugTouched(true); setF({ ...f, slug: e.target.value }); }} />
            <p className="mt-1 text-xs text-muted-foreground">Website address: /businesses/{slug || "…"}</p>
          </div>
          <div>
            <Label>Icon</Label>
            <select value={f.icon} onChange={(e) => setF({ ...f, icon: e.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {Object.entries(CAPABILITY_ICONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-3 self-end pb-2 text-sm"><Switch checked={f.published} onCheckedChange={(v) => setF({ ...f, published: v })} /> Live on website</label>
        </div>
        <div><Label>Card text (home page) *</Label><Textarea rows={2} maxLength={300} value={f.card_text} onChange={(e) => setF({ ...f, card_text: e.target.value })} /></div>
        <div><Label>Projects page description</Label><Textarea rows={2} maxLength={400} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Shown under the title on the projects page" /></div>
      </FormSection>
      <FormSection title={row ? "Card image (upload a new one to replace)" : "Card image *"}>
        {current && !file && !clearImage && (
          <div className="flex items-center gap-3">
            <img src={current} alt="Current" className="h-20 w-32 rounded border border-border object-cover" />
            {row?.image_url && <Button type="button" variant="outline" size="sm" onClick={() => setClearImage(true)}>Use default photo</Button>}
          </div>
        )}
        <FileDropzone file={file} onFile={(x) => { setFile(x); if (x) setClearImage(false); }} accept="image/png,image/jpeg,image/webp" hint="JPG, PNG or WEBP — landscape photos look best" />
        <div><Label>Image description (for accessibility)</Label><Input value={f.image_alt} maxLength={160} onChange={(e) => setF({ ...f, image_alt: e.target.value })} /></div>
      </FormSection>
    </AdminDialog>
  );
}
