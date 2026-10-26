# Admin menu: teal-green colors, top menu by default

## What changes
1. Sidebar and top menu bar switch from navy to a deep teal-green (#0f4d45 to #14665b), with light mint text and the orange active-item line kept.
2. The portal opens with the menu across the top (horizontal) by default. The Vertical/Horizontal switch still works and remembers each person's choice.
3. Buttons get a smooth gradient matched to what they do, replacing the current multi-colour mix:
   - Delete / remove: red-to-orange gradient
   - Sign in, Save, Upload, Create: teal-green gradient
   - Edit: blue gradient
   - View / secondary: soft outlined style
   - Cancel stays plain

## Technical details
- `src/styles.css`: update `--admin-nav`, `--admin-nav-2`, `--admin-nav-foreground`, `--admin-nav-muted` to teal-green OKLCH values; popup header strip follows automatically.
- `AdminShell.tsx`: default layout state becomes `horizontal` when nothing is saved in localStorage.
- New utilities `btn-grad-primary`, `btn-grad-danger`, `btn-grad-edit` in `src/styles.css`; applied in login (NeuAuth), AdminDialog, admin.index, admin.users in place of `neu-btn-gradient` / `admin-accent`, and on delete confirm buttons.
