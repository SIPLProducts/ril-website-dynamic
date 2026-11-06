# Fix: investor "View/Download" and /admin returning 404 on the server

## Likely causes (to confirm on the server first)
1. **Old build running** – the server is running a website build made before the investor-file fix, so the `/files/...` address doesn't exist yet and returns 404. This also explains `/admin` failing: page assets from an older/newer build don't match (the same 404 asset issue as before).
2. **New uploads stored only in file storage** – "Annual Report FY 25-26" and "Notice of the 32nd AGM" were uploaded on the server on 05 Nov. If storage isn't set up there, the file can't be found, so the page returns 404.
3. **Missing server key** – if the website's `.env` on the server lacks the backend service key, the file lookup silently fails and returns 404.

## What I will change in the app
- Make the file page fall back more reliably: look up the file by its path in the database copy first, then storage, without requiring the exact document-row match that can fail on dumped data.
- Return clear messages instead of a bare 404 (e.g. "file not uploaded to server", "server key missing") so the cause shows directly in the browser.
- Make sure every admin upload always saves a copy of the file in the database so future dumps include it.

## Server steps I will give you (copy-paste)
1. Pull the new code, then `npm run build`, then `pm2 restart` the website (fixes old-build 404s and /admin).
2. Check the `.env` has the backend URL and service key.
3. One check command to list which investor files are present in the database, and re-upload any missing ones from /admin.
4. Hard-refresh the browser (Ctrl+Shift+R) so old cached page files are dropped.

## Technical details
- `src/routes/files.$.tsx`: drop the hard `ir_documents` gate (keep `..` guard; restrict to bucket paths), add explicit error text, log errors.
- `src/lib/ir-files.functions.ts`: verify upload copy is awaited before saving the document.
- Diagnostic SQL: `select path, size from ir_files;` vs `select url from ir_documents where url like 'storage:%';`
