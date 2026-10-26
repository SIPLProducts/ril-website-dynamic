# Admin logo and hover tooltips

## What changes
1. **Logo in the top bar and sidebar**: the full-colour logo sits poorly on the teal-green bar. It will be shown in all-white, which reads cleanly on dark teal. (The colour logo stays on the login page, dashboard card and popups.) In the collapsed sidebar, a small white logo mark.
2. **Hover tooltips** (Delete, Edit, View, menu icons and so on) are blue because they use the main brand blue. They will match the button they belong to:
   - Delete: red-orange tooltip
   - Edit: blue tooltip
   - View and everything else: dark teal-green tooltip that matches the menu
3. Check every admin button's hover state so none flashes the brand blue; gradient buttons only dim slightly on hover.

## Technical details
- `AdminShell.tsx`: add `brightness-0 invert` to the two nav/sidebar `<img>` logos (CSS filter, no new asset).
- `components/ui/tooltip.tsx`: default background changes from `bg-primary` to the admin teal token (new `--color-admin-nav` in `@theme inline`); `IconAction` in `admin.index.tsx` passes `btn-grad-danger` / `btn-grad-edit` to `TooltipContent` for Delete/Edit.
- Gradient buttons: add `hover:bg-transparent` alongside `btn-grad-*` / `admin-accent` so the shadcn default `hover:bg-primary/90` never shows; verify in preview by hovering each button.
