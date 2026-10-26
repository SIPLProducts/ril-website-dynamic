import { describe, expect, it } from "vitest";
import { smtpReady } from "@/lib/email-config";
const full = { enabled: true, host: "smtp.gmail.com", port: 587, username: "u@x.com", password: "p", from_email: "u@x.com" };
describe("smtpReady", () => {
  it("uses SMTP when enabled and complete", () => expect(smtpReady(full)).toBe(true));
  it("falls back when sending is switched off", () => expect(smtpReady({ ...full, enabled: false })).toBe(false));
  it("falls back when the app password is missing", () => expect(smtpReady({ ...full, password: "" })).toBe(false));
  it("falls back when no settings exist", () => expect(smtpReady(null)).toBe(false));
});
