# Show Strength & Strategies card images clearly

## Why it looks unclear now
Your image is a wide picture (16:9) full of small labels (Men, Material, Machinery...). The card shrinks every image into a small square (about 176 px) and cuts off the sides, so the text in it can't be read.

## What changes
- **Bigger image, not cut:** the full picture shows at its own shape (wide stays wide), never cropped.
- **New layout when a card has an image:** on a computer the image takes about half the card width (left) with the heading and text on the right. On tablets and phones the image sits full width above the text.
- **Click to enlarge:** clicking the image opens it full screen so every label is readable; click outside or press Esc to close.
- Applies to both Card 1 (Pillars) and Card 2 cards. Cards without an image stay as they are.

## Best image to upload
- Wide picture, at least **1600 x 900 px** (the one you shared is fine).
- JPG or PNG, under 5 MB.

No database change; on the server just `npm run build` and redeploy.

## Technical details
- `src/components/site/StrengthPillars.tsx` `PillarCard`: grid `lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]` when image present; img `w-full h-auto object-contain rounded-lg`, remove `aspect-square object-cover max-w-[11rem]`.
- Wrap image in a button opening a shadcn `Dialog` with the image at `max-h-[90vh] object-contain`.
