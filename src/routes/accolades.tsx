import { Formatted } from "@/components/site/Formatted";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState, type CSSProperties } from "react";
import { shapeRatio, sizeWidth } from "@/lib/accolade-image";
import { Award as AwardIcon, ChevronDown } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { accoladesQuery, type PublicAward } from "@/lib/accolades-data.functions";
import { fyFromEnd, fyOf } from "@/lib/fiscal-year";

const TITLE = "Accolades | Ramky Infrastructure";
const DESCRIPTION = "Awards and recognitions earned by Ramky Infrastructure, financial year by financial year.";
/** How many recent financial years get their own row; older ones go under Past Awards. */
const FY_ROWS = 3;

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
  loader: ({ context }) => context.queryClient.ensureQueryData(accoladesQuery()),
  component: AccoladesPage,
});

function AwardItem({ a }: { a: PublicAward }) {
  const d = a.display;
  const ratio = shapeRatio(d.shape);
  const width = sizeWidth(d.size);
  return (
    <article className="grid gap-6 border-b border-border py-8 last:border-b-0 md:grid-cols-[var(--award-w)_1fr]" style={{ "--award-w": `minmax(0,${width})` } as CSSProperties}>
      {a.image ? (
        ratio ? (
          <div className="relative isolate w-full overflow-hidden rounded-sm border border-border bg-muted" style={{ aspectRatio: ratio }}>
            {d.fit === "contain" && <img src={a.image} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 -z-10 h-full w-full scale-110 object-cover opacity-60 blur-xl" />}
            <img src={a.image} alt={a.altText ?? a.title} loading="lazy" className={d.fit === "cover" ? "h-full w-full object-cover" : "h-full w-full object-contain p-2 drop-shadow-lg"} />
          </div>
        ) : (
          <div className="self-start overflow-hidden rounded-sm border border-border bg-muted">
            <img src={a.image} alt={a.altText ?? a.title} loading="lazy" className="block h-auto w-full" />
          </div>
        )
      ) : (
        <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-sm border border-border bg-surface px-5 text-center text-muted-foreground">
          <AwardIcon className="size-12" strokeWidth={1} aria-hidden="true" />
          <span className="text-sm">Award photograph coming soon</span>
        </div>
      )}
      <div className="min-w-0">
        {a.category && <p className="eyebrow"><Formatted text={a.category} /></p>}
        <h3 className="mt-2 font-display text-xl font-semibold text-brand-blue"><Formatted text={a.title} /></h3>
        <p className="mt-2 font-display text-sm font-semibold text-brand-orange"><Formatted text={a.organisation} /></p>
        {a.project && <p className="mt-2 text-sm text-foreground/80"><Formatted text={a.project} /></p>}
        {a.description && <p className="mt-4 leading-relaxed text-muted-foreground"><Formatted text={a.description} /></p>}
      </div>
    </article>
  );
}

function Row({ id, title, right, awards, open, onToggle }: { id: string; title: string; right?: string; awards: PublicAward[]; open: boolean; onToggle: () => void }) {
  return (
    <section className="border-b border-background">
      <h2 className="m-0">
        <button type="button" id={`${id}-button`} aria-expanded={open} aria-controls={`${id}-panel`} onClick={onToggle} className="flex w-full items-center justify-between gap-4 bg-muted px-4 py-4 text-left hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring sm:px-6">
          <span className="flex items-center gap-3 font-display text-base font-bold uppercase tracking-[0.08em] text-foreground">
            <ChevronDown className={`size-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
            {title}
          </span>
          {right && <span className="font-display text-sm font-bold text-foreground">{right}</span>}
        </button>
      </h2>
      <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-button`} hidden={!open} className="px-1 sm:px-2">
        {awards.map((a) => <AwardItem key={a.id} a={a} />)}
      </div>
    </section>
  );
}

function AccoladesPage() {
  const { data: awards } = useSuspenseQuery(accoladesQuery());
  const byFy = new Map<number, PublicAward[]>();
  for (const a of awards) {
    const y = fyOf(a.awardDate).endYear;
    byFy.set(y, [...(byFy.get(y) ?? []), a]);
  }
  for (const list of byFy.values()) list.sort((a, b) => a.sortOrder - b.sortOrder);
  const years = [...byFy.keys()].sort((a, b) => b - a);
  const rowYears = years.slice(0, FY_ROWS);
  const past = years.slice(FY_ROWS).flatMap((y) => byFy.get(y)!);
  const [open, setOpen] = useState<Set<string>>(() => new Set(years[0] ? [`fy-${years[0]}`] : []));
  const toggle = (k: string) => setOpen((p) => { const n = new Set(p); if (n.has(k)) n.delete(k); else n.add(k); return n; });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pb-20 pt-32 lg:pt-36">
        <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
          <p className="eyebrow">Accolades</p>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Celebrating achievements and milestones.</h1>
          <div className="mt-12">
            {rowYears.map((y) => {
              const fy = fyFromEnd(y);
              return <Row key={y} id={`fy-${y}`} title="Awards" right={fy.label} awards={byFy.get(y)!} open={open.has(`fy-${y}`)} onToggle={() => toggle(`fy-${y}`)} />;
            })}
            {past.length > 0 && <Row id="past" title="Past Awards" awards={past} open={open.has("past")} onToggle={() => toggle("past")} />}
            {!years.length && <p className="text-muted-foreground">Awards will be listed here soon.</p>}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
