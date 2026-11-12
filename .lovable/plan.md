# Merge Insert tab into Table tab

- Remove the Insert tab; the popup shows only **Home** and **Table** tabs.
- The Table tab always shows the Insert table tools (rows, columns, header row, Insert table) at the start.
- When the cursor is inside a table, the existing table editing tools (add/delete rows and columns, merge/split, header row, cell fill, cell border, alignment, delete table) show after them.
- Update the hint text so it no longer mentions "Insert → Insert table".

## Technical details
- File: `src/components/admin/RichTextEditor.tsx` only. Tab state becomes "home" | "table". No database change.
