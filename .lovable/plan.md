# Admin tables: one page scroll instead of a scroll inside the table

## What changes
- The document and user tables lose their separate inner scrollbar. The table shows every row, and you scroll the whole page with one scrollbar.
- The column headings (Document, Year/Qtr, Date...) stay pinned below the menu while you scroll, so you always know which column is which.
- The top bar and menu stay fixed at the top.
- The Ramky logo in the admin top bar and sidebar loses its white box and sits directly on the teal-green background.

## Technical details
- `admin.index.tsx` (documents table card, line ~187/198) and `admin.users.tsx` (line ~73): remove `min-h-0 flex-1 overflow-auto` / `overflow-hidden` / `min-h-[320px]` from the table wrappers so they grow to full height; keep `overflow-x-auto` only for narrow screens.
- Keep `main` in `AdminShell` as the single `overflow-y-auto` scroller; `thead` stays `sticky top-0` relative to `main`.
- `AdminShell`: remove the white/padded wrapper (`bg-background`, rounded box) around the transparent logo in both layouts.
- Check in preview at 1366x768 that only one scrollbar appears and scrolling reaches the last row.
