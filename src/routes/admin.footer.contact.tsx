import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ExternalLink, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getStaff } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { FormSection } from "@/components/admin/AdminDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/footer/contact")({
  ssr: false,
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  component: Page,
});

const EMPTY = { description: "", address: "", phone: "", email: "", tagline: "", copyright_name: "" };

function Page() {
  const { staff } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-footer-settings"], queryFn: async () => {
    const { data, error } = await supabase.from("footer_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    return data;
  } });
  const [f, setF] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setF({ description: data.description, address: data.address, phone: data.phone, email: data.email, tagline: data.tagline, copyright_name: data.copyright_name }); }, [data]);

  async function save() {
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) { toast.error("Please enter a valid email address"); return; }
    setSaving(true);
    const clean = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.trim()])) as typeof f;
    const { error } = await supabase.from("footer_settings").upsert({ id: 1, ...clean });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved — now live on the website footer");
    qc.invalidateQueries({ queryKey: ["admin-footer-settings"] });
    qc.invalidateQueries({ queryKey: ["footer"] });
  }
  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  return (
    <AdminShell staff={staff} active={{ kind: "module", module: "footer", section: "contact" }} crumbs={["Footer", "Contact & About"]}>
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold">Contact & About</h2>
            <p className="text-sm text-muted-foreground">The left side of the website footer (under the Ramky logo) and the bottom copyright line. Shown on every page.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild><a href="/#contact" target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> View on website</a></Button>
            <Button onClick={save} disabled={saving} className="neu-btn-gradient border-0"><Save className="size-4" /> {saving ? "Saving…" : "Save"}</Button>
          </div>
        </div>
        <FormSection title="About text (under the logo)">
          <div><Label>Short company description</Label><Textarea rows={3} maxLength={400} value={f.description} onChange={set("description")} /></div>
        </FormSection>
        <FormSection title="Contact details (leave a field empty to hide it)">
          <div><Label>Address</Label><Textarea rows={2} maxLength={300} value={f.address} onChange={set("address")} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Phone</Label><Input maxLength={40} value={f.phone} onChange={set("phone")} placeholder="+91 40 2301 5000" /></div>
            <div><Label>Email</Label><Input type="email" maxLength={120} value={f.email} onChange={set("email")} placeholder="info@…" /></div>
          </div>
        </FormSection>
        <FormSection title="Bottom line">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Company name in copyright</Label><Input maxLength={120} value={f.copyright_name} onChange={set("copyright_name")} /><p className="mt-1 text-xs text-muted-foreground">Shown as "© {new Date().getFullYear()} {f.copyright_name || "…"}. All rights reserved." — the year updates automatically.</p></div>
            <div><Label>Tagline (bottom right)</Label><Input maxLength={80} value={f.tagline} onChange={set("tagline")} /></div>
          </div>
        </FormSection>
      </section>
    </AdminShell>
  );
}
