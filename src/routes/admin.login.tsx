import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAdminUser } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  beforeLoad: async () => {
    const { isAdmin } = await getAdminUser();
    if (isAdmin) throw redirect({ to: "/admin" });
  },
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setBusy(false);
      return setError("Invalid email or password.");
    }
    const { isAdmin } = await getAdminUser();
    if (!isAdmin) {
      await supabase.auth.signOut();
      setBusy(false);
      return setError("This account does not have admin access.");
    }
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-sm border border-border bg-background p-8 shadow-sm">
        <div className="flex size-11 items-center justify-center rounded-full bg-brand-blue text-primary-foreground"><Lock className="size-5" /></div>
        <h1 className="mt-4 font-display text-2xl font-bold text-brand-blue">Admin Portal</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ramky Infrastructure · authorised staff only</p>
        <div className="mt-6 space-y-4">
          <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" /></div>
          <div><Label htmlFor="password">Password</Label><Input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" /></div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={busy} className="w-full">{busy ? "Signing in…" : "Sign in"}</Button>
        </div>
      </form>
    </div>
  );
}
