import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, Lock, Mail } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { getStaff, readStaff } from "@/lib/admin-auth";
import { sendLoginOtp, sendPasswordReset } from "@/lib/email-settings.functions";
import { NeuButton, NeuField, NeuShell, NeuTitle } from "@/components/admin/NeuAuth";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  beforeLoad: async () => {
    if (await getStaff()) throw redirect({ to: "/admin" });
  },
  component: AdminLogin,
});

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address");
type Step = "login" | "otp" | "forgot";

function AdminLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const fail = async (msg: string) => {
    await supabase.auth.signOut();
    setError(msg);
    setBusy(false);
  };

  async function sendOtp(addr: string) {
    const viaSmtp = await sendLoginOtp({ data: { email: addr } }).catch(() => ({ sent: false }));
    if (viaSmtp.sent) { setCooldown(60); return; }
    const { error } = await supabase.auth.signInWithOtp({ email: addr, options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/admin` } });
    if (error) throw error;
    setCooldown(60);
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setInfo("");
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) return setError(parsed.error.issues[0]!.message);
    if (!password) return setError("Enter your password");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: parsed.data, password });
    if (error) return fail("Invalid email or password.");
    const staff = await readStaff();
    if (!staff) return fail("This account does not have admin access.");
    if (!staff.isActive) return fail("Your account is inactive. Contact the Super Admin.");
    if (staff.otpRequired) {
      await supabase.auth.signOut();
      try {
        await sendOtp(parsed.data);
        setStep("otp");
        setInfo(`A verification code has been sent to ${parsed.data}.`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not send the code");
      }
      setBusy(false);
      return;
    }
    navigate({ to: "/admin", replace: true });
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\d{6,8}$/.test(code)) return setError("Enter the code from your email");
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: code, type: "email" });
    if (error) { setBusy(false); return setError("Invalid or expired code."); }
    const staff = await getStaff();
    if (!staff) return fail("Your account is inactive. Contact the Super Admin.");
    navigate({ to: "/admin", replace: true });
  }

  async function forgot(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setInfo("");
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) return setError(parsed.error.issues[0]!.message);
    setBusy(true);
    const redirectTo = `${window.location.origin}/admin/reset-password`;
    const viaSmtp = await sendPasswordReset({ data: { email: parsed.data, redirectTo } }).catch(() => ({ sent: false }));
    if (!viaSmtp.sent) await supabase.auth.resetPasswordForEmail(parsed.data, { redirectTo });
    setBusy(false);
    setInfo("If this email belongs to an admin account, a reset link has been sent.");
  }

  return (
    <NeuShell>
      {step === "login" && (
        <form onSubmit={login} noValidate className="space-y-4">
          <NeuTitle title="Login" subtitle="Sign in to your account" />
          <NeuField icon={<Mail className="size-4" />} type="email" placeholder="Email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
          <NeuField icon={<Lock className="size-4" />} type="password" placeholder="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Password" />
          <div className="flex justify-end text-xs">
            <button type="button" onClick={() => { setStep("forgot"); setError(""); setInfo(""); }} className="opacity-75 hover:opacity-100">Forgot password?</button>
          </div>
          {error && <p role="alert" className="neu-accent text-center text-sm">{error}</p>}
          <NeuButton type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</NeuButton>
          <p className="pt-1 text-center text-xs opacity-70">Authorised Ramky staff only</p>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={verify} className="space-y-4">
          <NeuTitle title="Verify OTP" subtitle="Enter the code sent to your email" />
          {info && <p className="text-center text-xs opacity-80">{info}</p>}
          <NeuField icon={<KeyRound className="size-4" />} inputMode="numeric" autoComplete="one-time-code" maxLength={8} placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} aria-label="Verification code" className="tracking-[0.5em]" />
          {error && <p role="alert" className="neu-accent text-center text-sm">{error}</p>}
          <NeuButton type="submit" disabled={busy}>{busy ? "Verifying…" : "Verify"}</NeuButton>
          <div className="flex justify-between text-xs">
            <button type="button" onClick={() => { setStep("login"); setCode(""); setError(""); }} className="opacity-75 hover:opacity-100">Back to login</button>
            <button type="button" disabled={cooldown > 0} onClick={async () => { setError(""); try { await sendOtp(email.trim().toLowerCase()); setInfo("A new code has been sent."); } catch (err) { setError(err instanceof Error ? err.message : "Could not resend"); } }} className="neu-accent font-semibold disabled:opacity-50">
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </form>
      )}

      {step === "forgot" && (
        <form onSubmit={forgot} noValidate className="space-y-4">
          <NeuTitle title="Reset" subtitle="We'll email you a reset link" />
          <NeuField icon={<Mail className="size-4" />} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
          {error && <p role="alert" className="neu-accent text-center text-sm">{error}</p>}
          {info && <p className="text-center text-sm">{info}</p>}
          <NeuButton type="submit" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</NeuButton>
          <p className="text-center text-xs"><button type="button" onClick={() => { setStep("login"); setError(""); setInfo(""); }} className="neu-accent font-semibold">Back to login</button></p>
        </form>
      )}
    </NeuShell>
  );
}
