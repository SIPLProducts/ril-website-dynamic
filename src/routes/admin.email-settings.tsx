import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Info, Mail, Send, X } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminSelect } from "@/components/admin/AdminDialog";
import { getStaff } from "@/lib/admin-auth";
import { getEmailSettings, saveEmailSettings, sendTestEmail } from "@/lib/email-settings.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/email-settings")({
  ssr: false,
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    if (staff.role !== "super_admin") throw redirect({ to: "/admin" });
    return { staff };
  },
  component: EmailSettingsPage,
});

type F = { enabled: boolean; host: string; port: number; secure: boolean; username: string; password: string; from_email: string; from_name: string; cc: string[] };
const blank: F = { enabled: false, host: "smtp.gmail.com", port: 587, secure: false, username: "", password: "", from_email: "", from_name: "Ramky Infrastructure — No Reply", cc: [] };
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function EmailSettingsPage() {
  const { staff } = Route.useRouteContext();
  const load = useServerFn(getEmailSettings);
  const save = useServerFn(saveEmailSettings);
  const test = useServerFn(sendTestEmail);
  const [f, setF] = useState<F>(blank);
  const [hasPw, setHasPw] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [ccInput, setCcInput] = useState("");
  const [testTo, setTestTo] = useState("");
  const [busy, setBusy] = useState<"" | "save" | "test">("");

  useEffect(() => {
    load().then((s) => {
      if (!s) return;
      setF({ enabled: s.enabled, host: s.host || blank.host, port: s.port, secure: s.secure, username: s.username, password: "", from_email: s.from_email, from_name: s.from_name, cc: s.cc ?? [] });
      setHasPw(s.hasPassword);
      setTestTo(s.from_email);
    }).catch((e) => toast.error(e instanceof Error ? e.message : "Could not load settings"));
  }, [load]);

  const set = <K extends keyof F>(k: K, v: F[K]) => setF((p) => ({ ...p, [k]: v }));
  const addCc = (raw: string) => {
    const vals = raw.split(/[,\s]+/).map((v) => v.trim()).filter((v) => isEmail(v));
    if (vals.length) setF((p) => ({ ...p, cc: [...new Set([...p.cc, ...vals])] }));
    setCcInput("");
  };

  async function onSave() {
    setBusy("save");
    try {
      await save({ data: { ...f, ...(f.password ? {} : { password: undefined }) } });
      if (f.password) setHasPw(true);
      set("password", "");
      toast.success("Email configuration saved");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
    finally { setBusy(""); }
  }
  async function onTest() {
    if (!isEmail(testTo)) return toast.error("Enter a valid email to send the test to");
    setBusy("test");
    try { await test({ data: { to: testTo } }); toast.success(`Test email sent to ${testTo}`); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Test failed"); }
    finally { setBusy(""); }
  }

  const field = "mt-1.5 h-10";
  return (
    <AdminShell staff={staff} active={{ kind: "email" }} crumbs={["User Management", "Email Configuration"]}>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">Administration</p>
        <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">Email Configuration</h1>
      </div>
      <div className="rounded-xl border border-border bg-background p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2"><Mail className="size-5 text-brand-green" /><h2 className="font-display text-lg font-semibold">No-Reply Email Configuration</h2></div>
        <p className="mt-1 text-sm text-muted-foreground">Sender used for login OTP codes and password reset links.</p>

        <label className="mt-5 flex items-center justify-between rounded-lg border border-border bg-surface p-4">
          <span><span className="block font-semibold">Enable No-Reply Sending</span><span className="block text-xs text-muted-foreground">When off, emails come from the built-in sender instead.</span></span>
          <Switch checked={f.enabled} onCheckedChange={(v) => set("enabled", v)} />
        </label>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div><Label>SMTP Host</Label><Input className={field} value={f.host} onChange={(e) => set("host", e.target.value)} /></div>
          <div><Label>Port</Label><Input className={field} inputMode="numeric" value={f.port} onChange={(e) => set("port", Number(e.target.value.replace(/\D/g, "")) || 0)} /></div>
          <div><Label>Encryption</Label>
            <select className={adminSelect + " mt-1.5"} value={f.secure ? "ssl" : "tls"} onChange={(e) => { const ssl = e.target.value === "ssl"; setF((p) => ({ ...p, secure: ssl, port: ssl ? 465 : 587 })); }}>
              <option value="tls">TLS (587)</option><option value="ssl">SSL (465)</option>
            </select></div>
          <div><Label>Username</Label><Input className={field} value={f.username} onChange={(e) => set("username", e.target.value)} /></div>
          <div><Label>App Password {hasPw && <span className="text-xs font-normal text-muted-foreground">(leave empty to keep existing)</span>}</Label>
            <div className="relative"><Input className={field + " pr-16"} type={showPw ? "text" : "password"} placeholder={hasPw ? "••••••••" : ""} value={f.password} onChange={(e) => set("password", e.target.value)} autoComplete="new-password" />
              <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 mt-[3px] -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground">{showPw ? "Hide" : "Show"}</button></div></div>
          <div><Label>From Email</Label><Input className={field} type="email" value={f.from_email} onChange={(e) => set("from_email", e.target.value)} /></div>
          <div><Label>From Name</Label><Input className={field} value={f.from_name} onChange={(e) => set("from_name", e.target.value)} /></div>
          <div><Label>CC Recipients (optional)</Label>
            <div className="mt-1.5 flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5">
              {f.cc.map((c) => <span key={c} className="admin-badge-live inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">{c}<button type="button" aria-label={`Remove ${c}`} onClick={() => set("cc", f.cc.filter((x) => x !== c))}><X className="size-3" /></button></span>)}
              <input className="min-w-[140px] flex-1 bg-transparent text-sm outline-none" placeholder="Add another…" value={ccInput} onChange={(e) => setCcInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addCc(ccInput); } }} onBlur={() => ccInput && addCc(ccInput)} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Press Enter or comma after each. Invalid entries are skipped.</p></div>
        </div>

        <div className="mt-5 flex items-start gap-2 rounded-lg border border-border bg-surface p-4 text-sm"><Info className="mt-0.5 size-4 shrink-0 text-brand-green" />
          <p>For Gmail, use a Google <b>App password</b> (Google Account → Security → App passwords), not the normal password.</p></div>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-border pt-5">
          <div className="w-full max-w-xs"><Label>Send test to</Label><Input className={field} type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} /></div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onTest} disabled={!!busy}><Send className="size-4" /> {busy === "test" ? "Sending…" : "Send Test Email"}</Button>
            <Button onClick={onSave} disabled={!!busy} className="admin-accent hover:bg-transparent border-0 px-6 hover:opacity-90">{busy === "save" ? "Saving…" : "Save Configuration"}</Button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
