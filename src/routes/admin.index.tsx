import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ExternalLink, FileText, LogOut, Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { getStaff } from "@/lib/admin-auth";
import { Link } from "@tanstack/react-router";
import { IR_BUCKET, IR_SECTIONS, STORAGE_PREFIX, rollingFyLabels, type IrContact, type IrDocumentRow } from "@/lib/investor-relations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CONTACTS = "contacts";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  validateSearch: z.object({ section: z.string().optional() }),
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { adminEmail: staff.email, isSuper: staff.role === "super_admin" };
  },
  component: AdminDashboard,
});

const selectCls = "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";

function AdminDashboard() {
  const { adminEmail, isSuper } = Route.useRouteContext();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const section = search.section ?? IR_SECTIONS[0]!.key;
  const groups = useMemo(() => {
    const m = new Map<string, typeof IR_SECTIONS>();
    for (const s of IR_SECTIONS) m.set(s.categoryLabel, [...(m.get(s.categoryLabel) ?? []), s]);
    return [...m.entries()];
  }, []);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="flex items-center justify-between border-b border-border bg-brand-blue px-6 py-3 text-primary-foreground">
        <div className="font-display text-sm font-bold tracking-wide">RAMKY INFRASTRUCTURE <span className="ml-2 rounded-sm bg-brand-orange px-2 py-0.5 text-xs">Admin Portal</span></div>
        <div className="flex items-center gap-3 text-sm">
          <a href="/investors" target="_blank" rel="noreferrer" className="hidden items-center gap-1 opacity-90 hover:opacity-100 sm:inline-flex">View live site <ExternalLink className="size-3.5" /></a>
          {isSuper && <Link to="/admin/users" className="inline-flex items-center gap-1 opacity-90 hover:opacity-100"><Users className="size-4" /> Users</Link>}
          <span className="hidden opacity-80 md:inline">{adminEmail}</span>
          <Button size="sm" variant="secondary" onClick={signOut}><LogOut className="size-4" /> Logout</Button>
        </div>
      </header>
      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="border-b border-border bg-background p-4 md:w-72 md:border-b-0 md:border-r">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Investor Relations</p>
          <nav className="space-y-4 text-sm">
            {groups.map(([cat, list]) => (
              <div key={cat}>
                <p className="font-semibold text-brand-blue">{cat}</p>
                <ul className="mt-1 space-y-0.5">
                  {list.map((s) => (
                    <li key={s.key}>
                      <button onClick={() => navigate({ to: "/admin", search: { section: s.key } })} className={`w-full rounded-sm px-2 py-1 text-left ${s.key === section ? "bg-brand-orange/10 font-semibold text-brand-orange" : "text-foreground/75 hover:bg-surface"}`}>{s.label}</button>
                    </li>
                  ))}
                  {cat === "Shareholders Information" && (
                    <li><button onClick={() => navigate({ to: "/admin", search: { section: CONTACTS } })} className={`flex w-full items-center gap-1.5 rounded-sm px-2 py-1 text-left ${section === CONTACTS ? "bg-brand-orange/10 font-semibold text-brand-orange" : "text-foreground/75 hover:bg-surface"}`}><Users className="size-3.5" /> Investor Contacts</button></li>
                  )}
                </ul>
              </div>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-6">{section === CONTACTS ? <ContactsEditor /> : <DocumentsManager sectionKey={section} />}</main>
      </div>
    </div>
  );
}

type Draft = Omit<IrDocumentRow, "id" | "sort_order"> & { id?: string };

function DocumentsManager({ sectionKey }: { sectionKey: string }) {
  const meta = IR_SECTIONS.find((s) => s.key === sectionKey) ?? IR_SECTIONS[0]!;
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [q, setQ] = useState("");
  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["admin-docs", meta.key],
    queryFn: async () => {
      const { data, error } = await supabase.from("ir_documents").select("*").eq("section_key", meta.key).order("doc_date", { ascending: false });
      if (error) throw error;
      return data as IrDocumentRow[];
    },
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-docs", meta.key] }); qc.invalidateQueries({ queryKey: ["ir-data"] }); };

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

  const filtered = docs.filter((d) => !q || d.title.toLowerCase().includes(q.toLowerCase()));
  const blank: Draft = { section_key: meta.key, title: "", doc_type: "", doc_date: new Date().toISOString().slice(0, 10), fy_year: meta.layout === "repository" ? null : rollingFyLabels()[0]!, quarter: null, disclosure_category: null, version: null, description: null, url: "", published: true };

  return (
    <div>
      <p className="text-xs text-muted-foreground">{meta.categoryLabel}</p>
      <h1 className="font-display text-2xl font-bold text-brand-blue">{meta.label}</h1>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button onClick={() => setEditing(blank)}><Plus className="size-4" /> Upload document</Button>
        <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <span className="text-sm text-muted-foreground">{docs.length} documents</span>
      </div>
      <div className="mt-5 overflow-x-auto rounded-sm border border-border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Year / Qtr</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Live</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No documents yet. Click “Upload document” to add one.</td></tr>}
            {filtered.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-3 font-medium"><span className="flex items-center gap-2"><FileText className="size-4 shrink-0 text-brand-orange" />{d.title}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{d.disclosure_category ?? d.doc_type}</td>
                <td className="px-4 py-3 text-muted-foreground">{[d.fy_year, d.quarter].filter(Boolean).join(" · ") || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.doc_date}</td>
                <td className="px-4 py-3"><Switch checked={d.published} onCheckedChange={() => togglePublish.mutate(d)} aria-label="Published" /></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openDoc(d.url)}>View</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(d)} aria-label="Edit"><Pencil className="size-4" /></Button>
                    <Button size="sm" variant="ghost" aria-label="Delete" onClick={() => { if (confirm(`Delete “${d.title}”?`)) remove.mutate(d); }}><Trash2 className="size-4 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && <DocDialog draft={editing} layout={meta.layout} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
    </div>
  );
}

async function openDoc(url: string) {
  if (!url.startsWith(STORAGE_PREFIX)) { window.open(url, "_blank", "noopener"); return; }
  const { data, error } = await supabase.storage.from(IR_BUCKET).createSignedUrl(url.slice(STORAGE_PREFIX.length), 600);
  if (error || !data) { toast.error("Could not open file"); return; }
  window.open(data.signedUrl, "_blank", "noopener");
}

function DocDialog({ draft, layout, onClose, onSaved }: { draft: Draft; layout: string; onClose: () => void; onSaved: () => void }) {
  const [d, setD] = useState<Draft>(draft);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((p) => ({ ...p, [k]: v }));
  const blankToNull = (v: string) => (v.trim() === "" ? null : v);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!file && !d.url) { toast.error("Choose a file to upload or paste a link."); return; }
    setSaving(true);
    try {
      let url = d.url;
      if (file) {
        const path = `${d.section_key}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
        const { error } = await supabase.storage.from(IR_BUCKET).upload(path, file, { contentType: file.type || "application/pdf" });
        if (error) throw error;
        url = STORAGE_PREFIX + path;
      }
      const row = { section_key: d.section_key, title: d.title, doc_type: d.doc_type || "Document", doc_date: d.doc_date, fy_year: d.fy_year, quarter: d.quarter, disclosure_category: d.disclosure_category, version: d.version, description: d.description, url, published: d.published };
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
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>{d.id ? "Edit document" : "Upload document"}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div><Label>Title</Label><Input required value={d.title} onChange={(e) => set("title", e.target.value)} className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Document type</Label><Input placeholder="e.g. Financial Results" value={d.doc_type} onChange={(e) => set("doc_type", e.target.value)} className="mt-1" /></div>
            <div><Label>Date</Label><Input type="date" required value={d.doc_date} onChange={(e) => set("doc_date", e.target.value)} className="mt-1" /></div>
          </div>
          {layout !== "repository" && (
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Financial year</Label>
                <select className={`${selectCls} mt-1`} value={d.fy_year ?? ""} onChange={(e) => set("fy_year", blankToNull(e.target.value))}>
                  <option value="">—</option>{rollingFyLabels().map((y) => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div><Label>Quarter</Label>
                <select className={`${selectCls} mt-1`} value={d.quarter ?? ""} onChange={(e) => set("quarter", blankToNull(e.target.value))}>
                  <option value="">None</option>{["Q1", "Q2", "Q3", "Q4"].map((x) => <option key={x}>{x}</option>)}
                </select>
              </div>
            </div>
          )}
          {layout === "repository" && (
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Disclosure category</Label><Input placeholder="Optional" value={d.disclosure_category ?? ""} onChange={(e) => set("disclosure_category", blankToNull(e.target.value))} className="mt-1" /></div>
              <div><Label>Version</Label><Input placeholder="Optional" value={d.version ?? ""} onChange={(e) => set("version", blankToNull(e.target.value))} className="mt-1" /></div>
            </div>
          )}
          <div><Label>Description</Label><Textarea rows={2} placeholder="Optional" value={d.description ?? ""} onChange={(e) => set("description", blankToNull(e.target.value))} className="mt-1" /></div>
          <div>
            <Label>File (PDF, up to 50 MB)</Label>
            <Input type="file" accept="application/pdf,.pdf,.ppt,.pptx,.xls,.xlsx,.doc,.docx,.mp3,.mp4" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-1" />
            <p className="mt-1 text-xs text-muted-foreground">{d.url && !file ? "A file is already attached — choose a new one to replace it." : "Or paste an external link instead:"}</p>
            {!file && <Input placeholder="https://…" value={d.url.startsWith(STORAGE_PREFIX) ? "" : d.url} onChange={(e) => set("url", e.target.value)} className="mt-1" />}
          </div>
          <label className="flex items-center gap-3 text-sm"><Switch checked={d.published} onCheckedChange={(v) => set("published", v)} /> Publish live on website</label>
          <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
      <p className="text-xs text-muted-foreground">Shareholders Information</p>
      <h1 className="font-display text-2xl font-bold text-brand-blue">Investor Contacts</h1>
      <Button className="mt-5" onClick={add}><Plus className="size-4" /> Add contact block</Button>
      {isLoading ? <p className="mt-5 text-sm text-muted-foreground">Loading…</p> : (
        <div className="mt-5 grid gap-5 lg:grid-cols-2">{rows.map((r) => <ContactCard key={r.id} row={r} onChange={refresh} />)}</div>
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
    if (!confirm(`Delete “${row.heading}”?`)) return;
    const { error } = await supabase.from("ir_contacts").delete().eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    onChange();
  }

  return (
    <div className="rounded-sm border border-border bg-background p-5">
      <Label>Heading</Label>
      <Input value={heading} onChange={(e) => setHeading(e.target.value)} className="mt-1" />
      <div className="mt-4 space-y-2">
        <div className="grid grid-cols-[1fr_2fr_2fr_auto] gap-2 text-xs text-muted-foreground"><span>Label</span><span>Value</span><span>Link (mailto:, tel:, https://)</span><span /></div>
        {lines.map((l, i) => (
          <div key={i} className="grid grid-cols-[1fr_2fr_2fr_auto] gap-2">
            <Input value={l.label ?? ""} onChange={(e) => upd(i, "label", e.target.value)} />
            <Input value={l.value} onChange={(e) => upd(i, "value", e.target.value)} />
            <Input value={l.href ?? ""} onChange={(e) => upd(i, "href", e.target.value)} />
            <Button size="icon" variant="ghost" aria-label="Remove line" onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}><Trash2 className="size-4" /></Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => setLines((ls) => [...ls, { value: "" }])}><Plus className="size-4" /> Add line</Button>
      </div>
      <div className="mt-4 flex justify-between">
        <Button variant="ghost" className="text-destructive" onClick={remove}><Trash2 className="size-4" /> Delete block</Button>
        <Button onClick={save}>Save</Button>
      </div>
    </div>
  );
}
