import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { brandedEmail, smtpReady, type EmailSettings } from "@/lib/email-config";

export const contactSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  mobile: z.string().trim().regex(/^\+?[\d\s-]{7,20}$/, "Enter a valid mobile number"),
  organisation: z.string().trim().max(200),
  message: z.string().trim().min(5, "Enter a message").max(2000),
  website: z.string().max(0, "Spam detected"),
});
const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export const submitSustainabilityContact = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => contactSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await admin.from("contact_submissions").select("id", { count: "exact", head: true }).eq("email", data.email).gte("created_at", since);
    if ((count ?? 0) >= 3) throw new Error("Too many messages. Please try again later.");
    const { website: _w, mobile, ...rest } = data;
    const row = { ...rest, message: `Mobile: ${mobile}\n\n${rest.message}` };
    const ins = await admin.from("contact_submissions").insert({ ...row, topic: "sustainability" }).select("id").single();
    if (ins.error) { console.error("contact insert", ins.error); throw new Error("Could not send your message. Please try again."); }
    let sent = false;
    try {
      const { data: s } = await admin.from("email_settings").select("*").eq("id", 1).maybeSingle();
      const settings = s as (EmailSettings & { sustainability_to: string }) | null;
      if (settings && smtpReady(settings)) {
        const rows: [string, string][] = [["Name", data.full_name], ["Email", data.email], ["Mobile", data.mobile], ["Organisation", data.organisation || "—"], ["Message", data.message]];
        const html = brandedEmail("New sustainability enquiry", `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows.map(([k, v]) => `<tr><td style="padding:6px 8px;color:#6b7785;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:6px 8px">${esc(v).replace(/\n/g, "<br>")}</td></tr>`).join("")}</table>`);
        const { sendMail } = await import("@/lib/send-mail.server");
        await sendMail(settings, { from: { name: settings.from_name, email: settings.from_email }, to: settings.sustainability_to?.trim() || "investors@ramky.com", replyTo: { email: data.email, name: data.full_name }, subject: `Sustainability enquiry — ${data.full_name}`, html });
        sent = true;
        await admin.from("contact_submissions").update({ email_sent: true }).eq("id", ins.data.id);
      }
    } catch (e) { console.error("contact email", e); }
    return { ok: true, emailed: sent };
  });
