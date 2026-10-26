import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Eye, FileText, FileUp, Pencil, Plus, Search, Trash2, Users, Contact, CheckCircle2, FilePen } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { getStaff } from "@/lib/admin-auth";
import { CONTACTS_SECTION } from "@/lib/admin-modules";
import { IR_BUCKET, IR_SECTIONS, STORAGE_PREFIX, rollingFyLabels, type IrContact, type IrDocumentRow } from "@/lib/investor-relations";
import logo from "@/assets/ramky-logo-transparent.png.asset.json";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDialog, FieldError, FileDropzone, FormSection, adminSelect } from "@/components/admin/AdminDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  validateSearch: z.object({ section: z.string().optional() }),
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  component: AdminPage,
});

function AdminPage() {
  const { staff } = Route.useRouteContext();
  const { section } = Route.useSearch();
  if (!section) {
    return <AdminShell staff={staff} active={{ kind: "dashboard" }} crumbs={["Dashboard"]}><Dashboard isSuper={staff.role === "super_admin"} name={staff.fullName} /></AdminShell>;
  }
  if (section === CONTACTS_SECTION) {
    return <AdminShell staff={staff} active={{ kind: "investors", section }} crumbs={["Investors", "Shareholders Information", "Investor Contacts"]}><ContactsEditor /></AdminShell>;
  }
  const meta = IR_SECTIONS.find((s) => s.key === section) ?? IR_SECTIONS[0]!;
  return (
    <AdminShell staff={staff} active={{ kind: "investors", section: meta.key }} crumbs={["Investors", meta.categoryLabel, meta.label]}>
      <DocumentsManager key={meta.key} sectionKey={meta.key} />
    </AdminShell>
  );
}

function PageHeader({ eyebrow, title, desc, action }: { eyebrow: string; title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex shrink-0 flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">{eyebrow}</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
        {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

function Dashboard({ isSuper, name }: { isSuper: boolean; name: string }) {
  const { data } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const [{ data: docs }, users] = await Promise.all([
        supabase.from("ir_documents").select("id,title,section_key,published,updated_at").order("updated_at", { ascending: false }),
        isSuper ? supabase.from("admin_profiles").select("user_id", { count: "exact", head: true }) : Promise.resolve({ count: null }),
      ]);
      return { docs: docs ?? [], users: users.count };
    },
  });
  const docs = data?.docs ?? [];
  const live = docs.filter((d) => d.published).length;
  const cards = [
    { label: "Total documents", value: docs.length, icon: FileText },
    { label: "Live on website", value: live, icon: CheckCircle2 },
    { label: "Drafts", value: docs.length - live, icon: FilePen },
    ...(isSuper ? [{ label: "Admin users", value: data?.users ?? 0, icon: Users }] : []),
  ];
  const label = (k: string) => IR_SECTIONS.find((s) => s.key === k);
  return (
    <div>
      <div className="relative mb-4 flex items-center justify-between gap-4 overflow-hidden rounded-xl border border-border bg-background px-6 py-5 shadow-[var(--shadow-card)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">Overview</p>
          <h1 className="mt-1 font-display text-2xl font-bold">Welcome back, {name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage website content module by module. Changes go live instantly.</p>
        </div>
        <img src={logo.url} alt="Ramky Infrastructure" className="hidden h-14 w-auto sm:block" />
        <div className="admin-accent-line absolute inset-x-0 bottom-0 h-[3px]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-background p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{c.label}</p><span className="admin-accent grid size-9 place-items-center rounded-lg"><c.icon className="size-4" /></span></div>
            <p className="mt-2 font-display text-3xl font-bold text-foreground">{data ? c.value : "—"}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-border bg-background shadow-[var(--shadow-card)]">
        <div className="border-b border-border px-5 py-4"><h2 className="font-display font-semibold">Recently updated</h2></div>
        <ul className="divide-y divide-border">
          {docs.slice(0, 5).map((d) => {
            const m = label(d.section_key);
            return (
              <li key={d.id}>
                <Link to="/admin" search={{ section: d.section_key }} className="flex items-center gap-3 px-5 py-2.5 text-sm hover:bg-surface">
                  <FileText className="size-4 shrink-0 text-brand-orange" />
                  <span className="flex-1 truncate font-medium">{d.title}</span>
                  <span className="hidden text-muted-foreground sm:inline">{m ? `${m.categoryLabel} · ${m.label}` : d.section_key}</span>
                  <StatusBadge live={d.published} />
                </Link>
              </li>
            );
          })}
          {data && docs.length === 0 && <li className="px-5 py-8 text-center text-sm text-muted-foreground">No documents yet.</li>}
        </ul>
      </div>
    </div>
  );
}

function StatusBadge({ live }: { live: boolean }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${live ? "admin-badge-live" : "admin-badge-draft"}`}><span className="size-1.5 rounded-full bg-current" />{live ? "Live" : "Draft"}</span>;
}

function IconAction({ label, onClick, children, danger }: { label: string; onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button onClick={onClick} aria-label={label} className={`grid size-8 place-items-center rounded-md transition-colors ${danger ? "text-destructive hover:bg-destructive/10" : "text-muted-foreground hover:bg-surface hover:text-brand-blue"}`}>{children}</button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

type Draft = Omit<IrDocumentRow, "id" | "sort_order"> & { id?: string };

function DocumentsManager({ sectionKey }: { sectionKey: string }) {
  const meta = IR_SECTIONS.find((s) => s.key === sectionKey) ?? IR_SECTIONS[0]!;
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [q, setQ] = useState("");
  const [fy, setFy] = useState("");
  const [status, setStatus] = useState("");
  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["admin-docs", meta.key],
    queryFn: async () => {
      const { data, error } = await supabase.from("ir_documents").select("*").eq("section_key", meta.key).order("doc_date", { ascending: false });
      if (error) throw error;
      return data as IrDocumentRow[];
    },
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-docs", meta.key] }); qc.invalidateQueries({ queryKey: ["ir-data"] }); qc.invalidateQueries({ queryKey: ["admin-dashboard"] }); };

  const togglePublish = useMutation({
    mutationFn: async (d: IrDocumentRow) => {
      const { error } = await supabase.from("ir_documents").update({ published: !d.published }).eq("id", d.id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (d: IrDocumentRow) => {
      const { error } = await supabase.from("ir_documents").delete().eq("id", d.id);
      if (error) throw error;
      if (d.url.startsWith(STORAGE_PREFIX)) await supabase.storage.from(IR_BUCKET).remove([d.url.slice(STORAGE_PREFIX.length)]);
    },
    onSuccess: () => { toast.success("Document deleted"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const years = [...new Set(docs.map((d) => d.fy_year).filter(Boolean))] as string[];
  const filtered = docs.filter((d) =>
    (!q || d.title.toLowerCase().includes(q.toLowerCase())) && (!fy || d.fy_year === fy) && (!status || (status === "live") === d.published));
  const blank: Draft = { section_key: meta.key, title: "", doc_type: "", doc_date: new Date().toISOString().slice(0, 10), fy_year: meta.layout === "repository" ? null : rollingFyLabels()[0]!, quarter: null, disclosure_category: null, version: null, description: null, url: "", published: true };
  const liveCount = docs.filter((d) => d.published).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader eyebrow={`Investors · ${meta.categoryLabel}`} title={meta.label} desc={`${docs.length} documents · ${liveCount} live · ${docs.length - liveCount} draft`}
        action={<Button onClick={() => setEditing(blank)} className="admin-accent h-10 border-0 px-5 shadow-md hover:opacity-90"><Plus className="size-4" /> Upload document</Button>} />

      <div className="flex min-h-[320px] flex-1 flex-col overflow-hidden rounded-xl border border-border bg-background shadow-[var(--shadow-card)]">
        <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border p-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by title…" value={q} onChange={(e) => setQ(e.target.value)} className="h-10 pl-9" />
          </div>
          {meta.layout !== "repository" && years.length > 0 && (
            <select className={adminSelect.replace("w-full", "w-44")} value={fy} onChange={(e) => setFy(e.target.value)}><option value="">All years</option>{years.map((y) => <option key={y}>{y}</option>)}</select>
          )}
          <select className={adminSelect.replace("w-full", "w-44")} value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All status</option><option value="live">Live</option><option value="draft">Draft</option></select>
        </div>
        <div className="thin-scroll min-h-0 flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-background text-left text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr className="border-b border-border"><th className="px-5 py-3 font-semibold">Document</th><th className="px-4 py-3 font-semibold">Year / Qtr</th><th className="px-4 py-3 font-semibold">Date</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Publish</th><th className="px-5 py-3 text-right font-semibold">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">Loading…</td></tr>}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-14 text-center"><FileUp className="mx-auto size-10 text-muted-foreground/50" /><p className="mt-2 font-medium">No documents found</p><p className="text-sm text-muted-foreground">Click "Upload document" to add one.</p></td></tr>
              )}
              {filtered.map((d) => (
                <tr key={d.id} className="transition-colors hover:bg-surface/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-orange/10 text-brand-orange"><FileText className="size-4" /></span>
                      <div className="min-w-0"><p className="truncate font-semibold text-foreground">{d.title}</p><p className="truncate text-xs text-muted-foreground">{d.disclosure_category ?? d.doc_type}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{[d.fy_year, d.quarter].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{new Date(d.doc_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td className="px-4 py-3"><StatusBadge live={d.published} /></td>
                  <td className="px-4 py-3"><Switch checked={d.published} onCheckedChange={() => togglePublish.mutate(d)} aria-label="Published" /></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <IconAction label="View file" onClick={() => openDoc(d.url)}><Eye className="size-4" /></IconAction>
                      <IconAction label="Edit" onClick={() => setEditing(d)}><Pencil className="size-4" /></IconAction>
                      <IconAction label="Delete" danger onClick={() => { if (confirm(`Delete "${d.title}"?`)) remove.mutate(d); }}><Trash2 className="size-4" /></IconAction>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {editing && <DocDialog draft={editing} sectionLabel={`${meta.categoryLabel} · ${meta.label}`} layout={meta.layout} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
    </div>
  );
}

async function openDoc(url: string) {
  if (!url.startsWith(STORAGE_PREFIX)) { window.open(url, "_blank", "noopener"); return; }
  const { data, error } = await supabase.storage.from(IR_BUCKET).createSignedUrl(url.slice(STORAGE_PREFIX.length), 600);
  if (error || !data) { toast.error("Could not open file"); return; }
  window.open(data.signedUrl, "_blank", "noopener");
}

function DocDialog({ draft, sectionLabel, layout, onClose, onSaved }: { draft: Draft; sectionLabel: string; layout: string; onClose: () => void; onSaved: () => void }) {
  const [d, setD] = useState<Draft>(draft);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<"title" | "doc_date" | "file", string>>>({});
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));
  const blankToNull = (v: string) => (v.trim() === "" ? null : v);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const errs: Partial<Record<"title" | "doc_date" | "file", string>> = {};
    if (!d.title.trim()) errs.title = "Please enter a title";
    if (!d.doc_date) errs.doc_date = "Please choose a date";
    if (!file && !d.url.trim()) errs.file = "Upload a file or paste a link";
    else if (!file && !d.url.startsWith(STORAGE_PREFIX) && !/^https?:\/\//.test(d.url)) errs.file = "Link must start with https://";
    if (file && file.size > 50 * 1048576) errs.file = "File must be 50 MB or smaller";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      let url = d.url;
      if (file) {
        const path = `${d.section_key}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
        const { error } = await supabase.storage.from(IR_BUCKET).upload(path, file, { contentType: file.type || "application/pdf" });
        if (error) throw error;
        url = STORAGE_PREFIX + path;
      }
      const row = { section_key: d.section_key, title: d.title.trim(), doc_type: d.doc_type || "Document", doc_date: d.doc_date, fy_year: d.fy_year, quarter: d.quarter, disclosure_category: d.disclosure_category, version: d.version, description: d.description, url, published: d.published };
      const { error } = d.id ? await supabase.from("ir_documents").update(row).eq("id", d.id) : await supabase.from("ir_documents").insert(row);
      if (error) throw error;
      toast.success(d.published ? "Saved — now live on the website" : "Saved as draft");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminDialog wide icon={FileUp} title={d.id ? "Edit document" : "Upload document"} subtitle={sectionLabel} onClose={onClose}
      footer={<><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" form="doc-form" disabled={saving} className="admin-accent border-0 px-6 hover:opacity-90">{saving ? "Saving…" : d.id ? "Save changes" : "Upload"}</Button></>}>
      <form id="doc-form" onSubmit={save} noValidate>
        <FormSection title="Details">
          <div><Label>Title <span className="text-destructive">*</span></Label><Input value={d.title} placeholder="e.g. Financial Results – Q1 FY 2026–27" onChange={(e) => set("title", e.target.value)} className="mt-1.5 h-10" aria-invalid={!!errors.title} /><FieldError msg={errors.title} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Document type</Label><Input placeholder="e.g. Financial Results" value={d.doc_type} onChange={(e) => set("doc_type", e.target.value)} className="mt-1.5 h-10" /></div>
            <div><Label>Date <span className="text-destructive">*</span></Label><Input type="date" value={d.doc_date} onChange={(e) => set("doc_date", e.target.value)} className="mt-1.5 h-10" /><FieldError msg={errors.doc_date} /></div>
          </div>
          <div><Label>Description</Label><Textarea rows={2} placeholder="Optional short note" value={d.description ?? ""} onChange={(e) => set("description", blankToNull(e.target.value))} className="mt-1.5" /></div>
        </FormSection>
        <FormSection title={layout === "repository" ? "Classification" : "Period"}>
          {layout !== "repository" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Financial year</Label>
                <select className={`${adminSelect} mt-1.5`} value={d.fy_year ?? ""} onChange={(e) => set("fy_year", blankToNull(e.target.value))}><option value="">—</option>{rollingFyLabels().map((y) => <option key={y}>{y}</option>)}</select>
              </div>
              <div><Label>Quarter</Label>
                <select className={`${adminSelect} mt-1.5`} value={d.quarter ?? ""} onChange={(e) => set("quarter", blankToNull(e.target.value))}><option value="">None</option>{["Q1", "Q2", "Q3", "Q4"].map((x) => <option key={x}>{x}</option>)}</select>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Disclosure category</Label><Input placeholder="Optional" value={d.disclosure_category ?? ""} onChange={(e) => set("disclosure_category", blankToNull(e.target.value))} className="mt-1.5 h-10" /></div>
              <div><Label>Version</Label><Input placeholder="Optional" value={d.version ?? ""} onChange={(e) => set("version", blankToNull(e.target.value))} className="mt-1.5 h-10" /></div>
            </div>
          )}
        </FormSection>
        <FormSection title="File">
          <FileDropzone file={file} onFile={setFile} accept="application/pdf,.pdf,.ppt,.pptx,.xls,.xlsx,.doc,.docx,.mp3,.mp4" hint={d.url && !file ? "A file is already attached — upload a new one to replace it" : "PDF, Office or media files up to 50 MB"} />
          {!file && (
            <div><Label className="text-xs text-muted-foreground">Or paste an external link</Label><Input placeholder="https://…" value={d.url.startsWith(STORAGE_PREFIX) ? "" : d.url} onChange={(e) => set("url", e.target.value)} className="mt-1.5 h-10" /></div>
          )}
          <FieldError msg={errors.file} />
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-border p-4">
            <span><span className="block text-sm font-semibold">Publish live on website</span><span className="block text-xs text-muted-foreground">Turn off to save as a draft and publish later.</span></span>
            <Switch checked={d.published} onCheckedChange={(v) => set("published", v)} />
          </label>
        </FormSection>
      </form>
    </AdminDialog>
  );
}

type ContactRow = { id: string; heading: string; lines: IrContact["lines"]; sort_order: number };

function ContactsEditor() {
  const qc = useQueryClient();
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ir_contacts").select("*").order("sort_order");
      if (error) throw error;
      return data as unknown as ContactRow[];
    },
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-contacts"] }); qc.invalidateQueries({ queryKey: ["ir-data"] }); };

  async function add() {
    const { error } = await supabase.from("ir_contacts").insert({ heading: "New contact block", lines: [], sort_order: rows.length });
    if (error) { toast.error(error.message); return; }
    refresh();
  }

  return (
    <div>
      <PageHeader eyebrow="Investors · Shareholders Information" title="Investor Contacts" desc="Contact blocks shown on the public Investors page."
        action={<Button onClick={add} className="admin-accent h-10 border-0 px-5 shadow-md hover:opacity-90"><Plus className="size-4" /> Add contact block</Button>} />
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
        <div className="grid gap-5 lg:grid-cols-2">{rows.map((r) => <ContactCard key={r.id} row={r} onChange={refresh} />)}</div>
      )}
    </div>
  );
}

function ContactCard({ row, onChange }: { row: ContactRow; onChange: () => void }) {
  const [heading, setHeading] = useState(row.heading);
  const [lines, setLines] = useState(row.lines);
  const upd = (i: number, k: "label" | "value" | "href", v: string) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, [k]: v || undefined } : l)));

  async function save() {
    const { error } = await supabase.from("ir_contacts").update({ heading, lines: lines.filter((l) => l.value) }).eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Contact saved — now live on the website");
    onChange();
  }
  async function remove() {
    if (!confirm(`Delete "${row.heading}"?`)) return;
    const { error } = await supabase.from("ir_contacts").delete().eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    onChange();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3 border-b border-border bg-surface px-5 py-3"><Contact className="size-4 text-brand-orange" /><Input value={heading} onChange={(e) => setHeading(e.target.value)} className="h-9 border-0 bg-transparent px-0 font-display font-semibold shadow-none focus-visible:ring-0" /></div>
      <div className="space-y-2 p-5">
        <div className="grid grid-cols-[1fr_2fr_2fr_auto] gap-2 text-[11px] uppercase tracking-wider text-muted-foreground"><span>Label</span><span>Value</span><span>Link (mailto:, tel:, https://)</span><span className="w-8" /></div>
        {lines.map((l, i) => (
          <div key={i} className="grid grid-cols-[1fr_2fr_2fr_auto] gap-2">
            <Input value={l.label ?? ""} onChange={(e) => upd(i, "label", e.target.value)} />
            <Input value={l.value} onChange={(e) => upd(i, "value", e.target.value)} />
            <Input value={l.href ?? ""} onChange={(e) => upd(i, "href", e.target.value)} />
            <IconAction label="Remove line" danger onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}><Trash2 className="size-4" /></IconAction>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => setLines((ls) => [...ls, { value: "" }])}><Plus className="size-4" /> Add line</Button>
      </div>
      <div className="flex justify-between border-t border-border px-5 py-3">
        <Button onClick={remove} className="btn-grad-danger border-0 hover:opacity-90"><Trash2 className="size-4" /> Delete block</Button>
        <Button onClick={save} className="admin-accent border-0 px-6 hover:opacity-90">Save</Button>
      </div>
    </div>
  );
}
