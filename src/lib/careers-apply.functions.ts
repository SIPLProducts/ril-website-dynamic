import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { brandedEmail, smtpReady, type EmailSettings } from "@/lib/email-config";

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

const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function toBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

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
    const path = `careers/applications/${crypto.randomUUID()}.${ext}`;
    const up = await admin.storage.from("investor-documents").upload(path, buf, { contentType: file.type || "application/octet-stream" });
    if (up.error) { console.error("resume upload", up.error); throw new Error("Could not upload resume. Please try again."); }

    const { website: _w, ...row } = fields;
    const ins = await admin.from("career_applications").insert({ ...row, resume_path: path, resume_name: file.name.slice(0, 200) }).select("id").single();
    if (ins.error) { console.error("application insert", ins.error); throw new Error("Could not submit application. Please try again."); }

    let sent = false;
    try {
      const { data: s } = await admin.from("email_settings").select("*").eq("id", 1).maybeSingle();
      const settings = s as (EmailSettings & { careers_to: string }) | null;
      if (settings && smtpReady(settings)) {
        const rows: [string, string][] = [["Position", fields.position], ["Job Req ID", fields.reference || "—"], ["Name", fields.full_name], ["Email", fields.email], ["Mobile", fields.mobile], ["Location", fields.location], ["Qualification", fields.qualification], ["Experience (years)", fields.experience || "—"], ["Cover note", fields.cover_note || "—"]];
        const html = brandedEmail("New job application", `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows.map(([k, v]) => `<tr><td style="padding:6px 8px;color:#6b7785;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:6px 8px">${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("")}</table><p style="font-size:13px;color:#6b7785">Resume attached. Also available in the admin portal under Careers → Applications.</p>`);
        const { WorkerMailer } = await import("worker-mailer");
        await WorkerMailer.send(
          { host: settings.host, port: settings.port, secure: settings.secure, startTls: !settings.secure, credentials: { username: settings.username, password: settings.password }, authType: ["plain", "login"] },
          { from: { name: settings.from_name, email: settings.from_email }, to: settings.careers_to || "careers@ramky.com", reply: { email: fields.email, name: fields.full_name }, subject: `Application: ${fields.position}${fields.reference ? ` (${fields.reference})` : ""} — ${fields.full_name}`, html, attachments: [{ filename: file.name, content: toBase64(buf), mimeType: file.type || undefined }] } as any,
        );
        sent = true;
        await admin.from("career_applications").update({ email_sent: true }).eq("id", ins.data.id);
      }
    } catch (e) { console.error("application email", e); }
    return { ok: true, emailed: sent };
  });

export const getResumeUrl = createServerFn({ method: "POST" })
  .inputValidator((d: { path: string }) => z.object({ path: z.string().startsWith("careers/applications/") }).parse(d))
  .handler(async () => { throw new Error("Use client signed URL"); });
