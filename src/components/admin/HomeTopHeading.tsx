import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ExternalLink, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { refreshHome } from "@/lib/home-highlights-admin";

export const homeTopAdminQuery = { queryKey: ["admin-home-top"], queryFn: async () => {
  const { data, error } = await supabase.from("home_top").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return data;
} };

export function HomeTopHeading({ eyebrowKey, titleKey, anchor, help }: { eyebrowKey: "journey_eyebrow" | "about_eyebrow"; titleKey: "journey_title" | "about_title"; anchor: string; help: string }) {
  const qc = useQueryClient();
  const { data } = useQuery(homeTopAdminQuery);
  const [f, setF] = useState({ e: "", t: "" });
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setF({ e: data[eyebrowKey], t: data[titleKey] }); }, [data, eyebrowKey, titleKey]);
  async function save() {
    if (!f.t.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    const { error } = await supabase.from("home_top").update({ [eyebrowKey]: f.e.trim(), [titleKey]: f.t.trim() }).eq("id", 1);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved — now live on the website");
    qc.invalidateQueries({ queryKey: ["admin-home-top"] }); refreshHome(qc);
  }
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Section heading</h2>
          <p className="text-sm text-muted-foreground">{help}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><a href={`/#${anchor}`} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /> View on website</a></Button>
          <Button onClick={save} disabled={saving} className="neu-btn-gradient border-0"><Save className="size-4" /> {saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label>Small heading</Label><Input maxLength={60} value={f.e} onChange={(ev) => setF({ ...f, e: ev.target.value })} /></div>
        <div><Label>Title *</Label><Input maxLength={160} value={f.t} onChange={(ev) => setF({ ...f, t: ev.target.value })} /></div>
      </div>
    </section>
  );
}
