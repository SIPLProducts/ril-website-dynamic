import { useState } from "react";
import { CalendarDays, ChevronDown, ClipboardList, Info, Users } from "lucide-react";
import type { EsgCommittee } from "@/lib/esg-committee";

export function EsgCommitteeAccordion({ committee }: { committee: EsgCommittee }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-5 rounded-sm border border-emerald-700/30 bg-surface">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6">
        <span className="flex items-center gap-3">
          <Users className="size-5 shrink-0 text-emerald-700" aria-hidden="true" />
          <span className="font-display text-lg font-bold text-foreground">{committee.title}</span>
        </span>
        <ChevronDown className={`size-5 shrink-0 text-emerald-700 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div className="space-y-6 border-t border-border p-5 sm:p-6">
          {committee.summary && <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{committee.summary}</p>}
          {committee.composition && (
            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-[0.12em] text-emerald-700">Committee Composition</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{committee.composition}</p>
            </div>
          )}
          {committee.members.length > 0 && (
            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-[0.12em] text-emerald-700">Members</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[32rem] text-left text-sm">
                  <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                    <tr><th className="py-2 pr-4">Name</th><th className="py-2 pr-4">Designation</th><th className="py-2">Role in Committee</th></tr>
                  </thead>
                  <tbody>
                    {committee.members.map((m, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="py-3 pr-4 font-semibold text-foreground">{m.name}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{m.designation || "—"}</td>
                        <td className="py-3 text-muted-foreground">{m.role || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {committee.responsibilities.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.12em] text-emerald-700"><ClipboardList className="size-4" aria-hidden="true" /> Roles & Responsibilities</h3>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
                {committee.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
          {committee.meetings && (
            <div>
              <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.12em] text-emerald-700"><CalendarDays className="size-4" aria-hidden="true" /> Meetings</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{committee.meetings}</p>
            </div>
          )}
          {committee.other && (
            <div>
              <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.12em] text-emerald-700"><Info className="size-4" aria-hidden="true" /> Other Information</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{committee.other}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
