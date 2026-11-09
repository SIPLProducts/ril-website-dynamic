import { safeRandomUUID } from "@/lib/uuid";
import { useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { IR_BUCKET, STORAGE_PREFIX } from "@/lib/investor-relations";
import { confirmDelete } from "@/components/admin/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export type CareersTable = "careers_life_sections" | "career_vacancies" | "career_flyers" | "careers_purpose_cards";
type Base = { id: string; title: string; published: boolean; sort_order: number; image_url?: string | null };

/** Uploads an image to private storage and returns its `storage:` reference. */
export async function uploadImage(file: File, folder: string) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `careers/${folder}/${safeRandomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(IR_BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw error;
  return STORAGE_PREFIX + path;
}
export async function removeStored(url: string | null | undefined) {
  if (url?.startsWith(STORAGE_PREFIX)) await supabase.storage.from(IR_BUCKET).remove([url.slice(STORAGE_PREFIX.length)]);
}
export const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
export const toLines = (v: unknown) => (Array.isArray(v) ? (v as unknown[]).filter((x) => typeof x === "string").join("\n") : "");

export function CareersList<R extends Base>({ table, heading, hint, addLabel, columns, renderDialog }: {
  table: CareersTable; heading: string; hint: string; addLabel: string;
  columns: { label: string; cell: (r: R) => ReactNode }[];
  renderDialog: (row: R | null, nextOrder: number, close: () => void, saved: () => void) => ReactNode;
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<R | "new" | null>(null);
  const { data: rows = [] } = useQuery({ queryKey: ["admin", table], queryFn: async () => {
    const { data, error } = await supabase.from(table).select("*").order("sort_order");
    if (error) throw error;
    return data as unknown as R[];
  } });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin", table] }); qc.invalidateQueries({ queryKey: ["careers"] }); };
  async function toggle(r: R) {
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
    if (r1.error || r2.error) toast.error("Could not reorder"); else refresh();
  }
  async function remove(r: R) {
    if (!(await confirmDelete(`Delete "${r.title}"?`))) return;
    const { error } = await supabase.from(table).delete().eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    await removeStored(r.image_url);
    toast.success("Deleted"); refresh();
  }
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 className="font-display text-xl font-bold">{heading}</h2>
          <p className="text-sm text-muted-foreground">{rows.length} items · {hint}</p>
        </div>
        <Button onClick={() => setEditing("new")} className="neu-btn-gradient border-0"><Plus className="size-4" /> {addLabel}</Button>
      </div>
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr><th className="px-4 py-3">Order</th>{columns.map((c) => <th key={c.label} className="px-4 py-3">{c.label}</th>)}<th className="px-4 py-3">Live</th><th className="px-4 py-3 text-right">Actions</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className="border-t border-border align-top">
              <td className="px-4 py-2"><div className="flex gap-1">
                <button aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="rounded border border-border p-1 disabled:opacity-30"><ArrowUp className="size-3.5" /></button>
                <button aria-label="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)} className="rounded border border-border p-1 disabled:opacity-30"><ArrowDown className="size-3.5" /></button>
              </div></td>
              {columns.map((c) => <td key={c.label} className="max-w-md px-4 py-2">{c.cell(r)}</td>)}
              <td className="px-4 py-2"><Switch checked={r.published} onCheckedChange={() => toggle(r)} aria-label="Live" /></td>
              <td className="px-4 py-2"><div className="flex justify-end gap-2">
                <button aria-label="Edit" onClick={() => setEditing(r)} className="btn-grad-edit grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Pencil className="size-4" /></button>
                <button aria-label="Delete" onClick={() => remove(r)} className="btn-grad-danger grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Trash2 className="size-4" /></button>
              </div></td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={columns.length + 3} className="px-4 py-10 text-center text-muted-foreground">Nothing added yet.</td></tr>}
        </tbody>
      </table>
      {editing && renderDialog(editing === "new" ? null : editing, (rows.at(-1)?.sort_order ?? 0) + 1, () => setEditing(null), () => { setEditing(null); refresh(); })}
    </section>
  );
}
