# Subsidiary cards: black names + orange-green hover line

- Company names in the no-logo cards change from blue to black (same as the logo cards).
- The line that slides in across the top on hover becomes a gradient, orange on the left fading to green on the right (brand colours).
- Initials badge stays as it is.

## Technical details
- `src/routes/about.partners.subsidiaries.tsx`: name `text-brand-blue` -> `text-foreground`; accent span `bg-brand-orange` -> `bg-gradient-to-r from-brand-orange to-brand-green`, height 1 (4px).
