import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { type IrContact, type IrDocumentRow } from "@/lib/investor-relations";
import { publishedFileUrl } from "@/lib/file-url";

/** Public read of published investor documents and contacts (no login required). */
export const getIrData = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const sb = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const [docsRes, contactsRes] = await Promise.all([
    sb.from("ir_documents").select("id,section_key,title,doc_type,doc_date,fy_year,quarter,disclosure_category,version,description,url,published,sort_order").eq("published", true).order("doc_date", { ascending: false }),
    // Contacts are no longer anonymously readable; read them with the server-only client.
    import("@/integrations/supabase/client.server").then(({ supabaseAdmin }) => supabaseAdmin.from("ir_contacts").select("heading,lines,sort_order").order("sort_order")),
  ]);
  if (docsRes.error) throw new Error(docsRes.error.message);
  if (contactsRes.error) throw new Error(contactsRes.error.message);

  const docs = docsRes.data as IrDocumentRow[];
  // Uploaded files are served from /files/<path> on whatever address the site was opened with.
  for (const d of docs) d.url = publishedFileUrl(d.url) ?? d.url;
  const contacts: IrContact[] = contactsRes.data.map((c) => ({ heading: c.heading, lines: c.lines as IrContact["lines"] }));
  return { docs, contacts };
});

export const irDataQuery = queryOptions({ queryKey: ["ir-data"], queryFn: () => getIrData() });
