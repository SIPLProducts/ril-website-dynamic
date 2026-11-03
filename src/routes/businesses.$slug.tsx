import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, MapPin, Building2, X } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useSuspenseQuery } from "@tanstack/react-query";
import { projectState, type BusinessProject, type ProjectStatus } from "@/lib/business-projects";
import { capabilitiesQuery } from "@/lib/capabilities.functions";

export const Route = createFileRoute("/businesses/$slug")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(capabilitiesQuery());
    const vertical = data.verticals.find((v) => v.slug === params.slug);
    if (!vertical) throw notFound();
    return { vertical: { title: vertical.title, description: vertical.description, count: vertical.projects.length } };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found — Ramky Infrastructure" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.vertical.title} Projects — Ramky Infrastructure`;
    const d = `${loaderData.vertical.count} ${loaderData.vertical.title} projects by Ramky Infrastructure: ${loaderData.vertical.description}`;
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  notFoundComponent: VerticalNotFound,
  errorComponent: ({ error }) => <div role="alert" className="mx-auto max-w-3xl px-5 py-40 text-center">{error instanceof Error ? error.message : "Something went wrong"}</div>,
  component: VerticalPage,
});

const STATUS_STYLE: Record<ProjectStatus, string> = {
  Ongoing: "bg-brand-orange text-accent-foreground",
  "O&M": "bg-brand-blue text-primary-foreground",
  Completed: "bg-brand-green text-primary-foreground",
};

function VerticalNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-40 text-center">
      <h1 className="text-3xl font-bold">Business not found</h1>
      <Link to="/" hash="businesses" className="mt-6 inline-block text-brand-blue underline">Back to businesses</Link>
    </div>
  );
}

function VerticalPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(capabilitiesQuery());
  const vertical = data.verticals.find((v) => v.slug === slug);
  if (!vertical) return <VerticalNotFound />;
  return (
    <>
      <SiteHeader />
      <main className="pt-32">
        <section className="mx-auto max-w-[1400px] px-5 pb-20 lg:px-10">
          <Link to="/" hash="businesses" className="inline-flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-blue">
            <ArrowLeft className="size-4" />  All capabilities
          </Link>
          <p className="eyebrow mt-8">{data.eyebrow}</p>
          <h1 className="mt-4 text-3xl font-bold sm:text-5xl">{vertical.title}</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">{vertical.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {data.verticals.map((v) => (
              <Link key={v.slug} to="/businesses/$slug" params={{ slug: v.slug }}
                className={`rounded-sm border px-3 py-1.5 text-sm ${v.slug === vertical.slug ? "border-brand-blue bg-brand-blue text-primary-foreground" : "border-border hover:border-brand-blue"}`}>
                {v.title}
              </Link>
            ))}
          </div>
          <ProjectList key={vertical.slug} projects={vertical.projects} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

type Filters = { status: string; client: string; state: string };
const EMPTY: Filters = { status: "", client: "", state: "" };
const uniq = (xs: string[]) => [...new Set(xs.filter(Boolean))].sort((a, b) => a.localeCompare(b));

function ProjectList({ projects }: { projects: BusinessProject[] }) {
  const [f, setF] = useState<Filters>(EMPTY);
  const options = useMemo(() => {
    const order = ["Ongoing", "O&M", "Completed"];
    return {
      status: order.filter((s) => projects.some((p) => p.status === s)),
      client: uniq(projects.map((p) => p.client)),
      state: uniq(projects.map(projectState)),
    };
  }, [projects]);
  const shown = projects.filter(
    (p) => (!f.status || p.status === f.status) && (!f.client || p.client === f.client) && (!f.state || projectState(p) === f.state),
  );
  const active = (Object.keys(f) as (keyof Filters)[]).filter((k) => f[k]);
  const labels: Record<keyof Filters, string> = { status: "Status", client: "Client", state: "State" };

  if (projects.length === 0) {
    return <p className="mt-10 rounded-sm border border-border bg-card p-8 text-center text-muted-foreground">Project details for this capability will be published shortly.</p>;
  }

  return (
    <>
      <div className="mt-10 grid gap-3 rounded-sm border border-border bg-card p-4 sm:grid-cols-3 sm:p-5">
        {(Object.keys(labels) as (keyof Filters)[]).map((k) => (
          <label key={k} className="block">
            <span className="font-display text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{labels[k]}</span>
            <select
              value={f[k]}
              onChange={(e) => setF({ ...f, [k]: e.target.value })}
              className="mt-1.5 h-11 w-full rounded-sm border border-border bg-background px-3 text-sm"
            >
              <option value="">All</option>
              {options[k].map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Showing {shown.length} projects</span>
        {active.map((k) => (
          <button key={k} type="button" onClick={() => setF({ ...f, [k]: "" })}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-sm border border-brand-blue/40 bg-brand-blue/10 px-2.5 text-xs text-brand-blue">
            {labels[k]}: {f[k]} <X className="size-3.5" />
          </button>
        ))}
        {active.length > 0 && (
          <button type="button" onClick={() => setF(EMPTY)} className="min-h-9 px-2 text-xs font-semibold uppercase tracking-[0.1em] text-brand-orange underline">Clear all</button>
        )}
      </div>
      {shown.length === 0 ? (
        <p className="mt-4 rounded-sm border border-border bg-card p-8 text-center text-muted-foreground">No projects match these filters. Try removing one or clear all.</p>
      ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((p) => (
              <article key={projects.indexOf(p)} className="card-lift rounded-sm border border-border bg-card p-6">
                <span className={`inline-block rounded-sm px-2.5 py-1 font-display text-[0.7rem] font-semibold uppercase tracking-[0.12em] ${STATUS_STYLE[p.status]}`}>{p.status}</span>
                <h2 className="mt-4 font-display text-lg font-semibold">{p.name}</h2>
                <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground"><MapPin className="mt-0.5 size-4 shrink-0" />{p.location}</p>
                {p.client && <p className="mt-1.5 flex items-start gap-2 text-sm text-muted-foreground"><Building2 className="mt-0.5 size-4 shrink-0" />{p.client}</p>}
              </article>
            ))}
          </div>
      )}
    </>
  );
}
