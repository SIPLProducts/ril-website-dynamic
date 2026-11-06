import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { IR_BUCKET } from "@/lib/investor-relations";

/** Copies an uploaded investor file into the database (ir_files) so SQL dumps carry the file itself. */
export const saveIrFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { path: string }) => {
    if (!d?.path || d.path.includes("..")) throw new Error("Invalid path");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { data: staff } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
    if (!staff) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: blob, error } = await supabaseAdmin.storage.from(IR_BUCKET).download(data.path);
    if (error || !blob) throw new Error("Uploaded file not found");
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let hex = "";
    for (let i = 0; i < bytes.length; i++) hex += bytes[i]!.toString(16).padStart(2, "0");
    const { error: e2 } = await supabaseAdmin.from("ir_files").upsert({ path: data.path, mime: blob.type || "application/octet-stream", size: bytes.length, data: "\\x" + hex, updated_at: new Date().toISOString() });
    if (e2) throw new Error(e2.message);
    return { ok: true };
  });
