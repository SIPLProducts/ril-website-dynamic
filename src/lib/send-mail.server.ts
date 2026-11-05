// Sends SMTP mail on Lovable hosting (worker-mailer) and on a self-hosted Node server (nodemailer).
export type MailCfg = { host: string; port: number; secure: boolean; username: string; password: string };
export type MailMsg = {
  from: { name: string; email: string }; to: string; cc?: string[]; replyTo?: { name: string; email: string };
  subject: string; html: string; attachments?: { filename: string; content: string; mimeType?: string | undefined }[];
};
const isNode = typeof process !== "undefined" && !!process.versions?.node && typeof (globalThis as any).WebSocketPair === "undefined";

export async function sendMail(c: MailCfg, m: MailMsg) {
  if (isNode) {
    const name = "nodemailer";
    const mod: any = await import(/* @vite-ignore */ name);
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
