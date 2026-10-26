import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, KeyRound, Pencil, Plus } from "lucide-react";
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/users")({
  ssr: false,
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    if (staff.role !== "super_admin") throw redirect({ to: "/admin" });
    return { me: staff.id };
  },
  component: UsersPage,
});

type Row = { user_id: string; full_name: string; email: string; phone: string; otp_required: boolean; is_active: boolean; role: StaffRole };
type Form = { userId?: string; fullName: string; email: string; phone: string; password: string; confirmPassword: string; role: StaffRole; otpRequired: boolean; isActive: boolean };
const blank: Form = { fullName: "", email: "", phone: "", password: "", confirmPassword: "", role: "admin", otpRequired: false, isActive: true };

function UsersPage() {
  const { me } = Route.useRouteContext();
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

  async function toggleActive(r: Row) {
    try {
      await update({ data: { userId: r.user_id, fullName: r.full_name, phone: r.phone, role: r.role, otpRequired: r.otp_required, isActive: !r.is_active } });
      toast.success(r.is_active ? "Account deactivated" : "Account activated");
      refresh();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="flex items-center justify-between bg-brand-blue px-6 py-3 text-primary-foreground">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm"><ArrowLeft className="size-4" /> Back to content</Link>
        <span className="font-display text-sm font-bold">User Management</span>
      </header>
      <main className="mx-auto max-w-6xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="font-display text-2xl font-bold text-brand-blue">Admins & Super Admins</h1><p className="text-sm text-muted-foreground">Only accounts listed here can sign in to the admin portal.</p></div>
          <Button onClick={() => setForm(blank)}><Plus className="size-4" /> Create user</Button>
        </div>
        <div className="mt-5 overflow-x-auto rounded-sm border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3">Full name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Mobile</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">OTP</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>}
              {rows.map((r) => (
                <tr key={r.user_id}>
                  <td className="px-4 py-3 font-medium">{r.full_name}{r.user_id === me && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}</td>
                  <td className="px-4 py-3">{r.email}</td>
                  <td className="px-4 py-3">{r.phone || "—"}</td>
                  <td className="px-4 py-3">{r.role === "super_admin" ? "Super Admin" : "Admin"}</td>
                  <td className="px-4 py-3">{r.otp_required ? "On" : "Off"}</td>
                  <td className="px-4 py-3">
                    <label className="flex items-center gap-2"><Switch checked={r.is_active} disabled={r.user_id === me} onCheckedChange={() => toggleActive(r)} aria-label="Active" /><span className={r.is_active ? "text-foreground" : "text-muted-foreground"}>{r.is_active ? "Active" : "Inactive"}</span></label>
                  </td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setForm({ ...blank, userId: r.user_id, fullName: r.full_name, email: r.email, phone: r.phone, role: r.role, otpRequired: r.otp_required, isActive: r.is_active })}><Pencil className="size-4" /> Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => setResetFor(r)}><KeyRound className="size-4" /> Reset password</Button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      {form && <UserDialog initial={form} isSelf={form.userId === me} onClose={() => setForm(null)} onSaved={() => { setForm(null); refresh(); }} />}
      {resetFor && <ResetDialog row={resetFor} onClose={() => setResetFor(null)} />}
    </div>
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

  const err = (k: string) => errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader><DialogTitle>{editing ? "Edit user" : "Create user"}</DialogTitle></DialogHeader>
        <form onSubmit={save} noValidate className="space-y-4">
          <div><Label>Full name</Label><Input value={f.fullName} onChange={(e) => set("fullName", e.target.value)} className="mt-1" />{err("fullName")}</div>
          <div><Label>Email</Label><Input type="email" disabled={editing} value={f.email} onChange={(e) => set("email", e.target.value)} className="mt-1" />{err("email")}</div>
          <div><Label>Mobile number</Label><Input inputMode="tel" placeholder="98XXXXXXXX" value={f.phone} onChange={(e) => set("phone", e.target.value)} className="mt-1" />{err("phone")}</div>
          {!editing && (
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Password</Label><Input type="password" autoComplete="new-password" value={f.password} onChange={(e) => set("password", e.target.value)} className="mt-1" />{err("password")}</div>
              <div><Label>Confirm password</Label><Input type="password" autoComplete="new-password" value={f.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} className="mt-1" />{err("confirmPassword")}</div>
            </div>
          )}
          <div><Label>Role</Label>
            <select disabled={isSelf} value={f.role} onChange={(e) => set("role", e.target.value as StaffRole)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="admin">Admin</option><option value="super_admin">Super Admin</option>
            </select>
          </div>
          <label className="flex items-center gap-3 text-sm"><Checkbox checked={f.otpRequired} onCheckedChange={(v) => set("otpRequired", v === true)} /> Require OTP verification (code emailed at each login)</label>
          <div><Label>Status</Label>
            <select disabled={isSelf} value={f.isActive ? "active" : "inactive"} onChange={(e) => set("isActive", e.target.value === "active")} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Reset password — {row.full_name}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-3">
          <div><Label>New password</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1" /></div>
          <div><Label>Confirm password</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1" /></div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit">Reset</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
