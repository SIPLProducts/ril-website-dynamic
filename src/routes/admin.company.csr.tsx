import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Leaf, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getStaff } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDialog, FormSection } from "@/components/admin/AdminDialog";
import { confirmDelete } from "@/components/admin/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/company/csr")({
  ssr: false,
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  component: Page,
});

type Area = { id: string; title: string; body: string; published: boolean; sort_order: number };

function Page() {
  const { staff } = Route.useRouteContext();
  return (
    <AdminShell staff={staff} active={{ kind: "module", module: "company", section: "csr" }} crumbs={["Company", "CSR"]}>
      <div className="space-y-6">
        <ContentEditor />
        <AreaList />
      </div>
    </AdminShell>
  );
}

function ContentEditor() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-csr"], queryFn: async () => {
    const { data, error } = await supabase.from("csr_content").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    return data;
  } });
  const [f, setF] = useState({ eyebrow: "", title: "", subtitle: "", intro: "", cta_label: "", cta_url: "" });
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setF({ eyebrow: data.eyebrow, title: data.title, subtitle: data.subtitle, intro: data.intro, cta_label: data.cta_label, cta_url: data.cta_url }); }, [data]);

  async function save() {
    if (!f.title.trim()) { toast.error("Title is required"); return; }
    if (f.cta_url && !/^https?:\/\//i.test(f.cta_url.trim())) { toast.error("Button link must start with http:// or https://"); return; }
    setSaving(true);
    const { error } = await supabase.from("csr_content").upsert({ id: 1, ...f, cta_url: f.cta_url.trim() });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved — now live on the website");
    qc.invalidateQueries({ queryKey: ["admin-csr"] });
    qc.invalidateQueries({ queryKey: ["csr"] });
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Home page CSR card</h2>
          <p className="text-sm text-muted-foreground">The "Community Stewardship" card near the bottom of the home page.</p>
        </div>
        <Button onClick={save} disabled={saving} className="neu-btn-gradient border-0"><Save className="size-4" /> {saving ? "Saving…" : "Save"}</Button>
      </div>
      <FormSection title="Card text">
        <div className="grid gap-4 sm:grid-cols-3">
          <div><Label>Small heading</Label><Input value={f.eyebrow} maxLength={40} onChange={(e) => setF({ ...f, eyebrow: e.target.value })} /></div>
          <div><Label>Title</Label><Input value={f.title} maxLength={80} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
          <div><Label>Subtitle</Label><Input value={f.subtitle} maxLength={120} onChange={(e) => setF({ ...f, subtitle: e.target.value })} /></div>
        </div>
        <div><Label>Intro text</Label><Textarea rows={3} maxLength={800} value={f.intro} onChange={(e) => setF({ ...f, intro: e.target.value })} /></div>
      </FormSection>
      <FormSection title="Button (shown after Read more)">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Button label</Label><Input value={f.cta_label} maxLength={60} onChange={(e) => setF({ ...f, cta_label: e.target.value })} /></div>
          <div><Label>Button link</Label><Input value={f.cta_url} maxLength={500} placeholder="https://…" onChange={(e) => setF({ ...f, cta_url: e.target.value })} /></div>
        </div>
      </FormSection>
    </section>
  );
}

function AreaList() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Area | "new" | null>(null);
  const { data: rows = [] } = useQuery({ queryKey: ["admin-csr-areas"], queryFn: async () => {
    const { data, error } = await supabase.from("csr_areas").select("id,title,body,published,sort_order").order("sort_order");
    if (error) throw error;
    return data as Area[];
  } });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-csr-areas"] }); qc.invalidateQueries({ queryKey: ["csr"] }); };

  async function toggle(r: Area) {
    const { error } = await supabase.from("csr_areas").update({ published: !r.published }).eq("id", r.id);
    if (error) toast.error(error.message); else refresh();
  }
  async function move(i: number, dir: -1 | 1) {
    const a = rows[i], b = rows[i + dir];
    if (!a || !b) return;
    const [r1, r2] = await Promise.all([
      supabase.from("csr_areas").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("csr_areas").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    if (r1.error || r2.error) toast.error("Could not reorder"); else refresh();
  }
  async function remove(r: Area) {
    if (!(await confirmDelete(`Delete "${r.title}"?`))) return;
    const { error } = await supabase.from("csr_areas").delete().eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Focus area deleted"); refresh();
  }

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 className="font-display text-xl font-bold">Focus areas</h2>
          <p className="text-sm text-muted-foreground">{rows.length} items · shown when a visitor clicks "Read more"</p>
        </div>
        <Button onClick={() => setEditing("new")} className="neu-btn-gradient border-0"><Plus className="size-4" /> Add focus area</Button>
      </div>
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Title</th><th className="px-4 py-3">Text</th><th className="px-4 py-3">Live</th><th className="px-4 py-3 text-right">Actions</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className="border-t border-border align-top">
              <td className="px-4 py-2">
                <div className="flex gap-1">
                  <button aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="rounded border border-border p-1 disabled:opacity-30"><ArrowUp className="size-3.5" /></button>
                  <button aria-label="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)} className="rounded border border-border p-1 disabled:opacity-30"><ArrowDown className="size-3.5" /></button>
                </div>
              </td>
              <td className="px-4 py-2 font-medium">{r.title}</td>
              <td className="max-w-md px-4 py-2 text-muted-foreground"><span className="line-clamp-2">{r.body}</span></td>
              <td className="px-4 py-2"><Switch checked={r.published} onCheckedChange={() => toggle(r)} aria-label="Published" /></td>
              <td className="px-4 py-2">
                <div className="flex justify-end gap-2">
                  <button aria-label="Edit" onClick={() => setEditing(r)} className="btn-grad-edit grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Pencil className="size-4" /></button>
                  <button aria-label="Delete" onClick={() => remove(r)} className="btn-grad-danger grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Trash2 className="size-4" /></button>
                </div>
              </td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No focus areas yet.</td></tr>}
        </tbody>
      </table>
      {editing && <AreaDialog row={editing === "new" ? null : editing} nextOrder={(rows.at(-1)?.sort_order ?? 0) + 1} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
    </section>
  );
}

function AreaDialog({ row, nextOrder, onClose, onSaved }: { row: Area | null; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(row?.title ?? "");
  const [body, setBody] = useState(row?.body ?? "");
  const [published, setPublished] = useState(row?.published ?? true);
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    const payload = { title: title.trim(), body: body.trim(), published };
    const { error } = row
      ? await supabase.from("csr_areas").update(payload).eq("id", row.id)
      : await supabase.from("csr_areas").insert({ ...payload, sort_order: nextOrder });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(published ? "Saved — now live on the website" : "Saved as draft");
    onSaved();
  }
  return (
    <AdminDialog icon={Leaf} title={row ? "Edit focus area" : "Add focus area"} subtitle="Shown in the home page CSR card" onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving} className="neu-btn-gradient border-0">{saving ? "Saving…" : row ? "Save changes" : "Add focus area"}</Button></>}>
      <FormSection title="Details">
        <div><Label>Title</Label><Input value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} /></div>
        <div><Label>Text</Label><Textarea rows={4} maxLength={800} value={body} onChange={(e) => setBody(e.target.value)} /></div>
        <label className="flex items-center gap-3 text-sm"><Switch checked={published} onCheckedChange={setPublished} /> Live on website</label>
      </FormSection>
    </AdminDialog>
  );
}
