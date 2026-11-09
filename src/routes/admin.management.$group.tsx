import { safeRandomUUID } from "@/lib/uuid";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, UserRound, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { getStaff } from "@/lib/admin-auth";
import { IR_BUCKET, STORAGE_PREFIX } from "@/lib/investor-relations";
import { imageFileError } from "@/lib/admin-validation";
import { fromParagraphs, getMgmtGroup, MGMT_GROUPS, slugifyName, toParagraphs } from "@/lib/management";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDialog, FieldError, FileDropzone, FormSection } from "@/components/admin/AdminDialog";
import { confirmDelete } from "@/components/admin/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/management/$group")({
  ssr: false,
  beforeLoad: async ({ params }) => {
    if (!getMgmtGroup(params.group)) throw notFound();
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  component: Page,
  notFoundComponent: () => <div className="p-10">Page not found.</div>,
});

type Row = { id: string; grp: string; slug: string; name: string; designation: string; image_url: string | null; sections: Record<string, string[]>; published: boolean; sort_order: number };

async function uploadImage(file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `management/${safeRandomUUID()}.${ext}`;
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
    <div className="grid h-14 w-11 place-items-center overflow-hidden rounded border border-border bg-surface">
      {src ? <img src={src} alt="" className="h-full w-full object-cover object-top" /> : <UserRound className="size-5 text-muted-foreground" />}
    </div>
  );
}

function Page() {
  const { staff } = Route.useRouteContext();
  const { group } = Route.useParams();
  const g = getMgmtGroup(group)!;
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const { data: rows = [] } = useQuery({
    queryKey: ["admin-management", group],
    queryFn: async () => {
      const { data, error } = await supabase.from("management_people").select("*").eq("grp", group).order("sort_order");
      if (error) throw error;
      return data as unknown as Row[];
    },
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-management", group] }); qc.invalidateQueries({ queryKey: ["management"] }); };

  async function toggle(r: Row) {
    const { error } = await supabase.from("management_people").update({ published: !r.published }).eq("id", r.id);
    if (error) toast.error(error.message); else refresh();
  }
  async function move(i: number, dir: -1 | 1) {
    const a = rows[i], b = rows[i + dir];
    if (!a || !b) return;
    const [r1, r2] = await Promise.all([
      supabase.from("management_people").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("management_people").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    if (r1.error || r2.error) toast.error("Could not reorder"); else refresh();
  }
  async function remove(r: Row) {
    if (!(await confirmDelete(`Delete "${r.name}"?`))) return;
    const { error } = await supabase.from("management_people").delete().eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    await removeStored(r.image_url);
    toast.success("Deleted"); refresh();
  }

  return (
    <AdminShell staff={staff} active={{ kind: "module", module: "management", section: group }} crumbs={["Management", g.label]}>
      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border p-5">
          <div>
            <h2 className="font-display text-xl font-bold">{g.label}</h2>
            <p className="text-sm text-muted-foreground">{rows.length} people · {rows.filter((r) => r.published).length} live on website</p>
          </div>
          <Button onClick={() => setEditing("new")} className="neu-btn-gradient border-0"><Plus className="size-4" /> Add Person</Button>
        </div>
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Photo</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Designation</th><th className="px-4 py-3">Live</th><th className="px-4 py-3 text-right">Actions</th></tr>
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
                <td className="px-4 py-2 font-medium">{r.name}</td>
                <td className="px-4 py-2 text-muted-foreground">{r.designation}</td>
                <td className="px-4 py-2"><Switch checked={r.published} onCheckedChange={() => toggle(r)} aria-label="Live" /></td>
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-2">
                    <button aria-label="Edit" onClick={() => setEditing(r)} className="btn-grad-edit grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Pencil className="size-4" /></button>
                    <button aria-label="Delete" onClick={() => remove(r)} className="btn-grad-danger grid size-8 place-items-center rounded-md shadow-sm hover:opacity-90"><Trash2 className="size-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No people yet.</td></tr>}
          </tbody>
        </table>
      </section>
      {editing && (
        <PersonDialog key={editing === "new" ? "new" : editing.id} group={group} row={editing === "new" ? null : editing} taken={rows.filter((r) => editing === "new" || r.id !== editing.id).map((r) => r.slug)}
          nextOrder={(rows.at(-1)?.sort_order ?? 0) + 1} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />
      )}
    </AdminShell>
  );
}

function PersonDialog({ group, row, taken, nextOrder, onClose, onSaved }: { group: string; row: Row | null; taken: string[]; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const g = MGMT_GROUPS.find((x) => x.key === group)!;
  const [name, setName] = useState(row?.name ?? "");
  const [designation, setDesignation] = useState(row?.designation ?? "");
  const [slug, setSlug] = useState(row?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!row);
  const [published, setPublished] = useState(row?.published ?? true);
  const [texts, setTexts] = useState<Record<string, string>>(() => Object.fromEntries(g.sections.map((s) => [s.key, fromParagraphs(row?.sections?.[s.key])])));
  const [file, setFile] = useState<File | null>(null);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const preview = usePreview(row?.image_url ?? null);

  async function save() {
    const finalSlug = slugifyName(slug || name);
    const e: Record<string, string> = {};
    if (!name.trim()) e["name"] = "Name is required";
    if (!designation.trim()) e["designation"] = "Designation is required";
    if (!finalSlug) e["slug"] = "Web address is required";
    else if (taken.includes(finalSlug)) e["slug"] = "Another person already uses this web address";
    const imgErr = imageFileError(file, false);
    if (imgErr) e["image"] = imgErr;
    setErrs(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      const image_url = file ? await uploadImage(file) : row?.image_url ?? null;
      const sections = Object.fromEntries(g.sections.map((s) => [s.key, toParagraphs(texts[s.key] ?? "")]));
      const payload = { grp: group, slug: finalSlug, name: name.trim(), designation: designation.trim(), image_url, published, sections: sections as unknown as Json };
      const { error } = row
        ? await supabase.from("management_people").update(payload).eq("id", row.id)
        : await supabase.from("management_people").insert({ ...payload, sort_order: nextOrder });
      if (error) throw new Error(error.message);
      if (file && row?.image_url) await removeStored(row.image_url);
      toast.success(published ? "Saved — now live on the website" : "Saved as hidden");
      onSaved();
    } catch (x) { toast.error(x instanceof Error ? x.message : "Save failed"); } finally { setSaving(false); }
  }

  return (
    <AdminDialog icon={UsersRound} title={row ? `Edit ${row.name}` : `Add to ${g.label}`} subtitle={`Shown in ${g.label} on the website`} onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving} className="neu-btn-gradient border-0">{saving ? "Saving…" : row ? "Save changes" : "Add person"}</Button></>}>
      <FormSection title="Photo">
        <div className="grid gap-3 sm:grid-cols-[6rem_1fr]">
          <div className="grid h-28 w-24 place-items-center overflow-hidden rounded border border-border bg-surface">
            {file ? <img src={URL.createObjectURL(file)} alt="" className="h-full w-full object-cover object-top" /> : preview ? <img src={preview} alt="" className="h-full w-full object-cover object-top" /> : <UserRound className="size-7 text-muted-foreground" />}
          </div>
          <div>
            <FileDropzone file={file} onFile={(f) => { setFile(f); setErrs((x) => ({ ...x, image: "" })); }} accept="image/png,image/jpeg,image/webp" hint={`PNG, JPG or WebP, up to 5 MB${row?.image_url ? " — leave empty to keep current" : " — optional"}`} />
            <FieldError msg={errs["image"] || undefined} />
          </div>
        </div>
      </FormSection>
      <FormSection title="Details">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Name *</Label>
            <Input value={name} maxLength={120} placeholder="e.g. Mr. Ravi Kumar" onChange={(e) => { setName(e.target.value); if (!slugTouched) setSlug(slugifyName(e.target.value)); }} />
            <FieldError msg={errs["name"] || undefined} />
          </div>
          <div>
            <Label>Designation *</Label>
            <Input value={designation} maxLength={120} placeholder="e.g. Independent Director" onChange={(e) => setDesignation(e.target.value)} />
            <FieldError msg={errs["designation"] || undefined} />
          </div>
          {g.hasProfile && (
            <div>
              <Label>Profile web address</Label>
              <Input value={slug} maxLength={80} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} />
              <FieldError msg={errs["slug"] || undefined} />
            </div>
          )}
        </div>
        <label className="flex items-center gap-3 text-sm"><Switch checked={published} onCheckedChange={setPublished} /> Live on website</label>
      </FormSection>
      {g.hasProfile && (
        <FormSection title="Profile sections">
          <p className="text-xs text-muted-foreground">Leave a blank line between paragraphs. Empty sections are hidden on the website.</p>
          {g.sections.map((s) => (
            <div key={s.key}>
              <Label>{s.heading}</Label>
              <Textarea rows={4} value={texts[s.key] ?? ""} onChange={(e) => setTexts({ ...texts, [s.key]: e.target.value })} />
            </div>
          ))}
        </FormSection>
      )}
    </AdminDialog>
  );
}
