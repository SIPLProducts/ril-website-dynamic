import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Download, Eye, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getStaff } from "@/lib/admin-auth";
import { IR_BUCKET } from "@/lib/investor-relations";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDialog, FormSection } from "@/components/admin/AdminDialog";
import { confirmDelete } from "@/components/admin/ConfirmDelete";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/careers/applications")({
  ssr: false,
  head: () => ({ meta: [{ title: "Applications — Ramky Admin" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  component: Page,
});

type App = { id: string; position: string; reference: string; full_name: string; email: string; mobile: string; location: string; qualification: string; experience: string; cover_note: string; resume_path: string | null; resume_name: string | null; status: string; email_sent: boolean; created_at: string };
const STATUSES = ["new", "reviewed", "shortlisted", "rejected"] as const;
const label = (s: string) => s[0]!.toUpperCase() + s.slice(1);

async function openResume(a: App) {
  if (!a.resume_path) return;
  const { data, error } = await supabase.storage.from(IR_BUCKET).createSignedUrl(a.resume_path, 300, { download: a.resume_name ?? true });
  if (error || !data) { toast.error("Could not open resume"); return; }
  window.open(data.signedUrl, "_blank", "noopener");
}

function Page() {
  const { staff } = Route.useRouteContext();
  const qc = useQueryClient();
  const [view, setView] = useState<App | null>(null);
  const [filter, setFilter] = useState("all");
  const { data: rows = [] } = useQuery({ queryKey: ["admin", "career_applications"], queryFn: async () => {
    const { data, error } = await supabase.from("career_applications").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data as App[];
  } });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "career_applications"] });
  async function setStatus(a: App, status: string) {
    const { error } = await supabase.from("career_applications").update({ status }).eq("id", a.id);
    if (error) toast.error(error.message); else { refresh(); if (view?.id === a.id) setView({ ...a, status }); }
  }
  async function remove(a: App) {
    if (!(await confirmDelete(`Delete the application from "${a.full_name}"?`))) return;
    const { error } = await supabase.from("career_applications").delete().eq("id", a.id);
    if (error) { toast.error(error.message); return; }
    if (a.resume_path) await supabase.storage.from(IR_BUCKET).remove([a.resume_path]);
    toast.success("Deleted"); setView(null); refresh();
  }
  const shown = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  return (
    <AdminShell staff={staff} active={{ kind: "module", module: "careers", section: "applications" }} crumbs={["Careers", "Applications"]}>
      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <div>
            <h2 className="font-display text-xl font-bold">Job applications</h2>
            <p className="text-sm text-muted-foreground">{rows.length} received · submitted from Apply Now on the Current Positions page, and emailed to the address set in Email Configuration</p>
          </div>
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
          </select>
        </div>
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Received</th><th className="px-4 py-3">Applicant</th><th className="px-4 py-3">Position</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {shown.map((a) => (
              <tr key={a.id} className="border-t border-border align-top">
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{new Date(a.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
                <td className="px-4 py-3"><div className="font-medium">{a.full_name}</div><div className="text-xs text-muted-foreground">{a.email} · {a.mobile}</div></td>
                <td className="px-4 py-3">{a.position}{a.reference && <div className="text-xs text-muted-foreground">{a.reference}</div>}</td>
                <td className="px-4 py-3"><select className="rounded border border-input bg-background px-2 py-1 text-xs" value={a.status} onChange={(e) => setStatus(a, e.target.value)}>{STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select></td>
                <td className="px-4 py-3"><div className="flex justify-end gap-1">
                  <Button size="icon" variant="outline" title="View" onClick={() => { setView(a); if (a.status === "new") setStatus(a, "reviewed"); }}><Eye className="size-4" /></Button>
                  <Button size="icon" variant="outline" title="Download resume" disabled={!a.resume_path} onClick={() => openResume(a)}><Download className="size-4" /></Button>
                  <Button size="icon" variant="outline" title="Delete" className="admin-btn-delete" onClick={() => remove(a)}><Trash2 className="size-4" /></Button>
                </div></td>
              </tr>
            ))}
            {!shown.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No applications yet.</td></tr>}
          </tbody>
        </table>
      </section>
      {view && <AdminDialog icon={UserRound} wide title={view.full_name} subtitle={`Applied for ${view.position}`} onClose={() => setView(null)}
        footer={<><Button variant="outline" onClick={() => setView(null)}>Close</Button><Button disabled={!view.resume_path} onClick={() => openResume(view)} className="neu-btn-gradient border-0"><Download className="size-4" /> Download resume</Button></>}>
        <FormSection title="Details">
          <dl className="grid gap-4 sm:grid-cols-3">
            {([["Email", view.email], ["Mobile", view.mobile], ["Location", view.location], ["Qualification", view.qualification], ["Experience (years)", view.experience || "—"], ["Job Req ID", view.reference || "—"], ["Resume", view.resume_name ?? "—"], ["Emailed to careers", view.email_sent ? "Yes" : "No (email not configured)"], ["Status", label(view.status)]] as const).map(([k, v]) => <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="break-words font-medium">{v}</dd></div>)}
          </dl>
          {view.cover_note && <div className="mt-4"><div className="text-xs text-muted-foreground">Cover note</div><p className="whitespace-pre-line">{view.cover_note}</p></div>}
        </FormSection>
      </AdminDialog>}
    </AdminShell>
  );
}
