import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Eye, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getStaff } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDialog } from "@/components/admin/AdminDialog";
import { confirmDelete } from "@/components/admin/ConfirmDelete";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/sustainability/enquiries")({
  ssr: false,
  head: () => ({ meta: [{ title: "Contact Enquiries — Ramky Admin" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  component: Page,
});

type Row = { id: string; full_name: string; email: string; organisation: string; message: string; email_sent: boolean; created_at: string };
const splitMobile = (m: string) => {
  const r = /^Mobile: (.*)\n\n([\s\S]*)$/.exec(m);
  return r ? { mobile: r[1]!, body: r[2]! } : { mobile: "", body: m };
};
const when = (d: string) => new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

function Page() {
  const { staff } = Route.useRouteContext();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [view, setView] = useState<Row | null>(null);
  const { data: rows = [] } = useQuery({ queryKey: ["admin", "contact_submissions"], queryFn: async () => {
    const { data, error } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data as Row[];
  } });
  async function remove(r: Row) {
    if (!(await confirmDelete(`Delete the enquiry from "${r.full_name}"?`))) return;
    const { error } = await supabase.from("contact_submissions").delete().eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted"); setView(null); qc.invalidateQueries({ queryKey: ["admin", "contact_submissions"] });
  }
  const t = q.trim().toLowerCase();
  const shown = t ? rows.filter((r) => [r.full_name, r.email, r.organisation, r.message].some((v) => v.toLowerCase().includes(t))) : rows;
  const v = view ? splitMobile(view.message) : null;
  return (
    <AdminShell staff={staff} active={{ kind: "module", module: "sustainability", section: "enquiries" }} crumbs={["Sustainability", "Contact Enquiries"]}>
      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <div>
            <h2 className="font-display text-xl font-bold">Contact enquiries</h2>
            <p className="text-sm text-muted-foreground">{rows.length} received · from "Contact us" on the Sustainability pages, emailed to the address set in Email Configuration</p>
          </div>
          <input className="w-64 rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Search name, email, message…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Received</th><th className="px-4 py-3">From</th><th className="px-4 py-3">Message</th><th className="px-4 py-3">Email</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {shown.map((r) => { const m = splitMobile(r.message); return (
              <tr key={r.id} className="border-t border-border align-top">
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{when(r.created_at)}</td>
                <td className="px-4 py-3"><div className="font-medium">{r.full_name}</div><div className="text-xs text-muted-foreground">{r.email}{m.mobile && ` · ${m.mobile}`}</div>{r.organisation && <div className="text-xs text-muted-foreground">{r.organisation}</div>}</td>
                <td className="max-w-md px-4 py-3"><p className="line-clamp-2">{m.body}</p></td>
                <td className="px-4 py-3"><span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${r.email_sent ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>{r.email_sent ? "Sent" : "Not sent"}</span></td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <Button size="icon" variant="ghost" aria-label="View" onClick={() => setView(r)}><Eye className="size-4" /></Button>
                  <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => remove(r)}><Trash2 className="size-4" /></Button>
                </td>
              </tr>); })}
            {!shown.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No enquiries yet.</td></tr>}
          </tbody>
        </table>
      </section>
      {view && v && (
        <AdminDialog icon={MessageSquare} title={`Enquiry from ${view.full_name}`} onClose={() => setView(null)} footer={<Button variant="outline" onClick={() => setView(null)}>Close</Button>}>
          <dl className="grid grid-cols-[8rem_1fr] gap-2 text-sm">
            <dt className="text-muted-foreground">Received</dt><dd>{when(view.created_at)}</dd>
            <dt className="text-muted-foreground">Email</dt><dd><a className="text-primary underline" href={`mailto:${view.email}`}>{view.email}</a></dd>
            <dt className="text-muted-foreground">Mobile</dt><dd>{v.mobile || "—"}</dd>
            <dt className="text-muted-foreground">Organisation</dt><dd>{view.organisation || "—"}</dd>
            <dt className="text-muted-foreground">Message</dt><dd className="whitespace-pre-wrap">{v.body}</dd>
          </dl>
        </AdminDialog>
      )}
    </AdminShell>
  );
}
