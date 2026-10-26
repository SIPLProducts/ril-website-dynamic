# Admin portal polish: Ramky logo, vertical/horizontal menu switch, fit-to-screen

## What you get
1. **Ramky logo** in the sidebar/top bar (replacing the "RI" box), on the dashboard welcome area, and in every popup header.
2. **Layout switch in the top bar**: a toggle with two icons, "Vertical" (left sidebar) and "Horizontal" (menu across the top). The choice is remembered on that computer.
   - Horizontal: a top menu bar with Dashboard, the website modules, an **Investors** dropdown (groups and pages, like the website) and a **User Management** dropdown.
3. **Refreshed menu look**: softer navy with a thin orange line on the active item, clearer group headings, small rounded icons, and smoother open/close of dropdowns.
4. **Thin, subtle scrollbar** in the sidebar and dropdowns (it only appears when needed).
5. **Popups**: a white header with the Ramky logo, an orange-to-blue accent line under it, a coloured icon badge, and matching gradient buttons. The form layout stays the same.
6. **Fits the screen without page scroll**: the portal fills exactly one screen. Only the table area scrolls inside its card, with the column headings fixed at the top. Spacing is tightened so the dashboard fits a laptop screen. Popups size to the screen and scroll only inside their body when space is short.

## Technical details
- `AdminShell`: `h-screen overflow-hidden` with flex column; the content `main` uses `min-h-0 flex-1`. A `layout` state (`vertical` | `horizontal`) is kept in localStorage and read in `useEffect`. The horizontal nav uses `DropdownMenu` with sub-menus built from `investorGroups()`.
- Document and users tables are wrapped in `flex-1 min-h-0 overflow-auto` with `sticky top-0` on the table header.
- New `@utility thin-scroll` in `src/styles.css` (scrollbar-width thin plus webkit styles using tokens). Popup header tokens are reused from the existing admin tokens.
- The logo comes from the existing `ramky-logo-transparent.png.asset.json` pointer.
