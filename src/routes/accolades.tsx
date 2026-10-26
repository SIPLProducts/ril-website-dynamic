import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Award as AwardIcon, ChevronDown } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ACCOLADES_SETTINGS, type Award, groupAwards } from "@/lib/accolades";

const TITLE = "Accolades | Ramky Infrastructure";
const DESCRIPTION = "Awards and recognitions earned by Ramky Infrastructure, year by year.";

export const Route = createFileRoute("/accolades")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccoladesPage,
});

function AwardItem({ a }: { a: Award }) {
  return (
    <article className="grid gap-6 border-b border-border py-8 last:border-b-0 md:grid-cols-[minmax(0,20rem)_1fr]">
      {a.image ? (
        <img src={a.image} alt={a.imageAltText ?? a.awardTitle} loading="lazy" className="h-auto w-full rounded-sm border border-border object-contain" />
      ) : (
        <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-sm border border-border bg-surface px-5 text-center text-muted-foreground">
          <AwardIcon className="size-12" strokeWidth={1} aria-hidden="true" />
          <span className="text-sm">Award photograph coming soon</span>
        </div>
      )}
      <div className="min-w-0">
        {a.awardCategory && <p className="eyebrow">{a.awardCategory}</p>}
        <h3 className="mt-2 font-display text-xl font-semibold text-brand-blue">{a.awardTitle}</h3>
        <p className="mt-2 font-display text-sm font-semibold text-brand-orange">{a.awardingOrganisation}</p>
        {a.projectOrInitiative && <p className="mt-2 text-sm text-foreground/80">{a.projectOrInitiative}</p>}
        {a.description && <p className="mt-4 leading-relaxed text-muted-foreground">{a.description}</p>}
      </div>
    </article>
  );
}

function AwardsAccordionRow({ id, title, year, awards, open, onToggle }: { id: string; title: string; year?: number; awards: Award[]; open: boolean; onToggle: () => void }) {
  const panelId = `${id}-panel`;
  return (
    <section className="border-b border-background">
      <h2 className="m-0">
        <button type="button" id={`${id}-button`} aria-expanded={open} aria-controls={panelId} onClick={onToggle} className="flex w-full items-center justify-between gap-4 bg-muted px-4 py-4 text-left hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring sm:px-6">
          <span className="flex items-center gap-3 font-display text-base font-bold uppercase tracking-[0.08em] text-foreground">
            <ChevronDown className={`size-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
            {title}
          </span>
          {year !== undefined && <span className="font-display text-sm font-bold text-foreground">{year}</span>}
        </button>
      </h2>
      <div id={panelId} role="region" aria-labelledby={`${id}-button`} hidden={!open} className="px-1 sm:px-2">
        {awards.map((a) => <AwardItem key={a.id} a={a} />)}
      </div>
    </section>
  );
}

function AccoladesPage() {
  const settings = ACCOLADES_SETTINGS;
  const { rows, past, expandedYear } = groupAwards(settings);
  const [open, setOpen] = useState<Set<string>>(() => new Set([`year-${expandedYear}`]));
  const toggle = (k: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pb-20 pt-32 lg:pt-36">
        <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
          <p className="eyebrow">Accolades</p>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Celebrating achievements and milestones.</h1>
          <div className="mt-12">
            {rows.map((g) => (
              <AwardsAccordionRow key={g.year} id={`year-${g.year}`} title={settings.rowTitle} year={g.year} awards={g.awards} open={open.has(`year-${g.year}`)} onToggle={() => toggle(`year-${g.year}`)} />
            ))}
            {past.length > 0 && (
              <AwardsAccordionRow id="past" title={settings.pastLabel} awards={past} open={open.has("past")} onToggle={() => toggle("past")} />
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
