import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDialog, FieldError, FormSection, adminSelect } from "@/components/admin/AdminDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { KeyRound, Pencil, Plus, UserPlus, UserCog } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getStaff, type StaffRole } from "@/lib/admin-auth";
import { createUserFormSchema, passwordSchema, updateUserSchema } from "@/lib/admin-validation";
import { createAdminUser, resetAdminPassword, updateAdminUser } from "@/lib/admin-users.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/admin/users")({
  ssr: false,
  validateSearch: z.object({ new: z.boolean().optional() }),
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    if (staff.role !== "super_admin") throw redirect({ to: "/admin" });
    return { me: staff.id, staff };
  },
  component: UsersPage,
});

type Row = { user_id: string; full_name: string; email: string; phone: string; otp_required: boolean; is_active: boolean; role: StaffRole };
type Form = { userId?: string; fullName: string; email: string; phone: string; password: string; confirmPassword: string; role: StaffRole; otpRequired: boolean; isActive: boolean };
const blank: Form = { fullName: "", email: "", phone: "", password: "", confirmPassword: "", role: "admin", otpRequired: false, isActive: true };

function UsersPage() {
  const { me, staff } = Route.useRouteContext();
  const search = Route.useSearch();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Form | null>(null);
  const [resetFor, setResetFor] = useState<Row | null>(null);
  const update = useServerFn(updateAdminUser);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [{ data: profiles, error }, { data: roles }] = await Promise.all([
        supabase.from("admin_profiles").select("*").order("created_at"),
        supabase.from("user_roles").select("user_id,role"),
      ]);
      if (error) throw error;
      return (profiles ?? []).map((p) => ({ ...p, role: (roles ?? []).some((r) => r.user_id === p.user_id && r.role === "super_admin") ? "super_admin" : "admin" })) as Row[];
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-users"] });
  useEffect(() => { if (search.new) { setForm(blank); nav({ to: "/admin/users", search: {}, replace: true }); } }, [search.new, nav]);

  async function toggleActive(r: Row) {
    try {
      await update({ data: { userId: r.user_id, fullName: r.full_name, phone: r.phone, role: r.role, otpRequired: r.otp_required, isActive: !r.is_active } });
      toast.success(r.is_active ? "Account deactivated" : "Account activated");
      refresh();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  return (
    <AdminShell staff={staff} active={{ kind: "users" }} crumbs={["User Management", "All users"]}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">Administration</p><h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">User Management</h1><p className="mt-1 text-sm text-muted-foreground">Only accounts listed here can sign in to the admin portal.</p></div>
        <Button onClick={() => setForm(blank)} className="admin-accent h-10 border-0 px-5 shadow-md hover:opacity-90"><Plus className="size-4" /> Create user</Button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-background shadow-[var(--shadow-card)]">
        <table className="w-full text-sm">
          <thead className="text-left text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            <tr className="border-b border-border"><th className="px-5 py-3">User</th><th className="px-4 py-3">Mobile</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">OTP</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">Loading…</td></tr>}
            {rows.map((r) => (
              <tr key={r.user_id} className="hover:bg-surface/60">
                <td className="px-5 py-3"><div className="flex items-center gap-3">
                  <span className="admin-accent grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold">{r.full_name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}</span>
                  <div className="min-w-0"><p className="truncate font-semibold">{r.full_name}{r.user_id === me && <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span>}</p><p className="truncate text-xs text-muted-foreground">{r.email}</p></div>
                </div></td>
                <td className="px-4 py-3 text-muted-foreground">{r.phone || "—"}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.role === "super_admin" ? "bg-brand-orange/12 text-brand-orange" : "bg-brand-blue/10 text-brand-blue"}`}>{r.role === "super_admin" ? "Super Admin" : "Admin"}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{r.otp_required ? "On" : "Off"}</td>
                <td className="px-4 py-3">
                  <label className="flex items-center gap-2"><Switch checked={r.is_active} disabled={r.user_id === me} onCheckedChange={() => toggleActive(r)} aria-label="Active" /><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.is_active ? "admin-badge-live" : "admin-badge-draft"}`}>{r.is_active ? "Active" : "Inactive"}</span></label>
                </td>
                <td className="px-5 py-3"><div className="flex justify-end gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setForm({ ...blank, userId: r.user_id, fullName: r.full_name, email: r.email, phone: r.phone, role: r.role, otpRequired: r.otp_required, isActive: r.is_active })}><Pencil className="size-4" /> Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => setResetFor(r)}><KeyRound className="size-4" /> Reset password</Button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {form && <UserDialog initial={form} isSelf={form.userId === me} onClose={() => setForm(null)} onSaved={() => { setForm(null); refresh(); }} />}
      {resetFor && <ResetDialog row={resetFor} onClose={() => setResetFor(null)} />}
    </AdminShell>
  );
}

function UserDialog({ initial, isSelf, onClose, onSaved }: { initial: Form; isSelf: boolean; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const create = useServerFn(createAdminUser);
  const update = useServerFn(updateAdminUser);
  const editing = Boolean(f.userId);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = editing ? updateUserSchema.safeParse({ ...f }) : createUserFormSchema.safeParse(f);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      if (editing) await update({ data: { userId: f.userId!, fullName: f.fullName, phone: f.phone, role: f.role, otpRequired: f.otpRequired, isActive: f.isActive } });
      else await create({ data: { fullName: f.fullName, email: f.email, phone: f.phone, password: f.password, role: f.role, otpRequired: f.otpRequired, isActive: f.isActive } });
      toast.success(editing ? "User updated" : "User created — they can sign in now");
      onSaved();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Save failed"); }
    finally { setBusy(false); }
  }

  const sel = adminSelect + " mt-1.5";
  return (
    <AdminDialog wide icon={editing ? UserCog : UserPlus} title={editing ? "Edit user" : "Create user"} subtitle={editing ? f.email : "Give a team member access to the admin portal"} onClose={onClose}
      footer={<><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" form="user-form" disabled={busy} className="admin-accent border-0 px-6 hover:opacity-90">{busy ? "Saving…" : editing ? "Save changes" : "Create user"}</Button></>}>
      <form id="user-form" onSubmit={save} noValidate>
        <FormSection title="Profile">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Full name *</Label><Input value={f.fullName} onChange={(e) => set("fullName", e.target.value)} className="mt-1.5 h-10" /><FieldError msg={errors.fullName} /></div>
            <div><Label>Mobile number *</Label><Input inputMode="tel" placeholder="98XXXXXXXX" value={f.phone} onChange={(e) => set("phone", e.target.value)} className="mt-1.5 h-10" /><FieldError msg={errors.phone} /></div>
          </div>
          <div><Label>Email *</Label><Input type="email" disabled={editing} value={f.email} onChange={(e) => set("email", e.target.value)} className="mt-1.5 h-10" /><FieldError msg={errors.email} /></div>
        </FormSection>
        {!editing && (
          <FormSection title="Password">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Password *</Label><Input type="password" autoComplete="new-password" value={f.password} onChange={(e) => set("password", e.target.value)} className="mt-1.5 h-10" /><FieldError msg={errors.password} /></div>
              <div><Label>Confirm password *</Label><Input type="password" autoComplete="new-password" value={f.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} className="mt-1.5 h-10" /><FieldError msg={errors.confirmPassword} /></div>
            </div>
          </FormSection>
        )}
        <FormSection title="Access">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Role</Label><select disabled={isSelf} value={f.role} onChange={(e) => set("role", e.target.value as StaffRole)} className={sel}><option value="admin">Admin</option><option value="super_admin">Super Admin</option></select></div>
            <div><Label>Status</Label><select disabled={isSelf} value={f.isActive ? "active" : "inactive"} onChange={(e) => set("isActive", e.target.value === "active")} className={sel}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4">
            <Checkbox className="mt-0.5" checked={f.otpRequired} onCheckedChange={(v) => set("otpRequired", v === true)} />
            <span><span className="block text-sm font-semibold">Require OTP verification</span><span className="block text-xs text-muted-foreground">A code is emailed at each login.</span></span>
          </label>
        </FormSection>
      </form>
    </AdminDialog>
  );
}

function ResetDialog({ row, onClose }: { row: Row; onClose: () => void }) {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const reset = useServerFn(resetAdminPassword);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const p = passwordSchema.safeParse(pw);
    if (!p.success) return setError(p.error.issues[0]!.message);
    if (pw !== confirm) return setError("Passwords do not match");
    try { await reset({ data: { userId: row.user_id, password: pw } }); toast.success("Password reset"); onClose(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed"); }
  }
  return (
    <AdminDialog icon={KeyRound} title="Reset password" subtitle={row.full_name} onClose={onClose}
      footer={<><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" form="reset-form" className="admin-accent border-0 px-6 hover:opacity-90">Reset password</Button></>}>
      <form id="reset-form" onSubmit={save} className="space-y-4">
        <div><Label>New password</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1.5 h-10" /></div>
        <div><Label>Confirm password</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1.5 h-10" /></div>
        <FieldError msg={error} />
      </form>
    </AdminDialog>
  );
}
