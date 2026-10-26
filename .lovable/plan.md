# Login layout tweaks

- Bring back the earlier **round login card** (large circle with the soft raised look) instead of the rounded rectangle, with the colour Ramky logo inside it.
- Split becomes **60 / 40**: poster on the left 60%, round login card on the right 40%.
- Default stays the **full-screen poster**, filling the whole screen edge to edge (no white bands above/below). Top-right button opens the split; clicking again returns to the full poster.
- Gradient buttons and the visible logo watermark stay as they are.

## Technical details
- `NeuShell` in `src/components/admin/NeuAuth.tsx`: widths `md:w-[60%]` / `md:w-[40%]`; card back to `aspect-square rounded-full` sized `w-[min(36vw,520px)]` with inner `max-w-[300px]`; poster `object-cover` in full mode, `object-contain` in split mode.
