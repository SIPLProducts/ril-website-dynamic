import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const DEFAULT_MILESTONES = [
  { year: "1994", text: "Ramky Founded" },
  { year: "1995", text: "Enters Water and Wastewater Management" },
  { year: "1998", text: "Expanded to Industrial Parks and Urban Infrastructure" },
  { year: "2004", text: "Launches India’s first sector-specific Industrial Park (VPCL)" },
  { year: "2005", text: "Enters Integrated Township Development (Discovery City)" },
  { year: "2006", text: "First Ever Private Equity across Infrastructure Peers" },
  { year: "2008", text: "Achieves ISO 9001:2008 certification" },
  { year: "2010", text: "Enters capital markets through IPO" },
  { year: "2014", text: "Completed NAM Expressway Road BOT" },
  { year: "2017", text: "Completed India’s largest WTE Plant, Delhi" },
  { year: "2018", text: "Received PCOD for Srinagar-Banihal Expressway" },
  { year: "2021", text: "Completed 2-million-square-foot township project" },
  { year: "2022", text: "Commissioned India’s first leachate treatment plant (2MLD)" },
  { year: "2023", text: "HAM Project in Water & Wastewater" },
  { year: "2025", text: "Completed 320 MLD STP Project with SBR Technology, Nagole, Hyderabad" },
  { year: "2026", text: "Transformation Strategy with 3 New Orders worth INR 6500 Crores" },
];

export function HistoryMilestones({ items }: { items?: { year: string; text: string }[] }) {
  const MILESTONES = items?.length ? items : DEFAULT_MILESTONES;
  const [active, setActive] = useState(0);
  const total = MILESTONES.length;
  const railRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const current = MILESTONES[active]!;

  const go = (i: number) => setActive(Math.max(0, Math.min(total - 1, i)));

  useEffect(() => {
    const rail = railRef.current;
    const btn = rail?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (rail && btn) {
      rail.scrollTo({ left: btn.offsetLeft - rail.clientWidth / 2 + btn.clientWidth / 2, behavior: "smooth" });
    }
  }, [active]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(active + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(active - 1); }
    if (e.key === "Home") { e.preventDefault(); go(0); }
    if (e.key === "End") { e.preventDefault(); go(total - 1); }
  };

  const progress = ((active + 1) / total) * 100;
  const accent = ["bg-brand-orange", "bg-brand-green", "bg-brand-blue"][active % 3];

  return (
    <main className="overflow-hidden bg-surface pb-20 pt-32 lg:pb-24 lg:pt-40">
      <section className="mx-auto max-w-[1400px] px-5 lg:px-10" aria-roledescription="carousel" aria-label="Ramky history and milestones">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">About Ramky</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">History &amp; Milestones</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              From a bold beginning in 1994 to landmark infrastructure across India, every year marks another step forward.
            </p>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <NavButton dir="prev" disabled={active === 0} onClick={() => go(active - 1)} />
            <NavButton dir="next" disabled={active === total - 1} onClick={() => go(active + 1)} />
          </div>
        </div>

        {/* Year rail */}
        <div className="relative mt-10">
          <div
            ref={railRef}
            role="tablist"
            aria-label="Milestone years"
            onKeyDown={onKey}
            className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-3 [scrollbar-width:thin]"
          >
            {MILESTONES.map((m, i) => {
              const isActive = i === active;
              return (
                <button
                  key={`${m.year}-${i}`}
                  data-index={i}
                  role="tab"
                  id={`ms-tab-${i}`}
                  aria-selected={isActive}
                  aria-controls="ms-panel"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => go(i)}
                  className={`group relative min-w-[5.5rem] shrink-0 snap-center rounded-sm border px-4 py-3 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                    isActive
                      ? "border-transparent bg-ink text-ink-foreground shadow-[var(--shadow-card)]"
                      : i < active
                        ? "border-border bg-card text-foreground/70 hover:border-primary/40 hover:text-foreground"
                        : "border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <span className="block font-display text-[0.6rem] font-bold uppercase tracking-[0.16em] opacity-70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-0.5 block font-display text-lg font-bold">{m.year}</span>
                  <span className={`absolute inset-x-0 bottom-0 h-[3px] rounded-b-sm transition-all ${isActive ? "bg-brand-orange" : "bg-transparent"}`} />
                </button>
              );
            })}
          </div>
          <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-border" aria-hidden="true">
            <div
              className="h-full bg-gradient-to-r from-brand-orange via-brand-green to-brand-blue transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Active milestone panel */}
        <div
          id="ms-panel"
          role="tabpanel"
          aria-labelledby={`ms-tab-${active}`}
          aria-live="polite"
          onTouchStart={(e) => (touchX.current = e.touches[0]!.clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0]!.clientX - touchX.current;
            if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
            touchX.current = null;
          }}
          className="relative mt-8 overflow-hidden rounded-sm border border-border bg-card shadow-[var(--shadow-card)]"
        >
          <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="ink-panel relative flex min-h-48 flex-col justify-between overflow-hidden p-7 sm:p-10 md:min-h-80">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-8 -right-4 select-none font-display text-[9rem] font-bold leading-none text-ink-foreground/[0.06] sm:text-[12rem]"
              >
                {current.year}
              </span>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-ink-foreground/70">
                Milestone {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </p>
              <p key={`y-${active}`} className="hero-text-in relative mt-6 font-display text-6xl font-bold leading-none sm:text-7xl lg:text-8xl">
                {current.year}
              </p>
              <span className={`relative mt-6 block h-1 w-14 ${accent}`} aria-hidden="true" />
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
              <p className="eyebrow">Our Journey</p>
              <p key={`t-${active}`} className="hero-text-in mt-4 font-display text-2xl font-semibold leading-snug text-foreground sm:text-3xl lg:text-4xl">
                {current.text}
              </p>
              <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6">
                <p className="text-sm text-muted-foreground">
                  {active > 0 ? <>Previous: <span className="font-semibold text-foreground">{MILESTONES[active - 1]!.year}</span></> : "The beginning"}
                </p>
                <p className="text-right text-sm text-muted-foreground">
                  {active < total - 1 ? <>Next: <span className="font-semibold text-foreground">{MILESTONES[active + 1]!.year}</span></> : "Latest milestone"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 md:hidden">
          <NavButton dir="prev" disabled={active === 0} onClick={() => go(active - 1)} />
          <p className="text-xs text-muted-foreground">Swipe or tap a year</p>
          <NavButton dir="next" disabled={active === total - 1} onClick={() => go(active + 1)} />
        </div>
      </section>
    </main>
  );
}

function NavButton({ dir, disabled, onClick }: { dir: "prev" | "next"; disabled: boolean; onClick: () => void }) {
  const label = dir === "prev" ? "Previous milestone" : "Next milestone";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-11 items-center gap-2 rounded-sm border border-border bg-card px-4 font-display text-xs font-semibold uppercase tracking-[0.12em] text-foreground transition-colors hover:border-brand-orange hover:text-brand-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
    >
      {dir === "prev" && <ArrowLeft className="size-4" aria-hidden="true" />}
      <span className="hidden sm:inline">{dir === "prev" ? "Previous" : "Next"}</span>
      {dir === "next" && <ArrowRight className="size-4" aria-hidden="true" />}
    </button>
  );
}
