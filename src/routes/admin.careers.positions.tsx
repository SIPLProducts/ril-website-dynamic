import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Briefcase, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getStaff } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDialog, FileDropzone, FormSection } from "@/components/admin/AdminDialog";
import { CareersList, lines, removeStored, toLines, uploadImage } from "@/components/admin/CareersList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/careers/positions")({
  ssr: false,
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  component: Page,
});

type Vacancy = {
  id: string; req_id: string; title: string; location: string; division: string; published_date: string; experience: string;
  qualification: string; employment_type: string; deadline: string; vacancies: number | null; description: string;
  responsibilities: unknown; skills: unknown; published: boolean; sort_order: number;
};
type Flyer = { id: string; title: string; image_url: string | null; url: string; roles: unknown; published: boolean; sort_order: number };

function Page() {
  const { staff } = Route.useRouteContext();
  return (
    <AdminShell staff={staff} active={{ kind: "module", module: "careers", section: "positions" }} crumbs={["Careers", "Current Positions"]}>
      <div className="space-y-6">
        <IntroEditor />
        <CareersList<Vacancy> table="career_vacancies" heading="Vacancies" hint="Live = Open on the website" addLabel="Add vacancy"
          columns={[
            { label: "Req ID", cell: (r) => r.req_id || "—" },
            { label: "Title", cell: (r) => <span className="font-medium">{r.title}</span> },
            { label: "Location", cell: (r) => <span className="text-muted-foreground">{r.location}</span> },
          ]}
          renderDialog={(row, next, close, saved) => <VacancyDialog row={row} nextOrder={next} onClose={close} onSaved={saved} />} />
        <CareersList<Flyer> table="career_flyers" heading="Recruitment flyers" hint="Live = Open on the website" addLabel="Add flyer"
          columns={[
            { label: "Title", cell: (r) => <span className="font-medium">{r.title}</span> },
            { label: "Roles", cell: (r) => <span className="text-muted-foreground">{toLines(r.roles).split("\n").filter(Boolean).length}</span> },
            { label: "Image", cell: (r) => (r.image_url ? "Yes" : "—") },
          ]}
          renderDialog={(row, next, close, saved) => <FlyerDialog row={row} nextOrder={next} onClose={close} onSaved={saved} />} />
      </div>
    </AdminShell>
  );
}

function IntroEditor() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-careers-content"], queryFn: async () => {
    const { data, error } = await supabase.from("careers_life_content").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    return data;
  } });
  const [intro, setIntro] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setIntro(data.positions_intro); }, [data]);
  async function save() {
    setSaving(true);
    const { error } = await supabase.from("careers_life_content").update({ positions_intro: intro }).eq("id", 1);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved — now live on the website");
    qc.invalidateQueries({ queryKey: ["admin-careers-content"] });
    qc.invalidateQueries({ queryKey: ["careers"] });
  }
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div><h2 className="font-display text-xl font-bold">Page intro</h2><p className="text-sm text-muted-foreground">Text at the top of the Current Positions page.</p></div>
        <Button onClick={save} disabled={saving} className="neu-btn-gradient border-0"><Save className="size-4" /> {saving ? "Saving…" : "Save"}</Button>
      </div>
      <Textarea rows={4} value={intro} onChange={(e) => setIntro(e.target.value)} />
    </section>
  );
}

const FIELDS = [
  ["req_id", "Job Req ID"], ["location", "Location"], ["division", "Business unit"], ["published_date", "Date (e.g. 9 Oct 2026)"],
  ["experience", "Experience"], ["qualification", "Qualifications"], ["employment_type", "Employment type"], ["deadline", "Application deadline"],
] as const;

function VacancyDialog({ row, nextOrder, onClose, onSaved }: { row: Vacancy | null; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<Record<string, string>>(() => {
    const o: Record<string, string> = { title: row?.title ?? "", description: row?.description ?? "", vacancies: row?.vacancies?.toString() ?? "", responsibilities: toLines(row?.responsibilities), skills: toLines(row?.skills) };
    for (const [k] of FIELDS) o[k] = row?.[k] ?? "";
    return o;
  });
  const [published, setPublished] = useState(row?.published ?? true);
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  async function save() {
    if (!f["title"]?.trim()) { toast.error("Title is required"); return; }
    const n = f["vacancies"]?.trim() ? Number(f["vacancies"]) : null;
    if (n !== null && (!Number.isInteger(n) || n < 1)) { toast.error("Number of vacancies must be a whole number"); return; }
    setSaving(true);
    const payload = {
      title: f["title"]!.trim(), description: f["description"] ?? "", vacancies: n, published,
      responsibilities: lines(f["responsibilities"] ?? ""), skills: lines(f["skills"] ?? ""),
      ...Object.fromEntries(FIELDS.map(([k]) => [k, (f[k] ?? "").trim()])),
    };
    const { error } = row
      ? await supabase.from("career_vacancies").update(payload).eq("id", row.id)
      : await supabase.from("career_vacancies").insert({ ...payload, sort_order: nextOrder });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(published ? "Saved — now open on the website" : "Saved as closed");
    onSaved();
  }
  return (
    <AdminDialog icon={Briefcase} xwide title={row ? "Edit vacancy" : "Add vacancy"} subtitle="Shown on the Current Positions page" onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving} className="neu-btn-gradient border-0">{saving ? "Saving…" : row ? "Save changes" : "Add vacancy"}</Button></>}>
      <FormSection title="Basics">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2"><Label>Title</Label><Input value={f["title"]} maxLength={150} onChange={(e) => set("title", e.target.value)} /></div>
          <div><Label>Number of vacancies</Label><Input type="number" min={1} value={f["vacancies"]} onChange={(e) => set("vacancies", e.target.value)} /></div>
          {FIELDS.map(([k, l]) => <div key={k}><Label>{l}</Label><Input value={f[k]} maxLength={200} onChange={(e) => set(k, e.target.value)} /></div>)}
        </div>
        <label className="flex items-center gap-3 text-sm"><Switch checked={published} onCheckedChange={setPublished} /> Open (shown on website)</label>
      </FormSection>
      <FormSection title="Details">
        <div><Label>Job description</Label><Textarea rows={4} value={f["description"]} onChange={(e) => set("description", e.target.value)} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Key responsibilities (one per line)</Label><Textarea rows={5} value={f["responsibilities"]} onChange={(e) => set("responsibilities", e.target.value)} /></div>
          <div><Label>Required skills (one per line)</Label><Textarea rows={5} value={f["skills"]} onChange={(e) => set("skills", e.target.value)} /></div>
        </div>
      </FormSection>
    </AdminDialog>
  );
}

function FlyerDialog({ row, nextOrder, onClose, onSaved }: { row: Flyer | null; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(row?.title ?? "");
  const [url, setUrl] = useState(row?.url ?? "");
  const [roles, setRoles] = useState(toLines(row?.roles));
  const [published, setPublished] = useState(row?.published ?? true);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!row?.image_url && !file) { toast.error("Please upload the flyer image"); return; }
    if (url.trim() && !/^https?:\/\//i.test(url.trim())) { toast.error("Link must start with http:// or https://"); return; }
    setSaving(true);
    try {
      const image_url = file ? await uploadImage(file, "flyers") : row?.image_url ?? null;
      const payload = { title: title.trim(), url: url.trim(), roles: lines(roles), image_url, published };
      const { error } = row
        ? await supabase.from("career_flyers").update(payload).eq("id", row.id)
        : await supabase.from("career_flyers").insert({ ...payload, sort_order: nextOrder });
      if (error) throw error;
      if (file && row?.image_url) await removeStored(row.image_url);
      toast.success(published ? "Saved — now open on the website" : "Saved as closed");
      onSaved();
    } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
  }
  return (
    <AdminDialog icon={Briefcase} wide title={row ? "Edit flyer" : "Add flyer"} subtitle="Recruitment flyer on the Current Positions page" onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving} className="neu-btn-gradient border-0">{saving ? "Saving…" : row ? "Save changes" : "Add flyer"}</Button></>}>
      <FormSection title="Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Title</Label><Input value={title} maxLength={150} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label>Full flyer link (optional)</Label><Input value={url} placeholder="https://…" onChange={(e) => setUrl(e.target.value)} /></div>
        </div>
        <div><Label>Roles (one per line — each gets an Apply Now button)</Label><Textarea rows={5} value={roles} onChange={(e) => setRoles(e.target.value)} /></div>
        <label className="flex items-center gap-3 text-sm"><Switch checked={published} onCheckedChange={setPublished} /> Open (shown on website)</label>
      </FormSection>
      <FormSection title={row?.image_url ? "Flyer image (upload to replace)" : "Flyer image (required)"}>
        <FileDropzone file={file} onFile={setFile} accept="image/*" hint="JPG, PNG or WebP" />
      </FormSection>
    </AdminDialog>
  );
}
