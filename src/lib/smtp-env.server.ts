// SMTP settings from server environment variables (SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS,
// SMTP_FROM_EMAIL, SMTP_FROM_NAME, CAREERS_MAIL_TO). When SMTP_HOST is set these replace the admin Email
// Configuration sender settings for career emails; the recipient always comes from Admin → Email Configuration, so test or corporate credentials are swapped without code changes.
import type { EmailSettings } from "@/lib/email-config";

export function envSmtp(): (EmailSettings & { careers_to: string }) | null {
  const e = (k: string) => (process.env[k] ?? "").trim();
  const host = e("SMTP_HOST");
  if (!host) return null;
  const port = Number(e("SMTP_PORT") || "587");
  const username = e("SMTP_USER");
  return {
    enabled: true, host, port, secure: e("SMTP_SECURE") ? e("SMTP_SECURE") === "true" : port === 465,
    username, password: process.env["SMTP_PASS"] ?? "",
    from_email: e("SMTP_FROM_EMAIL") || username, from_name: e("SMTP_FROM_NAME") || "Ramky Careers (No-Reply)",
    cc: [], careers_to: e("CAREERS_MAIL_TO"),
  };
}
