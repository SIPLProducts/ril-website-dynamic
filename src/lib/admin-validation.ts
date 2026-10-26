import { z } from "zod";

export const phoneSchema = z.string().trim().regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(72);

export const userBaseSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  phone: phoneSchema,
  role: z.enum(["admin", "super_admin"]),
  otpRequired: z.boolean(),
  isActive: z.boolean(),
});

export const createUserSchema = userBaseSchema.extend({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(255),
  password: passwordSchema,
});

export const createUserFormSchema = createUserSchema
  .extend({ confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export const updateUserSchema = userBaseSchema.extend({ userId: z.string().uuid() });
export const resetPasswordSchema = z.object({ userId: z.string().uuid(), password: passwordSchema });

/** Returns a reason the user cannot be deleted, or null when deletion is allowed. */
export function deleteUserBlocker(targetId: string, callerId: string, targetIsSuper: boolean, superAdminCount: number): string | null {
  if (targetId === callerId) return "You cannot delete your own account.";
  if (targetIsSuper && superAdminCount <= 1) return "At least one Super Admin must remain.";
  return null;
}
