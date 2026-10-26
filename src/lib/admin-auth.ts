import { supabase } from "@/integrations/supabase/client";

/** Returns the signed-in user only when they hold the admin role (checked by the database). */
export async function getAdminUser() {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { user: null, isAdmin: false };
  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
  return { user, isAdmin: Boolean(isAdmin) };
}
