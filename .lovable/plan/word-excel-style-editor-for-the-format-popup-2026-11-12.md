# Word / Excel-style editor for the Format popup

The current toolbar has small unlabeled icons, so tools like "text background color" are hard to find, and there is no table. The plan turns the toolbar into a labeled ribbon like Word/Excel.

## 1. Labeled ribbon with 3 tabs
```text
[ Home ]  [ Insert ]  [ Table ]
```
- **Home:** Bold, Italic, Underline, Strikethrough, Superscript, Subscript, Font, Size, Weight, **Text color**, **Text background color** (only the selected words), **Paragraph fill** (whole line), Border, Align left/center/right/justify, Bullets, Numbering, Line spacing, Paragraph spacing, Indent in/out, Clear format, Undo/Redo.
- **Insert:** Table, Link, Horizontal line, Quote box, Heading 3 / Heading 4.
- **Table** (shown when the cursor is in a table): add row above/below, add column left/right, delete row/column, delete table, merge cells, split cell, header row on/off, **cell fill color**, **cell border color**, cell text alignment.

Each button shows a short label/tooltip ("Text background", "Cell fill", and so on) so it's clear what it does.

## 2. Insert table dialog
Choose the number of rows and columns (for example 3 x 3) and whether the first row is a header, then insert it. Tables get a default thin grey grid with a shaded header row, and they scroll sideways on mobile.

## 3. Website display
Tables, headings, quotes and all colors show on the public page exactly like the preview. Harmful content is still stripped.

## Technical details
- Add @tiptap/extension-table (Table, TableRow, TableHeader, TableCell) with custom cell attrs: backgroundColor, borderColor, textAlign.
- Enable heading levels 3–4 and blockquote in StarterKit.
- Rewrite the toolbar in `RichTextEditor.tsx` as a tabbed ribbon with labeled buttons. Highlight is relabeled "Text background".
- Extend `cleanHtml` to allow table/thead/tbody/tr/th/td, colspan/rowspan, and border/border-color/vertical-align styles. Add a test that a table survives sanitizing and that script is removed.
- Add table CSS to the RichView / RICH classes, wrapped in overflow-x-auto.
- No database change.
