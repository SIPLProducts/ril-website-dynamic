import { useRef, useState, type ReactNode } from "react";
import { UploadCloud, X, type LucideIcon } from "lucide-react";
import logo from "@/assets/ramky-logo-transparent.png.asset.json";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

/** Branded popup used across the admin portal: gradient header, scrollable body, sticky footer. */
export function AdminDialog({ icon: Icon, title, subtitle, onClose, footer, children, wide }: { icon: LucideIcon; title: string; subtitle?: string; onClose: () => void; footer: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`flex max-h-[calc(100vh-2rem)] flex-col gap-0 overflow-hidden rounded-xl border-0 p-0 shadow-2xl ${wide ? "sm:max-w-2xl" : "sm:max-w-lg"} [&>button]:hidden`}>
        <div className="relative bg-background px-6 pb-4 pt-5">
          <div className="flex items-start gap-4">
            <span className="admin-accent grid size-11 shrink-0 place-items-center rounded-xl shadow-md"><Icon className="size-5" /></span>
            <div className="min-w-0 flex-1">
              <DialogTitle className="font-display text-lg font-bold text-foreground">{title}</DialogTitle>
              {subtitle && <DialogDescription className="mt-0.5 text-sm text-muted-foreground">{subtitle}</DialogDescription>}
            </div>
            <img src={logo.url} alt="Ramky" className="hidden h-8 w-auto opacity-90 sm:block" />
            <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-muted-foreground hover:bg-surface hover:text-foreground"><X className="size-5" /></button>
          </div>
          <div className="admin-accent-line absolute inset-x-0 bottom-0 h-[3px]" />
        </div>
        <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        <div className="flex justify-end gap-2 border-t border-border bg-surface px-6 py-4">{footer}</div>
      </DialogContent>
    </Dialog>
  );
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-5 last:mb-0">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-blue">{title}</p>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function FieldError({ msg }: { msg?: string | undefined }) {
  return msg ? <p className="mt-1 text-xs font-medium text-destructive">{msg}</p> : null;
}

const fmtSize = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.ceil(n / 1024)} KB`);

export function FileDropzone({ file, onFile, accept, hint }: { file: File | null; onFile: (f: File | null) => void; accept: string; hint?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); onFile(e.dataTransfer.files?.[0] ?? null); }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${over ? "border-brand-orange bg-brand-orange/5" : "border-border bg-surface hover:border-brand-blue/50"}`}
    >
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      <UploadCloud className="size-8 text-brand-blue" />
      {file ? (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-foreground">{file.name}</span>
          <span className="text-muted-foreground">({fmtSize(file.size)})</span>
          <button type="button" aria-label="Remove file" onClick={(e) => { e.stopPropagation(); onFile(null); if (ref.current) ref.current.value = ""; }} className="rounded p-0.5 hover:bg-muted"><X className="size-4" /></button>
        </div>
      ) : (
        <>
          <p className="text-sm"><span className="font-semibold text-brand-blue">Click to upload</span> or drag and drop</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </>
      )}
    </div>
  );
}

export const adminSelect = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";
