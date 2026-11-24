import { describe, expect, it } from "vitest";
import { createUserFormSchema, phoneSchema } from "@/lib/admin-validation";

const base = { fullName: "Test User", email: "a@b.com", phone: "9876543210", password: "secret123", confirmPassword: "secret123", role: "admin" as const, otpRequired: false, isActive: true };

describe("admin user rules", () => {
  it("accepts a 10-digit Indian mobile and rejects short numbers", () => {
    expect(phoneSchema.safeParse("9876543210").success).toBe(true);
    expect(phoneSchema.safeParse("12345").success).toBe(false);
  });
  it("rejects an invalid email", () => {
    expect(createUserFormSchema.safeParse({ ...base, email: "not-an-email" }).success).toBe(false);
  });
  it("requires passwords of at least 8 characters", () => {
    expect(createUserFormSchema.safeParse({ ...base, password: "short", confirmPassword: "short" }).success).toBe(false);
  });
  it("requires password and confirm password to match", () => {
    expect(createUserFormSchema.safeParse({ ...base, confirmPassword: "different1" }).success).toBe(false);
    expect(createUserFormSchema.safeParse(base).success).toBe(true);
  });
});

import { deleteUserBlocker } from "@/lib/admin-validation";
describe("deleteUserBlocker", () => {
  it("blocks deleting the last Super Admin", () => expect(deleteUserBlocker("a", "b", true, 1)).not.toBeNull());
  it("allows deleting a Super Admin when another remains", () => expect(deleteUserBlocker("a", "b", true, 2)).toBeNull());
  it("blocks self-delete", () => expect(deleteUserBlocker("a", "a", false, 2)).not.toBeNull());
});

import { clientImageError, imageFileError } from "@/lib/admin-validation";
describe("client images", () => {
  it("allows optional content images to be left empty", () => expect(imageFileError(null, false)).toBeNull());
  it("allows a client with only a description", () => expect(clientImageError(null, null, "NHAI")).toBeNull());
  it("needs a logo or a description", () => expect(clientImageError(null, null, "  ")).toBe("Add a logo or a description"));
  it("allows editing without a new file when an image exists", () => expect(clientImageError(null, "storage:a.png")).toBeNull());
  it("rejects images over 5 MB", () => expect(imageFileError({ type: "image/png", size: 6 * 1024 * 1024 }, true)).toBe("Image must be 5 MB or smaller"));
  it("rejects non-image files", () => expect(imageFileError({ type: "application/pdf", size: 10 }, true)).toBe("Use a PNG, JPG, WebP or SVG image"));
});
