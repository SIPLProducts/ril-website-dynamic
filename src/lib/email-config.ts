/** Shared (browser-safe) email configuration helpers. */
export type EmailSettings = {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  cc: string[];
};

/** True only when sending is switched on and every field needed to send is filled in. Otherwise the built-in sender is used. */
export function smtpReady(s: Pick<EmailSettings, "enabled" | "host" | "port" | "username" | "password" | "from_email"> | null | undefined): boolean {
  return !!s && s.enabled && !!s.host.trim() && s.port > 0 && !!s.username.trim() && !!s.password && !!s.from_email.trim();
}

const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function brandedEmail(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f3f6f5;font-family:Arial,sans-serif;color:#1f2a3a">
<div style="max-width:520px;margin:24px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e3e8e6">
<div style="background:#0f4d45;padding:18px 24px;color:#ffffff;font-size:18px;font-weight:bold">Ramky Infrastructure</div>
<div style="height:3px;background:linear-gradient(90deg,#f08a24,#1d5fa8)"></div>
<div style="padding:24px"><h2 style="margin:0 0 12px;font-size:20px">${esc(title)}</h2>${body}</div>
<div style="padding:14px 24px;background:#f7f9f8;font-size:12px;color:#6b7785">This is an automated message. Please do not reply.</div>
</div></body></html>`;
}
export const otpEmail = (code: string) => brandedEmail("Your login verification code", `<p>Use this code to finish signing in to the Ramky admin portal:</p><p style="font-size:30px;letter-spacing:8px;font-weight:bold;color:#0f4d45">${esc(code)}</p><p style="font-size:13px;color:#6b7785">If you did not try to sign in, you can ignore this email.</p>`);
export const resetEmail = (link: string) => brandedEmail("Reset your password", `<p>Click the button below to set a new password for the Ramky admin portal.</p><p><a href="${esc(link)}" style="display:inline-block;background:#0f4d45;color:#ffffff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Reset password</a></p><p style="font-size:13px;color:#6b7785">This link works once. If you did not ask for it, ignore this email.</p>`);
