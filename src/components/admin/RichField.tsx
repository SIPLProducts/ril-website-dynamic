import { useState } from "react";
import { Paintbrush, Type } from "lucide-react";
import { AdminDialog, FormSection } from "@/components/admin/AdminDialog";
import { RichTextEditor, textToHtml, TABLE_CSS } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cleanHtml, isHtml, plainText, splitBox } from "@/lib/strength-style";

const RICH = "overflow-x-auto space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:text-primary [&_a]:underline [&_hr]:my-3";

/** Shows saved formatted HTML safely. */
export function RichView({ html, className = "" }: { html: string; className?: string }) {
  return <div className={`${RICH} ${TABLE_CSS} ${className}`} dangerouslySetInnerHTML={{ __html: cleanHtml(html) }} />;
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
  const [html, setHtml] = useState(textToHtml(splitBox(value).inner));
  const result = html;
  return (
    <AdminDialog icon={Paintbrush} xwide title={`Format: ${label}`} subtitle="Select text and use the toolbar, then Save" onClose={onClose}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button className="neu-btn-gradient border-0" onClick={() => onApply(plainText(html) ? result : "")}>Apply</Button></>}>
      <FormSection title="Text">
        <RichTextEditor value={html} onChange={setHtml} compact={compact} />
      </FormSection>
      <FormSection title="Preview">
        <div className="rounded-md border border-dashed border-border p-4"><RichView html={result} /></div>
      </FormSection>
    </AdminDialog>
  );
}
