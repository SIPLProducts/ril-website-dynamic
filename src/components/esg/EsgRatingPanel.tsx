import { Download, FileText, Leaf, Scale, Users } from "lucide-react";
import nseLogo from "@/assets/nse-sustainability-logo.png.asset.json";
import { RATING_CATEGORIES, type EsgRating } from "@/lib/esg-rating";
import { publishedFileUrl } from "@/lib/file-url";

const PILLAR_ICON = { Environment: Leaf, Social: Users, Governance: Scale } as const;

/** Public ESG Rating block: NSE logo, year-wise ratings, category, pillar scores, synopsis and report PDF. */
export function EsgRatingPanel({ rating, onOpen }: { rating: EsgRating | null; onOpen: (doc: { title: string; url: string }) => void }) {
  if (!rating || (!rating.ratings.length && !rating.category)) {
    return <section className="mx-auto max-w-[1400px] px-5 py-16 lg:px-10"><p className="text-muted-foreground">The ESG rating will be published here soon.</p></section>;
  }
  const pdf = publishedFileUrl(rating.pdf);
  const latest = rating.ratings[0];
  const prev = rating.ratings[1];
  const diff = latest && prev ? Number(latest.score) - Number(prev.score) : NaN;
  const dl = pdf ? (pdf.startsWith("/files/") ? `${pdf}?download` : pdf) : null;
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-14 lg:px-10 lg:py-20">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="rounded-sm border border-border bg-card p-6 lg:p-8">
          <img src={nseLogo.url} alt="NSE Sustainability Ratings & Analytics" className="h-16 w-auto object-contain" />
          <p className="mt-6 eyebrow">ESG Rating{rating.reviewDate && <span className="font-normal normal-case tracking-normal text-muted-foreground"> | Last reviewed {rating.reviewDate}</span>}</p>
          <div className="mt-4 flex flex-wrap items-end gap-6">
            {rating.ratings.map((r, i) => (
              <div key={r.year}>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{r.year.replace(/^FY/, "FY ")}{r.note && <span className="normal-case"> ({r.note})</span>}</p>
                <p className={`font-display font-bold tabular-nums ${i === 0 ? "text-6xl text-brand-orange" : "text-4xl text-muted-foreground"}`}>{r.score}<span className="text-base font-medium text-muted-foreground">/100</span></p>
              </div>
            ))}
          </div>
          {Number.isFinite(diff) && diff !== 0 && <p className={`mt-2 text-sm font-semibold ${diff > 0 ? "text-brand-green" : "text-brand-orange"}`}>{diff > 0 ? "Up" : "Down"} {Math.abs(diff)} points vs {prev!.year.replace(/^FY/, "FY ")}</p>}
          {rating.category && (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rating category</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {RATING_CATEGORIES.map((c) => (
                  <span key={c.name} className={`rounded-sm px-2.5 py-1 text-xs font-semibold ${c.name === rating.category ? "bg-brand-green text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{c.name}</span>
                ))}
              </div>
              {rating.categoryNote && <p className="mt-3 text-sm text-muted-foreground">{rating.categoryNote}</p>}
            </div>
          )}
          {pdf && (
            <div className="mt-6 flex flex-wrap gap-2">
              <button type="button" onClick={() => onOpen({ title: "NSE ESG Rating Report", url: pdf })} className="inline-flex items-center gap-2 rounded-sm bg-brand-orange px-4 py-2 text-sm font-semibold text-primary-foreground"><FileText className="size-4" /> Explore</button>
              <a href={dl!} download className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface"><Download className="size-4" /> Download PDF</a>
            </div>
          )}
        </div>
        <div>
          {rating.pillars.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-3">
              {rating.pillars.map((p) => {
                const Icon = PILLAR_ICON[p.name as keyof typeof PILLAR_ICON] ?? Leaf;
                return (
                  <div key={p.name} className="rounded-sm border border-border bg-surface p-5">
                    <Icon className="size-5 text-brand-green" />
                    <p className="mt-3 font-display text-4xl font-bold tabular-nums text-brand-green">{p.score}</p>
                    <p className="text-sm font-semibold">{p.name} score</p>
                    {p.weight && <p className="text-xs text-muted-foreground">Weightage {p.weight}</p>}
                    <div className="mt-3 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-brand-green" style={{ width: `${Math.min(100, Number(p.score) || 0)}%` }} /></div>
                  </div>
                );
              })}
            </div>
          )}
          {rating.coreRating && <p className="mt-4 text-sm text-muted-foreground">Core ESG Rating (based on assured BRSR Core data): <span className="font-semibold text-foreground">{rating.coreRating}</span></p>}
          {rating.synopsis && (
            <div className="mt-6">
              <h2 className="font-display text-xl font-semibold">Synopsis</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{rating.synopsis}</p>
            </div>
          )}
          {rating.drivers.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {rating.drivers.map((d) => (
                <div key={d.pillar}>
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-brand-green">{d.pillar} — key drivers</h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    {d.points.map((p) => <li key={p} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-orange" />{p}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
