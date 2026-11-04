# Sustainability Section in the Sustainability admin menu

The home-page block reached via `/#sustainability` ("Towards sustainable growth — not as a slogan, as a method", hummingbird video, side figures, bottom figures) is already editable today under **Capabilities → Sustainability Highlight**. Admins expect it under **Sustainability**.

## Changes
1. Add a new sub-module **"Sustainability Section"** as the first item under the Sustainability menu, at `/admin/sustainability/section`, showing the full existing editor (heading, body, side figures, video/cover upload, bottom figure cards add/edit/reorder/hide/delete).
2. Remove "Sustainability Highlight" from the Capabilities menu so there is one clear place; old URL `/admin/capabilities/sustainability` redirects to the new one.
3. Keep the module marked completed so it is visible on the live admin panel.
4. Update the admin-modules test to cover the new menu entry.

## Technical
- New route `src/routes/admin.sustainability.section.tsx` reusing the editor component extracted from `admin.capabilities.sustainability.tsx` (same tables `home_sustainability`, `home_sustainability_stats`; no database change).
- Edit `src/lib/admin-modules.ts` menu definitions.
