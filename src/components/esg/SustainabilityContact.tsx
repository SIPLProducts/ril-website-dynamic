import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { contactSchema, submitSustainabilityContact } from "@/lib/contact.functions";

const blank = { full_name: "", email: "", organisation: "", message: "", website: "" };

export function SustainabilityContactButton({ className }: { className?: string }) {
  const submit = useServerFn(submitSustainabilityContact);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof blank, v: string) => setF((p) => ({ ...p, [k]: v }));
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = contactSchema.safeParse(f);
    if (!r.success) { toast.error(r.error.issues[0]?.message ?? "Check the form"); return; }
    setBusy(true);
    try { await submit({ data: r.data }); toast.success("Thank you — your message has been sent to our sustainability team."); setF(blank); setOpen(false); }
    catch (err) { toast.error(err instanceof Error ? err.message : "Could not send"); }
    finally { setBusy(false); }
  }
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}><Mail className="size-4" /> Contact Sustainability Team</button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Contact Sustainability Team</DialogTitle><DialogDescription>Send us your question and our team will get back to you.</DialogDescription></DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <div><Label htmlFor="sc-name">Full name *</Label><Input id="sc-name" maxLength={120} value={f.full_name} onChange={(e) => set("full_name", e.target.value)} /></div>
            <div><Label htmlFor="sc-email">Email *</Label><Input id="sc-email" type="email" maxLength={200} value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
            <div><Label htmlFor="sc-org">Organisation</Label><Input id="sc-org" maxLength={200} value={f.organisation} onChange={(e) => set("organisation", e.target.value)} /></div>
            <div><Label htmlFor="sc-msg">Message *</Label><Textarea id="sc-msg" rows={5} maxLength={2000} value={f.message} onChange={(e) => set("message", e.target.value)} /></div>
            <input tabIndex={-1} autoComplete="off" className="hidden" value={f.website} onChange={(e) => set("website", e.target.value)} aria-hidden />
            <div className="flex justify-end"><Button type="submit" disabled={busy}>{busy ? "Sending…" : "Send message"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
