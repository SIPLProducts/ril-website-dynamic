import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { otpEmail, resetEmail, smtpReady, type EmailSettings } from "@/lib/email-config";

async function adminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}
async function assertSuper(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("is_super_admin", { _user_id: context.userId });
  if (!data) throw new Error("Only a Super Admin can manage email settings.");
  return adminClient();
}
async function loadSettings(admin: any): Promise<EmailSettings | null> {
  const { data } = await admin.from("email_settings").select("*").eq("id", 1).maybeSingle();
  return data as EmailSettings | null;
}
async function smtpSend(s: EmailSettings, to: string, subject: string, html: string) {
  const { sendMail } = await import("@/lib/send-mail.server");
  await sendMail(s, { from: { name: s.from_name, email: s.from_email }, to, cc: s.cc, subject, html });
}

export const getEmailSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const admin = await assertSuper(context);
    const s = await loadSettings(admin);
    if (!s) return null;
    const { password, ...rest } = s;
    return { ...rest, hasPassword: !!password };
  });

const saveSchema = z.object({
  enabled: z.boolean(),
  host: z.string().trim().max(200),
  port: z.number().int().min(1).max(65535),
  secure: z.boolean(),
  username: z.string().trim().max(200),
  password: z.string().max(200).optional(),
  from_email: z.string().trim().max(200).refine((v) => !v || z.string().email().safeParse(v).success, "Enter a valid From email"),
  from_name: z.string().trim().max(120),
  cc: z.array(z.string().trim().email()).max(20),
  careers_to: z.string().trim().email("Enter a valid applications email").max(200),
});

export const saveEmailSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => saveSchema.parse(d))
  .handler(async ({ data, context }) => {
    const admin = await assertSuper(context);
    const { password, ...rest } = data;
    const patch: any = { ...rest, updated_at: new Date().toISOString() };
    if (password) patch["password"] = password;
    const { error } = await admin.from("email_settings").update(patch).eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const sendTestEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ to: z.string().trim().email() }).parse(d))
  .handler(async ({ data, context }) => {
    const admin = await assertSuper(context);
    const s = await loadSettings(admin);
    if (!s || !smtpReady({ ...s, enabled: true })) throw new Error("Fill in and save all SMTP fields first.");
    try {
      await smtpSend(s, data.to, "Test email from Ramky admin portal", otpEmail("123456").replace("Your login verification code", "Test email — your SMTP settings work"));
    } catch (e) {
      console.error("SMTP test failed", e);
      throw new Error("Could not send. Check host, port, encryption, username and app password.");
    }
    return { ok: true };
  });

/** Active staff only; returns { sent: false } when SMTP is off so the client uses the built-in sender. */
async function activeStaffId(admin: any, email: string) {
  const { data } = await admin.from("admin_profiles").select("user_id,is_active").eq("email", email).maybeSingle();
  return data && data.is_active ? (data.user_id as string) : null;
}

export const sendLoginOtp = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ email: z.string().trim().toLowerCase().email() }).parse(d))
  .handler(async ({ data }) => {
    const admin = await adminClient();
    const s = await loadSettings(admin);
    if (!smtpReady(s)) return { sent: false };
    if (!(await activeStaffId(admin, data.email))) return { sent: true };
    const { data: link, error } = await admin.auth.admin.generateLink({ type: "magiclink", email: data.email });
    const code = link?.properties?.email_otp;
    if (error || !code) { console.error("generateLink failed", error); return { sent: false }; }
    try { await smtpSend(s!, data.email, "Your Ramky admin login code", otpEmail(code)); return { sent: true }; }
    catch (e) { console.error("SMTP OTP failed", e); return { sent: false }; }
  });

export const sendPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ email: z.string().trim().toLowerCase().email(), redirectTo: z.string().url() }).parse(d))
  .handler(async ({ data }) => {
    const admin = await adminClient();
    const s = await loadSettings(admin);
    if (!smtpReady(s)) return { sent: false };
    if (!(await activeStaffId(admin, data.email))) return { sent: true };
    const site = new URL(data.redirectTo);
    if (!site.pathname.startsWith("/admin/reset-password")) return { sent: true };
    const { data: link, error } = await admin.auth.admin.generateLink({ type: "recovery", email: data.email, options: { redirectTo: data.redirectTo } });
    const url = link?.properties?.action_link;
    if (error || !url) { console.error("generateLink failed", error); return { sent: false }; }
    try { await smtpSend(s!, data.email, "Reset your Ramky admin password", resetEmail(url)); return { sent: true }; }
    catch (e) { console.error("SMTP reset failed", e); return { sent: false }; }
  });
