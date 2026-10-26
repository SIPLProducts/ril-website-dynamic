import { useState } from "react";
import { Mail, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const ACCEPTED = ".pdf,.doc,.docx,.rtf,.txt";
const MAX_SIZE = 10 * 1024 * 1024;

export function CareersApplication({ position, reference, open, onOpenChange }: { position: string; reference: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto">
      <DialogTitle className="pr-5 text-xl leading-snug">Apply for {position}</DialogTitle>
      <DialogDescription>Job Req ID {reference}</DialogDescription>
      <p role="status" className="border-l-2 border-brand-orange bg-surface p-4 text-sm leading-relaxed">Online applications are not available yet. Please email your updated resume to <a className="font-semibold text-brand-blue underline" href={`mailto:careers@ramky.com?subject=${encodeURIComponent(`${position} — Job Req ID ${reference}`)}`}>careers@ramky.com</a>, including the position and Job Req ID. This form does not send or save your information.</p>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        {[{ label: "Full name", type: "text", autoComplete: "name" }, { label: "Email address", type: "email", autoComplete: "email" }, { label: "Mobile number", type: "tel", autoComplete: "tel" }, { label: "Current location", type: "text", autoComplete: "address-level2" }, { label: "Highest qualification", type: "text", autoComplete: "off" }].map((field) => <label className="grid gap-2 text-sm" key={field.label}>{field.label}<Input type={field.type} autoComplete={field.autoComplete} required /></label>)}
        <label className="grid gap-2 text-sm">Total work experience (years)<Input type="number" min="0" step="0.5" /></label>
        <label className="grid gap-2 text-sm sm:col-span-2">Position applied for<Input value={position} readOnly /></label>
        <label className="grid gap-2 text-sm sm:col-span-2">Short cover note (optional)<textarea rows={3} className="w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" /></label>
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="careers-resume" className="flex items-center gap-2 text-sm"><Upload className="size-4 text-brand-blue" />Resume / CV</label>
          <Input id="careers-resume" type="file" accept={ACCEPTED} className="h-auto py-3" aria-describedby="resume-help resume-error" onChange={(e) => {
            const file = e.target.files?.[0];
            setFileName(""); setFileError("");
            if (!file) return;
            if (!/\.(pdf|doc|docx|rtf|txt)$/i.test(file.name)) { setFileError("Choose a PDF, DOC, DOCX, RTF or TXT file."); e.target.value = ""; return; }
            if (file.size === 0 || file.size > MAX_SIZE) { setFileError("Choose a non-empty file no larger than 10 MB."); e.target.value = ""; return; }
            setFileName(file.name);
          }} />
          <p id="resume-help" className="text-xs text-muted-foreground">PDF, DOC, DOCX, RTF or TXT · Maximum 10 MB. Files are not uploaded.</p>
          {fileName && <p className="break-all text-sm">Selected: {fileName}</p>}
          <p id="resume-error" role="alert" className="text-sm text-destructive">{fileError}</p>
        </div>
        <label className="flex items-start gap-3 text-sm leading-relaxed sm:col-span-2"><input type="checkbox" required className="mt-1 size-4 shrink-0" />I consent to the processing of my information for recruitment by Ramky Infrastructure Limited. Online collection is currently unavailable; information entered here remains on this page only.</label>
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <Button type="submit" disabled>Submit Application</Button>
          <Button asChild variant="outline"><a href={`mailto:careers@ramky.com?subject=${encodeURIComponent(`${position} — Job Req ID ${reference}`)}`}><Mail />Apply by email</a></Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}