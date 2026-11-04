import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminDialog, FileDropzone, FormSection } from "@/components/admin/AdminDialog";
import { confirmDelete } from "@/components/admin/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { refreshHome, removeHomeFile, uploadHomeFile, useHomePreview } from "@/lib/home-highlights-admin";

type Table = "home_hero_slides" | "home_stats" | "home_journey_milestones";
export type Field = { key: string; label: string; required?: boolean; long?: boolean; max?: number; placeholder?: string };
type Row = Record<string, unknown> & { id: string; published: boolean; sort_order: number; image_url?: string | null };

export function HomeListEditor({ table, title, help, itemName, icon, fields, withImage }: {
  table: Table; title: string; help: string; itemName: string; icon: LucideIcon; fields: Field[]; withImage?: boolean;
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const { data: rows = [] } = useQuery({ queryKey: ["admin-" + table], queryFn: async () => {
    const { data, error } = await supabase.from(table).select("*").order("sort_order");
    if (error) throw error;
    return data as unknown as Row[];
  } });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-" + table] }); refreshHome(qc); };
  async function toggle(r: Row) {
    const { error } = await supabase.from(table).update({ published: !r.published }).eq("id", r.id);
    if (error) toast.error(error.message); else refresh();
  }
  async function move(i: number, dir: -1 | 1) {
    const a = rows[i], b = rows[i + dir];
    if (!a || !b) return;
    const [r1, r2] = await Promise.all([
      supabase.from(table).update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from(table).update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    if (r1.error || r2.error) toast.error((r1.error ?? r2.error)!.message); else refresh();
  }
  async function remove(r: Row) {
    if (!(await confirmDelete(`Delete "${String(r[fields[0]!.key] ?? "")}"?`))) return;
    const { error } = await supabase.from(table).delete().eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    await removeHomeFile(r.image_url);
    toast.success(`${itemName} deleted`); refresh();
  }
  const cols = fields.slice(0, 2);
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground">{help}</p>
        </div>
        <Button onClick={() => setEditing("new")} className="neu-btn-gradient border-0"><Plus className="size-4" /> Add {itemName.toLowerCase()}</Button>
      </div>
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr><th className="px-4 py-3">Order</th>{withImage && <th className="px-4 py-3">Photo</th>}{cols.map((c) => <th key={c.key} className="px-4 py-3">{c.label}</th>)}<th className="px-4 py-3">Live</th><th className="px-4 py-3 text-right">Actions</th></tr>
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
              {withImage && <td className="px-4 py-2"><Thumb url={r.image_url ?? null} /></td>}
              {cols.map((c) => <td key={c.key} className="px-4 py-2"><p className="line-clamp-2">{String(r[c.key] ?? "")}</p></td>)}
              <td className="px-4 py-2"><Switch checked={r.published} onCheckedChange={() => toggle(r)} aria-label="Live" /></td>
              <td className="px-4 py-2">
                <div className="flex justify-end gap-2">
                  <button aria-label="Edit" onClick={() => setEditing(r)} className="btn-grad-edit grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Pencil className="size-4" /></button>
                  <button aria-label="Delete" onClick={() => remove(r)} className="btn-grad-danger grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Trash2 className="size-4" /></button>
                </div>
              </td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Nothing here yet. Click "Add {itemName.toLowerCase()}".</td></tr>}
        </tbody>
      </table>
      {editing && <ItemDialog table={table} icon={icon} itemName={itemName} fields={fields} withImage={withImage} row={editing === "new" ? null : editing}
        nextOrder={(rows.at(-1)?.sort_order ?? 0) + 1} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
    </section>
  );
}

function Thumb({ url }: { url: string | null }) {
  const src = useHomePreview(url);
  return src ? <img src={src} alt="" className="h-12 w-20 rounded border border-border object-cover" /> : <div className="grid h-12 w-20 place-items-center rounded border border-dashed border-border text-[10px] text-muted-foreground">No photo</div>;
}

function ItemDialog({ table, icon, itemName, fields, withImage, row, nextOrder, onClose, onSaved }: {
  table: Table; icon: LucideIcon; itemName: string; fields: Field[]; withImage?: boolean | undefined; row: Row | null; nextOrder: number; onClose: () => void; onSaved: () => void;
}) {
  const [f, setF] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((x) => [x.key, String(row?.[x.key] ?? "")])));
  const [published, setPublished] = useState(row?.published ?? true);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const current = useHomePreview(row?.image_url);
  async function save() {
    const missing = fields.find((x) => x.required && !f[x.key]?.trim());
    if (missing) { toast.error(`${missing.label} is required`); return; }
    if (withImage && !file && !row?.image_url) { toast.error("Please upload a photo"); return; }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { published, ...Object.fromEntries(fields.map((x) => [x.key, f[x.key]!.trim()])) };
      if (withImage && file) payload["image_url"] = await uploadHomeFile("top", file);
      const { error } = row
        ? await supabase.from(table).update(payload as never).eq("id", row.id)
        : await supabase.from(table).insert({ ...payload, sort_order: nextOrder } as never);
      if (error) throw new Error(error.message);
      if (file && row?.image_url) await removeHomeFile(row.image_url);
      toast.success(published ? "Saved — now live on the website" : "Saved as hidden");
      onSaved();
    } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
  }
  return (
    <AdminDialog icon={icon} wide title={row ? `Edit ${itemName.toLowerCase()}` : `Add ${itemName.toLowerCase()}`} onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving} className="neu-btn-gradient border-0">{saving ? "Saving…" : row ? "Save changes" : `Add ${itemName.toLowerCase()}`}</Button></>}>
      <FormSection title="Details">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.filter((x) => !x.long).map((x) => (
            <div key={x.key}><Label>{x.label}{x.required ? " *" : ""}</Label><Input maxLength={x.max ?? 200} placeholder={x.placeholder} value={f[x.key]} onChange={(e) => setF({ ...f, [x.key]: e.target.value })} /></div>
          ))}
        </div>
        {fields.filter((x) => x.long).map((x) => (
          <div key={x.key}><Label>{x.label}{x.required ? " *" : ""}</Label><Textarea rows={3} maxLength={x.max ?? 800} placeholder={x.placeholder} value={f[x.key]} onChange={(e) => setF({ ...f, [x.key]: e.target.value })} /></div>
        ))}
        <label className="flex items-center gap-3 text-sm"><Switch checked={published} onCheckedChange={setPublished} /> Live on website</label>
      </FormSection>
      {withImage && (
        <FormSection title={row ? "Photo (upload a new one to replace)" : "Photo *"}>
          {current && !file && <img src={current} alt="Current" className="h-24 max-w-[260px] rounded border border-border object-cover" />}
          <FileDropzone file={file} onFile={setFile} accept="image/png,image/jpeg,image/webp" hint="Wide landscape photo (1920×1080) looks best" />
        </FormSection>
      )}
    </AdminDialog>
  );
}
