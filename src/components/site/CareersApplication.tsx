import { useState } from "react";
import { CheckCircle2, Upload } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { RESUME_MAX, submitApplication } from "@/lib/careers-apply.functions";

const ACCEPTED = ".pdf,.doc,.docx";
const FIELDS = [
  { name: "full_name", label: "Full name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email address", type: "email", autoComplete: "email" },
  { name: "mobile", label: "Mobile number", type: "tel", autoComplete: "tel" },
  { name: "location", label: "Current location", type: "text", autoComplete: "address-level2" },
  { name: "qualification", label: "Highest qualification", type: "text", autoComplete: "off" },
];

export function CareersApplication({ position, reference, open, onOpenChange }: { position: string; reference: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const submit = useServerFn(submitApplication);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!fileName) { setFileError("Please attach your resume."); return; }
    setBusy(true); setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("position", position); fd.set("reference", reference);
    try { await submit({ data: fd }); setDone(true); }
    catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg.startsWith("[") ? "Please check the details you entered." : msg || "Could not submit. Please try again.");
    } finally { setBusy(false); }
  }

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto">
      <DialogTitle className="pr-5 text-xl leading-snug">Apply for {position}</DialogTitle>
      <DialogDescription>{reference ? `Job Req ID ${reference}` : "Ramky Infrastructure Limited"}</DialogDescription>
      {done ? <div role="status" className="flex flex-col items-start gap-3 border-l-2 border-brand-green bg-surface p-5">
        <p className="flex items-center gap-2 text-lg font-semibold"><CheckCircle2 className="size-5 text-brand-green" />Application submitted</p>
        <p className="text-sm leading-relaxed text-muted-foreground">Thank you for applying. Our recruitment team will review your profile and contact you if it matches the role.</p>
        <Button onClick={() => onOpenChange(false)}>Close</Button>
      </div> :
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
        {FIELDS.map((f) => <label className="grid gap-2 text-sm" key={f.name}>{f.label} *<Input name={f.name} type={f.type} autoComplete={f.autoComplete} maxLength={200} required /></label>)}
        <label className="grid gap-2 text-sm">Total work experience (years)<Input name="experience" type="number" min="0" max="60" step="0.5" /></label>
        <label className="grid gap-2 text-sm sm:col-span-2">Position applied for<Input value={position} readOnly /></label>
        <label className="grid gap-2 text-sm sm:col-span-2">Short cover note (optional)<textarea name="cover_note" rows={3} maxLength={2000} className="w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" /></label>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="careers-resume" className="flex items-center gap-2 text-sm"><Upload className="size-4 text-brand-blue" />Resume / CV *</label>
          <Input id="careers-resume" name="resume" type="file" accept={ACCEPTED} className="h-auto py-3" aria-describedby="resume-help resume-error" onChange={(e) => {
            const file = e.target.files?.[0];
            setFileName(""); setFileError("");
            if (!file) return;
            if (!/\.(pdf|doc|docx)$/i.test(file.name)) { setFileError("Choose a PDF, DOC or DOCX file."); e.target.value = ""; return; }
            if (file.size === 0 || file.size > RESUME_MAX) { setFileError("Choose a non-empty file no larger than 5 MB."); e.target.value = ""; return; }
            setFileName(file.name);
          }} />
          <p id="resume-help" className="text-xs text-muted-foreground">PDF, DOC or DOCX · Maximum 5 MB</p>
          <p id="resume-error" role="alert" className="text-sm text-destructive">{fileError}</p>
        </div>
        <label className="flex items-start gap-3 text-sm leading-relaxed sm:col-span-2"><input type="checkbox" required className="mt-1 size-4 shrink-0" />I consent to the processing of my information for recruitment by Ramky Infrastructure Limited.</label>
        {error && <p role="alert" className="text-sm text-destructive sm:col-span-2">{error}</p>}
        <div className="sm:col-span-2"><Button type="submit" disabled={busy}>{busy ? "Submitting…" : "Submit Application"}</Button></div>
      </form>}
    </DialogContent>
  </Dialog>;
}
