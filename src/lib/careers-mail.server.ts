import { brandedEmail, smtpReady, type EmailSettings } from "@/lib/email-config";
import { friendlySmtpError, sendMail } from "@/lib/send-mail.server";

const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
function toBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

export type MailResult = { status: "sent" | "failed" | "pending"; error: string | null };

/** Email one stored application (with its stored resume) to the careers inbox and record the outcome. Never throws. */
export async function sendApplicationEmail(admin: any, id: string): Promise<MailResult> {
  let result: MailResult;
  let secrets: string[] = [];
  try {
    const { data: a } = await admin.from("career_applications").select("*").eq("id", id).maybeSingle();
    if (!a) return { status: "failed", error: "Application not found." };
    const { data: s } = await admin.from("email_settings").select("*").eq("id", 1).maybeSingle();
    const settings = s as (EmailSettings & { careers_to: string }) | null;
    if (!settings || !smtpReady(settings)) {
      result = { status: "pending", error: "Email is not configured yet. Fill in Admin → Email Configuration, then use Resend." };
    } else {
      secrets = [settings.password];
      const attachments: { filename: string; content: string; mimeType?: string }[] = [];
      if (a.resume_path) {
        const dl = await admin.storage.from("investor-documents").download(a.resume_path);
        if (dl.error || !dl.data) throw new Error("Could not read the stored resume file.");
        attachments.push({ filename: a.resume_name || "resume", content: toBase64(await dl.data.arrayBuffer()), ...(dl.data.type ? { mimeType: dl.data.type } : {}) });
      }
      const rows: [string, string][] = [["Position", a.position], ["Job Req ID", a.reference || "—"], ["Name", a.full_name], ["Email", a.email], ["Mobile", a.mobile], ["Location", a.location], ["Qualification", a.qualification], ["Experience (years)", a.experience || "—"], ["Cover note", a.cover_note || "—"]];
      const html = brandedEmail("New job application", `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows.map(([k, v]) => `<tr><td style="padding:6px 8px;color:#6b7785;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:6px 8px">${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("")}</table><p style="font-size:13px;color:#6b7785">Resume attached. Also available in the admin portal under Careers → Applications.</p>`);
      await sendMail(settings, { from: { name: settings.from_name, email: settings.from_email }, to: settings.careers_to || "careers@ramky.com", replyTo: { email: a.email, name: a.full_name }, subject: `Application: ${a.position}${a.reference ? ` (${a.reference})` : ""} — ${a.full_name}`, html, attachments });
      result = { status: "sent", error: null };
    }
  } catch (e) {
    console.error("application email", e);
    result = { status: "failed", error: friendlySmtpError(e, secrets) };
  }
  await admin.from("career_applications").update({ email_status: result.status, email_error: result.error, email_sent: result.status === "sent", email_attempted_at: new Date().toISOString() }).eq("id", id);
  return result;
}
