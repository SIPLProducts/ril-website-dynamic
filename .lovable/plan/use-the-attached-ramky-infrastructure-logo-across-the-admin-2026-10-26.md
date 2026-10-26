# Use the attached Ramky Infrastructure logo across the admin portal

## What changes
- The attached logo (full colour, "Towards sustainable growth") replaces the current logo everywhere in the admin portal: top bar, sidebar, dashboard welcome card, popups and the login card.
- The top bar turns **white** so the logo shows in its true colours (no white-out effect). Breadcrumb, layout switch, "View live site" and the profile menu switch to dark text to suit the white bar, with a thin orange-to-blue line under it.
- The teal-green stays on the horizontal menu row and the left sidebar.
- In vertical mode the logo moves to the white top bar; the sidebar top shows a small logo mark when collapsed.

## Technical details
- Upload the image with `lovable-assets` to `src/assets/ramky-infra-logo.png.asset.json`; switch imports in `AdminShell`, `AdminDialog`, `NeuAuth` and the dashboard card to it, and drop the `brightness-0 invert` classes.
- `AdminShell` header: `bg-background` + `admin-accent-line` bottom border; text colours use `text-foreground`/`text-muted-foreground` in both layouts. The horizontal menu row becomes `admin-nav` (teal) with light text and the orange active line.
