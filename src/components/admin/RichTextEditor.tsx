import { useEffect } from "react";
import type React from "react";
import { EditorContent, useEditor, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle, Color, FontFamily, FontSize } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Highlighter, Italic, Link2, List, ListOrdered, Minus, Redo2, Strikethrough, Subscript as SubI, Superscript as SupI, Underline as U, Undo2 } from "lucide-react";
import { FONT_FAMILIES, FONT_SIZES } from "@/lib/strength-style";

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

export function RichTextEditor({ value, onChange, compact }: { value: string; onChange: (html: string) => void; compact?: boolean }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ heading: false, codeBlock: false, code: false }), TextStyle, Color, FontFamily, FontSize, FontWeight, TextAlign.configure({ types: ["paragraph"] }), Highlight.configure({ multicolor: true }), Subscript, Superscript],
    content: textToHtml(value),
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: `${compact ? "min-h-16" : "min-h-40"} rounded-b-md border border-t-0 border-border bg-background p-3 text-sm focus:outline-none [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 space-y-2 [&_a]:text-primary [&_a]:underline [&_mark]:rounded-sm [&_mark]:px-0.5` } },
  });
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !editor.isFocused) editor.commands.setContent(textToHtml(value), { emitUpdate: false });
  }, [value, editor]);
  if (!editor) return <div className="min-h-40 rounded-md border border-border" />;
  const c = () => editor.chain().focus();
  const ts = editor.getAttributes("textStyle");
  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-t-md border border-border bg-surface p-1.5">
        <button type="button" title="Bold" className={btn(editor.isActive("bold"))} onClick={() => c().toggleBold().run()}><Bold className="size-4" /></button>
        <button type="button" title="Italic" className={btn(editor.isActive("italic"))} onClick={() => c().toggleItalic().run()}><Italic className="size-4" /></button>
        <button type="button" title="Underline" className={btn(editor.isActive("underline"))} onClick={() => c().toggleUnderline().run()}><U className="size-4" /></button>
        <select title="Font" className="h-8 rounded border border-border bg-background px-1 text-xs" value={ts["fontFamily"] ?? ""} onChange={(e) => e.target.value ? c().setFontFamily(e.target.value).run() : c().unsetFontFamily().run()}>
          <option value="">Font</option>{FONT_FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <select title="Size" className="h-8 rounded border border-border bg-background px-1 text-xs" value={ts["fontSize"] ?? ""} onChange={(e) => e.target.value ? c().setFontSize(e.target.value).run() : c().unsetFontSize().run()}>
          <option value="">Size</option>{FONT_SIZES.map((s) => <option key={s} value={`${s}px`}>{s}</option>)}
        </select>
        <select title="Weight" className="h-8 rounded border border-border bg-background px-1 text-xs" value={ts["fontWeight"] ?? ""} onChange={(e) => c().setMark("textStyle", { fontWeight: e.target.value || null }).removeEmptyTextStyle().run()}>
          <option value="">Weight</option>{["300", "400", "500", "600", "700", "800"].map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
        <ColorPick title="Text color" icon={<span className="text-sm font-bold">A</span>} value={ts["color"]} onPick={(v) => c().setColor(v).run()} onClear={() => c().unsetColor().run()} />
        <ColorPick title="Fill / highlight color" icon={<Highlighter className="size-4" />} value={editor.getAttributes("highlight")["color"]} onPick={(v) => c().setHighlight({ color: v }).run()} onClear={() => c().unsetHighlight().run()} />
        <button type="button" title="Strikethrough" className={btn(editor.isActive("strike"))} onClick={() => c().toggleStrike().run()}><Strikethrough className="size-4" /></button>
        <button type="button" title="Superscript" className={btn(editor.isActive("superscript"))} onClick={() => c().toggleSuperscript().run()}><SupI className="size-4" /></button>
        <button type="button" title="Subscript" className={btn(editor.isActive("subscript"))} onClick={() => c().toggleSubscript().run()}><SubI className="size-4" /></button>
        <button type="button" title="Link" className={btn(editor.isActive("link"))} onClick={() => { const u = window.prompt("Link address (https://…), empty to remove", editor.getAttributes("link")["href"] ?? ""); if (u === null) return; u.trim() ? c().extendMarkRange("link").setLink({ href: u.trim() }).run() : c().unsetLink().run(); }}><Link2 className="size-4" /></button>
        {([["left", AlignLeft], ["center", AlignCenter], ["right", AlignRight], ["justify", AlignJustify]] as const).map(([a, I]) => (
          <button key={a} type="button" title={`Align ${a}`} className={btn(editor.isActive({ textAlign: a }))} onClick={() => c().setTextAlign(a).run()}><I className="size-4" /></button>
        ))}
        <button type="button" title="Bullets" className={btn(editor.isActive("bulletList"))} onClick={() => c().toggleBulletList().run()}><List className="size-4" /></button>
        <button type="button" title="Numbered list" className={btn(editor.isActive("orderedList"))} onClick={() => c().toggleOrderedList().run()}><ListOrdered className="size-4" /></button>
        {!compact && <button type="button" title="Horizontal line" className={btn(false)} onClick={() => c().setHorizontalRule().run()}><Minus className="size-4" /></button>}
        <button type="button" title="Undo" className={btn(false)} onClick={() => c().undo().run()}><Undo2 className="size-4" /></button>
        <button type="button" title="Redo" className={btn(false)} onClick={() => c().redo().run()}><Redo2 className="size-4" /></button>
        <button type="button" className="ml-auto h-8 rounded border border-border bg-background px-2 text-xs" onClick={() => c().unsetAllMarks().clearNodes().run()}>Clear format</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
