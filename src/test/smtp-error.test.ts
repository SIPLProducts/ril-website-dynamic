import { describe, expect, it } from "vitest";
import { friendlySmtpError } from "@/lib/send-mail.server";
describe("friendlySmtpError", () => {
  it("explains login failures", () => {
    expect(friendlySmtpError(new Error("535 5.7.8 Username and Password not accepted"))).toMatch(/Login rejected/);
  });
  it("never contains the password", () => {
    expect(friendlySmtpError(new Error("weird failure pw=Secret123"), ["Secret123"])).not.toContain("Secret123");
  });
  it("explains a missing mail library", () => {
    expect(friendlySmtpError(new Error("Cannot find module 'nodemailer'"))).toMatch(/npm install/);
  });
});
