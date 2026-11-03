import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Fragment, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, ImagePlus, Leaf, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getStaff } from "@/lib/admin-auth";
import { IR_BUCKET, STORAGE_PREFIX } from "@/lib/investor-relations";
import { imageFileError } from "@/lib/admin-validation";
import { ESG_SECTIONS } from "@/lib/esg-sections";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDialog, FieldError, FileDropzone, FormSection } from "@/components/admin/AdminDialog";
import { confirmDelete } from "@/components/admin/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/sustainability/$slug")({
  ssr: false,
  beforeLoad: async ({ params }) => {
    if (!ESG_SECTIONS.some((s) => s.slug === params.slug)) throw notFound();
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  component: Page,
  notFoundComponent: () => <div className="p-10">Page not found.</div>,
});

type Kind = "metric" | "accordion" | "governance_item" | "report";
type Item = { id: string; kind: Kind; group_title: string | null; title: string; value: string; body: string; year: string; url: string | null; published: boolean; sort_order: number };

const KIND_INFO: Record<Kind, { heading: string; hint: string; noun: string }> = {
  metric: { heading: "Key figures", hint: "Value and label, e.g. 22% · Reduction in Energy Consumption", noun: "figure" },
  governance_item: { heading: "Committees & policies", hint: "Shown next to the highlight box", noun: "item" },
  accordion: { heading: "Focus areas", hint: "Expandable sections in the In Detail block", noun: "focus area" },
  report: { heading: "Reports", hint: "Download cards — upload a PDF or add a link", noun: "report" },
};

const MAX_PDF = 50 * 1024 * 1024;

async function upload(file: File, folder: string) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `esg/${folder}/${crypto.randomUUID()}.${ext}`;
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
  const { slug } = Route.useParams();
  const label = ESG_SECTIONS.find((s) => s.slug === slug)?.title ?? slug;
  const kinds: Kind[] = slug === "governance" ? ["governance_item", "accordion"] : slug === "esg-reporting" ? ["metric", "accordion", "report"] : ["metric", "accordion"];
  return (
    <AdminShell staff={staff} active={{ kind: "module", module: "sustainability", section: slug }} crumbs={["Sustainability", label]}>
      <div key={slug} className="space-y-6">
        <PageEditor slug={slug} label={label} />
        {kinds.map((k) => <ItemList key={k} slug={slug} kind={k} grouped={k === "metric"} />)}
      </div>
    </AdminShell>
  );
}

function PageEditor({ slug, label }: { slug: string; label: string }) {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-esg-page", slug], queryFn: async () => {
    const { data, error } = await supabase.from("esg_pages").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    return data;
  } });
  const empty = { eyebrow: "", title: label, hero: "", metrics_period: "", banner_image_url: null as string | null, highlight_title: "", highlight_value: "", highlight_label: "" };
  const [f, setF] = useState(empty);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setF({ eyebrow: data.eyebrow, title: data.title, hero: data.hero, metrics_period: data.metrics_period, banner_image_url: data.banner_image_url, highlight_title: data.highlight_title, highlight_value: data.highlight_value, highlight_label: data.highlight_label }); }, [data]);
  const preview = usePreview(f.banner_image_url);
  const shown = file ? URL.createObjectURL(file) : preview;

  async function save() {
    const err = imageFileError(file, false);
    if (err) { toast.error(err); return; }
    if (!f.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const next = { ...f };
      if (file) next.banner_image_url = await upload(file, "banner");
      const { error } = await supabase.from("esg_pages").upsert({ slug, ...next });
      if (error) throw new Error(error.message);
      if (data?.banner_image_url && data.banner_image_url !== next.banner_image_url) await removeStored(data.banner_image_url);
      setFile(null);
      toast.success("Saved — now live on the website");
      qc.invalidateQueries({ queryKey: ["admin-esg-page", slug] });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); } finally { setSaving(false); }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">{label} page content</h2>
          <p className="text-sm text-muted-foreground">Top banner{slug === "governance" ? " and the board highlight box" : " and key figures period"}.</p>
        </div>
        <Button onClick={save} disabled={saving} className="neu-btn-gradient border-0"><Save className="size-4" /> {saving ? "Saving…" : "Save"}</Button>
      </div>
      <FormSection title="Top banner">
        <div className="grid gap-4 sm:grid-cols-3">
          <div><Label>Small heading</Label><Input value={f.eyebrow} maxLength={80} onChange={(e) => setF({ ...f, eyebrow: e.target.value })} /></div>
          <div><Label>Title</Label><Input value={f.title} maxLength={80} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
          <div><Label>Key figures period <span className="text-muted-foreground">(optional)</span></Label><Input value={f.metrics_period} maxLength={80} placeholder="e.g. FY 2025–26" onChange={(e) => setF({ ...f, metrics_period: e.target.value })} /></div>
        </div>
        <div><Label>Intro text</Label><Textarea rows={3} maxLength={400} value={f.hero} onChange={(e) => setF({ ...f, hero: e.target.value })} /></div>
        <div>
          <Label>Background image <span className="text-muted-foreground">(optional)</span></Label>
          <div className="mt-2 grid gap-3 sm:grid-cols-[10rem_1fr]">
            <div className="grid h-28 place-items-center overflow-hidden rounded-lg border border-border bg-surface">
              {shown ? <img src={shown} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="size-7 text-muted-foreground" />}
            </div>
            <div className="space-y-2">
              <FileDropzone file={file} onFile={setFile} accept="image/png,image/jpeg,image/webp" hint="PNG, JPG or WebP, up to 5 MB" />
              {f.banner_image_url && !file && <Button type="button" size="sm" variant="outline" onClick={() => setF({ ...f, banner_image_url: null })}><Trash2 className="size-4" /> Remove image</Button>}
            </div>
          </div>
        </div>
      </FormSection>
      {slug === "governance" && (
        <FormSection title="Highlight box">
          <div className="grid gap-4 sm:grid-cols-3">
            <div><Label>Heading</Label><Input value={f.highlight_title} maxLength={80} onChange={(e) => setF({ ...f, highlight_title: e.target.value })} /></div>
            <div><Label>Value</Label><Input value={f.highlight_value} maxLength={20} placeholder="e.g. 4/7" onChange={(e) => setF({ ...f, highlight_value: e.target.value })} /></div>
            <div><Label>Label</Label><Input value={f.highlight_label} maxLength={120} onChange={(e) => setF({ ...f, highlight_label: e.target.value })} /></div>
          </div>
        </FormSection>
      )}
    </section>
  );
}

function ItemList({ slug, kind, grouped }: { slug: string; kind: Kind; grouped: boolean }) {
  const qc = useQueryClient();
  const info = KIND_INFO[kind];
  const [editing, setEditing] = useState<Item | "new" | null>(null);
  const qk = ["admin-esg-items", slug, kind];
  const { data: rows = [] } = useQuery({ queryKey: qk, queryFn: async () => {
    const { data, error } = await supabase.from("esg_items").select("*").eq("page_slug", slug).eq("kind", kind).order("sort_order");
    if (error) throw error;
    return data as Item[];
  } });
  const refresh = () => qc.invalidateQueries({ queryKey: qk });
  const groups = [...new Set(rows.map((r) => r.group_title).filter((g): g is string => !!g))];

  async function toggle(r: Item) {
    const { error } = await supabase.from("esg_items").update({ published: !r.published }).eq("id", r.id);
    if (error) toast.error(error.message); else refresh();
  }
  async function move(i: number, dir: -1 | 1) {
    const a = rows[i], b = rows[i + dir];
    if (!a || !b) return;
    const [r1, r2] = await Promise.all([
      supabase.from("esg_items").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("esg_items").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    if (r1.error || r2.error) toast.error("Could not reorder"); else refresh();
  }
  async function remove(r: Item) {
    if (!(await confirmDelete(`Delete "${r.title}"?`))) return;
    const { error } = await supabase.from("esg_items").delete().eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    await removeStored(r.url);
    toast.success("Deleted"); refresh();
  }
  async function renameGroup(oldName: string) {
    const next = window.prompt(`Rename group "${oldName}" to:`, oldName)?.trim();
    if (!next || next === oldName) return;
    const { error } = await supabase.from("esg_items").update({ group_title: next.slice(0, 80) }).eq("page_slug", slug).eq("kind", kind).eq("group_title", oldName);
    if (error) toast.error(error.message); else { toast.success("Group renamed"); refresh(); }
  }

  const cols = kind === "metric" ? ["Value", "Label", ...(grouped ? ["Group"] : [])] : kind === "report" ? ["Year", "Title", "File"] : kind === "accordion" ? ["Title", "Description"] : ["Title"];

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 className="font-display text-xl font-bold">{info.heading}</h2>
          <p className="text-sm text-muted-foreground">{rows.length} · {info.hint}</p>
        </div>
        <Button onClick={() => setEditing("new")} className="neu-btn-gradient border-0"><Plus className="size-4" /> Add {info.noun}</Button>
      </div>
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr><th className="px-4 py-3">Order</th>{cols.map((c) => <th key={c} className="px-4 py-3">{c}</th>)}<th className="px-4 py-3">Live</th><th className="px-4 py-3 text-right">Actions</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (<Fragment key={r.id}>
            {grouped && (i === 0 || rows[i - 1]?.group_title !== r.group_title) && (
              <tr className="border-t border-border bg-emerald-50/60">
                <td colSpan={cols.length + 3} className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-emerald-800">{r.group_title || "Main Key Metrics (no group heading)"}</span>
                    {r.group_title && <button aria-label="Rename group" title="Rename group" onClick={() => renameGroup(r.group_title!)} className="btn-grad-edit grid size-6 place-items-center rounded shadow-sm hover:opacity-90"><Pencil className="size-3" /></button>}
                  </div>
                </td>
              </tr>
            )}
            <tr className="border-t border-border align-top">
              <td className="px-4 py-2">
                <div className="flex gap-1">
                  <button aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="rounded border border-border p-1 disabled:opacity-30"><ArrowUp className="size-3.5" /></button>
                  <button aria-label="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)} className="rounded border border-border p-1 disabled:opacity-30"><ArrowDown className="size-3.5" /></button>
                </div>
              </td>
              {kind === "metric" && <><td className="px-4 py-2 font-display text-base font-bold text-emerald-700">{r.value}</td><td className="px-4 py-2 font-medium">{r.title}</td>{grouped && <td className="px-4 py-2 text-muted-foreground">{r.group_title ?? "—"}</td>}</>}
              {kind === "report" && <><td className="px-4 py-2">{r.year}</td><td className="px-4 py-2 font-medium">{r.title}</td><td className="px-4 py-2">{r.url ? <FileLink url={r.url} /> : <span className="text-muted-foreground">No file yet</span>}</td></>}
              {kind === "accordion" && <><td className="px-4 py-2 font-medium">{r.title}</td><td className="max-w-xl px-4 py-2 text-muted-foreground"><span className="line-clamp-2">{r.body}</span></td></>}
              {kind === "governance_item" && <td className="px-4 py-2 font-medium">{r.title}</td>}
              <td className="px-4 py-2"><Switch checked={r.published} onCheckedChange={() => toggle(r)} aria-label="Live" /></td>
              <td className="px-4 py-2">
                <div className="flex justify-end gap-2">
                  <button aria-label="Edit" onClick={() => setEditing(r)} className="btn-grad-edit grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Pencil className="size-4" /></button>
                  <button aria-label="Delete" onClick={() => remove(r)} className="btn-grad-danger grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Trash2 className="size-4" /></button>
                </div>
              </td>
            </tr>
          </Fragment>))}
          {!rows.length && <tr><td colSpan={cols.length + 3} className="px-4 py-10 text-center text-muted-foreground">Nothing added yet.</td></tr>}
        </tbody>
      </table>
      {editing && <ItemDialog slug={slug} kind={kind} grouped={grouped} groups={groups} row={editing === "new" ? null : editing} nextOrder={(rows.at(-1)?.sort_order ?? 0) + 1} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
    </section>
  );
}

function FileLink({ url }: { url: string }) {
  const href = usePreview(url);
  return href ? <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-blue hover:underline">Open <ExternalLink className="size-3.5" /></a> : <span className="text-muted-foreground">…</span>;
}

function ItemDialog({ slug, kind, grouped, groups, row, nextOrder, onClose, onSaved }: { slug: string; kind: Kind; grouped: boolean; groups: string[]; row: Item | null; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const info = KIND_INFO[kind];
  const [f, setF] = useState({ title: row?.title ?? "", value: row?.value ?? "", body: row?.body ?? "", year: row?.year ?? "", group_title: row?.group_title ?? (groups[0] ?? ""), published: row?.published ?? true });
  const isLink = !!row?.url && !row.url.startsWith(STORAGE_PREFIX);
  const [mode, setMode] = useState<"file" | "link">(isLink ? "link" : "file");
  const [link, setLink] = useState(isLink ? row!.url! : "");
  const [file, setFile] = useState<File | null>(null);
  const [errs, setErrs] = useState<{ title?: string; value?: string; body?: string; year?: string; file?: string }>({});
  const [saving, setSaving] = useState(false);

  async function save() {
    const e: { title?: string; value?: string; body?: string; year?: string; file?: string } = {};
    if (!f.title.trim()) e.title = kind === "metric" ? "Label is required" : "Title is required";
    if (kind === "metric" && !f.value.trim()) e.value = "Value is required";
    if (kind === "accordion" && !f.body.trim()) e.body = "Description is required";
    if (kind === "report" && !f.year.trim()) e.year = "Year is required";
    if (kind === "report" && mode === "file" && file && (file.type !== "application/pdf" || file.size > MAX_PDF)) e.file = "Upload a PDF up to 50 MB";
    if (kind === "report" && mode === "link" && link && !/^https?:\/\//i.test(link.trim())) e.file = "Link must start with http:// or https://";
    setErrs(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      let url = row?.url ?? null;
      if (kind === "report") {
        if (mode === "file" && file) url = await upload(file, "reports");
        else if (mode === "link") url = link.trim() || null;
      }
      const payload = { title: f.title.trim(), value: f.value.trim(), body: f.body.trim(), year: f.year.trim(), group_title: grouped ? f.group_title.trim() || null : null, published: f.published, url };
      const { error } = row
        ? await supabase.from("esg_items").update(payload).eq("id", row.id)
        : await supabase.from("esg_items").insert({ ...payload, page_slug: slug, kind, sort_order: nextOrder });
      if (error) throw new Error(error.message);
      if (row?.url && row.url !== url) await removeStored(row.url);
      toast.success(f.published ? "Saved — now live on the website" : "Saved as draft");
      onSaved();
    } catch (x) { toast.error(x instanceof Error ? x.message : "Save failed"); } finally { setSaving(false); }
  }

  return (
    <AdminDialog icon={Leaf} title={`${row ? "Edit" : "Add"} ${info.noun}`} subtitle={`Shown in ${info.heading} on the website`} onClose={onClose} xwide
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving} className="neu-btn-gradient border-0">{saving ? "Saving…" : row ? "Save changes" : `Add ${info.noun}`}</Button></>}>
      <FormSection title="Details">
        <div className="grid gap-4 sm:grid-cols-3">
          {kind === "metric" && <div><Label>Value</Label><Input value={f.value} maxLength={30} placeholder="e.g. 22%" onChange={(e) => setF({ ...f, value: e.target.value })} /><FieldError msg={errs.value} /></div>}
          {kind === "report" && <div><Label>Year</Label><Input value={f.year} maxLength={20} placeholder="e.g. 2026 or 2025-26" onChange={(e) => setF({ ...f, year: e.target.value })} /><FieldError msg={errs.year} /></div>}
          <div className={kind === "metric" || kind === "report" ? "" : "sm:col-span-2"}><Label>{kind === "metric" ? "Label" : "Title"}</Label><Input value={f.title} maxLength={160} onChange={(e) => setF({ ...f, title: e.target.value })} /><FieldError msg={errs.title} /></div>
          {grouped && <div><Label>Card group heading (optional — type a new name to create a new group)</Label><Input list="esg-groups" value={f.group_title} maxLength={80} placeholder="e.g. Workforce & Safety" onChange={(e) => setF({ ...f, group_title: e.target.value })} /><datalist id="esg-groups">{groups.map((g) => <option key={g} value={g} />)}</datalist></div>}
        </div>
        {(kind === "accordion" || kind === "report") && (
          <div><Label>Description {kind === "report" && <span className="text-muted-foreground">(optional)</span>}</Label><Textarea rows={4} maxLength={2000} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /><FieldError msg={errs.body} /></div>
        )}
        <label className="flex items-center gap-3 text-sm"><Switch checked={f.published} onCheckedChange={(v) => setF({ ...f, published: v })} /> Live on website</label>
      </FormSection>
      {kind === "report" && (
        <FormSection title="Report file (optional)">
          <div className="flex gap-2">
            <Button type="button" size="sm" variant={mode === "file" ? "default" : "outline"} onClick={() => setMode("file")}>Upload PDF</Button>
            <Button type="button" size="sm" variant={mode === "link" ? "default" : "outline"} onClick={() => setMode("link")}>External link</Button>
          </div>
          {mode === "file"
            ? <FileDropzone file={file} onFile={(x) => { setFile(x); setErrs({ ...errs, file: "" }); }} accept="application/pdf" hint={`PDF up to 50 MB${row?.url?.startsWith(STORAGE_PREFIX) ? " — leave empty to keep current file" : ""}`} />
            : <Input value={link} placeholder="https://…" onChange={(e) => setLink(e.target.value)} />}
          <FieldError msg={errs.file || undefined} />
          <p className="text-xs text-muted-foreground">Without a file, the website shows "Coming soon" on this report.</p>
        </FormSection>
      )}
    </AdminDialog>
  );
}
