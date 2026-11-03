import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
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

export const Route = createFileRoute("/admin/careers/life")({
  ssr: false,
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  component: Page,
});

type Section = { id: string; title: string; paragraphs: unknown; image_url: string | null; published: boolean; sort_order: number };

function Page() {
  const { staff } = Route.useRouteContext();
  return (
    <AdminShell staff={staff} active={{ kind: "module", module: "careers", section: "life" }} crumbs={["Careers", "Life at Ramky"]}>
      <div className="space-y-6">
        <CareersList<Purpose> table="careers_purpose_cards" heading="Vision, Mission and Values cards" hint="cards at the top of the Life at Ramky page — add as many as you need" addLabel="Add card"
          columns={[
            { label: "Heading", cell: (r) => <span className="font-medium">{r.title}</span> },
            { label: "Text", cell: (r) => <span className="line-clamp-2 text-muted-foreground">{r.body || toLines(r.bullets).split("\n").join(" · ")}</span> },
          ]}
          renderDialog={(row, next, close, saved) => <PurposeDialog row={row} nextOrder={next} onClose={close} onSaved={saved} />} />
        <CareersList<Section> table="careers_life_sections" heading="Page sections" hint="shown below Vision, Mission and Values" addLabel="Add section"
          columns={[
            { label: "Title", cell: (r) => <span className="font-medium">{r.title}</span> },
            { label: "Text", cell: (r) => <span className="line-clamp-2 text-muted-foreground">{toLines(r.paragraphs).split("\n")[0]}</span> },
            { label: "Image", cell: (r) => (r.image_url ? "Yes" : "—") },
          ]}
          renderDialog={(row, next, close, saved) => <SectionDialog row={row} nextOrder={next} onClose={close} onSaved={saved} />} />
      </div>
    </AdminShell>
  );
}

type Purpose = { id: string; title: string; body: string; bullets: unknown; published: boolean; sort_order: number };

function PurposeDialog({ row, nextOrder, onClose, onSaved }: { row: Purpose | null; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(row?.title ?? "");
  const [body, setBody] = useState(row?.body ?? "");
  const [bullets, setBullets] = useState(toLines(row?.bullets));
  const [published, setPublished] = useState(row?.published ?? true);
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!title.trim()) { toast.error("Card heading is required"); return; }
    if (!body.trim() && !lines(bullets).length) { toast.error("Add some text or bullet points"); return; }
    setSaving(true);
    const payload = { title: title.trim(), body: body.trim(), bullets: lines(bullets), published };
    const { error } = row ? await supabase.from("careers_purpose_cards").update(payload).eq("id", row.id) : await supabase.from("careers_purpose_cards").insert({ ...payload, sort_order: nextOrder });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved — now live on the website"); onSaved();
  }
  return (
    <AdminDialog icon={Briefcase} title={row ? "Edit card" : "Add card"} subtitle="Shown in Vision, Mission and Values" onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving} className="neu-btn-gradient border-0"><Save className="size-4" /> {saving ? "Saving…" : "Save"}</Button></>}>
      <FormSection title="Card">
        <div className="grid gap-4">
          <div><Label>Card heading *</Label><Input value={title} placeholder="e.g. Vision, Mission, Values, Culture" onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label>Text</Label><Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} /></div>
          <div><Label>Bullet points (optional, one per line)</Label><Textarea rows={5} value={bullets} onChange={(e) => setBullets(e.target.value)} /></div>
          <div className="flex items-center gap-3"><Switch checked={published} onCheckedChange={setPublished} /><Label>Live on website</Label></div>
        </div>
      </FormSection>
    </AdminDialog>
  );
}

function SectionDialog({ row, nextOrder, onClose, onSaved }: { row: Section | null; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(row?.title ?? "");
  const [text, setText] = useState(toLines(row?.paragraphs).split("\n").join("\n\n"));
  const [published, setPublished] = useState(row?.published ?? true);
  const [file, setFile] = useState<File | null>(null);
  const [clearImage, setClearImage] = useState(false);
  const [saving, setSaving] = useState(false);
  async function save() {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      let image_url = clearImage ? null : row?.image_url ?? null;
      if (file) image_url = await uploadImage(file, "life");
      const payload = { title: title.trim(), paragraphs: lines(text), image_url, published };
      const { error } = row
        ? await supabase.from("careers_life_sections").update(payload).eq("id", row.id)
        : await supabase.from("careers_life_sections").insert({ ...payload, sort_order: nextOrder });
      if (error) throw error;
      if (row?.image_url && row.image_url !== image_url) await removeStored(row.image_url);
      toast.success(published ? "Saved — now live on the website" : "Saved as draft");
      onSaved();
    } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
  }
  return (
    <AdminDialog icon={Briefcase} wide title={row ? "Edit section" : "Add section"} subtitle="Shown on the Life at Ramky page" onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving} className="neu-btn-gradient border-0">{saving ? "Saving…" : row ? "Save changes" : "Add section"}</Button></>}>
      <FormSection title="Details">
        <div><Label>Title</Label><Input value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} /></div>
        <div><Label>Text (each line is a paragraph)</Label><Textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} /></div>
        <label className="flex items-center gap-3 text-sm"><Switch checked={published} onCheckedChange={setPublished} /> Live on website</label>
      </FormSection>
      <FormSection title="Image (optional)">
        <FileDropzone file={file} onFile={setFile} accept="image/*" hint="JPG, PNG or WebP" />
        {row?.image_url && !file && <label className="flex items-center gap-3 text-sm"><Switch checked={clearImage} onCheckedChange={setClearImage} /> Remove current image</label>}
      </FormSection>
    </AdminDialog>
  );
}
