import { useEffect } from "react";
import { EditorContent, useEditor, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle, Color, FontFamily, FontSize } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Italic, List, ListOrdered, Underline as U } from "lucide-react";
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
  if (/<\/?(p|ul|ol|li|strong|em|span)\b/i.test(s)) return s;
  const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return s.split(/\\n|\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => `<p>${esc(l)}</p>`).join("");
}

const btn = (on: boolean) => `grid size-8 place-items-center rounded border text-sm ${on ? "border-primary bg-primary/10 text-primary" : "border-border bg-background"}`;

export function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ heading: false, codeBlock: false, code: false }), TextStyle, Color, FontFamily, FontSize, FontWeight, TextAlign.configure({ types: ["paragraph"] })],
    content: textToHtml(value),
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: "min-h-32 rounded-b-md border border-t-0 border-border bg-background p-3 text-sm focus:outline-none [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 space-y-2" } },
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
        <input type="color" title="Text color" className="h-8 w-9 cursor-pointer rounded border border-border bg-background" value={ts["color"] ?? "#000000"} onChange={(e) => c().setColor(e.target.value).run()} />
        {([["left", AlignLeft], ["center", AlignCenter], ["right", AlignRight], ["justify", AlignJustify]] as const).map(([a, I]) => (
          <button key={a} type="button" title={`Align ${a}`} className={btn(editor.isActive({ textAlign: a }))} onClick={() => c().setTextAlign(a).run()}><I className="size-4" /></button>
        ))}
        <button type="button" title="Bullets" className={btn(editor.isActive("bulletList"))} onClick={() => c().toggleBulletList().run()}><List className="size-4" /></button>
        <button type="button" title="Numbered list" className={btn(editor.isActive("orderedList"))} onClick={() => c().toggleOrderedList().run()}><ListOrdered className="size-4" /></button>
        <button type="button" className="ml-auto h-8 rounded border border-border bg-background px-2 text-xs" onClick={() => c().unsetAllMarks().clearNodes().run()}>Clear format</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
