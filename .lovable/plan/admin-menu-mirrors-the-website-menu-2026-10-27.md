# Admin menu mirrors the website menu

Make the admin menu (top and side layouts) follow the exact same order, names and sub-pages as the public website header, so every page has one clear place. Only Clientele and Investors are editable today; everything else shows a "Soon" badge and can't be clicked.

## New menu (same order as the website)

```text
Dashboard
About Ramky            (dropdown)
   History & Milestones          Soon
   Partners                      Soon
     - Subsidiaries              Soon
   Management Systems            Soon
   Strength & Strategies         Soon
   Clientele                     editable
   Geographic Presence           Soon
Management             (dropdown)
   Board Of Directors            Soon
   Senior Management             Soon
Capabilities                     Soon
Accolades                        Soon
Sustainability         (dropdown)
   Environmental / Social / Governance / ESG Reporting   Soon
Careers                (dropdown)
   Life at Ramky / Current Positions                     Soon
Investors              (dropdown, unchanged groups)
   Financials / Corporate Governance / Shareholders Information / Stock Exchange Filings
User Management        (Super Admin only, unchanged)
```

- "Website modules" wrapper is removed: each module sits directly beside Dashboard, like the website.
- Rename "About Us" to "About Ramky" (breadcrumb too).
- A main module with nothing editable yet shows "Soon" on the module itself; a module with some editable pages shows "Soon" only on the unfinished sub-pages.
- Horizontal layout: each module is its own dropdown in the menu row (wraps nicely / "More" not needed at 1366px; checked at the user's screen size). Vertical layout: each module is an expandable group; the group of the current page stays open.
- Dashboard "Website modules" cards follow the same list and status.

## Technical details
- Rewrite `src/lib/admin-modules.ts` as one tree: `{ key, label, icon, children?: { key, label, to?, children? }[] }`; a node is ready when it has a `to`. Sub-page labels derive from `ABOUT_SECTIONS` and `ESG_SECTIONS` so names stay in sync with the website.
- `AdminShell.tsx` renders both layouts from that tree (generic group open state keyed by module) instead of the special-cased About branch; Investors keeps `investorGroups()`.
- Breadcrumb label for the Clientele route becomes "About Ramky > Clientele".
- Add a small test that the admin module order equals the website header order.
