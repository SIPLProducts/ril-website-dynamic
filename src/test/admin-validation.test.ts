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
