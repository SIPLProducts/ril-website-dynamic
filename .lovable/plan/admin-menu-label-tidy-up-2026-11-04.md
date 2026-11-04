# Admin menu label tidy-up

1. Rename the "Home Page" menu to "Home" (top bar and side menu).
2. Keep "About Ramky" and "User Management" on a single line in the top menu bar (no wrapping onto two lines); other menu labels get the same no-wrap treatment so the bar stays tidy.

## Technical details
- `src/lib/admin-modules.ts`: label "Home Page" -> "Home".
- `src/components/admin/AdminShell.tsx`: add `whitespace-nowrap shrink-0` to the horizontal menu item class (`hItem`) and dropdown triggers; let the bar scroll horizontally on narrow screens instead of wrapping.
- Update the admin-modules test if it asserts the old label.
