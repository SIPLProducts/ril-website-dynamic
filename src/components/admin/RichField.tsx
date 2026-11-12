import { useState } from "react";
import { Paintbrush, Type } from "lucide-react";
import { AdminDialog, FormSection } from "@/components/admin/AdminDialog";
import { RichTextEditor, textToHtml } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cleanHtml, isHtml, plainText, splitBox, wrapBox, type Box } from "@/lib/strength-style";

const RICH = "space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:text-primary [&_a]:underline [&_hr]:my-3";

/** Shows saved formatted HTML safely. */
export function RichView({ html, className = "" }: { html: string; className?: string }) {
  return <div className={`${RICH} ${className}`} dangerouslySetInnerHTML={{ __html: cleanHtml(html) }} />;
}

/** A normal text box with a "Format" button that opens an Excel-style editor popup. */
export function RichField({ label, value, onChange, long, max = 200 }: { label: string; value: string; onChange: (v: string) => void; long?: boolean; max?: number }) {
  const [open, setOpen] = useState(false);
  const formatted = isHtml(value);
  return (
    <div>
      <div className="flex items-center justify-between gap-2"><Label>{label}</Label>
        <div className="flex gap-1">
          {formatted && <Button type="button" variant="ghost" size="sm" onClick={() => { if (confirm("Remove formatting and keep plain text?")) onChange(plainText(value)); }}><Type className="size-4" /> Plain text</Button>}
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}><Paintbrush className="size-4" /> Format</Button>
        </div>
      </div>
      <div className="mt-1">
        {formatted
          ? <button type="button" onClick={() => setOpen(true)} title="Click to edit formatting" className="w-full rounded-md border border-input bg-background p-3 text-left text-sm hover:border-primary"><RichView html={value} /></button>
          : long ? <Textarea rows={3} maxLength={max} value={value} onChange={(e) => onChange(e.target.value)} />
            : <Input maxLength={max} value={value} onChange={(e) => onChange(e.target.value)} />}
      </div>
      {open && <FormatDialog label={label} value={value} compact={!long} onClose={() => setOpen(false)} onApply={(v) => { onChange(v); setOpen(false); }} />}
    </div>
  );
}

function FormatDialog({ label, value, compact, onClose, onApply }: { label: string; value: string; compact: boolean; onClose: () => void; onApply: (v: string) => void }) {
  const start = splitBox(value);
  const [html, setHtml] = useState(textToHtml(start.inner));
  const [box, setBox] = useState<Box>(start.box);
  const num = (k: keyof Box, l: string, min: number, maxV: number, step = 1) => (
    <div><Label className="text-xs">{l}</Label><Input type="number" min={min} max={maxV} step={step} placeholder="—" value={(box[k] as number | undefined) ?? ""} onChange={(e) => setBox({ ...box, [k]: e.target.value === "" ? undefined : Number(e.target.value) })} /></div>
  );
  const col = (k: "bg" | "borderColor", l: string) => (
    <div><Label className="text-xs">{l}</Label>
      <div className="mt-1 flex items-center gap-2"><input type="color" className="h-9 w-10 rounded border border-border" value={box[k] ?? "#ffffff"} onChange={(e) => setBox({ ...box, [k]: e.target.value })} />
        <button type="button" className="text-xs underline" onClick={() => setBox({ ...box, [k]: undefined })}>None</button></div></div>
  );
  const result = wrapBox(html, box);
  return (
    <AdminDialog icon={Paintbrush} xwide title={`Format: ${label}`} subtitle="Select text and use the toolbar, like in Excel or Word. Click Apply, then Save on the page." onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button className="neu-btn-gradient border-0" onClick={() => onApply(plainText(html) ? result : "")}>Apply</Button></>}>
      <FormSection title="Text">
        <RichTextEditor value={html} onChange={setHtml} compact={compact} />
      </FormSection>
      <FormSection title="Box (whole field) — fill, border, spacing">
        <div className="grid gap-3 sm:grid-cols-4">
          {col("bg", "Fill color")}
          {col("borderColor", "Border color")}
          {num("borderWidth", "Border thickness (px)", 0, 10)}
          <div><Label className="text-xs">Border style</Label>
            <select className="mt-1 h-10 w-full rounded-md border border-input bg-background px-2 text-sm" value={box.borderStyle ?? "solid"} onChange={(e) => setBox({ ...box, borderStyle: e.target.value as Box["borderStyle"] })}>
              {["solid", "dashed", "dotted", "double"].map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
          {num("radius", "Rounded corners (px)", 0, 32)}
          {num("padding", "Inner spacing (px)", 0, 64)}
          {num("lineHeight", "Line spacing", 1, 3, 0.1)}
          {num("indent", "Indent (px)", 0, 200, 8)}
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => setBox({})}>Reset box</Button>
      </FormSection>
      <FormSection title="Preview">
        <div className="rounded-md border border-dashed border-border p-4"><RichView html={result} /></div>
      </FormSection>
    </AdminDialog>
  );
}
