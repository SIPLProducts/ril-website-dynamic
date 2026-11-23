// Sends SMTP mail on Lovable hosting (worker-mailer) and on a self-hosted Node server (nodemailer).
export type MailCfg = { host: string; port: number; secure: boolean; username: string; password: string };
export type MailMsg = {
  from: { name: string; email: string }; to: string; cc?: string[]; replyTo?: { name: string; email: string };
  subject: string; html: string; attachments?: { filename: string; content: string; mimeType?: string | undefined }[];
};
const isNode = typeof process !== "undefined" && !!process.versions?.node && typeof (globalThis as any).WebSocketPair === "undefined";

/** Load nodemailer from the server's installed packages (project folder first, then next to the build). */
async function loadNodemailer() {
  const { createRequire } = await import(/* @vite-ignore */ "node:module" as string);
  const bases = [`${process.cwd()}/`, import.meta.url];
  let last: unknown;
  for (const b of bases) {
    try { return createRequire(b)("nodemailer"); } catch (e) { last = e; }
  }
  throw new Error(`Mail library (nodemailer) is not installed on the server. Run npm install in the site folder. ${String(last)}`);
}

/** Turn an SMTP/transport error into a short admin-readable reason, never including secrets. */
export function friendlySmtpError(e: unknown, secrets: string[] = []): string {
  const raw = e instanceof Error ? `${e.message} ${(e as any).code ?? ""} ${(e as any).responseCode ?? ""}` : String(e);
  const t = raw.toLowerCase();
  let msg: string;
  if (t.includes("nodemailer")) msg = "Mail library is not installed on the server. Run npm install, rebuild and restart.";
  else if (/535|534|invalid login|authentication|auth.*fail|username and password not accepted|badcredentials/.test(t)) msg = "Login rejected by the mail server. Check the username and password (for Gmail/Office 365 use an App Password).";
  else if (/econnrefused|etimedout|timeout|enotfound|ehostunreach|econnreset|getaddrinfo/.test(t)) msg = "Cannot reach the mail server. Check the host and port, and that the server firewall allows outgoing SMTP.";
  else if (/certificate|tls|ssl|wrong version/.test(t)) msg = "Encryption mismatch. Use port 465 with SSL on, or port 587 with SSL off (STARTTLS).";
  else if (/550|553|554|sender|from address|not owned|relay/.test(t)) msg = "The mail server refused the sender or recipient. The From email usually must match the login account.";
  else msg = `Sending failed: ${raw.slice(0, 200)}`;
  for (const sec of secrets) if (sec) msg = msg.split(sec).join("***");
  return msg;
}

export async function sendMail(c: MailCfg, m: MailMsg) {
  if (isNode) {
    const mod: any = await loadNodemailer();
    const t = (mod.default ?? mod).createTransport({ host: c.host, port: c.port, secure: c.secure, auth: { user: c.username, pass: c.password } });
    await t.sendMail({
      from: { name: m.from.name, address: m.from.email }, to: m.to, cc: m.cc?.length ? m.cc : undefined,
      replyTo: m.replyTo ? { name: m.replyTo.name, address: m.replyTo.email } : undefined, subject: m.subject, html: m.html,
      attachments: m.attachments?.map((a) => ({ filename: a.filename, content: a.content, encoding: "base64", contentType: a.mimeType })),
    });
    return;
  }
  const { WorkerMailer } = await import("worker-mailer");
  await WorkerMailer.send(
    { host: c.host, port: c.port, secure: c.secure, startTls: !c.secure, credentials: { username: c.username, password: c.password }, authType: ["plain", "login"] },
    { from: m.from, to: m.to, ...(m.cc?.length ? { cc: m.cc } : {}), ...(m.replyTo ? { reply: m.replyTo } : {}), subject: m.subject, html: m.html, ...(m.attachments ? { attachments: m.attachments } : {}) } as any,
  );
}
