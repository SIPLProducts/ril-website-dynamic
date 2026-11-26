import { afterEach, describe, expect, it } from "vitest";
import { envSmtp } from "@/lib/smtp-env.server";
const keys = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "CAREERS_MAIL_TO", "SMTP_SECURE"];
afterEach(() => { for (const k of keys) delete process.env[k]; });
describe("envSmtp", () => {
  it("is off when SMTP_HOST is unset", () => { expect(envSmtp()).toBeNull(); });
  it("reads credentials and recipient from the environment", () => {
    process.env["SMTP_HOST"] = "smtp.gmail.com"; process.env["SMTP_USER"] = "me@gmail.com"; process.env["SMTP_PASS"] = "x"; process.env["CAREERS_MAIL_TO"] = "dev@gmail.com";
    const c = envSmtp()!;
    expect([c.port, c.secure, c.from_email, c.careers_to]).toEqual([587, false, "me@gmail.com", "dev@gmail.com"]);
  });
});
