import { useEffect } from "react";
import type React from "react";
import { EditorContent, useEditor, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle, Color, FontFamily, FontSize } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import { useState } from "react";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Highlighter, Italic, Link2, List, ListOrdered, Minus, Redo2, Strikethrough, Underline as U, Undo2, PaintBucket, Square, IndentIncrease, IndentDecrease, Table2, Quote, Heading3, Heading4, Trash2, Merge, Split, Baseline } from "lucide-react";
import { FONT_FAMILIES, FONT_SIZES, TABLE_CSS } from "@/lib/strength-style";
export { TABLE_CSS };

/** Adds a font-weight attribute to text-style marks. */
const FontWeight = Extension.create({
  name: "fontWeight",
  addGlobalAttributes() {
    return [{ types: ["textStyle"], attributes: { fontWeight: {
      default: null,
      parseHTML: (el) => (el as HTMLElement).style.fontWeight || null,
      renderHTML: (a) => (a["fontWeight"] ? { style: `font-weight: ${a["fontWeight"]}` } : {}),
    } } }];
  },
});

/** Excel-style paragraph formatting: cell fill, border, line spacing, indent, spacing. */
const PARA_ATTRS: Record<string, string> = { pBg: "background-color", pBorder: "border", pLh: "line-height", pIndent: "margin-left", pBefore: "margin-top", pAfter: "margin-bottom" };
const ParaStyle = Extension.create({
  name: "paraStyle",
  addGlobalAttributes() {
    const attrs: Record<string, any> = {};
    for (const [k, css] of Object.entries(PARA_ATTRS)) attrs[k] = {
      default: null,
      parseHTML: (el: HTMLElement) => el.style.getPropertyValue(css) || null,
      renderHTML: (a: Record<string, any>) => {
        if (!a[k]) return {};
        const extra = k === "pBg" || k === "pBorder" ? "; padding: 4px 8px" : "";
        return { style: `${css}: ${a[k]}${extra}` };
      },
    };
    return [{ types: ["paragraph"], attributes: attrs }];
  },
});

/** Turns old plain text (line breaks) into paragraphs so it opens nicely in the editor. */
export function textToHtml(s: string) {
  if (/<\/?(p|ul|ol|li|strong|em|span|div|mark|u|s|a|sub|sup)\b/i.test(s)) return s;
  const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return s.split(/\\n|\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => `<p>${esc(l)}</p>`).join("");
}

const btn = (on: boolean) => `grid size-8 place-items-center rounded border text-sm ${on ? "border-primary bg-primary/10 text-primary" : "border-border bg-background"}`;

export const PALETTE = ["#000000", "#404040", "#7f7f7f", "#ffffff", "#c00000", "#ff0000", "#ffc000", "#ffff00", "#92d050", "#00b050", "#00b0f0", "#0070c0", "#002060", "#7030a0", "#f15a29", "#3aa935"];

function ColorPick({ title, icon, value, onPick, onClear }: { title: string; icon: React.ReactNode; value: string | undefined; onPick: (c: string) => void; onClear: () => void }) {
  return (
    <details className="relative">
      <summary title={title} className="flex h-8 cursor-pointer list-none items-center gap-1 rounded border border-border bg-background px-1.5">
        {icon}<span className="h-1.5 w-4 rounded-sm border border-border" style={{ backgroundColor: value ?? "transparent" }} />
      </summary>
      <div className="absolute left-0 top-9 z-50 w-44 rounded-md border border-border bg-background p-2 shadow-lg">
        <div className="grid grid-cols-8 gap-1">{PALETTE.map((c) => <button key={c} type="button" title={c} className="size-4 rounded-sm border border-border" style={{ backgroundColor: c }} onClick={() => onPick(c)} />)}</div>
        <div className="mt-2 flex items-center gap-2 text-xs"><input type="color" className="h-6 w-8" value={value && value.startsWith("#") ? value : "#000000"} onChange={(e) => onPick(e.target.value)} /> Custom
          <button type="button" className="ml-auto underline" onClick={onClear}>None</button></div>
      </div>
    </details>
  );
}

const cellAttrs = {
  backgroundColor: { default: null, parseHTML: (el: HTMLElement) => el.style.backgroundColor || null, renderHTML: (a: Record<string, any>) => (a["backgroundColor"] ? { style: `background-color: ${a["backgroundColor"]}` } : {}) },
  borderColor: { default: null, parseHTML: (el: HTMLElement) => el.style.borderColor || null, renderHTML: (a: Record<string, any>) => (a["borderColor"] ? { style: `border-color: ${a["borderColor"]}` } : {}) },
  verticalAlign: { default: null, parseHTML: (el: HTMLElement) => el.style.verticalAlign || null, renderHTML: (a: Record<string, any>) => (a["verticalAlign"] ? { style: `vertical-align: ${a["verticalAlign"]}` } : {}) },
};
const Cell = TableCell.extend({ addAttributes() { return { ...this.parent?.(), ...cellAttrs }; } });
const Header = TableHeader.extend({ addAttributes() { return { ...this.parent?.(), ...cellAttrs }; } });


/** Labeled toolbar button. */
function Tb({ label, icon, on, onClick, disabled }: { label: string; icon?: React.ReactNode; on?: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" title={label} disabled={disabled} onClick={onClick}
      className={`flex h-8 items-center gap-1 rounded border px-2 text-xs disabled:opacity-40 ${on ? "border-primary bg-primary/10 text-primary" : "border-border bg-background"}`}>
      {icon}<span className="hidden sm:inline">{label}</span>
    </button>
  );
}
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded border border-border/60 bg-background/50 px-1.5 pb-1 pt-1">
      <div className="flex flex-wrap items-center gap-1">{children}</div>
      <div className="mt-1 text-center text-[10px] uppercase tracking-wide text-muted-foreground">{title}</div>
    </div>
  );
}

export function RichTextEditor({ value, onChange, compact }: { value: string; onChange: (html: string) => void; compact?: boolean }) {
  const [tab, setTab] = useState<"home" | "insert" | "table">("home");
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [hdr, setHdr] = useState(true);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ heading: { levels: [3, 4] }, codeBlock: false, code: false }), TextStyle, Color, FontFamily, FontSize, FontWeight, TextAlign.configure({ types: ["paragraph", "heading"] }), Highlight.configure({ multicolor: true }), Subscript, Superscript, ParaStyle,
      Table.configure({ resizable: false }), TableRow, Header, Cell],
    content: textToHtml(value),
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: `${compact ? "min-h-16" : "min-h-40"} overflow-x-auto rounded-b-md border border-t-0 border-border bg-background p-3 text-sm focus:outline-none [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 space-y-2 [&_a]:text-primary [&_a]:underline [&_mark]:rounded-sm [&_mark]:px-0.5 ${TABLE_CSS} [&_.selectedCell]:bg-primary/15` } },
  });
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !editor.isFocused) editor.commands.setContent(textToHtml(value), { emitUpdate: false });
  }, [value, editor]);
  const inTable = !!editor?.isActive("table");
  useEffect(() => { if (inTable) setTab("table"); }, [inTable]);
  if (!editor) return <div className="min-h-40 rounded-md border border-border" />;
  const c = () => editor.chain().focus();
  const ts = editor.getAttributes("textStyle");
  const pa = editor.getAttributes("paragraph");
  const cell = editor.isActive("tableHeader") ? editor.getAttributes("tableHeader") : editor.getAttributes("tableCell");
  const setP = (k: string, v: string | null) => c().updateAttributes("paragraph", { [k]: v }).run();
  const indent = (d: number) => { const cur = parseInt(pa["pIndent"] ?? "0", 10) || 0; const n = Math.max(0, Math.min(200, cur + d)); setP("pIndent", n ? `${n}px` : null); };
  const sel = "h-8 rounded border border-border bg-background px-1 text-xs";
  const tabBtn = (k: typeof tab, l: string) => (
    <button type="button" onClick={() => setTab(k)} className={`rounded-t px-3 py-1 text-xs font-semibold ${tab === k ? "bg-surface text-primary border border-b-0 border-border" : "text-muted-foreground"}`}>{l}</button>
  );
  return (
    <div>
      <div className="flex gap-1">{tabBtn("home", "Home")}{tabBtn("insert", "Insert")}{tabBtn("table", "Table")}
        <div className="ml-auto flex gap-1 pb-1"><Tb label="Undo" icon={<Undo2 className="size-4" />} onClick={() => c().undo().run()} /><Tb label="Redo" icon={<Redo2 className="size-4" />} onClick={() => c().redo().run()} /></div>
      </div>
      <div className="flex flex-wrap items-stretch gap-1.5 rounded-t-md border border-border bg-surface p-1.5">
        {tab === "home" && <>
          <Group title="Font">
            <select title="Font" className={sel} value={ts["fontFamily"] ?? ""} onChange={(e) => e.target.value ? c().setFontFamily(e.target.value).run() : c().unsetFontFamily().run()}>
              <option value="">Font</option>{FONT_FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <select title="Size" className={sel} value={ts["fontSize"] ?? ""} onChange={(e) => e.target.value ? c().setFontSize(e.target.value).run() : c().unsetFontSize().run()}>
              <option value="">Size</option>{FONT_SIZES.map((s) => <option key={s} value={`${s}px`}>{s}</option>)}
            </select>
            <select title="Weight" className={sel} value={ts["fontWeight"] ?? ""} onChange={(e) => c().setMark("textStyle", { fontWeight: e.target.value || null }).removeEmptyTextStyle().run()}>
              <option value="">Weight</option>{["300", "400", "500", "600", "700", "800"].map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
            <button type="button" title="Bold" className={btn(editor.isActive("bold"))} onClick={() => c().toggleBold().run()}><Bold className="size-4" /></button>
            <button type="button" title="Italic" className={btn(editor.isActive("italic"))} onClick={() => c().toggleItalic().run()}><Italic className="size-4" /></button>
            <button type="button" title="Underline" className={btn(editor.isActive("underline"))} onClick={() => c().toggleUnderline().run()}><U className="size-4" /></button>
            <button type="button" title="Strikethrough" className={btn(editor.isActive("strike"))} onClick={() => c().toggleStrike().run()}><Strikethrough className="size-4" /></button>
          </Group>
          <Group title="Colors">
            <ColorPick title="Text color" icon={<span className="flex items-center gap-1 text-xs"><Baseline className="size-4" />Text color</span>} value={ts["color"]} onPick={(v) => c().setColor(v).run()} onClear={() => c().unsetColor().run()} />
            <ColorPick title="Text background color (selected words)" icon={<span className="flex items-center gap-1 text-xs"><Highlighter className="size-4" />Text background</span>} value={editor.getAttributes("highlight")["color"]} onPick={(v) => c().setHighlight({ color: v }).run()} onClear={() => c().unsetHighlight().run()} />
            <ColorPick title="Paragraph fill (whole line)" icon={<span className="flex items-center gap-1 text-xs"><PaintBucket className="size-4" />Line fill</span>} value={pa["pBg"]} onPick={(v) => setP("pBg", v)} onClear={() => setP("pBg", null)} />
            <ColorPick title="Border around paragraph" icon={<span className="flex items-center gap-1 text-xs"><Square className="size-4" />Border</span>} value={pa["pBorder"]?.split(" ")[2]} onPick={(v) => setP("pBorder", `1px solid ${v}`)} onClear={() => setP("pBorder", null)} />
          </Group>
          <Group title="Paragraph">
            {([["left", AlignLeft], ["center", AlignCenter], ["right", AlignRight], ["justify", AlignJustify]] as const).map(([a, I]) => (
              <button key={a} type="button" title={`Align ${a}`} className={btn(editor.isActive({ textAlign: a }))} onClick={() => c().setTextAlign(a).run()}><I className="size-4" /></button>
            ))}
            <button type="button" title="Bullets" className={btn(editor.isActive("bulletList"))} onClick={() => c().toggleBulletList().run()}><List className="size-4" /></button>
            <button type="button" title="Numbering" className={btn(editor.isActive("orderedList"))} onClick={() => c().toggleOrderedList().run()}><ListOrdered className="size-4" /></button>
            <button type="button" title="Decrease indent" className={btn(false)} onClick={() => indent(-24)}><IndentDecrease className="size-4" /></button>
            <button type="button" title="Increase indent" className={btn(false)} onClick={() => indent(24)}><IndentIncrease className="size-4" /></button>
            <select title="Line spacing" className={sel} value={pa["pLh"] ?? ""} onChange={(e) => setP("pLh", e.target.value || null)}>
              <option value="">Line spacing</option>{["1", "1.15", "1.5", "2"].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <select title="Paragraph spacing (before / after)" className={sel} value={pa["pAfter"] ?? ""} onChange={(e) => { const v = e.target.value || null; c().updateAttributes("paragraph", { pBefore: v, pAfter: v }).run(); }}>
              <option value="">Para spacing</option>{["0px", "6px", "12px", "18px", "24px"].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <Tb label="Clear format" onClick={() => c().unsetAllMarks().clearNodes().resetAttributes("paragraph", Object.keys(PARA_ATTRS)).run()} />
          </Group>
          <Group title="Insert">
            <Tb label="Link" icon={<Link2 className="size-4" />} on={editor.isActive("link")} onClick={() => { const u = window.prompt("Link address (https://…), empty to remove", editor.getAttributes("link")["href"] ?? ""); if (u === null) return; u.trim() ? c().extendMarkRange("link").setLink({ href: u.trim() }).run() : c().unsetLink().run(); }} />
            <Tb label="Line" icon={<Minus className="size-4" />} onClick={() => c().setHorizontalRule().run()} />
            <Tb label="Quote box" icon={<Quote className="size-4" />} on={editor.isActive("blockquote")} onClick={() => c().toggleBlockquote().run()} />
            <Tb label="Heading 3" icon={<Heading3 className="size-4" />} on={editor.isActive("heading", { level: 3 })} onClick={() => c().toggleHeading({ level: 3 }).run()} />
            <Tb label="Heading 4" icon={<Heading4 className="size-4" />} on={editor.isActive("heading", { level: 4 })} onClick={() => c().toggleHeading({ level: 4 }).run()} />
          </Group>
        </>}
        {tab === "insert" && <>
          <Group title="Table">
            <span className="text-xs">Rows</span><input type="number" min={1} max={20} value={rows} onChange={(e) => setRows(Math.max(1, Math.min(20, Number(e.target.value) || 1)))} className="h-8 w-14 rounded border border-border bg-background px-1 text-xs" />
            <span className="text-xs">Columns</span><input type="number" min={1} max={10} value={cols} onChange={(e) => setCols(Math.max(1, Math.min(10, Number(e.target.value) || 1)))} className="h-8 w-14 rounded border border-border bg-background px-1 text-xs" />
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={hdr} onChange={(e) => setHdr(e.target.checked)} /> Header row</label>
            <Tb label="Insert table" icon={<Table2 className="size-4" />} onClick={() => { c().insertTable({ rows, cols, withHeaderRow: hdr }).run(); setTab("table"); }} />
          </Group>
        </>}
        {tab === "table" && (!inTable
          ? <div className="p-2 text-xs text-muted-foreground">Click inside a table to edit it, or use <b>Insert → Insert table</b>.</div>
          : <>
            <Group title="Rows & columns">
              <Tb label="Row above" onClick={() => c().addRowBefore().run()} />
              <Tb label="Row below" onClick={() => c().addRowAfter().run()} />
              <Tb label="Column left" onClick={() => c().addColumnBefore().run()} />
              <Tb label="Column right" onClick={() => c().addColumnAfter().run()} />
              <Tb label="Delete row" onClick={() => c().deleteRow().run()} />
              <Tb label="Delete column" onClick={() => c().deleteColumn().run()} />
            </Group>
            <Group title="Cells">
              <Tb label="Merge cells" icon={<Merge className="size-4" />} disabled={!editor.can().mergeCells()} onClick={() => c().mergeCells().run()} />
              <Tb label="Split cell" icon={<Split className="size-4" />} disabled={!editor.can().splitCell()} onClick={() => c().splitCell().run()} />
              <Tb label="Header row" onClick={() => c().toggleHeaderRow().run()} />
              <ColorPick title="Cell fill color" icon={<span className="flex items-center gap-1 text-xs"><PaintBucket className="size-4" />Cell fill</span>} value={cell["backgroundColor"]} onPick={(v) => c().setCellAttribute("backgroundColor", v).run()} onClear={() => c().setCellAttribute("backgroundColor", null).run()} />
              <ColorPick title="Cell border color" icon={<span className="flex items-center gap-1 text-xs"><Square className="size-4" />Cell border</span>} value={cell["borderColor"]} onPick={(v) => c().setCellAttribute("borderColor", v).run()} onClear={() => c().setCellAttribute("borderColor", null).run()} />
              <select title="Vertical align" className={sel} value={cell["verticalAlign"] ?? ""} onChange={(e) => c().setCellAttribute("verticalAlign", e.target.value || null).run()}>
                <option value="">Vertical align</option><option value="top">Top</option><option value="middle">Middle</option><option value="bottom">Bottom</option>
              </select>
              {([["left", AlignLeft], ["center", AlignCenter], ["right", AlignRight]] as const).map(([a, I]) => (
                <button key={a} type="button" title={`Cell text ${a}`} className={btn(editor.isActive({ textAlign: a }))} onClick={() => c().setTextAlign(a).run()}><I className="size-4" /></button>
              ))}
            </Group>
            <Group title="Table">
              <Tb label="Delete table" icon={<Trash2 className="size-4" />} onClick={() => c().deleteTable().run()} />
            </Group>
          </>)}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
