# Fix the empty table stuck in the Card 1 Heading

## Why it keeps coming back
An empty 3×3 table was inserted into the Card 1 **Heading** and that version was saved. Pressing Backspace/Delete only clears the cells, so the table stays in the box. Removing it in the popup also isn't kept until you click **Save** at the bottom of the page. After a refresh, the saved version with the table loads again.

## Fix
1. **Clean the saved heading now:** remove the empty table so only "Pillars of Ramky Infrastructure" is left. Local only; I'll give you a small SQL file for the server.
2. **Auto-clean on save:** empty tables (all cells blank) and leftover empty lines are removed automatically when you save any formatted field, so this can't happen again.
3. **Easy delete:** a red **Delete table** button shows right above any table while the cursor is inside it, so you don't have to look for it in the Table tab.
4. **Heading boxes stay simple:** the Table tab is hidden for single-line fields like headings and taglines. It stays available for descriptions.

## Technical details
- Run a data update on `about_content.extra.pillarsTitle` for `strength-strategies`, setting it to `<h3>Pillars of Ramky Infrastructure</h3>`; server copy in `13_fix_pillars_heading.sql`.
- Add a `stripEmptyTables(html)` helper in `strength-style.ts` (removes `<table>` nodes with no text and trailing empty `<p></p>`), used in RichField on Apply. Add a unit test for it.
- RichTextEditor: an `allowTables` prop (false when `long` is false) and a floating delete button using `deleteTable()` when `isActive("table")`.
