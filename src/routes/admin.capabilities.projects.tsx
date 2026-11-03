import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, FolderKanban, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
import { STATUSES, fetchVerticals, refreshCapabilities, type ProjectRow } from "@/lib/capabilities-admin";

export const Route = createFileRoute("/admin/capabilities/projects")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({ v: typeof s.v === "string" ? s.v : undefined }),
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  head: () => ({ meta: [{ title: "Capability Projects — Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

const STATUS_CLS: Record<string, string> = {
  Ongoing: "bg-brand-orange/15 text-brand-orange",
  "O&M": "bg-brand-blue/15 text-brand-blue",
  Completed: "bg-brand-green/15 text-brand-green",
};

function Page() {
  const { staff } = Route.useRouteContext();
  const { v } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const qc = useQueryClient();
  const { data: verticals = [] } = useQuery({ queryKey: ["admin-verticals"], queryFn: fetchVerticals });
  const slug = v ?? verticals[0]?.slug;
  const vertical = verticals.find((x) => x.slug === slug);
  const { data: rows = [] } = useQuery({
    queryKey: ["admin-projects", slug], enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase.from("business_projects").select("*").eq("vertical_slug", slug!).order("sort_order");
      if (error) throw error;
      return data as ProjectRow[];
    },
  });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<ProjectRow | "new" | null>(null);
  const shown = useMemo(() => rows.filter((r) =>
    (!status || r.status === status) && (!q || `${r.name} ${r.location} ${r.client}`.toLowerCase().includes(q.toLowerCase()))), [rows, q, status]);
  const filtered = !!(q || status);
  const refresh = () => refreshCapabilities(qc);

  async function toggle(r: ProjectRow) {
    const { error } = await supabase.from("business_projects").update({ published: !r.published }).eq("id", r.id);
    if (error) toast.error(error.message); else refresh();
  }
  async function move(i: number, dir: -1 | 1) {
    const a = rows[i], b = rows[i + dir];
    if (!a || !b) return;
    const [r1, r2] = await Promise.all([
      supabase.from("business_projects").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("business_projects").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    if (r1.error || r2.error) toast.error((r1.error ?? r2.error)!.message); else refresh();
  }
  async function remove(r: ProjectRow) {
    if (!(await confirmDelete(`Delete "${r.name}"?`))) return;
    const { error } = await supabase.from("business_projects").delete().eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Project deleted"); refresh();
  }

  return (
    <AdminShell staff={staff} active={{ kind: "module", module: "capabilities", section: "projects" }} crumbs={["Capabilities", "Projects", vertical?.title ?? ""]}>
      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="space-y-4 border-b border-border p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold">Projects{vertical ? ` — ${vertical.title}` : ""}</h2>
              <p className="text-sm text-muted-foreground">{rows.length} projects · the website lists Ongoing first, then O&amp;M, then Completed</p>
            </div>
            <div className="flex gap-2">
              {slug && <Button variant="outline" asChild><a href={`/businesses/${slug}`} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> View on website</a></Button>}
              <Button onClick={() => setEditing("new")} disabled={!slug} className="neu-btn-gradient border-0"><Plus className="size-4" /> Add project</Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {verticals.map((x) => (
              <button key={x.slug} onClick={() => navigate({ search: { v: x.slug } })}
                className={`rounded-md border px-3 py-1.5 text-sm ${x.slug === slug ? "border-brand-blue bg-brand-blue text-primary-foreground" : "border-border hover:border-brand-blue"}`}>
                {x.title}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
            <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, location or client" /></div>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Project</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Client</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Live</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {shown.map((r) => {
              const i = rows.indexOf(r);
              return (
              <tr key={r.id} className="border-t border-border align-middle">
                <td className="px-4 py-2">
                  <div className="flex gap-1">
                    <button aria-label="Move up" disabled={filtered || i === 0} onClick={() => move(i, -1)} className="rounded border border-border p-1 disabled:opacity-30"><ArrowUp className="size-3.5" /></button>
                    <button aria-label="Move down" disabled={filtered || i === rows.length - 1} onClick={() => move(i, 1)} className="rounded border border-border p-1 disabled:opacity-30"><ArrowDown className="size-3.5" /></button>
                  </div>
                </td>
                <td className="px-4 py-2 font-medium">{r.name}</td>
                <td className="px-4 py-2 text-muted-foreground">{r.location}</td>
                <td className="px-4 py-2 text-muted-foreground">{r.client}</td>
                <td className="px-4 py-2"><span className={`rounded px-2 py-0.5 text-xs font-semibold ${STATUS_CLS[r.status]}`}>{r.status}</span></td>
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
            {!shown.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">{rows.length ? "No projects match the search." : 'No projects yet. Click "Add project".'}</td></tr>}
          </tbody>
        </table>
      </section>
      {editing && slug && <ProjectDialog row={editing === "new" ? null : editing} slug={slug} title={vertical?.title ?? ""} nextOrder={(rows.at(-1)?.sort_order ?? 0) + 1} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
    </AdminShell>
  );
}

function ProjectDialog({ row, slug, title, nextOrder, onClose, onSaved }: { row: ProjectRow | null; slug: string; title: string; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ name: row?.name ?? "", location: row?.location ?? "", client: row?.client ?? "", status: row?.status ?? "Ongoing", published: row?.published ?? true });
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!f.name.trim()) { toast.error("Project name is required"); return; }
    if (!f.location.trim()) { toast.error("Location is required (City, State)"); return; }
    setSaving(true);
    const payload = { name: f.name.trim(), location: f.location.trim(), client: f.client.trim(), status: f.status, published: f.published };
    const { error } = row
      ? await supabase.from("business_projects").update(payload).eq("id", row.id)
      : await supabase.from("business_projects").insert({ ...payload, vertical_slug: slug, sort_order: nextOrder });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(f.published ? "Saved — now live on the website" : "Saved as hidden");
    onSaved();
  }
  return (
    <AdminDialog icon={FolderKanban} wide title={row ? "Edit project" : "Add project"} subtitle={title} onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving} className="neu-btn-gradient border-0">{saving ? "Saving…" : row ? "Save changes" : "Add project"}</Button></>}>
      <FormSection title="Project details">
        <div><Label>Project name *</Label><Input value={f.name} maxLength={200} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Location *</Label>
            <Input value={f.location} maxLength={120} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder="City, State" />
            <p className="mt-1 text-xs text-muted-foreground">The text after the last comma is used for the State filter</p>
          </div>
          <div><Label>Client</Label><Input value={f.client} maxLength={160} onChange={(e) => setF({ ...f, client: e.target.value })} /></div>
          <div>
            <Label>Status *</Label>
            <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as ProjectRow["status"] })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <label className="flex items-center gap-3 text-sm"><Switch checked={f.published} onCheckedChange={(v) => setF({ ...f, published: v })} /> Live on website</label>
      </FormSection>
    </AdminDialog>
  );
}
