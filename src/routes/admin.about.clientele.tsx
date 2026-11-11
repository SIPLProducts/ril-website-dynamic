import { safeRandomUUID } from "@/lib/uuid";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Building2, ImagePlus, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getStaff } from "@/lib/admin-auth";
import { IR_BUCKET, STORAGE_PREFIX } from "@/lib/investor-relations";
import { clientImageError, imageFileError } from "@/lib/admin-validation";
import { AdminShell } from "@/components/admin/AdminShell";
import { AboutContentEditor } from "@/components/admin/AboutContentEditor";
import { AdminDialog, FieldError, FileDropzone, FormSection } from "@/components/admin/AdminDialog";
import { confirmDelete } from "@/components/admin/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const SLUG = "clientele";

export const Route = createFileRoute("/admin/about/clientele")({
  ssr: false,
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  component: Page,
});

type ClientRow = { id: string; image_url: string | null; description: string; published: boolean; sort_order: number };

async function uploadImage(file: File, folder: string) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `about/${folder}/${safeRandomUUID()}.${ext}`;
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
  return (
    <AdminShell staff={staff} active={{ kind: "about", section: SLUG }} crumbs={["About Ramky", "Clientele"]}>
      <div className="space-y-6">
        <AboutContentEditor slug={SLUG} label="Clientele" />
        <ClientList />
      </div>
    </AdminShell>
  );
}

function Thumb({ url }: { url: string | null }) {
  const src = usePreview(url);
  return <div className="grid h-12 w-20 place-items-center overflow-hidden rounded border border-border bg-background">{src ? <img src={src} alt="" className="max-h-full max-w-full object-contain" /> : <span className="text-[10px] text-muted-foreground">No logo</span>}</div>;
}

function ClientList() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ClientRow | "new" | null>(null);
  const { data: rows = [] } = useQuery({ queryKey: ["admin-clientele"], queryFn: async () => {
    const { data, error } = await supabase.from("clientele").select("id,image_url,description,published,sort_order").order("sort_order");
    if (error) throw error;
    return data as ClientRow[];
  } });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-clientele"] }); qc.invalidateQueries({ queryKey: ["about-data", SLUG] }); };

  async function toggle(r: ClientRow) {
    const { error } = await supabase.from("clientele").update({ published: !r.published }).eq("id", r.id);
    if (error) toast.error(error.message); else refresh();
  }
  async function move(i: number, dir: -1 | 1) {
    const a = rows[i], b = rows[i + dir];
    if (!a || !b) return;
    const [r1, r2] = await Promise.all([
      supabase.from("clientele").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("clientele").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    if (r1.error || r2.error) toast.error("Could not reorder"); else refresh();
  }
  async function remove(r: ClientRow) {
    if (!(await confirmDelete(`Delete "${r.description || "this client"}"?`))) return;
    const { error } = await supabase.from("clientele").delete().eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    await removeStored(r.image_url);
    toast.success("Client deleted"); refresh();
  }

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 className="font-display text-xl font-bold">Our Clientele</h2>
          <p className="text-sm text-muted-foreground">{rows.length} clients · image required, description optional</p>
        </div>
        <Button onClick={() => setEditing("new")} className="neu-btn-gradient border-0"><Plus className="size-4" /> Add Client</Button>
      </div>
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Logo</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Live</th><th className="px-4 py-3 text-right">Actions</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className="border-t border-border">
              <td className="px-4 py-2">
                <div className="flex gap-1">
                  <button aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="rounded border border-border p-1 disabled:opacity-30"><ArrowUp className="size-3.5" /></button>
                  <button aria-label="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)} className="rounded border border-border p-1 disabled:opacity-30"><ArrowDown className="size-3.5" /></button>
                </div>
              </td>
              <td className="px-4 py-2"><Thumb url={r.image_url} /></td>
              <td className="px-4 py-2 font-medium">{r.description || <span className="text-muted-foreground">—</span>}</td>
              <td className="px-4 py-2"><Switch checked={r.published} onCheckedChange={() => toggle(r)} aria-label="Published" /></td>
              <td className="px-4 py-2">
                <div className="flex justify-end gap-2">
                  <button aria-label="Edit" onClick={() => setEditing(r)} className="btn-grad-edit grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Pencil className="size-4" /></button>
                  <button aria-label="Delete" onClick={() => remove(r)} className="btn-grad-danger grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Trash2 className="size-4" /></button>
                </div>
              </td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No clients yet.</td></tr>}
        </tbody>
      </table>
      {editing && <ClientDialog row={editing === "new" ? null : editing} nextOrder={(rows.at(-1)?.sort_order ?? 0) + 1} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
    </section>
  );
}

function ClientDialog({ row, nextOrder, onClose, onSaved }: { row: ClientRow | null; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState(row?.description ?? "");
  const [published, setPublished] = useState(row?.published ?? true);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const preview = usePreview(row?.image_url ?? null);

  async function save() {
    const e = clientImageError(file, row?.image_url ?? null);
    setErr(e);
    if (e) return;
    setSaving(true);
    try {
      const image_url = file ? await uploadImage(file, "clients") : row!.image_url;
      const payload = { image_url, description: description.trim(), published };
      const { error } = row
        ? await supabase.from("clientele").update(payload).eq("id", row.id)
        : await supabase.from("clientele").insert({ ...payload, sort_order: nextOrder });
      if (error) throw new Error(error.message);
      if (file && row?.image_url) await removeStored(row.image_url);
      toast.success(published ? "Saved — now live on the website" : "Saved as draft");
      onSaved();
    } catch (x) { toast.error(x instanceof Error ? x.message : "Save failed"); } finally { setSaving(false); }
  }

  return (
    <AdminDialog icon={Building2} title={row ? "Edit client" : "Add client"} subtitle="Shown in Our Clientele on the website" onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving} className="neu-btn-gradient border-0">{saving ? "Saving…" : row ? "Save changes" : "Add client"}</Button></>}>
      <FormSection title="Client logo">
        {preview && !file && <img src={preview} alt="" className="h-20 w-auto rounded border border-border bg-background object-contain p-2" />}
        <FileDropzone file={file} onFile={(f) => { setFile(f); setErr(null); }} accept="image/png,image/jpeg,image/webp,image/svg+xml" hint={`PNG, JPG, WebP or SVG, up to 5 MB${row?.image_url ? " — leave empty to keep current" : " — required"}`} />
        <FieldError msg={err ?? undefined} />
      </FormSection>
      <FormSection title="Details">
        <div><Label>Description <span className="text-muted-foreground">(optional)</span></Label><Textarea rows={2} maxLength={300} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. National Highways Authority of India (NHAI)" /></div>
        <label className="flex items-center gap-3 text-sm"><Switch checked={published} onCheckedChange={setPublished} /> Live on website</label>
      </FormSection>
    </AdminDialog>
  );
}
