import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Award, ChevronDown, ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getStaff } from "@/lib/admin-auth";
import { IR_BUCKET, STORAGE_PREFIX } from "@/lib/investor-relations";
import { imageFileError } from "@/lib/admin-validation";
import { adminFyYears, fyDateBounds, fyFromEnd, fyOf, isFutureDate, pastFyStarts } from "@/lib/fiscal-year";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDialog, FieldError, FileDropzone, FormSection } from "@/components/admin/AdminDialog";
import { confirmDelete } from "@/components/admin/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/accolades")({
  ssr: false,
  head: () => ({ meta: [{ title: "Accolades | RIL Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  component: Page,
});

type Row = {
  id: string; award_date: string; title: string; category: string | null; organisation: string; project: string | null;
  description: string | null; image_url: string | null; alt_text: string | null; published: boolean; sort_order: number;
};

const today = () => new Date().toISOString().slice(0, 10);
/** A default date inside the given FY: today if it's the current FY, else 31 March of that FY. */
const dateInFy = (endYear: number) => (fyOf(today()).endYear === endYear ? today() : `${endYear}-03-31`);

async function uploadImage(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `accolades/${crypto.randomUUID()}.${ext}`;
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
function Thumb({ url }: { url: string | null }) {
  const src = usePreview(url);
  return (
    <div className="grid h-12 w-16 place-items-center overflow-hidden rounded border border-border bg-surface">
      {src ? <img src={src} alt="" className="h-full w-full object-contain" /> : <ImagePlus className="size-4 text-muted-foreground" />}
    </div>
  );
}

function Page() {
  const { staff } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({ queryKey: ["admin-accolades"], queryFn: async () => {
    const { data, error } = await supabase.from("accolades").select("*").order("sort_order");
    if (error) throw error;
    return data as Row[];
  } });
  const years = adminFyYears(rows.map((r) => r.award_date));
  const [open, setOpen] = useState<Set<number>>(new Set());
  useEffect(() => { if (years[0] && !open.size) setOpen(new Set([years[0]])); }, [years[0]]); // eslint-disable-line react-hooks/exhaustive-deps
  const [editing, setEditing] = useState<{ row: Row | null; fy: number; pick?: boolean } | null>(null);
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-accolades"] }); qc.invalidateQueries({ queryKey: ["accolades-public"] }); };

  async function toggleLive(r: Row) {
    const { error } = await supabase.from("accolades").update({ published: !r.published }).eq("id", r.id);
    if (error) toast.error(error.message); else refresh();
  }
  async function move(list: Row[], i: number, dir: -1 | 1) {
    const a = list[i], b = list[i + dir];
    if (!a || !b) return;
    const oa = a.sort_order === b.sort_order ? i + dir : b.sort_order, ob = a.sort_order === b.sort_order ? i : a.sort_order;
    const [r1, r2] = await Promise.all([
      supabase.from("accolades").update({ sort_order: oa }).eq("id", a.id),
      supabase.from("accolades").update({ sort_order: ob }).eq("id", b.id),
    ]);
    if (r1.error || r2.error) toast.error("Could not reorder"); else refresh();
  }
  async function remove(r: Row) {
    if (!(await confirmDelete(`Delete "${r.title}"?`))) return;
    const { error } = await supabase.from("accolades").delete().eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    await removeStored(r.image_url);
    toast.success("Award deleted"); refresh();
  }

  return (
    <AdminShell staff={staff} active={{ kind: "module", module: "accolades", section: "awards" }} crumbs={["Accolades", "Awards"]}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Accolades</h1>
          <p className="text-sm text-muted-foreground">One card per financial year (1 April – 31 March). A new year's card appears automatically after 31 March.</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setEditing({ row: null, fy: pastFyStarts()[0] + 1, pick: true })}><Plus className="size-4" /> Add past year</Button>
      </div>
      <div className="space-y-4">
        {years.map((y) => {
          const fy = fyFromEnd(y);
          const list = rows.filter((r) => fyOf(r.award_date).endYear === y);
          const isOpen = open.has(y);
          return (
            <section key={y} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between gap-3 p-4">
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen((p) => { const n = new Set(p); if (n.has(y)) n.delete(y); else n.add(y); return n; })} className="flex flex-1 items-center gap-3 text-left">
                  <ChevronDown className={`size-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  <span className="font-display text-lg font-bold">FY {fy.label}</span>
                  <span className="text-xs text-muted-foreground">{list.length} award{list.length === 1 ? "" : "s"}</span>
                </button>
                <Button onClick={() => setEditing({ row: null, fy: y })} className="neu-btn-gradient border-0"><Plus className="size-4" /> Add award</Button>
              </div>
              {isOpen && <div className="border-t border-border bg-surface/50 px-4 py-2 text-xs text-muted-foreground">From {fy.range.replace(" to ", " to ")}</div>}
              {isOpen && (
                <table className="w-full border-t border-border text-sm">
                  <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Photo</th><th className="px-4 py-3">Award</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Live</th><th className="px-4 py-3 text-right">Actions</th></tr>
                  </thead>
                  <tbody>
                    {list.map((r, i) => (
                      <tr key={r.id} className="border-t border-border">
                        <td className="px-4 py-2">
                          <div className="flex gap-1">
                            <button aria-label="Move up" disabled={i === 0} onClick={() => move(list, i, -1)} className="rounded border border-border p-1 disabled:opacity-30"><ArrowUp className="size-3.5" /></button>
                            <button aria-label="Move down" disabled={i === list.length - 1} onClick={() => move(list, i, 1)} className="rounded border border-border p-1 disabled:opacity-30"><ArrowDown className="size-3.5" /></button>
                          </div>
                        </td>
                        <td className="px-4 py-2"><Thumb url={r.image_url} /></td>
                        <td className="px-4 py-2"><div className="font-medium">{r.title}</div><div className="text-xs text-muted-foreground">{r.organisation}</div></td>
                        <td className="whitespace-nowrap px-4 py-2">{r.award_date.split("-").reverse().join("-")}</td>
                        <td className="px-4 py-2"><Switch checked={r.published} onCheckedChange={() => toggleLive(r)} aria-label="Live" /></td>
                        <td className="px-4 py-2">
                          <div className="flex justify-end gap-2">
                            <button aria-label="Edit" onClick={() => setEditing({ row: r, fy: y })} className="btn-grad-edit grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Pencil className="size-4" /></button>
                            <button aria-label="Delete" onClick={() => remove(r)} className="btn-grad-danger grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Trash2 className="size-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!list.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No awards in FY {fy.label} yet. Click "Add award" to add the first one.</td></tr>}
                  </tbody>
                </table>
              )}
            </section>
          );
        })}
      </div>
      {editing && (
        <AwardDialog row={editing.row} defaultDate={dateInFy(editing.fy)} fyEnd={editing.row ? undefined : editing.fy} pickYear={editing.pick}
          nextOrder={Math.max(0, ...rows.filter((r) => fyOf(r.award_date).endYear === editing.fy).map((r) => r.sort_order)) + 1}
          onClose={() => setEditing(null)} onSaved={(d) => { setEditing(null); setOpen((p) => new Set(p).add(fyOf(d).endYear)); refresh(); }} />
      )}
    </AdminShell>
  );
}

function AwardDialog({ row, defaultDate, fyEnd, pickYear, nextOrder, onClose, onSaved }: { row: Row | null; defaultDate: string; fyEnd?: number; pickYear?: boolean; nextOrder: number; onClose: () => void; onSaved: (date: string) => void }) {
  const [yearEnd, setYearEnd] = useState(fyEnd);
  const bounds = yearEnd ? fyDateBounds(yearEnd) : { min: undefined, max: new Date().toISOString().slice(0, 10) };
  const [f, setF] = useState({
    award_date: row?.award_date ?? defaultDate, title: row?.title ?? "", category: row?.category ?? "", organisation: row?.organisation ?? "",
    project: row?.project ?? "", description: row?.description ?? "", alt_text: row?.alt_text ?? "", published: row?.published ?? true,
    image_url: row?.image_url ?? null,
  });
  const [file, setFile] = useState<File | null>(null);
  const [errs, setErrs] = useState<{ award_date?: string; title?: string; organisation?: string; image?: string }>({});
  const [saving, setSaving] = useState(false);
  const preview = usePreview(f.image_url);

  async function save() {
    const e: { award_date?: string; title?: string; organisation?: string; image?: string } = {};
    if (!f.award_date) e.award_date = "Award date is required";
    else if (isFutureDate(f.award_date)) e.award_date = "Award date can't be in the future";
    else if (yearEnd && fyOf(f.award_date).endYear !== yearEnd) e.award_date = `Date must be within FY ${yearEnd - 1} (${fyFromEnd(yearEnd).range})`;
    if (!f.title.trim()) e.title = "Award title is required";
    if (!f.organisation.trim()) e.organisation = "Awarding organisation is required";
    const imgErr = imageFileError(file, false);
    if (imgErr) e.image = imgErr;
    setErrs(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      const image_url = file ? await uploadImage(file) : f.image_url;
      const nul = (s: string) => (s.trim() ? s.trim() : null);
      const payload = {
        award_date: f.award_date, title: f.title.trim(), category: nul(f.category), organisation: f.organisation.trim(),
        project: nul(f.project), description: nul(f.description), alt_text: nul(f.alt_text), published: f.published, image_url,
      };
      const { error } = row
        ? await supabase.from("accolades").update(payload).eq("id", row.id)
        : await supabase.from("accolades").insert({ ...payload, sort_order: nextOrder });
      if (error) throw new Error(error.message);
      if (row?.image_url && row.image_url !== image_url) await removeStored(row.image_url);
      toast.success(f.published ? `Saved in FY ${fyOf(f.award_date).label} — now live on the website` : "Saved as draft");
      onSaved(f.award_date);
    } catch (x) { toast.error(x instanceof Error ? x.message : "Save failed"); } finally { setSaving(false); }
  }

  const fy = f.award_date ? fyOf(f.award_date) : null;
  return (
    <AdminDialog icon={Award} title={row ? "Edit award" : "Add award"} subtitle={fy ? `FY ${fy.label} (${fy.range})` : "Shown on the Accolades page"} onClose={onClose} xwide
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving} className="neu-btn-gradient border-0">{saving ? "Saving…" : row ? "Save changes" : "Add award"}</Button></>}>
      <FormSection title="Award details">
        {pickYear && (
          <div className="max-w-xs"><Label>Financial year *</Label>
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={yearEnd}
              onChange={(e) => { const y = Number(e.target.value); setYearEnd(y); setF({ ...f, award_date: `${y}-03-31` }); }}>
              {pastFyStarts().map((s) => <option key={s} value={s + 1}>FY {s} ({fyFromEnd(s + 1).range})</option>)}
            </select>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <div><Label>Award date *</Label><Input type="date" min={bounds.min} max={bounds.max} value={f.award_date} onChange={(e) => setF({ ...f, award_date: e.target.value })} /><FieldError msg={errs.award_date} /></div>
          <div><Label>Award title *</Label><Input maxLength={200} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /><FieldError msg={errs.title} /></div>
          <div><Label>Category</Label><Input maxLength={120} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} /></div>
          <div><Label>Awarding organisation *</Label><Input maxLength={200} value={f.organisation} onChange={(e) => setF({ ...f, organisation: e.target.value })} /><FieldError msg={errs.organisation} /></div>
          <div><Label>Project / initiative</Label><Input maxLength={200} value={f.project} onChange={(e) => setF({ ...f, project: e.target.value })} /></div>
          <div><Label>Photo description (for screen readers)</Label><Input maxLength={200} value={f.alt_text} onChange={(e) => setF({ ...f, alt_text: e.target.value })} /></div>
        </div>
        <div><Label>Description</Label><Textarea rows={3} maxLength={1000} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
      </FormSection>
      <FormSection title="Certificate / award photo (optional)">
        {preview && !file && (
          <div className="flex items-center gap-3">
            <img src={preview} alt="" className="h-20 w-auto rounded border border-border bg-background object-contain p-1" />
            <Button type="button" size="sm" variant="outline" onClick={() => setF({ ...f, image_url: null })}><Trash2 className="size-4" /> Remove photo</Button>
          </div>
        )}
        <FileDropzone file={file} onFile={(x) => { setFile(x); setErrs({ ...errs, image: "" }); }} accept="image/png,image/jpeg,image/webp" hint="PNG, JPG or WebP, up to 5 MB" />
        <FieldError msg={errs.image || undefined} />
        <label className="flex items-center gap-3 text-sm"><Switch checked={f.published} onCheckedChange={(v) => setF({ ...f, published: v })} /> Live on website</label>
      </FormSection>
    </AdminDialog>
  );
}
