import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, ImagePlus, Plus, RotateCcw, Trash2 } from "lucide-react";
import { getStaff } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ESG_SECTIONS } from "@/lib/esg-sections";
import { METRIC_TRENDS, computeChange, type MetricTrend, type Polarity } from "@/lib/esg-metric-trends";
import { DEFAULT_PDF, esgLabel, type EsgLabels, IMAGE_SLOTS, MAIN_MENU, orderSustainability, parseSettings, type MainMenuKey, type PdfViewerSettings, type SustainabilityNavItem } from "@/lib/site-settings";
import { removeHomeFile, uploadHomeFile, useHomePreview } from "@/lib/home-highlights-admin";

export const Route = createFileRoute("/admin/site-settings")({
  ssr: false,
  head: () => ({ meta: [{ title: "Website settings — Admin" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  component: Page,
});

const adminSettingsQuery = { queryKey: ["admin-site-settings"], queryFn: async () => {
  const { data, error } = await supabase.from("site_settings").select("key,value");
  if (error) throw new Error(error.message);
  return parseSettings(data ?? []);
} };

function useSave() {
  const qc = useQueryClient();
  return async (key: string, value: unknown, msg = "Saved") => {
    const { error } = await supabase.from("site_settings").upsert({ key, value: value as never });
    if (error) { toast.error(error.message); return false; }
    qc.invalidateQueries({ queryKey: ["admin-site-settings"] });
    qc.invalidateQueries({ queryKey: ["site-settings"] });
    toast.success(msg);
    return true;
  };
}

function Page() {
  const { staff } = Route.useRouteContext();
  const { data, isLoading } = useQuery(adminSettingsQuery);
  return (
    <AdminShell staff={staff} active={{ kind: "settings" }} crumbs={["Website settings"]}>
      {isLoading || !data ? <p className="text-sm text-muted-foreground">Loading…</p> : (
        <Tabs defaultValue="trends">
          <TabsList className="flex h-auto flex-wrap justify-start">
            <TabsTrigger value="trends">ESG trends</TabsTrigger>
            <TabsTrigger value="images">Hero &amp; framework images</TabsTrigger>
            <TabsTrigger value="menu">Menu order</TabsTrigger>
            <TabsTrigger value="pdf">PDF viewer</TabsTrigger>
            <TabsTrigger value="sus">Sustainability navigation</TabsTrigger>
            <TabsTrigger value="labels">Section headings</TabsTrigger>
          </TabsList>
          <TabsContent value="trends"><TrendsEditor initial={data.esgTrends} /></TabsContent>
          <TabsContent value="images"><ImagesEditor images={data.images} /></TabsContent>
          <TabsContent value="menu"><MenuEditor initial={data.mainMenu} /></TabsContent>
          <TabsContent value="pdf"><PdfEditor initial={data.pdfViewer} /></TabsContent>
          <TabsContent value="sus"><SusNavEditor initial={data.sustainabilityNav} /></TabsContent>
          <TabsContent value="labels"><LabelsEditor initial={data.esgLabels} /></TabsContent>
        </Tabs>
      )}
    </AdminShell>
  );
}

function move<T>(list: T[], i: number, d: -1 | 1): T[] {
  const j = i + d; if (j < 0 || j >= list.length) return list;
  const n = [...list]; [n[i], n[j]] = [n[j]!, n[i]!]; return n;
}

function Card({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="mt-4 rounded-sm border border-border bg-background p-5">
      <div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-display text-base font-semibold">{title}</h2>{actions}</div>
      {children}
    </section>
  );
}

/* ---------- ESG trends ---------- */
function TrendsEditor({ initial }: { initial: MetricTrend[] }) {
  const save = useSave();
  const [list, setList] = useState<MetricTrend[]>(initial);
  const [sel, setSel] = useState(0);
  useEffect(() => setList(initial), [initial]);
  const m = list[sel];
  const { data: cards = [] } = useQuery({ queryKey: ["admin-esg-figure-cards"], queryFn: async () => {
    const { data, error } = await supabase.from("esg_items").select("id,page_slug,group_title,title,value").eq("kind", "metric").in("page_slug", ["environmental", "social"]).order("page_slug").order("sort_order");
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({ id: r.id, page: r.page_slug === "social" ? "Social" : "Environmental", group: r.group_title, title: r.title, value: r.value }));
  } });
  const upd = (patch: Partial<MetricTrend>) => setList((l) => l.map((x, i) => (i === sel ? { ...x, ...patch } : x)));
  const updYear = (yi: number, patch: Record<string, unknown>) => m && upd({ years: m.years.map((y, i) => (i === yi ? { ...y, ...patch } : y)) });
  const addYearAll = () => {
    const last = list[0]?.years.at(-1)?.year ?? "FY 2025–26";
    const mm = last.match(/(\d{4})\D+(\d{2})/);
    const next = mm ? `FY ${Number(mm[1]) + 1}–${String(Number(mm[2]) + 1).padStart(2, "0")}` : "New year";
    const label = window.prompt("Financial year to add to every metric", next);
    if (!label) return;
    setList((l) => l.map((x) => (x.years.some((y) => y.year === label) ? x : { ...x, years: [...x.years, { year: label, value: null, note: "Not disclosed" }] })));
  };
  const removeYearAll = (year: string) => {
    if (!window.confirm(`Remove ${year} from every metric?`)) return;
    setList((l) => l.map((x) => ({ ...x, years: x.years.filter((y) => y.year !== year) })));
  };
  const years = [...new Set(list.flatMap((x) => x.years.map((y) => y.year)))];
  const change = m ? computeChange(m) : null;
  return (
    <Card title="ESG year-wise trend charts" actions={<div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={addYearAll}><Plus className="size-4" /> Add financial year</Button>
      <Button size="sm" variant="outline" onClick={() => { if (window.confirm("Restore the original figures from the Excel sheet? Unsaved and saved edits will be replaced once you save.")) { setList(METRIC_TRENDS); setSel(0); } }}><RotateCcw className="size-4" /> Reset to default</Button>
      <Button size="sm" onClick={() => save("esg_trends", list, "Trend data saved")}>Save all trends</Button>
    </div>}>
      <p className="mb-3 text-xs text-muted-foreground">Pick the figure card each chart appears under (Environmental and Social pages). Charts without a picked card fall back to a figure with the same name. The last two years are compared. Leave a value empty when it is not disclosed — it will never be treated as zero.</p>
      <div className="mb-4 flex flex-wrap gap-2 text-xs">Years: {years.map((y) => <span key={y} className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">{y}<button aria-label={`Remove ${y}`} onClick={() => removeYearAll(y)}><Trash2 className="size-3 text-destructive" /></button></span>)}</div>
      <div className="grid gap-5 lg:grid-cols-[18rem_1fr]">
        <ul className="max-h-[32rem] space-y-1 overflow-y-auto pr-1">
          {list.map((x, i) => (
            <li key={i}><button onClick={() => setSel(i)} className={`w-full rounded-sm px-3 py-2 text-left text-sm ${i === sel ? "bg-primary text-primary-foreground" : "hover:bg-surface"}`}>{x.label || "(untitled)"}</button></li>
          ))}
          <li><Button size="sm" variant="ghost" className="w-full" onClick={() => { setList((l) => [...l, { label: "New metric", unit: "No.", polarity: "higher", summary: "", source: "", years: years.map((y) => ({ year: y, value: null, note: "Not disclosed" })) }]); setSel(list.length); }}><Plus className="size-4" /> Add metric</Button></li>
        </ul>
        {m && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold">Metric name<Input value={m.label} onChange={(e) => upd({ label: e.target.value })} /></label>
              <label className="text-xs font-semibold">Chart title (optional, default "Trend")<Input value={m.title ?? ""} onChange={(e) => upd({ title: e.target.value || undefined })} /></label>
              <label className="text-xs font-semibold">Show under figure
                <select className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={m.metricId ?? ""} onChange={(e) => upd({ metricId: e.target.value || undefined })}>
                  <option value="">— Match by metric name —</option>
                  {cards.map((c) => <option key={c.id} value={c.id}>{c.page} · {c.group ? `${c.group} · ` : ""}{c.value} {c.title}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold">Chart type
                <select className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={m.chartType ?? "bar"} onChange={(e) => upd({ chartType: e.target.value as "bar" | "line" })}>
                  <option value="bar">Bar chart</option><option value="line">Line chart</option>
                </select>
              </label>
              <label className="text-xs font-semibold">Unit (e.g. GJ, tCO2e, KL, %, No., ₹ Mn)<Input value={m.unit} onChange={(e) => upd({ unit: e.target.value })} /></label>
              <label className="text-xs font-semibold">Which direction is good?
                <select className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={m.polarity} onChange={(e) => upd({ polarity: e.target.value as Polarity })}>
                  <option value="lower">Lower is better</option><option value="higher">Higher is better</option><option value="neutral">Neutral</option>
                </select>
              </label>
              <label className="flex items-center gap-2 pt-5 text-xs font-semibold"><Switch checked={!!m.percent} onCheckedChange={(v) => upd({ percent: v })} /> Value is a percentage</label>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-muted-foreground"><th className="py-1">Year</th><th>Value</th><th>Note (shown when empty)</th><th>Approx.</th><th /></tr></thead>
              <tbody>
                {m.years.map((y, yi) => (
                  <tr key={yi} className="border-t border-border">
                    <td className="py-1 pr-2"><Input value={y.year} onChange={(e) => updYear(yi, { year: e.target.value })} /></td>
                    <td className="pr-2"><Input inputMode="decimal" value={y.value ?? ""} placeholder="Not disclosed" onChange={(e) => { const v = e.target.value.trim(); updYear(yi, { value: v === "" || isNaN(Number(v)) ? null : Number(v) }); }} /></td>
                    <td className="pr-2"><Input value={y.note ?? ""} onChange={(e) => updYear(yi, { note: e.target.value || undefined })} /></td>
                    <td><Switch checked={!!y.approximate} onCheckedChange={(v) => updYear(yi, { approximate: v || undefined })} /></td>
                    <td className="whitespace-nowrap">
                      <Button size="icon" variant="ghost" onClick={() => upd({ years: move(m.years, yi, -1) })}><ArrowUp className="size-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => upd({ years: move(m.years, yi, 1) })}><ArrowDown className="size-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => upd({ years: m.years.filter((_, i) => i !== yi) })}><Trash2 className="size-4 text-destructive" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button size="sm" variant="outline" onClick={() => upd({ years: [...m.years, { year: "", value: null, note: "Not disclosed" }] })}><Plus className="size-4" /> Add year to this metric</Button>
            {change && <p className="rounded-sm bg-surface px-3 py-2 text-xs"><span className="font-semibold">Preview:</span> {change.text}</p>}
            <label className="block text-xs font-semibold">Trend summary<Textarea rows={3} value={m.summary} onChange={(e) => upd({ summary: e.target.value })} /></label>
            <label className="block text-xs font-semibold">Source<Input value={m.source} onChange={(e) => upd({ source: e.target.value })} /></label>
            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { if (window.confirm(`Delete "${m.label}"?`)) { setList((l) => l.filter((_, i) => i !== sel)); setSel(0); } }}><Trash2 className="size-4" /> Delete metric</Button>
          </div>
        )}
      </div>
    </Card>
  );
}

/* ---------- Images ---------- */
function ImagesEditor({ images }: { images: Record<string, string> }) {
  const save = useSave();
  const persist = (next: Record<string, string>) => save("esg_images", Object.entries(next).map(([slot, url]) => ({ slot, url })), "Images saved");
  return (
    <Card title="Sustainability hero and framework card images">
      <p className="mb-4 text-xs text-muted-foreground">Upload a photo to replace the built-in one. Remove it to go back to the built-in photo.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {IMAGE_SLOTS.map((s) => <ImageSlot key={s.slot} label={s.label} value={images[s.slot]} onChange={async (url) => {
          const next = { ...images }; if (url) next[s.slot] = url; else delete next[s.slot];
          const ok = await persist(next); if (ok && images[s.slot] && images[s.slot] !== url) await removeHomeFile(images[s.slot]);
        }} />)}
      </div>
    </Card>
  );
}
function ImageSlot({ label, value, onChange }: { label: string; value?: string | undefined; onChange: (url: string | null) => Promise<void> }) {
  const src = useHomePreview(value);
  const [busy, setBusy] = useState(false);
  return (
    <div className="rounded-sm border border-border p-3">
      <p className="mb-2 text-xs font-semibold">{label}</p>
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-sm bg-surface text-xs text-muted-foreground">
        {src ? <img src={src} alt={label} className="h-full w-full object-cover" /> : "Using built-in photo"}
      </div>
      <div className="mt-2 flex gap-2">
        <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-sm border border-border px-2 py-1.5 text-xs font-semibold hover:bg-surface">
          <ImagePlus className="size-4" /> {busy ? "Uploading…" : value ? "Replace" : "Upload"}
          <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={async (e) => {
            const f = e.target.files?.[0]; e.target.value = ""; if (!f) return;
            setBusy(true);
            try { await onChange(await uploadHomeFile("esg", f)); } catch (err) { toast.error(err instanceof Error ? err.message : "Upload failed"); } finally { setBusy(false); }
          }} />
        </label>
        {value && <Button size="sm" variant="outline" onClick={() => onChange(null)}><Trash2 className="size-4" /></Button>}
      </div>
    </div>
  );
}

/* ---------- Menu ---------- */
function MenuEditor({ initial }: { initial: MainMenuKey[] }) {
  const save = useSave();
  const [list, setList] = useState(initial);
  const label = (k: MainMenuKey) => MAIN_MENU.find((m) => m.key === k)?.label ?? k;
  return (
    <Card title="Main website menu order" actions={<div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={() => setList(MAIN_MENU.map((m) => m.key))}><RotateCcw className="size-4" /> Default</Button>
      <Button size="sm" onClick={() => save("main_menu", list, "Menu order saved")}>Save</Button></div>}>
      <OrderList items={list.map((k) => ({ id: k, label: label(k) }))} onMove={(i, d) => setList(move(list, i, d))} />
    </Card>
  );
}
function OrderList({ items, onMove, extra }: { items: { id: string; label: string }[]; onMove: (i: number, d: -1 | 1) => void; extra?: (i: number) => React.ReactNode }) {
  return (
    <ol className="divide-y divide-border rounded-sm border border-border">
      {items.map((it, i) => (
        <li key={it.id} className="flex items-center gap-3 px-3 py-2 text-sm">
          <span className="w-6 text-muted-foreground">{i + 1}.</span>
          <span className="flex-1">{extra ? extra(i) : it.label}</span>
          <Button size="icon" variant="ghost" disabled={i === 0} onClick={() => onMove(i, -1)} aria-label="Move up"><ArrowUp className="size-4" /></Button>
          <Button size="icon" variant="ghost" disabled={i === items.length - 1} onClick={() => onMove(i, 1)} aria-label="Move down"><ArrowDown className="size-4" /></Button>
        </li>
      ))}
    </ol>
  );
}

/* ---------- PDF ---------- */
function PdfEditor({ initial }: { initial: PdfViewerSettings }) {
  const save = useSave();
  const [v, setV] = useState(initial);
  return (
    <Card title="Report PDF viewer" actions={<div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={() => setV(DEFAULT_PDF)}><RotateCcw className="size-4" /> Default</Button>
      <Button size="sm" onClick={() => save("pdf_viewer", v, "Viewer settings saved")}>Save</Button></div>}>
      <div className="grid max-w-xl gap-4">
        <label className="flex items-center gap-3 text-sm"><Switch checked={v.allowDownload} onCheckedChange={(c) => setV({ ...v, allowDownload: c })} /> Show download button in the viewer</label>
        <label className="text-xs font-semibold">Download button text<Input value={v.downloadLabel} onChange={(e) => setV({ ...v, downloadLabel: e.target.value })} /></label>
        <label className="text-xs font-semibold">Open button text on report cards<Input value={v.exploreLabel} onChange={(e) => setV({ ...v, exploreLabel: e.target.value })} /></label>
      </div>
    </Card>
  );
}

/* ---------- Sustainability nav ---------- */
function SusNavEditor({ initial }: { initial: SustainabilityNavItem[] }) {
  const save = useSave();
  const build = (nav: SustainabilityNavItem[]): SustainabilityNavItem[] => orderSustainability(ESG_SECTIONS, nav).map((s) => ({ slug: s.slug, label: nav.find((n) => n.slug === s.slug)?.label ?? "" }));
  const [list, setList] = useState<SustainabilityNavItem[]>(() => build(initial));
  const defTitle = (slug: string) => ESG_SECTIONS.find((s) => s.slug === slug)?.title ?? slug;
  return (
    <Card title="Sustainability dropdown and tabs" actions={<div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={() => setList(build([]))}><RotateCcw className="size-4" /> Default</Button>
      <Button size="sm" onClick={() => save("sustainability_nav", list.map((n) => ({ slug: n.slug, ...(n.label?.trim() ? { label: n.label.trim() } : {}) })), "Sustainability navigation saved")}>Save</Button></div>}>
      <p className="mb-3 text-xs text-muted-foreground">Order and names used in the Sustainability dropdown and the tabs on every Sustainability page. Leave a name empty to keep the default. Hide a page from <strong>Page visibility</strong>.</p>
      <OrderList items={list.map((n) => ({ id: n.slug, label: defTitle(n.slug) }))} onMove={(i, d) => setList(move(list, i, d))}
        extra={(i) => <div className="flex items-center gap-2"><span className="w-40 shrink-0 text-xs text-muted-foreground">{defTitle(list[i]!.slug)}</span><Input value={list[i]!.label ?? ""} placeholder={defTitle(list[i]!.slug)} onChange={(e) => setList(list.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} /></div>} />
    </Card>
  );
}

/* ---------- Section headings ---------- */
function LabelsEditor({ initial }: { initial: Record<string, EsgLabels> }) {
  const save = useSave();
  const [v, setV] = useState<Record<string, EsgLabels>>(initial);
  const set = (slug: string, part: keyof EsgLabels, val: string) => setV({ ...v, [slug]: { ...v[slug], [part]: val } });
  return (
    <Card title="Sustainability section headings" actions={<div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={() => setV({})}><RotateCcw className="size-4" /> Default</Button>
      <Button size="sm" onClick={() => save("esg_labels", v, "Headings saved")}>Save</Button></div>}>
      <p className="mb-4 text-sm text-muted-foreground">Leave a box empty to use the default heading shown in grey.</p>
      <div className="grid gap-6">
        {ESG_SECTIONS.map((s) => (
          <div key={s.slug} className="grid gap-3 sm:grid-cols-3">
            <p className="font-semibold sm:col-span-3">{s.title}</p>
            {(["metrics", "detail", "downloads"] as const).map((part) => (
              <label key={part} className="text-xs font-semibold">{part === "metrics" ? "Figures heading" : part === "detail" ? "Detail heading" : "Downloads heading"}
                <Input value={v[s.slug]?.[part] ?? ""} placeholder={esgLabel({}, s.slug, part)} onChange={(e) => set(s.slug, part, e.target.value)} /></label>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}
