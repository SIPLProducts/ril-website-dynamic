# Make the client logo optional in Clientele

## What changes
- **Add / Edit client form:** the logo is no longer required. The "Image is required" error goes away, and the hint changes from "required" to "optional".
- **Rule:** a client must have a logo **or** a description. If both are empty, the form shows "Add a logo or a description".
- **Remove logo button:** when a client already has a logo, a **Remove logo** button appears in the Edit form (same as Subsidiaries). Save then removes the logo.
- **Admin list:** the line "image required, description optional" becomes "logo and description optional (at least one)". Rows without a logo show "No logo".
- **Website:** no change needed. A client without a logo already shows a small orange marker and its name.

No database change; the server needs only `npm run build` and redeploy.

## Technical details
- `src/routes/admin.about.clientele.tsx`: replace `clientImageError` with `imageFileError(file, false)` plus a "logo or description" check; add a `removeImage` state, set `image_url: null` and delete the stored file on save.
- `src/lib/admin-validation.ts`: make `clientImageError` accept the description; update its test if one exists.
