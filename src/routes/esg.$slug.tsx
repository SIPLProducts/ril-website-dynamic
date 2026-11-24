import * as React from "react";
import { AutoScrollRail } from "@/components/site/AutoScrollRail";
import type React from "react";
import { isHtml, plainText } from "@/lib/strength-style";
import { Formatted } from "@/components/site/Formatted";
import { SustainabilityContactButton } from "@/components/esg/SustainabilityContact";
import framework2026 from "@/assets/logo-2026.png";
import frameworkBrsr from "@/assets/logo-brsr.png";
import frameworkGri from "@/assets/logo-gri.svg";
import frameworkSasb from "@/assets/logo-sasb.jpg";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, BarChart3, CalendarDays, ChevronDown, ClipboardCheck, Leaf, Mail, Scale, FileText, Download, Globe2, ScrollText, Users, X } from "lucide-react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { PdfCanvasViewer } from "@/components/site/PdfCanvasViewer";
import { ESG_SECTIONS } from "@/lib/esg-sections";
import { getEsgPage } from "@/lib/esg-data.functions";
import { computeChange, findTrendFor } from "@/lib/esg-metric-trends";
import { inclusionPresentation } from "@/lib/esg-inclusion";
import { useSiteSettings } from "@/lib/site-settings.functions";
import { esgLabel, orderSustainability, type PdfViewerSettings } from "@/lib/site-settings";
import { publishedFileUrl } from "@/lib/file-url";
import { MetricTrendToggle } from "@/components/esg/MetricTrend";
import { SocialKpiCard } from "@/components/esg/SocialKpiCard";
import envImage from "@/assets/esg-environmental.jpg.asset.json";
import governanceImage from "@/assets/esg-governance-professional.jpg";
import socialImage from "@/assets/social-tree-planting-india.jpg.asset.json";
import reportingImage from "@/assets/esg-reporting-solar-aerial.jpg.asset.json";
import policiesImage from "@/assets/esg-policies-sapling-hands.jpg.asset.json";

const SIDE_IMAGES: Record<string, string> = {
  environmental: envImage.url,
  social: socialImage.url,
  governance: governanceImage,
  "esg-reporting": reportingImage.url,
  policies: policiesImage.url,
};

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
  policies: ScrollText,
} as const;

const REPORTING_METRIC_IMAGES: Record<string, string> = {
  "2026": framework2026,
  BRSR: frameworkBrsr,
  GRI: frameworkGri,
  SASB: frameworkSasb,
};

const REPORTING_METRIC_ICONS = {
  "2026": CalendarDays,
  BRSR: ClipboardCheck,
  GRI: Globe2,
  SASB: BarChart3,
} as const;

function MetricRow({ social, children }: { social: boolean; children: React.ReactNode }) {
  if (social) return <div className="mt-8 grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">{children}</div>;
  return <AutoScrollRail className="mt-8">{children}</AutoScrollRail>;
}

function EsgPage() {
  const section = Route.useLoaderData();
  const Icon = ICONS[section.slug as keyof typeof ICONS] ?? Leaf;
  const [openIndex, setOpenIndex] = useState<number>(0);
  const [viewer, setViewer] = useState<{ title: string; url: string } | null>(null);
  const settings = useSiteSettings();
  const slotImg = (slot: string, fallback: string | undefined) => (settings.images[slot] ? publishedFileUrl(settings.images[slot]) ?? fallback : fallback);
  const sideImage = slotImg(`hero:${section.slug}`, SIDE_IMAGES[section.slug]);
  const frameworkImg = (k: string) => slotImg(`framework:${k}`, REPORTING_METRIC_IMAGES[k]);
  const hasMetrics = section.metrics.length > 0 || Boolean(section.metricGroups?.length) || Boolean(section.governance);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      {viewer && <ReportViewer doc={viewer} pdf={settings.pdfViewer} onClose={() => setViewer(null)} />}
      <main>
        {/* Hero */}
        <section className="relative isolate flex min-h-[30rem] items-center overflow-hidden bg-[#0d2b1f] pb-14 pt-32 text-white sm:min-h-[34rem] lg:min-h-[38rem] lg:pb-16 lg:pt-36">
          {(sideImage ?? section.bannerImage) && (
            <img
              src={sideImage ?? section.bannerImage ?? undefined}
              alt={section.slug === "social" ? "Volunteers planting saplings together at a community tree-planting drive in India" : `${section.title} at Ramky Infrastructure`}
              className={`absolute inset-0 -z-10 h-full w-full object-cover ${section.slug === "social" ? "object-[65%_40%] sm:object-[60%_40%]" : "object-center"}`}
              style={{ filter: "saturate(1.05) contrast(1.03)" }}
            />
          )}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0d2b1f]/85 via-[#0d2b1f]/45 to-transparent" aria-hidden="true" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0d2b1f]/35 via-transparent to-[#0d2b1f]/25" aria-hidden="true" />
          <div className="relative mx-auto w-full max-w-[1400px] px-5 lg:px-10">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.22em] text-emerald-300 [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">
                <Icon className="size-4" aria-hidden="true" /> ESG · {section.eyebrow}
              </p>
              <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl xl:text-7xl [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]">
                {section.title}
              </h1>
              <div className="mt-6 h-1 w-16 rounded-full bg-brand-orange" aria-hidden="true" />
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/95 [text-shadow:0_1px_8px_rgba(0,0,0,0.6)] sm:text-xl">
                {section.hero}
              </p>
            </div>
          </div>
        </section>

        {/* Sub-tab navigation */}
        <nav
          aria-label="ESG sections"
          className="sticky top-[76px] z-40 border-b border-border bg-background/95 backdrop-blur"
        >
          <div className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-5 lg:px-10">
            {orderSustainability(ESG_SECTIONS, settings.sustainabilityNav).map((item) => (
              <Link
                key={item.slug}
                to="/esg/$slug"
                params={{ slug: item.slug }}
                aria-current={item.slug === section.slug ? "page" : undefined}
                className={`whitespace-nowrap border-b-2 px-4 py-4 font-display text-sm font-semibold uppercase tracking-[0.08em] transition-colors ${item.slug === section.slug ? "border-brand-green bg-brand-green/10 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </nav>

        {/* Metrics */}
        {hasMetrics && (
        <section className="mx-auto max-w-[1400px] px-5 py-16 lg:px-10 lg:py-20">
          <p className="eyebrow">
            {esgLabel(settings.esgLabels, section.slug, "metrics")}
            {section.metricsPeriod && (
              <span className="font-normal normal-case tracking-normal text-muted-foreground">
                {" "}| {section.metricsPeriod}
              </span>
            )}
          </p>
          {section.metrics.length > 0 && (
            <MetricRow social={section.slug === "social"}>
              {section.metrics.map((metric) => {
                if (section.slug === "social") return <SocialKpiCard key={metric.label} label={metric.label} value={metric.value} trend={findTrendFor(metric, settings.esgTrends)} />;
                const trend = section.slug === "environmental" ? findTrendFor(metric, settings.esgTrends) : undefined;
                const improved = trend && computeChange(trend).direction === "improved";
                const compliant = metric.label.trim().toLowerCase() === "environmental compliance" && trend?.years.at(-1)?.value === 100;
                const MetricIcon = section.slug === "esg-reporting"
                  ? REPORTING_METRIC_ICONS[metric.value as keyof typeof REPORTING_METRIC_ICONS]
                  : undefined;
                return (
                  <div
                    key={metric.label}
                    className={`overflow-hidden rounded-sm border border-border bg-surface p-6 transition-shadow hover:shadow-lg ${section.slug === "environmental" ? "min-w-0 flex flex-col" : ""}`}
                  >
                    {section.slug === "esg-reporting" && frameworkImg(metric.value) ? (
                      <div className="-mx-6 -mt-6 mb-5 flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-border bg-background p-6">
                        <img src={frameworkImg(metric.value)} alt={metric.label || metric.value} loading="lazy" className="h-full w-auto max-w-full object-contain" />
                      </div>
                    ) : MetricIcon && (
                      <div className="mb-5 flex size-11 items-center justify-center rounded-sm bg-emerald-700/10 text-emerald-700">
                        <MetricIcon className="size-6" strokeWidth={1.7} aria-hidden="true" />
                      </div>
                    )}
                    <p className={`font-display text-4xl font-bold tabular-nums lg:text-5xl ${section.slug === "environmental" ? improved || compliant ? "text-brand-green" : "text-brand-orange" : "text-emerald-700"}`}>
                      {metric.value}
                    </p>
                    {metric.label && (
                      <p className={`mt-3 text-sm leading-relaxed text-muted-foreground ${section.slug === "environmental" ? "min-h-16 font-medium" : ""}`}>{metric.label}</p>
                    )}
                    {trend && <MetricTrendToggle trend={trend} environmental />}
                    {section.slug === "esg-reporting" && metric.url && (
                      <a href={metric.url.startsWith("/files/") ? `${metric.url}${metric.url.includes("?") ? "&" : "?"}download` : metric.url} download target={metric.url.startsWith("/") ? undefined : "_blank"} rel="noopener noreferrer" className="mt-5 inline-flex items-center justify-center gap-2 rounded-sm bg-brand-orange px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90">
                        <Download className="size-4" /> Download PDF
                      </a>
                    )}
                  </div>
                );
              })}
            </MetricRow>
          )}
          {section.metricGroups?.map((group) => (
            <div key={group.title} className="mt-10">
              <h2 className="border-l-4 border-emerald-600 pl-3 font-display text-xl font-bold text-foreground">
                {group.title}
              </h2>
              <div className={section.slug === "social" ? "mt-5 grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4" : "mt-5 gap-5 flex snap-x snap-mandatory overflow-x-auto pb-3 [&>*]:shrink-0 [&>*]:snap-start [&>*]:basis-[85%] sm:[&>*]:basis-[calc(50%-10px)] lg:[&>*]:basis-[calc(25%-16px)]"}>
                {group.metrics.map((metric) => {
                  const inclusion = section.slug === "social" && group.title === "Inclusion & Responsible Business" ? inclusionPresentation(metric, settings.esgTrends) : undefined;
                  const trend = inclusion ? inclusion.trend : section.slug === "environmental" || section.slug === "social" ? findTrendFor(metric, settings.esgTrends) : undefined;
                  const value = inclusion?.value ?? metric.value;
                  const improved = trend && computeChange(trend).direction === "improved";
                  if (section.slug === "social") return <SocialKpiCard key={metric.label} label={metric.label} value={value} trend={trend} />;
                  return (
                  <div
                    key={metric.label}
                    className="overflow-hidden rounded-sm border border-border bg-surface p-6 transition-shadow hover:shadow-lg"
                  >
                    <p className={`font-display ${value === "Not Disclosed" ? "text-xl" : "text-4xl"} font-bold ${section.slug === "environmental" ? improved ? "text-brand-green" : "text-brand-orange" : "text-emerald-700"}`}>{value}</p>
                    <p className={`mt-3 text-sm leading-relaxed text-muted-foreground ${section.slug === "environmental" ? "min-h-16 font-medium" : ""}`}>{metric.label}</p>
                    {trend && <MetricTrendToggle trend={trend} environmental={section.slug === "environmental"} />}
                  </div>
                ); })}
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
                  <GovernanceCard key={item} title={item} details={section.governance?.details?.[item]} />
                ))}
              </ul>
            </div>
          )}
        </section>
        )}

        {/* Accordions */}
        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-[1400px] px-5 py-16 lg:px-10 lg:py-20">
            <p className="eyebrow">{esgLabel(settings.esgLabels, section.slug, "detail")}</p>
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
                        <Formatted text={item.title} />
                      </span>
                      <ChevronDown
                        className={`size-5 shrink-0 text-emerald-700 transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </button>
                    {open && (
                      <div className="max-w-3xl pb-6 leading-relaxed text-muted-foreground">
                        <Formatted as="div" text={item.body} />
                        {(section.slug === "environmental" || section.slug === "social") && item.imageUrl && (
                          <img src={item.imageUrl} alt={plainText(item.title)} loading="lazy" className="mt-5 max-h-96 w-full rounded-sm object-contain object-left" />
                        )}
                      </div>
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
              <p className="eyebrow">{esgLabel(settings.esgLabels, section.slug, "downloads")}</p>
              <h2 className="mt-4 font-display text-3xl font-bold">Reports</h2>
              {(() => {
                const byYear = new Map<string, typeof section.reports>();
                for (const r of section.reports!) {
                  const y = (r.year || "").trim() || "Other";
                  if (!byYear.has(y)) byYear.set(y, []);
                  byYear.get(y)!.push(r);
                }
                const years = [...byYear.keys()].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
                return years.map((year, yi) => (
                  <ReportYear key={year} year={year} defaultOpen={yi === 0}>
                    <AutoScrollRail className="mt-6">
                      {byYear.get(year)!.map((report) => (
                        <div key={report.title} className="flex flex-col rounded-sm border border-border bg-background p-6 transition-shadow hover:shadow-lg">
                          <FileText className="size-8 text-emerald-700" strokeWidth={1.5} aria-hidden="true" />
                          <h4 className="mt-4 font-display text-lg font-semibold leading-snug">{report.title}</h4>
                          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{report.description}</p>
                          {report.url ? (
                            <div className="mt-5 grid gap-2">
                              <button
                                type="button"
                                onClick={() => setViewer({ title: report.title, url: report.url! })}
                                className="inline-flex items-center justify-center gap-2 rounded-sm bg-emerald-700 px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90"
                              >
                                <ArrowUpRight className="size-4" /> {settings.pdfViewer.exploreLabel || "Explore"}
                              </button>
                              <a
                                href={report.url}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-sm border border-emerald-700 px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.1em] text-emerald-700 transition-colors hover:bg-emerald-50"
                              >
                                <Download className="size-4" /> Download PDF
                              </a>
                            </div>
                          ) : (
                            <span className="mt-5 inline-flex items-center justify-center rounded-sm border border-border px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                              Coming soon
                            </span>
                          )}
                        </div>
                      ))}
                    </AutoScrollRail>
                  </ReportYear>
                ));
              })()}
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
            <div className="flex flex-col items-start gap-3">
              <SustainabilityContactButton className="inline-flex items-center gap-2 rounded-sm bg-emerald-500 px-7 py-4 font-display text-sm font-semibold uppercase tracking-[0.12em] text-[#0d2b1f] transition-opacity hover:opacity-90" />
              <p className="max-w-sm text-sm text-white/80">Send us your question and our team will get back to you. Office: <a href="tel:+914023015000" className="font-semibold text-emerald-300 hover:underline">+91 40 2301 5000</a></p>
            </div>
          </div>
        </section>

        {/* Back link */}
        <div className="mx-auto max-w-[1400px] px-5 py-10 lg:px-10">
          <Link
            to="/sustainability"
            className="inline-flex items-center gap-2 font-display text-sm font-semibold uppercase text-brand-blue transition-colors hover:text-brand-orange"
          >
            <ArrowLeft className="size-4" /> Back to Sustainability
          </Link>
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
          <Link
            to="/sustainability"
            className="mt-7 inline-flex items-center gap-2 font-display text-sm font-semibold text-brand-blue"
          >
            <ArrowLeft className="size-4" /> Back to Sustainability
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ReportViewer({ doc, pdf, onClose }: { doc: { title: string; url: string }; pdf: PdfViewerSettings; onClose: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-label={doc.title} className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/60 p-3 sm:p-8" onClick={onClose}>
      <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-sm bg-background shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <FileText className="size-5 shrink-0 text-emerald-700" />
          <p className="min-w-0 flex-1 truncate text-sm font-semibold">{doc.title}</p>
          {pdf.allowDownload && <a href={doc.url} download={`${doc.title.replace(/[^\w\- ]+/g, "").trim() || "report"}.pdf`} className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-surface"><Download className="size-4" /> {pdf.downloadLabel || "Download Report"}</a>}
          <button type="button" onClick={onClose} aria-label="Close viewer" className="rounded-sm p-1 hover:bg-surface"><X className="size-5" /></button>
        </div>
        <PdfCanvasViewer url={doc.url} />
      </div>
    </div>
  );
}

function GovernanceCard({ title, details }: { title: string; details?: string | undefined }) {
  const [open, setOpen] = useState(false);
  if (!details) {
    return (
      <li className="flex items-center gap-3 rounded-sm border border-border bg-surface p-5 transition-shadow hover:shadow-lg">
        <Scale className="size-5 shrink-0 text-emerald-700" aria-hidden="true" />
        <span className="font-display text-base font-semibold text-foreground"><Formatted text={title} /></span>
      </li>
    );
  }
  return (
    <li className={`rounded-sm border bg-surface transition-shadow hover:shadow-lg ${open ? "border-emerald-700/40 sm:col-span-2" : "border-border"}`}>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 p-5 text-left">
        <Scale className="size-5 shrink-0 text-emerald-700" aria-hidden="true" />
        <span className="flex-1 font-display text-base font-semibold text-foreground"><Formatted text={title} /></span>
        <ChevronDown className={`size-5 shrink-0 text-emerald-700 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div className="space-y-2 border-t border-border px-5 pb-5 pt-4 text-sm leading-relaxed text-muted-foreground">
          {isHtml(details) ? <Formatted as="div" text={details} /> : details.split(/\n+/).map((line, i) => {
            const m = line.match(/^([^:]{1,40}):\s*(.+)$/);
            return m ? <p key={i}><span className="font-semibold text-foreground">{m[1]}:</span> {m[2]}</p> : <p key={i}>{line}</p>;
          })}
        </div>
      )}
    </li>
  );
}


function ReportYear({ year, defaultOpen, children }: { year: string; defaultOpen: boolean; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [hover, setHover] = React.useState(false);
  const shown = open || hover;
  return (
    <div className="mt-10" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-display text-2xl font-bold text-brand-orange">{year}</h3>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={shown}
          className="rounded-sm border border-border px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.1em] text-emerald-700 hover:bg-emerald-50"
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>
      {shown ? children : <p className="mt-3 text-sm text-muted-foreground">Point at this year or press Show to see its reports.</p>}
    </div>
  );
}
