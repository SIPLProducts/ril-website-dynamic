# Investor PDFs inside one migration file

## Why the ZIP was needed today
The SQL file only copies text rows. The PDFs sit in a separate file store, not in the database, and a SQL file can't write into that store. So a normal migration can't carry them.

## What changes
Investor documents are also saved **inside the database**. After that, one `.sql` file carries both the rows and the PDFs. Any future dump includes the PDFs too, so files can't go missing again.

1. **New database table for files.** It holds each uploaded file's content, name and type, keyed by its path.
2. **Admin upload.** Uploading an investor document in the admin panel saves it to the new table too, along with the current file store.
3. **Opening and downloading.** The site serves the file from a link on the same address you opened, like `/files/<path>`. It reads the file from the database, so it works on 10.200.1.8, the public IP and the domain. Download uses the real file name.
4. **Fill the table now.** The 17 investor PDFs that already exist are copied into the new table.
5. **Migration file for your server:** `05_investor_files.sql`, about 50 MB. It creates the table and inserts all 17 PDFs, and it's safe to run more than once. You run it the same way as the others:
   `docker exec -i supabase-db psql -U postgres -d postgres < sql/05_investor_files.sql`
   After that, rebuild and restart the site once with the new code.

## Technical details
- Table `public.ir_files(path text primary key, mime text, size int, data bytea, updated_at)`. RLS is on; only staff can write, and there are no public grants beyond what the server function needs.
- A public server route `src/routes/files.$.tsx` reads by path through the admin client. It only serves paths that a **published** `ir_documents` row references, and sets the content type, `Content-Disposition` and a cache header.
- `ir-data.functions.ts` maps `storage:<path>` to `/files/<path>`, so links are relative to whatever address you opened. This also fixes the 38.31.132.10 link problem.
- The admin upload in `admin.index.tsx` also calls a staff-only server function that writes the bytes into `ir_files`.
- A one-off script generates the SQL file using `decode('<base64>','base64')` inserts with `ON CONFLICT (path) DO UPDATE`.
- Scope is the investor module only. Logos and photos keep their current behaviour unless you want them included too.
