import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, ChevronDown, Download, Leaf, Mail, Scale, FileText, Users } from "lucide-react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ESG_SECTIONS } from "@/lib/esg-sections";
import { getEsgPage } from "@/lib/esg-data.functions";

export const Route = createFileRoute("/esg/$slug")({
  loader: async ({ params }) => {
    const section = await getEsgPage({ data: { slug: params.slug } });
    if (!section) throw notFound();
    return section;
  },
  head: ({ loaderData }) => {
    const title = loaderData
      ? `${loaderData.title} — ESG | Ramky Infrastructure`
      : "ESG | Ramky Infrastructure";
    const description =
      loaderData?.hero ?? "Environmental, Social and Governance at Ramky Infrastructure.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: EsgPage,
  notFoundComponent: EsgNotFound,
  errorComponent: ({ error }) => <div role="alert" className="p-10">{error instanceof Error ? error.message : String(error)}</div>,
});

const ICONS = {
  environmental: Leaf,
  social: Users,
  governance: Scale,
  "esg-reporting": FileText,
} as const;

function EsgPage() {
  const section = Route.useLoaderData();
  const Icon = ICONS[section.slug as keyof typeof ICONS] ?? Leaf;
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#0d2b1f] pb-20 pt-36 text-white lg:pb-28 lg:pt-44">
          {section.bannerImage && (
            <>
              <img src={section.bannerImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[#0d2b1f]/75" aria-hidden="true" />
            </>
          )}
          <div
            className="absolute inset-0 opacity-[0.07]"
            aria-hidden="true"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, #34d399 0, transparent 40%), radial-gradient(circle at 80% 70%, #34d399 0, transparent 40%)",
            }}
          />
          <div className="relative mx-auto grid max-w-[1400px] gap-12 px-5 lg:grid-cols-[1fr_18rem] lg:items-end lg:px-10">
            <div className="max-w-4xl">
              <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
                ESG · {section.eyebrow}
              </p>
              <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-7xl">
                {section.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70 sm:text-xl">
                {section.hero}
              </p>
            </div>
            <div className="flex justify-start lg:justify-end">
              <Icon className="size-28 text-emerald-400" strokeWidth={1} aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* Sub-tab navigation */}
        <nav
          aria-label="ESG sections"
          className="sticky top-[76px] z-40 border-b border-border bg-background/95 backdrop-blur"
        >
          <div className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-5 lg:px-10">
            {ESG_SECTIONS.map((item) => (
              <Link
                key={item.slug}
                to="/esg/$slug"
                params={{ slug: item.slug }}
                className="whitespace-nowrap border-b-2 border-transparent px-4 py-4 font-display text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "border-emerald-600 text-emerald-700" }}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </nav>

        {/* Metrics */}
        <section className="mx-auto max-w-[1400px] px-5 py-16 lg:px-10 lg:py-20">
          <p className="eyebrow">
            Key Metrics
            {section.metricsPeriod && (
              <span className="font-normal normal-case tracking-normal text-muted-foreground">
                {" "}| {section.metricsPeriod}
              </span>
            )}
          </p>
          {section.metrics.length > 0 && (
            <div
              className={`mt-8 grid gap-5 sm:grid-cols-2 ${section.metrics.length === 5 ? "lg:grid-cols-3 xl:grid-cols-5" : "lg:grid-cols-4"}`}
            >
              {section.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-sm border border-border bg-surface p-6 transition-shadow hover:shadow-lg"
                >
                  <p className="font-display text-4xl font-bold text-emerald-700 lg:text-5xl">
                    {metric.value}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{metric.label}</p>
                </div>
              ))}
            </div>
          )}
          {section.metricGroups?.map((group) => (
            <div key={group.title} className="mt-10">
              <h2 className="border-l-4 border-emerald-600 pl-3 font-display text-xl font-bold text-foreground">
                {group.title}
              </h2>
              <div className={`mt-5 grid gap-5 sm:grid-cols-2 ${group.metrics.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
                {group.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-sm border border-border bg-surface p-6 transition-shadow hover:shadow-lg"
                  >
                    <p className="font-display text-4xl font-bold text-emerald-700">{metric.value}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {section.governance && (
            <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,22rem)_1fr]">
              <div className="flex flex-col justify-center rounded-sm border border-emerald-700/30 bg-surface p-8">
                <p className="font-display text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
                  {section.governance.highlight.title}
                </p>
                <p className="mt-4 font-display text-6xl font-bold text-emerald-700">
                  {section.governance.highlight.value}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {section.governance.highlight.label}
                </p>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {section.governance.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 rounded-sm border border-border bg-surface p-5 transition-shadow hover:shadow-lg"
                  >
                    <Scale className="size-5 shrink-0 text-emerald-700" aria-hidden="true" />
                    <span className="font-display text-base font-semibold text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Accordions */}
        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-[1400px] px-5 py-16 lg:px-10 lg:py-20">
            <p className="eyebrow">In Detail</p>
            <div className="mt-8 max-w-4xl divide-y divide-border border-y border-border">
              {section.accordions.map((item, index) => {
                const open = openIndex === index;
                return (
                  <div key={item.title}>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(open ? -1 : index)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left"
                    >
                      <span className="font-display text-lg font-semibold text-foreground">
                        {item.title}
                      </span>
                      <ChevronDown
                        className={`size-5 shrink-0 text-emerald-700 transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </button>
                    {open && (
                      <p className="max-w-3xl pb-6 leading-relaxed text-muted-foreground">
                        {item.body}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Reports (ESG Reporting tab only) */}
        {section.reports && section.reports.length > 0 && (
          <section className="border-t border-border">
            <div className="mx-auto max-w-[1400px] px-5 py-16 lg:px-10 lg:py-20">
              <p className="eyebrow">Downloads</p>
              <h2 className="mt-4 font-display text-3xl font-bold">Reports &amp; Frameworks</h2>
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {section.reports.map((report) => (
                  <div
                    key={report.title}
                    className="flex flex-col rounded-sm border border-border bg-background p-6 transition-shadow hover:shadow-lg"
                  >
                    <FileText className="size-8 text-emerald-700" strokeWidth={1.5} aria-hidden="true" />
                    <p className="mt-4 font-display text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      {report.year}
                    </p>
                    <h3 className="mt-2 font-display text-lg font-semibold leading-snug">
                      {report.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {report.description}
                    </p>
                    {report.url ? (
                      <a
                        href={report.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-sm bg-emerald-700 px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90"
                      >
                        <Download className="size-4" /> Download PDF
                      </a>
                    ) : (
                      <span className="mt-5 inline-flex items-center justify-center rounded-sm border border-border px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        Coming soon
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-[#0d2b1f] text-white">
          <div className="mx-auto flex max-w-[1400px] flex-col items-start gap-8 px-5 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-20">
            <div className="max-w-2xl">
              <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
                Talk To Us
              </p>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight lg:text-4xl">
                Questions about our sustainability commitments?
              </h2>
              <p className="mt-4 text-white/70">
                Our sustainability team is happy to share data, discuss partnerships or walk you
                through our reports.
              </p>
            </div>
            <a
              href="mailto:sustainability@ramky.com"
              className="inline-flex items-center gap-2 rounded-sm bg-emerald-500 px-7 py-4 font-display text-sm font-semibold uppercase tracking-[0.12em] text-[#0d2b1f] transition-opacity hover:opacity-90"
            >
              <Mail className="size-4" /> Contact Sustainability Team
            </a>
          </div>
        </section>

        {/* Back link */}
        <div className="mx-auto max-w-[1400px] px-5 py-10 lg:px-10">
          <a
            href="/#sustainability"
            className="inline-flex items-center gap-2 font-display text-sm font-semibold uppercase text-brand-blue transition-colors hover:text-brand-orange"
          >
            <ArrowLeft className="size-4" /> Back to Sustainability
          </a>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function EsgNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex min-h-[70vh] max-w-[1400px] items-center px-5 pt-28 lg:px-10">
        <div>
          <p className="eyebrow">ESG</p>
          <h1 className="mt-4 text-4xl font-bold">Section not found</h1>
          <a
            href="/#sustainability"
            className="mt-7 inline-flex items-center gap-2 font-display text-sm font-semibold text-brand-blue"
          >
            <ArrowLeft className="size-4" /> Back to Sustainability
          </a>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
