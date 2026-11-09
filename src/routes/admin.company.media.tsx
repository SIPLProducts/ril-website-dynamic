import { safeRandomUUID } from "@/lib/uuid";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Newspaper, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getStaff } from "@/lib/admin-auth";
import { IR_BUCKET, STORAGE_PREFIX } from "@/lib/investor-relations";
import { MEDIA_TYPES } from "@/lib/media";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDialog, FileDropzone, FormSection } from "@/components/admin/AdminDialog";
import { confirmDelete } from "@/components/admin/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/company/media")({
  ssr: false,
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  component: Page,
});

type Row = {
  id: string; item_type: string; item_date: string | null; kicker: string | null; title: string; summary: string | null;
  paragraphs: unknown; source: string | null; document_url: string | null; external_url: string | null; link_label: string | null;
  published: boolean; sort_order: number;
};

const today = () => new Date().toISOString().slice(0, 10);
const refreshKeys = (qc: ReturnType<typeof useQueryClient>) => { qc.invalidateQueries({ queryKey: ["admin-media"] }); qc.invalidateQueries({ queryKey: ["media"] }); };
async function removeStored(url: string | null) {
  if (url?.startsWith(STORAGE_PREFIX)) await supabase.storage.from(IR_BUCKET).remove([url.slice(STORAGE_PREFIX.length)]);
}

function Page() {
  const { staff } = Route.useRouteContext();
  return (
    <AdminShell staff={staff} active={{ kind: "module", module: "company", section: "media" }} crumbs={["Company", "Media"]}>
      <div className="space-y-6">
        <PageEditor />
        <ItemList />
      </div>
    </AdminShell>
  );
}

function PageEditor() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-media-page"], queryFn: async () => {
    const { data, error } = await supabase.from("media_page").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    return data;
  } });
  const [f, setF] = useState({ eyebrow: "", title: "", intro: "", card_title: "", card_subtitle: "", card_text: "" });
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setF({ eyebrow: data.eyebrow, title: data.title, intro: data.intro, card_title: data.card_title, card_subtitle: data.card_subtitle, card_text: data.card_text }); }, [data]);
  async function save() {
    if (!f.title.trim()) { toast.error("Page title is required"); return; }
    setSaving(true);
    const { error } = await supabase.from("media_page").upsert({ id: 1, ...f });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved — now live on the website");
    qc.invalidateQueries({ queryKey: ["admin-media-page"] }); qc.invalidateQueries({ queryKey: ["media"] });
  }
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Media page &amp; home card</h2>
          <p className="text-sm text-muted-foreground">Top of the Media page and the Media card on the home page.</p>
        </div>
        <Button onClick={save} disabled={saving} className="neu-btn-gradient border-0"><Save className="size-4" /> {saving ? "Saving…" : "Save"}</Button>
      </div>
      <FormSection title="Media page banner">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Small heading</Label><Input value={f.eyebrow} maxLength={60} onChange={(e) => setF({ ...f, eyebrow: e.target.value })} /></div>
          <div><Label>Page title</Label><Input value={f.title} maxLength={100} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
        </div>
        <div><Label>Intro text</Label><Textarea rows={2} maxLength={400} value={f.intro} onChange={(e) => setF({ ...f, intro: e.target.value })} /></div>
      </FormSection>
      <FormSection title="Home page Media card">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Card title</Label><Input value={f.card_title} maxLength={60} onChange={(e) => setF({ ...f, card_title: e.target.value })} /></div>
          <div><Label>Card subtitle</Label><Input value={f.card_subtitle} maxLength={120} onChange={(e) => setF({ ...f, card_subtitle: e.target.value })} /></div>
        </div>
        <div><Label>Card text</Label><Textarea rows={2} maxLength={400} value={f.card_text} onChange={(e) => setF({ ...f, card_text: e.target.value })} /></div>
      </FormSection>
    </section>
  );
}

function ItemList() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const { data: rows = [] } = useQuery({ queryKey: ["admin-media"], queryFn: async () => {
    const { data, error } = await supabase.from("media_items").select("*").order("sort_order");
    if (error) throw error;
    return data as Row[];
  } });
  async function toggle(r: Row) {
    const { error } = await supabase.from("media_items").update({ published: !r.published }).eq("id", r.id);
    if (error) toast.error(error.message); else refreshKeys(qc);
  }
  async function move(i: number, dir: -1 | 1) {
    const a = rows[i], b = rows[i + dir];
    if (!a || !b) return;
    const [r1, r2] = await Promise.all([
      supabase.from("media_items").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("media_items").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    if (r1.error || r2.error) toast.error("Could not reorder"); else refreshKeys(qc);
  }
  async function remove(r: Row) {
    if (!(await confirmDelete(`Delete "${r.title}"?`))) return;
    const { error } = await supabase.from("media_items").delete().eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    await removeStored(r.document_url);
    toast.success("Item deleted"); refreshKeys(qc);
  }
  const firstOrder = (rows[0]?.sort_order ?? 1) - 1;

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 className="font-display text-xl font-bold">Press releases &amp; media items</h2>
          <p className="text-sm text-muted-foreground">{rows.length} items · shown on the website in this order (new items go on top)</p>
        </div>
        <Button onClick={() => setEditing("new")} className="neu-btn-gradient border-0"><Plus className="size-4" /> Add item</Button>
      </div>
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Title</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Live</th><th className="px-4 py-3 text-right">Actions</th></tr>
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
              <td className="whitespace-nowrap px-4 py-2 text-muted-foreground">{r.item_date ? new Date(r.item_date).toLocaleDateString("en-GB") : "—"}</td>
              <td className="whitespace-nowrap px-4 py-2">{r.item_type}</td>
              <td className="max-w-md px-4 py-2 font-medium">{r.title}</td>
              <td className="px-4 py-2 text-muted-foreground">{r.source || "—"}</td>
              <td className="px-4 py-2"><Switch checked={r.published} onCheckedChange={() => toggle(r)} aria-label="Published" /></td>
              <td className="px-4 py-2">
                <div className="flex justify-end gap-2">
                  <button aria-label="Edit" onClick={() => setEditing(r)} className="btn-grad-edit grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Pencil className="size-4" /></button>
                  <button aria-label="Delete" onClick={() => remove(r)} className="btn-grad-danger grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Trash2 className="size-4" /></button>
                </div>
              </td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No media items yet.</td></tr>}
        </tbody>
      </table>
      {editing && <ItemDialog row={editing === "new" ? null : editing} newOrder={firstOrder} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refreshKeys(qc); }} />}
    </section>
  );
}

function ItemDialog({ row, newOrder, onClose, onSaved }: { row: Row | null; newOrder: number; onClose: () => void; onSaved: () => void }) {
  const paras = Array.isArray(row?.paragraphs) ? (row!.paragraphs as string[]).join("\n\n") : "";
  const [f, setF] = useState({
    item_type: row?.item_type ?? "Press Release", item_date: row?.item_date ?? "", kicker: row?.kicker ?? "", title: row?.title ?? "",
    summary: row?.summary ?? "", body: paras, source: row?.source ?? "", external_url: row?.external_url ?? "", link_label: row?.link_label ?? "",
    published: row?.published ?? true,
  });
  const [docUrl, setDocUrl] = useState<string | null>(row?.document_url ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  async function save() {
    if (!f.title.trim()) { toast.error("Title is required"); return; }
    if (f.item_date && f.item_date > today()) { toast.error("Date cannot be in the future"); return; }
    if (f.external_url && !/^https?:\/\//i.test(f.external_url.trim())) { toast.error("Link must start with http:// or https://"); return; }
    if (file && file.type !== "application/pdf") { toast.error("Only PDF files can be attached"); return; }
    if (file && file.size > 20 * 1024 * 1024) { toast.error("PDF must be 20 MB or smaller"); return; }
    setSaving(true);
    try {
      let document_url = docUrl;
      if (file) {
        const path = `media/${safeRandomUUID()}.pdf`;
        const { error } = await supabase.storage.from(IR_BUCKET).upload(path, file, { contentType: "application/pdf" });
        if (error) throw new Error(error.message);
        document_url = STORAGE_PREFIX + path;
      }
      const paragraphs = f.body.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
      const payload = {
        item_type: f.item_type, item_date: f.item_date || null, kicker: f.kicker.trim() || null, title: f.title.trim(),
        summary: f.summary.trim() || null, paragraphs, source: f.source.trim() || null, document_url,
        external_url: f.external_url.trim() || null, link_label: f.link_label.trim() || null, published: f.published,
      };
      const { error } = row
        ? await supabase.from("media_items").update(payload).eq("id", row.id)
        : await supabase.from("media_items").insert({ ...payload, sort_order: newOrder });
      if (error) throw new Error(error.message);
      if (row?.document_url && row.document_url !== document_url) await removeStored(row.document_url);
      toast.success(f.published ? "Saved — now live on the website" : "Saved as draft");
      onSaved();
    } catch (x) { toast.error(x instanceof Error ? x.message : "Save failed"); } finally { setSaving(false); }
  }

  return (
    <AdminDialog icon={Newspaper} title={row ? "Edit media item" : "Add media item"} subtitle="Shown on the Media page of the website" onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving} className="neu-btn-gradient border-0">{saving ? "Saving…" : row ? "Save changes" : "Add item"}</Button></>}>
      <FormSection title="Basics">
        <div className="grid gap-4 sm:grid-cols-3">
          <div><Label>Type</Label>
            <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={f.item_type} onChange={(e) => set("item_type", e.target.value)}>
              {MEDIA_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div><Label>Date <span className="text-muted-foreground">(optional)</span></Label><Input type="date" max={today()} value={f.item_date} onChange={(e) => set("item_date", e.target.value)} /></div>
          <div><Label>Source <span className="text-muted-foreground">(optional)</span></Label><Input value={f.source} maxLength={120} placeholder="e.g. Forbes India" onChange={(e) => set("source", e.target.value)} /></div>
        </div>
        <div><Label>Heading line above title <span className="text-muted-foreground">(optional)</span></Label><Input value={f.kicker} maxLength={150} onChange={(e) => set("kicker", e.target.value)} /></div>
        <div><Label>Title</Label><Input value={f.title} maxLength={250} onChange={(e) => set("title", e.target.value)} /></div>
      </FormSection>
      <FormSection title="Content">
        <div><Label>Short summary <span className="text-muted-foreground">(optional)</span></Label><Textarea rows={2} maxLength={1000} value={f.summary} onChange={(e) => set("summary", e.target.value)} /></div>
        <div><Label>Full text <span className="text-muted-foreground">(optional — leave a blank line between paragraphs; shown instead of the summary)</span></Label><Textarea rows={5} maxLength={8000} value={f.body} onChange={(e) => set("body", e.target.value)} /></div>
      </FormSection>
      <FormSection title="Attachment or link (optional)">
        {docUrl && !file && <div className="flex items-center gap-3 text-sm"><span>PDF attached</span><Button type="button" size="sm" variant="outline" onClick={() => setDocUrl(null)}><Trash2 className="size-4" /> Remove PDF</Button></div>}
        <FileDropzone file={file} onFile={setFile} accept="application/pdf" hint="PDF, up to 20 MB" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>External link</Label><Input value={f.external_url} maxLength={800} placeholder="https://…" onChange={(e) => set("external_url", e.target.value)} /></div>
          <div><Label>Link label</Label><Input value={f.link_label} maxLength={80} placeholder="e.g. Read the full article" onChange={(e) => set("link_label", e.target.value)} /></div>
        </div>
        <label className="flex items-center gap-3 text-sm"><Switch checked={f.published} onCheckedChange={(v) => set("published", v)} /> Live on website</label>
      </FormSection>
    </AdminDialog>
  );
}
