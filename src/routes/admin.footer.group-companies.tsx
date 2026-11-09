import { safeRandomUUID } from "@/lib/uuid";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Building2, ExternalLink, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getStaff } from "@/lib/admin-auth";
import { IR_BUCKET, STORAGE_PREFIX } from "@/lib/investor-relations";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDialog, FileDropzone, FormSection } from "@/components/admin/AdminDialog";
import { confirmDelete } from "@/components/admin/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/footer/group-companies")({
  ssr: false,
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  component: Page,
});

type Company = { id: string; name: string; url: string | null; logo_url: string | null; published: boolean; show_logo: boolean; show_name: boolean; show_link: boolean; sort_order: number };

async function uploadLogo(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `footer/group-companies/${safeRandomUUID()}.${ext}`;
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
const refreshKeys = (qc: ReturnType<typeof useQueryClient>) => { qc.invalidateQueries({ queryKey: ["admin-group-companies"] }); qc.invalidateQueries({ queryKey: ["admin-footer-settings"] }); qc.invalidateQueries({ queryKey: ["footer"] }); };

function Page() {
  const { staff } = Route.useRouteContext();
  return (
    <AdminShell staff={staff} active={{ kind: "module", module: "footer", section: "group-companies" }} crumbs={["Footer", "Group Companies"]}>
      <div className="space-y-6">
        <HeadingEditor />
        <CompanyList />
      </div>
    </AdminShell>
  );
}

function HeadingEditor() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-footer-settings"], queryFn: async () => {
    const { data, error } = await supabase.from("footer_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    return data;
  } });
  const [f, setF] = useState({ group_eyebrow: "", group_title: "", group_subtitle: "" });
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setF({ group_eyebrow: data.group_eyebrow, group_title: data.group_title, group_subtitle: data.group_subtitle }); }, [data]);
  async function save() {
    if (!f.group_title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    const { error } = await supabase.from("footer_settings").update({ group_eyebrow: f.group_eyebrow.trim(), group_title: f.group_title.trim(), group_subtitle: f.group_subtitle.trim() }).eq("id", 1);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved — now live on the website footer"); refreshKeys(qc);
  }
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Ramky Group — section heading</h2>
          <p className="text-sm text-muted-foreground">The "Group Companies" strip with logos near the bottom of every website page.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><a href="/#group-companies-heading" target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> View on website</a></Button>
          <Button onClick={save} disabled={saving} className="neu-btn-gradient border-0"><Save className="size-4" /> {saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><Label>Small heading</Label><Input maxLength={40} value={f.group_eyebrow} onChange={(e) => setF({ ...f, group_eyebrow: e.target.value })} placeholder="Ramky Group" /></div>
        <div><Label>Title</Label><Input maxLength={80} value={f.group_title} onChange={(e) => setF({ ...f, group_title: e.target.value })} placeholder="Group Companies" /></div>
        <div><Label>Right side text</Label><Input maxLength={80} value={f.group_subtitle} onChange={(e) => setF({ ...f, group_subtitle: e.target.value })} placeholder="Visit our group companies" /></div>
      </div>
    </section>
  );
}

function Logo({ url, name }: { url: string | null; name: string }) {
  const src = usePreview(url);
  return src ? <img src={src} alt={name} className="h-12 w-24 rounded border border-border bg-background object-contain p-1" /> : <div className="grid h-12 w-24 place-items-center rounded border border-dashed border-border text-[10px] text-muted-foreground">No logo</div>;
}

function CompanyList() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Company | "new" | null>(null);
  const { data: rows = [] } = useQuery({ queryKey: ["admin-group-companies"], queryFn: async () => {
    const { data, error } = await supabase.from("group_companies").select("id,name,url,logo_url,show_logo,show_name,show_link,published,sort_order").order("sort_order");
    if (error) throw error;
    return data as Company[];
  } });
  const refresh = () => refreshKeys(qc);
  async function toggle(r: Company) {
    const { error } = await supabase.from("group_companies").update({ published: !r.published }).eq("id", r.id);
    if (error) toast.error(error.message); else refresh();
  }
  async function move(i: number, dir: -1 | 1) {
    const a = rows[i], b = rows[i + dir];
    if (!a || !b) return;
    const [r1, r2] = await Promise.all([
      supabase.from("group_companies").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("group_companies").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    if (r1.error || r2.error) toast.error("Could not reorder"); else refresh();
  }
  async function remove(r: Company) {
    if (!(await confirmDelete(`Delete "${r.name}"?`, "The company and its logo will be removed from the website footer."))) return;
    const { error } = await supabase.from("group_companies").delete().eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    await removeStored(r.logo_url);
    toast.success("Company deleted"); refresh();
  }
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 className="font-display text-xl font-bold">Group companies</h2>
          <p className="text-sm text-muted-foreground">{rows.length} companies · each shows as a logo card that opens the company website in a new tab</p>
        </div>
        <Button onClick={() => setEditing("new")} className="neu-btn-gradient border-0"><Plus className="size-4" /> Add company</Button>
      </div>
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Logo</th><th className="px-4 py-3">Company name</th><th className="px-4 py-3">Website</th><th className="px-4 py-3">Live</th><th className="px-4 py-3 text-right">Actions</th></tr>
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
              <td className="px-4 py-2"><Logo url={r.logo_url} name={r.name} /></td>
              <td className="px-4 py-2 font-medium">{r.name}</td>
              <td className="px-4 py-2">{r.url ? <a href={r.url} target="_blank" rel="noreferrer" className="text-brand-orange hover:underline">{r.url}</a> : "—"}</td>
              <td className="px-4 py-2"><Switch checked={r.published} onCheckedChange={() => toggle(r)} aria-label="Live" /></td>
              <td className="px-4 py-2">
                <div className="flex justify-end gap-2">
                  <button aria-label="Edit" onClick={() => setEditing(r)} className="btn-grad-edit grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Pencil className="size-4" /></button>
                  <button aria-label="Delete" onClick={() => remove(r)} className="btn-grad-danger grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Trash2 className="size-4" /></button>
                </div>
              </td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No group companies yet. Click "Add company".</td></tr>}
        </tbody>
      </table>
      {editing && <CompanyDialog row={editing === "new" ? null : editing} nextOrder={(rows.at(-1)?.sort_order ?? 0) + 1} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
    </section>
  );
}

function CompanyDialog({ row, nextOrder, onClose, onSaved }: { row: Company | null; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(row?.name ?? "");
  const [url, setUrl] = useState(row?.url ?? "");
  const [published, setPublished] = useState(row?.published ?? true);
  const [showLogo, setShowLogo] = useState(row?.show_logo ?? true);
  const [showName, setShowName] = useState(row?.show_name ?? false);
  const [showLink, setShowLink] = useState(row?.show_link ?? true);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const current = usePreview(row?.logo_url ?? null);
  async function save() {
    if (!name.trim()) { toast.error("Company name is required"); return; }
    if (url.trim() && !/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(url.trim())) { toast.error("Website must be a full link starting with https://"); return; }
    setSaving(true);
    try {
      let logo_url = row?.logo_url ?? null;
      if (file) logo_url = await uploadLogo(file);
      const payload = { name: name.trim(), url: url.trim() || null, published, logo_url, show_logo: showLogo, show_name: showName, show_link: showLink };
      const { error } = row
        ? await supabase.from("group_companies").update(payload).eq("id", row.id)
        : await supabase.from("group_companies").insert({ ...payload, sort_order: nextOrder });
      if (error) throw new Error(error.message);
      if (file && row?.logo_url) await removeStored(row.logo_url);
      toast.success(published ? "Saved — now live on the website footer" : "Saved as hidden");
      onSaved();
    } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
  }
  return (
    <AdminDialog icon={Building2} title={row ? "Edit group company" : "Add group company"} subtitle="Shown as a logo card in the website footer" onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving} className="neu-btn-gradient border-0">{saving ? "Saving…" : row ? "Save changes" : "Add company"}</Button></>}>
      <FormSection title="Company details">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Company name *</Label><Input value={name} maxLength={120} onChange={(e) => setName(e.target.value)} placeholder="e.g. MILES City" /></div>
          <div><Label>Website link</Label><Input value={url} maxLength={300} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" /></div>
        </div>
        <label className="flex items-center gap-3 text-sm"><Switch checked={published} onCheckedChange={setPublished} /> Live on website</label>
        <div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-widest text-brand-blue">Display on website</p><div className="flex flex-wrap gap-6"><label className="flex items-center gap-2 text-sm"><Switch checked={showLogo} onCheckedChange={setShowLogo} /> Show logo</label><label className="flex items-center gap-2 text-sm"><Switch checked={showName} onCheckedChange={setShowName} /> Show company name</label><label className="flex items-center gap-2 text-sm"><Switch checked={showLink} onCheckedChange={setShowLink} /> Link to website</label></div></div>
      </FormSection>
      <FormSection title={row ? "Logo (upload a new one to replace)" : "Logo"}>
        {current && !file && <img src={current} alt="Current logo" className="h-16 max-w-[200px] rounded border border-border bg-background object-contain p-2" />}
        <FileDropzone file={file} onFile={setFile} accept="image/png,image/jpeg,image/svg+xml,image/webp" hint="PNG, JPG, SVG or WEBP — a transparent background looks best" />
      </FormSection>
    </AdminDialog>
  );
}
