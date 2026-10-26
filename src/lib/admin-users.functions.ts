import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createUserSchema, resetPasswordSchema, updateUserSchema } from "@/lib/admin-validation";

async function assertSuper(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("is_super_admin", { _user_id: context.userId });
  if (!data) throw new Error("Only a Super Admin can manage users.");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function setRole(admin: any, userId: string, role: string) {
  await admin.from("user_roles").delete().eq("user_id", userId);
  const { error } = await admin.from("user_roles").insert({ user_id: userId, role });
  if (error) throw new Error(error.message);
}

export const createAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createUserSchema.parse(d))
  .handler(async ({ data, context }) => {
    const admin = await assertSuper(context);
    const { data: created, error } = await admin.auth.admin.createUser({ email: data.email, password: data.password, email_confirm: true, user_metadata: { full_name: data.fullName } });
    if (error || !created.user) throw new Error(error?.message.includes("already") ? "An account with this email already exists." : (error?.message ?? "Could not create user"));
    const id = created.user.id;
    const { error: pErr } = await admin.from("admin_profiles").insert({ user_id: id, full_name: data.fullName, email: data.email, phone: data.phone, otp_required: data.otpRequired, is_active: data.isActive });
    if (pErr) throw new Error(pErr.message);
    await setRole(admin, id, data.role);
    return { id };
  });

export const updateAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateUserSchema.parse(d))
  .handler(async ({ data, context }) => {
    const admin = await assertSuper(context);
    if (data.userId === context.userId && (!data.isActive || data.role !== "super_admin")) throw new Error("You cannot deactivate or demote your own account.");
    const { error } = await admin.from("admin_profiles").update({ full_name: data.fullName, phone: data.phone, otp_required: data.otpRequired, is_active: data.isActive }).eq("user_id", data.userId);
    if (error) throw new Error(error.message);
    await setRole(admin, data.userId, data.role);
    return { ok: true };
  });

export const resetAdminPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => resetPasswordSchema.parse(d))
  .handler(async ({ data, context }) => {
    const admin = await assertSuper(context);
    const { error } = await admin.auth.admin.updateUserById(data.userId, { password: data.password });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
