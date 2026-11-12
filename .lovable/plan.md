# Simplify the Format popup

## Changes
1. **Remove the "Box (whole field) — fill, border, spacing" section** from the Format popup (fill, border color/thickness/style, rounded corners, inner spacing, line spacing, indent, Reset box).
2. **Move useful Excel-style tools into the text toolbar** (applied to selected text / paragraph):
   - Cell fill (paragraph background color)
   - Border around paragraph (color picker + on/off)
   - Line spacing dropdown (1.0, 1.15, 1.5, 2.0)
   - Increase / decrease indent buttons
   - Paragraph spacing (before/after) dropdown
   - Keep all existing tools (bold, italic, underline, font, size, weight, text color, highlight, strike, super/subscript, link, align, lists, line, undo/redo, clear format).
3. **Rename popup subtitle** to: "Select text and use the toolbar, then Save".
4. Preview stays below the editor.

## Technical details
- Edit `src/components/admin/RichField.tsx`: drop box FormSection and box state; previously saved box styles are ignored on render.
- Extend `RichTextEditor.tsx` with paragraph-level global attributes (backgroundColor, border, lineHeight, marginLeft, margin) on paragraph/heading nodes.
- Extend `cleanHtml` allow-list in `src/lib/strength-style.ts` for background-color, border, line-height, margin, padding-left; update test.
- No database change.
