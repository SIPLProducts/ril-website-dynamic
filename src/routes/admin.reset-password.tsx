import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { passwordSchema } from "@/lib/admin-validation";
import { NeuButton, NeuField, NeuShell, NeuTitle } from "@/components/admin/NeuAuth";

export const Route = createFileRoute("/admin/reset-password")({
  ssr: false,
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const p = passwordSchema.safeParse(pw);
    if (!p.success) return setError(p.error.issues[0]!.message);
    if (pw !== confirm) return setError("Passwords do not match");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setError(error.message.includes("session") ? "This reset link has expired. Request a new one from the login page." : error.message);
    await supabase.auth.signOut();
    setDone(true);
  }

  return (
    <NeuShell>
      <form onSubmit={submit} noValidate className="space-y-4">
        <NeuTitle title="New Password" subtitle={done ? "Your password has been updated" : "Choose a new password"} />
        {done ? (
          <NeuButton type="button" onClick={() => navigate({ to: "/admin/login", replace: true })}>Go to login</NeuButton>
        ) : (
          <>
            <NeuField icon={<Lock className="size-4" />} type="password" placeholder="New password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} aria-label="New password" />
            <NeuField icon={<Lock className="size-4" />} type="password" placeholder="Confirm password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-label="Confirm password" />
            {error && <p role="alert" className="neu-accent text-center text-sm">{error}</p>}
            <NeuButton type="submit" disabled={busy}>{busy ? "Saving…" : "Save password"}</NeuButton>
          </>
        )}
      </form>
    </NeuShell>
  );
}
