import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EMPTY_COMMITTEE, parseCommittee, type EsgCommittee } from "@/lib/esg-committee";
import { FormSection } from "@/components/admin/AdminDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function EsgCommitteeEditor() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-esg-committee"], queryFn: async () => {
    const { data, error } = await supabase.from("esg_pages").select("committee").eq("slug", "governance").maybeSingle();
    if (error) throw error;
    return parseCommittee(data?.committee);
  } });
  const [c, setC] = useState<EsgCommittee>(EMPTY_COMMITTEE);
  const [resp, setResp] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) { setC({ ...data, members: data.members.length ? data.members : [] }); setResp(data.responsibilities.join("\n")); } }, [data]);

  const setMember = (i: number, k: "name" | "designation" | "role", v: string) => setC({ ...c, members: c.members.map((m, j) => (j === i ? { ...m, [k]: v } : m)) });
  const moveMember = (i: number, d: -1 | 1) => { const m = [...c.members]; const t = m[i + d]; if (!t) return; m[i + d] = m[i]!; m[i] = t; setC({ ...c, members: m }); };

  async function save() {
    if (c.members.some((m) => !m.name.trim() && (m.designation.trim() || m.role.trim()))) { toast.error("Every member needs a name"); return; }
    setSaving(true);
    const committee = { ...c, title: c.title.trim() || "ESG Committee", members: c.members.filter((m) => m.name.trim()), responsibilities: resp.split("\n").map((r) => r.trim()).filter(Boolean) };
    const { error } = await supabase.from("esg_pages").update({ committee }).eq("slug", "governance");
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved — now live on the website");
    qc.invalidateQueries({ queryKey: ["admin-esg-committee"] });
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">ESG Committee</h2>
          <p className="text-sm text-muted-foreground">Expandable section on the Governance page. Leave everything empty to hide it.</p>
        </div>
        <Button onClick={save} disabled={saving} className="neu-btn-gradient border-0"><Save className="size-4" /> {saving ? "Saving…" : "Save"}</Button>
      </div>
      <FormSection title="Overview">
        <div><Label>Heading</Label><Input value={c.title} maxLength={120} onChange={(e) => setC({ ...c, title: e.target.value })} /></div>
        <div><Label>Introduction <span className="text-muted-foreground">(optional)</span></Label><Textarea rows={3} maxLength={4000} value={c.summary} onChange={(e) => setC({ ...c, summary: e.target.value })} /></div>
        <div><Label>Committee composition <span className="text-muted-foreground">(optional)</span></Label><Textarea rows={3} maxLength={4000} placeholder="e.g. The Committee comprises three Directors, two of whom are Independent." value={c.composition} onChange={(e) => setC({ ...c, composition: e.target.value })} /></div>
      </FormSection>
      <FormSection title="Members">
        <div className="space-y-3">
          {c.members.map((m, i) => (
            <div key={i} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <div><Label>Name</Label><Input value={m.name} maxLength={120} onChange={(e) => setMember(i, "name", e.target.value)} /></div>
              <div><Label>Designation</Label><Input value={m.designation} maxLength={160} placeholder="e.g. Independent Director" onChange={(e) => setMember(i, "designation", e.target.value)} /></div>
              <div><Label>Role in committee</Label><Input value={m.role} maxLength={120} placeholder="e.g. Chairperson" onChange={(e) => setMember(i, "role", e.target.value)} /></div>
              <div className="flex items-end gap-1">
                <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => moveMember(i, -1)} className="rounded border border-border p-2 disabled:opacity-30"><ArrowUp className="size-3.5" /></button>
                <button type="button" aria-label="Move down" disabled={i === c.members.length - 1} onClick={() => moveMember(i, 1)} className="rounded border border-border p-2 disabled:opacity-30"><ArrowDown className="size-3.5" /></button>
                <button type="button" aria-label="Remove member" onClick={() => setC({ ...c, members: c.members.filter((_, j) => j !== i) })} className="btn-grad-danger grid size-9 place-items-center rounded-md"><Trash2 className="size-4" /></button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => setC({ ...c, members: [...c.members, { name: "", designation: "", role: "" }] })}><Plus className="size-4" /> Add member</Button>
        </div>
      </FormSection>
      <FormSection title="Responsibilities & meetings">
        <div><Label>Roles & responsibilities <span className="text-muted-foreground">(one per line)</span></Label><Textarea rows={5} maxLength={8000} value={resp} onChange={(e) => setResp(e.target.value)} /></div>
        <div><Label>Meeting details <span className="text-muted-foreground">(optional)</span></Label><Textarea rows={3} maxLength={4000} placeholder="e.g. The Committee meets at least twice a year. Two meetings were held in FY 2025–26." value={c.meetings} onChange={(e) => setC({ ...c, meetings: e.target.value })} /></div>
        <div><Label>Other information <span className="text-muted-foreground">(optional)</span></Label><Textarea rows={3} maxLength={4000} value={c.other} onChange={(e) => setC({ ...c, other: e.target.value })} /></div>
      </FormSection>
    </section>
  );
}
