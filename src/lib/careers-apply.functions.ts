import { safeRandomUUID } from "@/lib/uuid";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const RESUME_MAX = 5 * 1024 * 1024;
const RESUME_EXT = /\.(pdf|doc|docx)$/i;

const schema = z.object({
  position: z.string().trim().min(1).max(200),
  reference: z.string().trim().max(100),
  full_name: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  mobile: z.string().trim().regex(/^[+\d][\d\s-]{6,18}$/, "Enter a valid mobile number"),
  location: z.string().trim().min(1, "Enter your location").max(120),
  qualification: z.string().trim().min(1, "Enter your qualification").max(200),
  experience: z.string().trim().max(10),
  cover_note: z.string().trim().max(2000),
  website: z.string().max(0, "Spam detected"),
});



export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => {
    if (!(d instanceof FormData)) throw new Error("Invalid form");
    const get = (k: string) => String(d.get(k) ?? "");
    const fields = schema.parse({
      position: get("position"), reference: get("reference"), full_name: get("full_name"), email: get("email"),
      mobile: get("mobile"), location: get("location"), qualification: get("qualification"),
      experience: get("experience"), cover_note: get("cover_note"), website: get("website"),
    });
    const file = d.get("resume");
    if (!(file instanceof File) || !file.size) throw new Error("Please attach your resume");
    if (!RESUME_EXT.test(file.name)) throw new Error("Resume must be a PDF, DOC or DOCX file");
    if (file.size > RESUME_MAX) throw new Error("Resume must be 5 MB or smaller");
    return { fields, file };
  })
  .handler(async ({ data: { fields, file } }) => {
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    // Limit: 3 applications per email per hour.
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await admin.from("career_applications").select("id", { count: "exact", head: true }).eq("email", fields.email).gte("created_at", since);
    if ((count ?? 0) >= 3) throw new Error("Too many applications. Please try again later.");

    const buf = await file.arrayBuffer();
    const ext = file.name.split(".").pop()!.toLowerCase();
    const path = `careers/applications/${safeRandomUUID()}.${ext}`;
    const up = await admin.storage.from("investor-documents").upload(path, buf, { contentType: file.type || "application/octet-stream" });
    if (up.error) { console.error("resume upload", up.error); throw new Error("Could not upload resume. Please try again."); }

    const { website: _w, ...row } = fields;
    const ins = await admin.from("career_applications").insert({ ...row, resume_path: path, resume_name: file.name.slice(0, 200) }).select("id").single();
    if (ins.error) { console.error("application insert", ins.error); throw new Error("Could not submit application. Please try again."); }

    const { sendApplicationEmail } = await import("@/lib/careers-mail.server");
    const r = await sendApplicationEmail(admin, ins.data.id);
    const sent = r.status === "sent";
    return { ok: true, emailed: sent };
  });

/** Staff-only: retry the careers email for one application. */
export const resendApplicationEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: ok } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
    if (!ok) throw new Error("Only staff can resend emails.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendApplicationEmail } = await import("@/lib/careers-mail.server");
    return sendApplicationEmail(supabaseAdmin, data.id);
  });
