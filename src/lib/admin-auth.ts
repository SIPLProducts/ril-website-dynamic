import { supabase } from "@/integrations/supabase/client";

export type StaffRole = "admin" | "super_admin";
export type Staff = { id: string; email: string; fullName: string; role: StaffRole; otpRequired: boolean; isActive: boolean };

/** Reads the signed-in user's admin profile and role. Returns null when not signed in or not staff. */
export async function readStaff(): Promise<Staff | null> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("admin_profiles").select("full_name,otp_required,is_active").eq("user_id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
  ]);
  const names = (roles ?? []).map((r) => r.role as string);
  const role: StaffRole | null = names.includes("super_admin") ? "super_admin" : names.includes("admin") ? "admin" : null;
  if (!profile || !role) return null;
  return { id: user.id, email: user.email ?? "", fullName: profile.full_name, role, otpRequired: profile.otp_required, isActive: profile.is_active };
}

/** Active staff only — used by the /admin route guards. */
export async function getStaff() {
  const s = await readStaff();
  return s && s.isActive ? s : null;
}
