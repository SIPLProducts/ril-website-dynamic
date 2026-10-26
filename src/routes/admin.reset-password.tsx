import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { passwordSchema } from "@/lib/admin-validation";
import { NeuButton, NeuField, NeuShell, NeuTitle } from "@/components/admin/NeuAuth";

export const Route = createFileRoute("/admin/reset-password")({
  ssr: false,
  component: ResetPassword,
});

type LinkState = "checking" | "ready" | "expired";

function ResetPassword() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<LinkState>("checking");

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const query = new URLSearchParams(window.location.search);
    if (hash.get("error") || hash.get("error_code") || query.get("error")) {
      setLink("expired");
      return;
    }
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "INITIAL_SESSION")) setLink("ready");
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setLink("ready"); });
    const t = setTimeout(() => setLink((s) => (s === "checking" ? "expired" : s)), 4000);
    return () => { sub.subscription.unsubscribe(); clearTimeout(t); };
  }, []);

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

  const toLogin = () => navigate({ to: "/admin/login", replace: true });

  if (link === "expired" && !done) {
    return (
      <NeuShell>
        <div className="space-y-4">
          <NeuTitle title="Link expired" subtitle="This reset link is invalid or was already used" />
          <p className="text-center text-xs opacity-80">Each link works only once. Use "Forgot password?" on the login page to get a new one.</p>
          <NeuButton type="button" onClick={toLogin}>Back to login</NeuButton>
        </div>
      </NeuShell>
    );
  }

  return (
    <NeuShell>
      <form onSubmit={submit} noValidate className="space-y-4">
        <NeuTitle title="New Password" subtitle={done ? "Your password has been updated" : link === "checking" ? "Checking your link…" : "Choose a new password"} />
        {done ? (
          <NeuButton type="button" onClick={toLogin}>Go to login</NeuButton>
        ) : (
          <>
            <NeuField icon={<Lock className="size-4" />} type="password" placeholder="New password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} aria-label="New password" />
            <NeuField icon={<Lock className="size-4" />} type="password" placeholder="Confirm password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} aria-label="Confirm password" />
            {error && <p role="alert" className="neu-accent text-center text-sm">{error}</p>}
            <NeuButton type="submit" disabled={busy || link !== "ready"}>{busy ? "Saving…" : "Save password"}</NeuButton>
          </>
        )}
      </form>
    </NeuShell>
  );
}
