import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FileUp, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { IR_BUCKET, STORAGE_PREFIX } from "@/lib/investor-relations";
import { safeRandomUUID } from "@/lib/uuid";
import { EMPTY_RATING, RATING_CATEGORIES, extractRating, parseRating, type EsgRating } from "@/lib/esg-rating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

async function pdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= Math.min(doc.numPages, 20); i++) {
    const c = await (await doc.getPage(i)).getTextContent();
    pages.push(c.items.map((it) => ("str" in it ? it.str + (it.hasEOL ? "\n" : " ") : "")).join(""));
  }
  return pages.join("\n");
}

/** Admin: upload an NSE ESG rating PDF, auto-fill the values read from it, review, then publish. */
export function EsgRatingEditor() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-esg-rating"], queryFn: async () => {
    const { data, error } = await supabase.from("site_settings").select("value").eq("key", "esg_rating").maybeSingle();
    if (error) throw error;
    return parseRating(data?.value) ?? EMPTY_RATING;
  } });
  const [f, setF] = useState<EsgRating>(EMPTY_RATING);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (data) setF(data); }, [data]);
  const set = <K extends keyof EsgRating>(k: K, v: EsgRating[K]) => setF((p) => ({ ...p, [k]: v }));

  async function onPdf(fl: File | undefined) {
    if (!fl) return;
    if (fl.type !== "application/pdf" && !fl.name.toLowerCase().endsWith(".pdf")) { toast.error("Please choose a PDF file"); return; }
    if (fl.size > 50 * 1024 * 1024) { toast.error("PDF must be 50 MB or smaller"); return; }
    setBusy(true);
    try {
      const r = extractRating(await pdfText(fl));
      setFile(fl);
      setF((p) => ({ ...p, ...Object.fromEntries(Object.entries(r).filter(([, v]) => (Array.isArray(v) ? v.length : v))) }));
      const missing = [!r.ratings.length && "year-wise ratings", !r.category && "rating category", !r.synopsis && "synopsis"].filter(Boolean);
      if (missing.length) toast.warning(`Read the PDF, but couldn't find: ${missing.join(", ")}. Please fill these in.`);
      else toast.success(`Read ${r.ratings.length} rating year(s), category "${r.category}". Check the values, then press Save.`);
    } catch (e) { toast.error(`Could not read this PDF: ${(e as Error).message}`); }
    finally { setBusy(false); }
  }

  async function save() {
    setBusy(true);
    try {
      let pdf = f.pdf;
      if (file) {
        const path = `esg/rating/${safeRandomUUID()}.pdf`;
        const { error } = await supabase.storage.from(IR_BUCKET).upload(path, file, { contentType: "application/pdf" });
        if (error) throw error;
        pdf = STORAGE_PREFIX + path;
      }
      const value = { ...f, pdf, ratings: f.ratings.filter((r) => r.year.trim() && r.score.trim()) };
      const { error } = await supabase.from("site_settings").upsert({ key: "esg_rating", value: value as never });
      if (error) throw error;
      setFile(null);
      toast.success("ESG rating published");
      qc.invalidateQueries({ queryKey: ["admin-esg-rating"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  }

  const upd = <T,>(list: T[], i: number, patch: Partial<T>) => list.map((x, j) => (j === i ? { ...x, ...patch } : x));
  return (
    <section className="rounded-sm border border-border bg-card p-5">
      <h2 className="font-display text-lg font-semibold">ESG Rating (NSE)</h2>
      <p className="mb-4 text-sm text-muted-foreground">Upload the NSE ESG rating PDF — the year-wise ratings, rating category, pillar scores and synopsis are filled in automatically. Check them, then press Save to publish.</p>
      <div className="space-y-5">
        <label className="flex cursor-pointer items-center gap-3 rounded-sm border border-dashed border-border p-4 hover:bg-muted/40">
          <FileUp className="size-5 text-brand-orange" />
          <span className="text-sm">{busy ? "Reading…" : file ? `Selected: ${file.name}` : f.pdf ? "Replace rating PDF (current PDF is published)" : "Upload NSE ESG rating PDF"}</span>
          <input type="file" accept="application/pdf,.pdf" className="hidden" disabled={busy} onChange={(e) => { void onPdf(e.target.files?.[0]); e.target.value = ""; }} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Company</Label><Input value={f.company} onChange={(e) => set("company", e.target.value)} /></div>
          <div><Label>Last review date</Label><Input value={f.reviewDate} onChange={(e) => set("reviewDate", e.target.value)} /></div>
          <div><Label>Rating category</Label>
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={f.category} onChange={(e) => { const c = RATING_CATEGORIES.find((x) => x.name === e.target.value); setF((p) => ({ ...p, category: e.target.value, categoryNote: c?.note ?? p.categoryNote })); }}>
              <option value="">—</option>{RATING_CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}
            </select></div>
          <div><Label>Core ESG rating</Label><Input value={f.coreRating} onChange={(e) => set("coreRating", e.target.value)} /></div>
        </div>
        <div>
          <div className="flex items-center justify-between"><Label>Year-wise rating</Label>
            <Button size="sm" variant="outline" onClick={() => set("ratings", [{ year: "", score: "", note: "" }, ...f.ratings])}><Plus className="size-4" /> Add year</Button></div>
          <div className="mt-2 space-y-2">
            {f.ratings.map((r, i) => (
              <div key={i} className="flex gap-2">
                <Input placeholder="FY2026" value={r.year} onChange={(e) => set("ratings", upd(f.ratings, i, { year: e.target.value }))} />
                <Input placeholder="Rating" value={r.score} onChange={(e) => set("ratings", upd(f.ratings, i, { score: e.target.value }))} />
                <Input placeholder="Note (e.g. Revised)" value={r.note} onChange={(e) => set("ratings", upd(f.ratings, i, { note: e.target.value }))} />
                <Button size="icon" variant="ghost" aria-label="Remove year" onClick={() => set("ratings", f.ratings.filter((_, j) => j !== i))}><Trash2 className="size-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {f.pillars.map((p, i) => (
            <div key={p.name}><Label>{p.name} score / weightage</Label><div className="flex gap-2">
              <Input value={p.score} onChange={(e) => set("pillars", upd(f.pillars, i, { score: e.target.value }))} />
              <Input value={p.weight} onChange={(e) => set("pillars", upd(f.pillars, i, { weight: e.target.value }))} /></div></div>
          ))}
        </div>
        <div><Label>Synopsis</Label><Textarea rows={5} value={f.synopsis} onChange={(e) => set("synopsis", e.target.value)} /></div>
        {f.drivers.map((d, i) => (
          <div key={d.pillar}><Label>{d.pillar} — key drivers (one per line)</Label>
            <Textarea rows={4} value={d.points.join("\n")} onChange={(e) => set("drivers", upd(f.drivers, i, { points: e.target.value.split("\n") }))} /></div>
        ))}
        <div className="flex justify-end"><Button onClick={() => void save()} disabled={busy}><Save className="size-4" /> Save</Button></div>
      </div>
    </section>
  );
}
