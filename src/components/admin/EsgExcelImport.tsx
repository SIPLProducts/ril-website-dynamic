import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileSpreadsheet, Save, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MetricTrendToggle } from "@/components/esg/MetricTrend";
import { type MetricTrend } from "@/lib/esg-metric-trends";
import { parseSettings } from "@/lib/site-settings";
import { makeGraphWorkbook, mergeGraphImport, readGraphWorkbook, type GraphPage } from "@/lib/esg-excel";

export function EsgExcelImport({ page }: { page: GraphPage }) {
  const qc = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<MetricTrend[] | null>(null);
  const [filename, setFilename] = useState("");
  const { data: cards, error: cardsError } = useQuery({ queryKey: ["admin-esg-excel-cards", page], queryFn: async () => {
    const { data, error } = await supabase.from("esg_items").select("id,title").eq("page_slug", page).eq("kind", "metric").order("sort_order");
    if (error) throw error;
    return data ?? [];
  } });
  const title = page === "environmental" ? "Environmental" : "Social";
  async function currentTrends() {
    const { data, error } = await supabase.from("site_settings").select("key,value").eq("key", "esg_trends");
    if (error) throw error;
    return parseSettings(data ?? []).esgTrends;
  }
  async function download() {
    if (!cards?.length) return;
    setBusy(true); setError("");
    try {
      const buffer = await makeGraphWorkbook(page, cards, await currentTrends());
      const url = URL.createObjectURL(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
      const link = document.createElement("a");
      link.href = url; link.download = `${title}-Graph-Sample.xlsx`;
      document.body.appendChild(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not download sample sheet"); }
    finally { setBusy(false); }
  }
  async function upload(file: File) {
    setPreview(null); setError(""); setFilename(file.name);
    if (!/\.xlsx$/i.test(file.name)) { setError("Upload an Excel .xlsx file using the sample structure"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Excel files must be 5 MB or smaller"); return; }
    if (!cards?.length) return;
    setBusy(true);
    try { setPreview(await readGraphWorkbook(await file.arrayBuffer(), cards)); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to read this Excel file"); }
    finally { setBusy(false); }
  }
  async function save() {
    if (!preview || !cards) return;
    setBusy(true); setError("");
    try {
      const { data: latestCards, error: cardError } = await supabase.from("esg_items").select("id,title").eq("page_slug", page).eq("kind", "metric");
      if (cardError) throw cardError;
      if (preview.some((m) => !latestCards?.some((c) => c.id === m.metricId))) throw new Error("A figure card was removed. Download a fresh sample sheet and upload again.");
      const next = mergeGraphImport(await currentTrends(), preview, latestCards ?? []);
      const { error } = await supabase.from("site_settings").upsert({ key: "esg_trends", value: next as never });
      if (error) throw error;
      await Promise.all([qc.invalidateQueries({ queryKey: ["admin-site-settings"] }), qc.invalidateQueries({ queryKey: ["site-settings"] })]);
      setPreview(null); setFilename("");
      toast.success(`${title} graphs updated from Excel`);
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed — existing graphs have not been changed"); }
    finally { setBusy(false); }
  }
  return (
    <section className="border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold"><FileSpreadsheet className="size-5 text-brand-green" />{title} graphs — Excel upload</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={busy || !cards?.length} onClick={download}><Download className="size-4" />Download sample sheet</Button>
          <Button disabled={busy || !cards?.length} onClick={() => input.current?.click()}><Upload className="size-4" />{busy ? "Please wait…" : "Upload Excel"}</Button>
          <input ref={input} type="file" accept=".xlsx" className="hidden" aria-label={`${title} graph Excel file`} onChange={(e) => { const file = e.target.files?.[0]; if (file) void upload(file); e.target.value = ""; }} />
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">Use the sample’s Graph Data sheet to edit values or add financial years. Keep Metric IDs and column headings unchanged. Blank values stay “Not disclosed”. XLSX, up to 5 MB.</p>
      {cards?.length === 0 && <p className="mt-2 text-sm text-muted-foreground">Add a key figure first to create its graph in the sample sheet.</p>}
      {(error || cardsError) && <p role="alert" className="mt-4 whitespace-pre-wrap text-sm text-destructive">{error || "Could not load figure cards. Please reload this page."}</p>}
      {preview && <div className="mt-5 border-t border-border pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="min-w-0 break-words text-sm font-semibold">{filename} · {preview.length} graphs ready to save</p>
          <div className="flex gap-2">
            <Button variant="outline" disabled={busy} onClick={() => { setPreview(null); setFilename(""); }}><X className="size-4" />Cancel</Button>
            <Button disabled={busy} onClick={save}><Save className="size-4" />Save graph data</Button>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Saving replaces the years for these graphs only. Other graphs and the other Sustainability page stay unchanged. Review summaries when figures change.</p>
        <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {preview.map((m) => <div key={m.metricId} className="min-w-0"><h3 className="font-display text-sm font-semibold">{m.label}</h3><MetricTrendToggle trend={m} environmental={page === "environmental"} /></div>)}
        </div>
      </div>}
    </section>
  );
}
