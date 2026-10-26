# Teal top bar back, transparent colour logo on it

## What changes
- The top bar returns to teal-green (same as the menu row and sidebar), so the header and menu read as one branded block.
- The attached transparent logo sits directly on the teal, in its real colours, a bit larger, with a soft light glow behind the lettering so the blue "RAMKY" and grey tagline stay readable. No white box.
- Breadcrumb, layout switch, "View live site" and the profile menu go back to light text on teal.
- The thin orange-to-blue line stays under the menu row, like the website header.
- Same in the vertical layout (logo in the teal top bar next to the collapse button).

## Technical details
- `AdminShell` header: `admin-nav` background again; restore the light-text classes the earlier change replaced (`text-primary-foreground`, `--admin-nav-muted`, `bg-primary-foreground/10`).
- Logo `<img>`: `h-12`, `drop-shadow` glow via a new `@utility logo-glow` in `src/styles.css` (stacked `drop-shadow(0 0 6px` with a light token) so it stays transparent and token-based.
- Move `admin-accent-line` to the bottom of the menu row (horizontal) / header (vertical).
