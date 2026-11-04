import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getStaff } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { FileDropzone } from "@/components/admin/AdminDialog";
import { homeTopAdminQuery } from "@/components/admin/HomeTopHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { refreshHome, removeHomeFile, uploadHomeFile, useHomePreview } from "@/lib/home-highlights-admin";

export const Route = createFileRoute("/admin/home/about")({
  ssr: false,
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  head: () => ({ meta: [{ title: "Who We Are — Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

type Img = { url: string | null; alt: string; position: string };
const SLOTS = ["Main photo (wide, top)", "Side photo 1", "Side photo 2"];

function Page() {
  const { staff } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data } = useQuery(homeTopAdminQuery);
  const [eyebrow, setEyebrow] = useState("");
  const [title, setTitle] = useState("");
  const [paras, setParas] = useState<string[]>([]);
  const [hl, setHl] = useState<{ t: string; d: string }[]>([]);
  const [imgs, setImgs] = useState<Img[]>([]);
  const [files, setFiles] = useState<(File | null)[]>([null, null, null]);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!data) return;
    setEyebrow(data.about_eyebrow); setTitle(data.about_title);
    setParas((data.about_paragraphs as string[]) ?? []);
    setHl((data.about_highlights as { t: string; d: string }[]) ?? []);
    const im = (data.about_images as Img[]) ?? [];
    setImgs(SLOTS.map((_, i) => im[i] ?? { url: null, alt: "", position: "50% 50%" }));
  }, [data]);

  async function save() {
    if (!title.trim()) { toast.error("Title is required"); return; }
    const p = paras.map((x) => x.trim()).filter(Boolean);
    if (!p.length) { toast.error("Add at least one paragraph"); return; }
    setSaving(true);
    try {
      const next = [...imgs];
      const old: (string | null)[] = [];
      for (let i = 0; i < SLOTS.length; i++) {
        const file = files[i];
        if (file) { old.push(next[i]!.url); next[i] = { ...next[i]!, url: await uploadHomeFile("top", file) }; }
      }
      const { error } = await supabase.from("home_top").update({
        about_eyebrow: eyebrow.trim(), about_title: title.trim(), about_paragraphs: p,
        about_highlights: hl.filter((h) => h.t.trim()).map((h) => ({ t: h.t.trim(), d: h.d.trim() })),
        about_images: next.map((x) => ({ url: x.url, alt: x.alt.trim(), position: x.position || "50% 50%" })),
      }).eq("id", 1);
      if (error) throw new Error(error.message);
      for (const u of old) await removeHomeFile(u);
      setFiles([null, null, null]);
      toast.success("Saved — now live on the website");
      qc.invalidateQueries({ queryKey: ["admin-home-top"] }); refreshHome(qc);
    } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
  }

  return (
    <AdminShell staff={staff} active={{ kind: "module", module: "home", section: "about" }} crumbs={["Home Page", "Who We Are"]}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">The "Who we are" block below the key figures on the home page.</p>
          <div className="flex gap-2">
            <Button variant="outline" asChild><a href="/#about" target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> View on website</a></Button>
            <Button onClick={save} disabled={saving} className="neu-btn-gradient border-0"><Save className="size-4" /> {saving ? "Saving…" : "Save all"}</Button>
          </div>
        </div>
        <Card title="Heading">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Small heading</Label><Input maxLength={60} value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} /></div>
            <div><Label>Title *</Label><Input maxLength={160} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          </div>
        </Card>
        <Card title="Paragraphs" help='The first paragraph is always shown; the others appear when visitors click "Read more".'
          action={<Button variant="outline" onClick={() => setParas([...paras, ""])}><Plus className="size-4" /> Add paragraph</Button>}>
          {paras.map((p, i) => (
            <div key={i} className="flex gap-2">
              <div className="flex-1"><Label>Paragraph {i + 1}{i === 0 ? " (always shown)" : ""}</Label><Textarea rows={3} maxLength={1500} value={p} onChange={(e) => setParas(paras.map((x, j) => j === i ? e.target.value : x))} /></div>
              <button aria-label="Remove paragraph" onClick={() => setParas(paras.filter((_, j) => j !== i))} className="btn-grad-danger mt-6 grid size-8 place-items-center rounded-md shadow-sm"><Trash2 className="size-4" /></button>
            </div>
          ))}
        </Card>
        <Card title="Highlights" help="The small points under the Read more button (up to 3 look best)."
          action={<Button variant="outline" onClick={() => setHl([...hl, { t: "", d: "" }])}><Plus className="size-4" /> Add highlight</Button>}>
          {hl.map((h, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
              <div><Label>Title</Label><Input maxLength={40} value={h.t} onChange={(e) => setHl(hl.map((x, j) => j === i ? { ...x, t: e.target.value } : x))} /></div>
              <div><Label>Short text</Label><Input maxLength={80} value={h.d} onChange={(e) => setHl(hl.map((x, j) => j === i ? { ...x, d: e.target.value } : x))} /></div>
              <button aria-label="Remove highlight" onClick={() => setHl(hl.filter((_, j) => j !== i))} className="btn-grad-danger grid size-9 place-items-center rounded-md shadow-sm"><Trash2 className="size-4" /></button>
            </div>
          ))}
        </Card>
        <Card title="Photos" help="Upload a new photo to replace one. Changes go live when you click Save all.">
          <div className="grid gap-4 lg:grid-cols-3">
            {imgs.map((img, i) => (
              <PhotoSlot key={i} label={SLOTS[i]!} img={img} file={files[i] ?? null}
                onFile={(f) => setFiles(files.map((x, j) => j === i ? f : x))}
                onAlt={(alt) => setImgs(imgs.map((x, j) => j === i ? { ...x, alt } : x))} />
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}

function Card({ title, help, action, children }: { title: string; help?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="font-display text-xl font-bold">{title}</h2>{help && <p className="text-sm text-muted-foreground">{help}</p>}</div>
        {action}
      </div>
      {children}
    </section>
  );
}

function PhotoSlot({ label, img, file, onFile, onAlt }: { label: string; img: Img; file: File | null; onFile: (f: File | null) => void; onAlt: (s: string) => void }) {
  const src = useHomePreview(img.url);
  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <p className="font-display text-sm font-semibold">{label}</p>
      {src && !file && <img src={src} alt="" className="h-28 w-full rounded border border-border object-cover" />}
      <FileDropzone file={file} onFile={onFile} accept="image/png,image/jpeg,image/webp" hint="Landscape photo" />
      <div><Label>Photo description</Label><Input maxLength={200} value={img.alt} onChange={(e) => onAlt(e.target.value)} /></div>
    </div>
  );
}
