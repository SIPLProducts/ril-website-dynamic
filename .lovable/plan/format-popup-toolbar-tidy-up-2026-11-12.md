# Format popup toolbar tidy-up

- Remove the Superscript and Subscript buttons from the Home tab.
- Move Link, Line, Quote box, Heading 3 and Heading 4 out of the Insert tab into a new "Insert" group at the end of the Home tab.
- The Insert tab keeps only the "Insert table" tools (rows, columns, header row), and the Table tab stays as the place to edit a table after inserting it.
- The Table tab is unchanged.

## Technical details
- File: `src/components/admin/RichTextEditor.tsx` only. Drop the sub/superscript buttons and icon imports; keep the extensions loaded so existing saved content still renders.
- No database change; rebuild and redeploy as usual.
