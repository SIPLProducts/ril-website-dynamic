import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import { pageListQuery } from "@/lib/page-lists.functions";
import { STRENGTH_DEFAULTS } from "@/lib/strength-defaults";
import { merge, parseStyles, type CardStyle, type StrengthStyles } from "@/lib/strength-style";
import { IntroCard, PillarCard, type Pillar } from "@/components/site/StrengthPillars";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = { extra: Record<string, string>; set: (v: Record<string, string>) => void };

function ColorField({ label, v, on }: { label: string; v?: string | undefined; on: (c?: string) => void }) {
  return (
    <div><Label>{label}</Label>
      <div className="mt-1 flex items-center gap-2">
        <input type="color" className="h-9 w-11 cursor-pointer rounded border border-border" value={v ?? "#ffffff"} onChange={(e) => on(e.target.value)} />
        <span className="text-xs text-muted-foreground">{v ?? "Default"}</span>
        {v && <button type="button" className="text-xs underline" onClick={() => on(undefined)}>clear</button>}
      </div>
    </div>
  );
}
function NumField({ label, v, on, max }: { label: string; v?: number | undefined; on: (n?: number) => void; max: number }) {
  return <div><Label>{label}</Label><Input type="number" min={0} max={max} placeholder="Default" value={v ?? ""} onChange={(e) => on(e.target.value === "" ? undefined : Number(e.target.value))} /></div>;
}
const sel = "mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-sm";

export function StrengthStyleEditor({ extra, set }: Props) {
  const { data: rows } = useQuery(pageListQuery("strength_pillars"));
  const pillars = (rows ?? []) as unknown as Pillar[];
  const styles = parseStyles(extra["styles"]);
  const [target, setTarget] = useState("page");
  const x = (k: keyof typeof STRENGTH_DEFAULTS) => (extra[k] ?? "").trim() || STRENGTH_DEFAULTS[k];

  const save = (next: StrengthStyles) => set({ ...extra, styles: JSON.stringify(next) });
  const current: CardStyle = target === "page" ? styles.page ?? {} : target === "intro" ? styles.intro ?? {} : styles.pillars?.[target] ?? {};
  const put = (s: CardStyle) => {
    if (target === "page") save({ ...styles, page: s });
    else if (target === "intro") save({ ...styles, intro: s });
    else save({ ...styles, pillars: { ...(styles.pillars ?? {}), [target]: s } });
  };
  const upd = <K extends keyof CardStyle>(k: K, v: CardStyle[K]) => {
    const n = { ...current, [k]: v };
    if (v === undefined || v === "") delete n[k];
    put(n);
  };
  const pillar = pillars.find((p) => p.id === target);
  const previewStyle = target === "intro" ? current : merge(styles.page, target === "page" ? {} : current);
  const previewPillar = pillar ?? pillars[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <div className="space-y-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-60 flex-1"><Label>What to style</Label>
            <select className={sel} value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="page">All pillar cards (default style)</option>
              {pillars.map((p, i) => <option key={p.id} value={p.id}>Pillar {i + 1}: {p.title}</option>)}
              <option value="intro">Card 2 — Strengths & Strategies</option>
            </select>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => put({})}><RotateCcw className="size-4" /> Reset this card</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => { if (confirm("Restore the original look for every card?")) save({}); }}><RotateCcw className="size-4" /> Reset whole page</Button>
        </div>

        <fieldset className="space-y-3 rounded-lg border border-border p-4">
          <legend className="px-1 text-sm font-semibold">Card header</legend>
          {target !== "page" && <div><Label>Header text <span className="text-muted-foreground">(blank = use the title)</span></Label><Input maxLength={160} value={current.headerText ?? ""} onChange={(e) => upd("headerText", e.target.value)} /></div>}
          <div className="grid gap-3 sm:grid-cols-3">
            <NumField label="Font size (px)" max={48} v={current.headerSize} on={(n) => upd("headerSize", n)} />
            <div><Label>Font weight</Label><select className={sel} value={current.headerWeight ?? ""} onChange={(e) => upd("headerWeight", (e.target.value || undefined) as CardStyle["headerWeight"])}><option value="">Default</option><option value="normal">Normal</option><option value="bold">Bold</option></select></div>
            <div><Label>Alignment</Label><select className={sel} value={current.headerAlign ?? ""} onChange={(e) => upd("headerAlign", (e.target.value || undefined) as CardStyle["headerAlign"])}><option value="">Default</option><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option><option value="justify">Justify</option></select></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <ColorField label="Text color" v={current.headerColor} on={(c) => upd("headerColor", c)} />
            <ColorField label="Background" v={current.headerBg} on={(c) => upd("headerBg", c)} />
            <ColorField label="Border color" v={current.headerBorder} on={(c) => upd("headerBorder", c)} />
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded-lg border border-border p-4">
          <legend className="px-1 text-sm font-semibold">Card</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            <ColorField label="Background" v={current.cardBg} on={(c) => upd("cardBg", c)} />
            <ColorField label="Border color" v={current.cardBorder} on={(c) => upd("cardBorder", c)} />
            <ColorField label="Content text color" v={current.contentColor} on={(c) => upd("contentColor", c)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <NumField label="Corner roundness (px)" max={32} v={current.radius} on={(n) => upd("radius", n)} />
            <NumField label="Padding (px)" max={64} v={current.padding} on={(n) => upd("padding", n)} />
            {target !== "intro" && <NumField label="Space above card (px)" max={64} v={current.spacing} on={(n) => upd("spacing", n)} />}
          </div>
        </fieldset>

        {pillar && (
          <div><Label>Formatted description <span className="text-muted-foreground">(blank = use the plain description from the Pillars list)</span></Label>
            <div className="mt-1"><RichTextEditor value={current.bodyHtml ?? pillar.body ?? ""} onChange={(h) => upd("bodyHtml", h)} /></div>
          </div>
        )}
        {target === "intro" && (
          <div><Label>Paragraphs (formatted)</Label>
            <div className="mt-1"><RichTextEditor value={extra["introBody"] ?? ""} onChange={(h) => set({ ...extra, introBody: h })} /></div>
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Live preview <span className="font-normal text-muted-foreground">— click Save at the top to publish</span></p>
        <div className="max-h-[42rem] overflow-auto rounded-lg border border-dashed border-border bg-background p-4">
          {target === "intro" ? <IntroCard x={x} style={previewStyle} />
            : previewPillar ? <ul><PillarCard p={previewPillar} n={Math.max(1, pillars.indexOf(previewPillar) + 1)} style={previewStyle} /></ul>
            : <p className="text-sm text-muted-foreground">Add a pillar to see a preview.</p>}
        </div>
      </div>
    </div>
  );
}
