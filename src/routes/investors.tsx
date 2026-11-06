import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, Download, ExternalLink, Eye, FileText, Mail, Search, X } from "lucide-react";
import { z } from "zod";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useSuspenseQuery } from "@tanstack/react-query";
import { resolveIn, rollingFyLabels, withDocuments, type IrContact, type IrDocument, type IrSubTab } from "@/lib/investor-relations";
import { irDataQuery } from "@/lib/ir-data.functions";

const TITLE = "Investor Relations | Ramky Infrastructure";
const DESC = "Quarterly results, annual reports, general meetings, MOA & AOA, Regulation 46 disclosures and investor contacts of Ramky Infrastructure Limited.";

export const Route = createFileRoute("/investors")({
  validateSearch: z.object({ cat: z.string().optional(), sub: z.string().optional(), meet: z.string().optional() }),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(irDataQuery),
  component: InvestorsPage,
  errorComponent: ({ error }) => <div role="alert" className="p-10 text-center text-sm">Investor documents could not be loaded: {error instanceof Error ? error.message : String(error)}</div>,
  notFoundComponent: () => <div className="p-10 text-center text-sm">Not found.</div>,
});

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const selectCls = "h-10 w-full rounded-sm border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30";

function InvestorsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data } = useSuspenseQuery(irDataQuery);
  const IR_CATEGORIES = useMemo(() => withDocuments(data.docs), [data.docs]);
  const { category, subTab, leaf } = resolveIn(IR_CATEGORIES, search.cat, search.sub, search.meet);
  const [viewing, setViewing] = useState<IrDocument | null>(null);
  const go = (cat: string, sub?: string, meet?: string) => navigate({ search: { cat, sub, meet }, resetScroll: false });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="bg-surface pb-20 pt-32">
        <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
            <Link to="/" className="hover:text-brand-blue">Home</Link> / Investor Relations / {category.label}
            {category.subTabs.length > 1 && <> / <span className="text-foreground">{subTab.label}</span></>}
            {subTab.children && <> / <span className="text-foreground">{leaf.label}</span></>}
          </nav>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">Investor Relations</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{category.summary}</p>

          {/* Mobile: two selects */}
          <div className="mt-8 grid gap-3 sm:hidden">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Category
              <select className={`${selectCls} mt-1`} value={category.slug} onChange={(e) => go(e.target.value)}>
                {IR_CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              </select>
            </label>
            {category.subTabs.length > 1 && (
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sub-category
                <select className={`${selectCls} mt-1`} value={subTab.slug} onChange={(e) => go(category.slug, e.target.value)}>
                  {category.subTabs.map((s) => <option key={s.slug} value={s.slug}>{s.label}</option>)}
                </select>
              </label>
            )}
            {subTab.children && (
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Meeting type
                <select className={`${selectCls} mt-1`} value={leaf.slug} onChange={(e) => go(category.slug, subTab.slug, e.target.value)}>
                  {subTab.children.map((s) => <option key={s.slug} value={s.slug}>{s.label}</option>)}
                </select>
              </label>
            )}
          </div>

          {/* Tablet/desktop: main tabs + contextual sub-tabs */}
          <div className="mt-8 hidden sm:block">
            <div role="tablist" className="flex flex-wrap gap-1 border-b border-border">
              {IR_CATEGORIES.map((c) => {
                const active = c.slug === category.slug;
                return (
                  <button key={c.slug} role="tab" aria-selected={active} onClick={() => go(c.slug)}
                    className={`-mb-px border-b-2 px-4 py-3 font-display text-sm font-semibold transition-colors ${active ? "border-brand-orange text-brand-blue" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                    {c.label}
                  </button>
                );
              })}
            </div>
            {category.subTabs.length > 1 && (
              <div role="tablist" className="mt-4 flex flex-wrap gap-2">
                {category.subTabs.map((s) => {
                  const active = s.slug === subTab.slug;
                  return (
                    <button key={s.slug} role="tab" aria-selected={active} onClick={() => go(category.slug, s.slug)}
                      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${active ? "border-brand-blue bg-brand-blue text-primary-foreground" : "border-border bg-background text-foreground/80 hover:border-brand-blue"}`}>
                      {s.label}
                    </button>
                  );
                })}
              </div>
            )}
            {subTab.children && (
              <div role="tablist" aria-label={subTab.label} className="mt-3 flex flex-wrap items-center gap-2 border-l-2 border-brand-orange pl-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{subTab.label}:</span>
                {subTab.children.map((s) => {
                  const active = s.slug === leaf.slug;
                  return (
                    <button key={s.slug} role="tab" aria-selected={active} onClick={() => go(category.slug, subTab.slug, s.slug)}
                      className={`rounded-sm px-3 py-1 text-sm transition-colors ${active ? "bg-brand-orange/10 font-semibold text-brand-orange" : "text-foreground/75 hover:text-brand-blue"}`}>
                      {s.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <section className="mt-8" key={`${category.slug}-${subTab.slug}-${leaf.slug}`}>
            {leaf.layout === "contacts" ? <Contacts contacts={data.contacts} /> : leaf.layout === "repository" ? <Repository tab={leaf} onView={setViewing} /> : <YearWise tab={leaf} onView={setViewing} />}
          </section>
                  </div>
      </main>
      <SiteFooter />
      {viewing && <Viewer doc={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function uniq(list: (string | undefined)[]) {
  return [...new Set(list.filter(Boolean) as string[])];
}

function YearWise({ tab, onView }: { tab: IrSubTab; onView: (d: IrDocument) => void }) {
  const docs = tab.documents.filter((d) => d.published);
  const years = rollingFyLabels();
  const types = uniq(docs.map((d) => d.type)).sort();
  const quarterly = tab.layout === "quarterly" || docs.some((d) => d.quarter);
  const [year, setYear] = useState("");
  const [quarter, setQuarter] = useState("");
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(years.find((y) => docs.some((d) => d.year === y)) ?? null);

  const filtered = docs.filter((d) => (!year || d.year === year) && (!quarter || d.quarter === quarter) && (!type || d.type === type) && (!q || d.title.toLowerCase().includes(q.toLowerCase())));
  const shownYears = years.filter((y) => filtered.some((d) => d.year === y));
  const filtering = !!(year || quarter || type || q);

  return (
    <div>
      <div className={`grid gap-3 rounded-sm border border-border bg-background p-4 sm:grid-cols-2 ${quarterly ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        <select className={selectCls} value={year} onChange={(e) => setYear(e.target.value)} aria-label="Year">
          <option value="">All years</option>
          {years.map((y) => <option key={y}>{y}</option>)}
        </select>
        {quarterly && (
          <select className={selectCls} value={quarter} onChange={(e) => setQuarter(e.target.value)} aria-label="Quarter">
            <option value="">All quarters</option>
            {["Q1", "Q2", "Q3", "Q4"].map((x) => <option key={x}>{x}</option>)}
          </select>
        )}
        <select className={selectCls} value={type} onChange={(e) => setType(e.target.value)} aria-label="Document type">
          <option value="">All document types</option>
          {types.map((t) => <option key={t}>{t}</option>)}
        </select>
        <SearchBox value={q} onChange={setQ} />
      </div>

      {shownYears.length === 0 ? <Empty /> : (
        <>
        {filtering ? null : <p className="mt-4 text-xs text-muted-foreground">Showing {shownYears.length} of 9 financial years with documents ({years[years.length - 1]} to {years[0]}).</p>}
        <div className="mt-5 space-y-3">
          {shownYears.map((y) => {
            const isOpen = filtering || open === y;
            const items = filtered.filter((d) => d.year === y);
            return (
              <div key={y} className="overflow-hidden rounded-sm border border-border bg-background">
                <button onClick={() => setOpen(open === y ? null : y)} aria-expanded={isOpen}
                  className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-surface">
                  <span className="font-display text-base font-semibold text-brand-blue">{y}</span>
                  <span className="flex items-center gap-3 text-xs text-muted-foreground">{items.length} documents<ChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} /></span>
                </button>
                {isOpen && (
                  <div className="border-t border-border">
                    {quarterly
                      ? ["Q1", "Q2", "Q3", "Q4"].map((qt) => {
                          const qd = items.filter((d) => d.quarter === qt);
                          if (!qd.length) return null;
                          return (
                            <div key={qt}>
                              <p className="bg-surface px-5 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{qt}</p>
                              <DocList docs={qd} onView={onView} />
                            </div>
                          );
                        })
                      : <DocList docs={items} onView={onView} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        </>
      )}
    </div>
  );
}

function Repository({ tab, onView }: { tab: IrSubTab; onView: (d: IrDocument) => void }) {
  const docs = tab.documents.filter((d) => d.published);
  const categories = uniq(docs.map((d) => d.category));
  const years = uniq(docs.map((d) => d.date.slice(0, 4))).sort().reverse();
  const [cat, setCat] = useState("");
  const [year, setYear] = useState("");
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => docs.filter((d) => (!cat || d.category === cat) && (!year || d.date.startsWith(year)) && (!q || `${d.title} ${d.description ?? ""}`.toLowerCase().includes(q.toLowerCase()))).sort((a, b) => b.date.localeCompare(a.date)),
    [docs, cat, year, q],
  );
  const showFilters = docs.length > 4;
  return (
    <div>
      {showFilters && (
        <div className="mb-5 grid gap-3 rounded-sm border border-border bg-background p-4 sm:grid-cols-3">
          <select className={selectCls} value={year} onChange={(e) => setYear(e.target.value)} aria-label="Year">
            <option value="">All years</option>
            {years.map((y) => <option key={y}>{y}</option>)}
          </select>
          {categories.length > 0 && (
            <select className={selectCls} value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Disclosure category">
              <option value="">All categories</option>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          )}
          <SearchBox value={q} onChange={setQ} />
        </div>
      )}
      {filtered.length === 0 ? <Empty /> : (
        <div className="overflow-hidden rounded-sm border border-border bg-background"><DocList docs={filtered} onView={onView} detailed /></div>
      )}
    </div>
  );
}

function DocList({ docs, onView, detailed }: { docs: IrDocument[]; onView: (d: IrDocument) => void; detailed?: boolean }) {
  return (
    <ul className="divide-y divide-border">
      {docs.map((d) => (
        <li key={d.id} className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-surface/60 sm:flex-row sm:items-center">
          <FileText className="hidden size-8 shrink-0 text-brand-orange sm:block" strokeWidth={1.5} />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">{d.title}</p>
            <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{d.category ?? d.type}</span>
              {d.quarter && <span>{d.quarter} · {d.year}</span>}
              {d.version && <span>Version {d.version}</span>}
              <span>{fmt(d.date)}</span>
            </p>
            {detailed && d.description && <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>}
          </div>
          <div className="flex shrink-0 gap-2">
            <button onClick={() => onView(d)} className="inline-flex items-center gap-1.5 rounded-sm border border-brand-blue px-3 py-1.5 text-xs font-semibold text-brand-blue hover:bg-brand-blue hover:text-primary-foreground">
              <Eye className="size-3.5" /> View
            </button>
            <a href={d.url.startsWith("/files/") ? d.url + "?download" : d.url} download className="inline-flex items-center gap-1.5 rounded-sm bg-brand-blue px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
              <Download className="size-3.5" /> Download
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search documents" aria-label="Search documents" className={`${selectCls} pl-9`} />
    </div>
  );
}

function Empty() {
  return <div className="mt-5 rounded-sm border border-dashed border-border bg-background px-6 py-12 text-center text-sm text-muted-foreground">No documents available for this period.</div>;
}

function Contacts({ contacts: IR_CONTACTS }: { contacts: IrContact[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {IR_CONTACTS.map((c) => (
        <div key={c.heading} className="rounded-sm border border-border bg-background p-6">
          <h2 className="border-b-2 border-brand-orange pb-3 font-display text-base font-semibold text-brand-blue">{c.heading}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {c.lines.map((l, i) => (
              <div key={i}>
                {l.label && <dt className="text-xs uppercase tracking-wider text-muted-foreground">{l.label}</dt>}
                <dd className="text-foreground">{l.href ? <a href={l.href} className="text-brand-blue hover:underline">{l.value}</a> : l.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
      <a href="mailto:investors@ramky.com" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-orange md:col-span-3">
        <Mail className="size-4" /> Email the investor relations team
      </a>
    </div>
  );
}

function Viewer({ doc, onClose }: { doc: IrDocument; onClose: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-label={doc.title} className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/60 p-3 sm:p-8" onClick={onClose}>
      <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-sm bg-background shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <FileText className="size-5 shrink-0 text-brand-orange" />
          <p className="min-w-0 flex-1 truncate text-sm font-semibold">{doc.title}</p>
          <a href={doc.url} target="_blank" rel="noreferrer" className="hidden items-center gap-1 text-xs text-brand-blue hover:underline sm:inline-flex"><ExternalLink className="size-3.5" /> New tab</a>
          <a href={doc.url.startsWith("/files/") ? doc.url + "?download" : doc.url} download className="inline-flex items-center gap-1 text-xs text-brand-blue hover:underline"><Download className="size-3.5" /> Download</a>
          <button onClick={onClose} aria-label="Close viewer" className="rounded-sm p-1 hover:bg-surface"><X className="size-5" /></button>
        </div>
        <iframe src={doc.url} title={doc.title} className="flex-1 bg-surface" />
      </div>
    </div>
  );
}
