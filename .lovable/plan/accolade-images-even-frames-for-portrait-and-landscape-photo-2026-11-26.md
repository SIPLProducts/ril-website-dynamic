# Accolade images: even frames for portrait and landscape photos

## Problem
Each award card shows its photo inside a fixed 4:3 frame using "contain". Portrait photos leave wide white bands on both sides, and landscape photos of different shapes leave bands at the top and bottom, so the cards look uneven.

## Solution (smart backdrop fit)
- Every card keeps the same 4:3 frame, so the grid stays even.
- Behind the photo, show a soft, blurred, slightly darkened copy of the same image that fills the whole frame. The empty areas take on the photo's own colours instead of white.
- On top, show the full photo, never cropped, so certificates, trophies and people's faces stay complete.
- Landscape photos that are close to 4:3 fill the frame almost edge to edge. Portrait photos sit in the centre with the blurred backdrop at the sides.
- Add a light shadow under the front photo so it stands out from the backdrop.
- Clicking a card shows the full image at its original shape, if a larger view already exists. Nothing in admin changes. Uploads stay as they are.

## Technical details
- File: `src/routes/accolades.tsx` (card image block, lines ~34–36).
- Frame: `relative aspect-[4/3] overflow-hidden`. A backdrop `<img aria-hidden>` with `absolute inset-0 h-full w-full object-cover scale-110 blur-xl opacity-60`. The front `<img>` uses `relative h-full w-full object-contain drop-shadow`.
- Use only theme tokens (no hardcoded colours). The empty-state placeholder stays unchanged.
- Check portrait and landscape cards in the browser at desktop and mobile widths.
