import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Building2, Globe2, Handshake, ShieldCheck, TrendingUp } from "lucide-react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ABOUT_SECTIONS, getAboutSection } from "@/lib/about-sections";
import { ManagementSystems } from "@/components/site/ManagementSystems";
import { OrgList } from "@/components/site/OrgList";
import { CLIENTELE } from "@/lib/organisations";

export const Route = createFileRoute("/about/$slug")({
  loader: ({ params }) => {
    const section = getAboutSection(params.slug);
    if (!section) throw notFound();
    return section;
  },
  head: ({ loaderData }) => {
    const title = loaderData
      ? `${loaderData.title} | Ramky Infrastructure`
      : "About Ramky | Ramky Infrastructure";
    const description = loaderData?.description ?? "Learn more about Ramky Infrastructure.";

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
  component: AboutSectionPage,
  notFoundComponent: AboutSectionNotFound,
});

const ICONS = {
  partners: Handshake,
  "management-systems": ShieldCheck,
  "strength-strategies": TrendingUp,
  clientele: Building2,
  "geographic-presence": Globe2,
};

function AboutSectionPage() {
  const section = Route.useLoaderData();
  const Icon = ICONS[section.slug];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="ink-panel relative overflow-hidden pb-20 pt-36 lg:pb-28 lg:pt-44">
          <div className="absolute inset-y-0 right-0 w-1/3 border-l border-ink-foreground/10" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-[1400px] gap-12 px-5 lg:grid-cols-[1fr_18rem] lg:items-end lg:px-10">
            <div className="max-w-4xl">
              <p className="eyebrow">{section.eyebrow}</p>
              <h1 className="mt-5 text-4xl font-bold leading-tight text-ink-foreground sm:text-5xl lg:text-7xl">
                {section.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-foreground/70 sm:text-xl">
                {section.description}
              </p>
            </div>
            <div className="flex justify-start lg:justify-end">
              <Icon className="size-28 text-brand-orange" strokeWidth={1} aria-hidden="true" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 py-16 lg:px-10 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.75fr)] lg:gap-24">
            <div>
              <p className="eyebrow">About Ramky</p>
              <p className="mt-5 max-w-3xl font-display text-2xl font-semibold leading-relaxed text-foreground sm:text-3xl">
                {section.statement}
              </p>
              <a
                href="/#about"
                className="mt-9 inline-flex items-center gap-2 font-display text-sm font-semibold uppercase text-brand-blue transition-colors hover:text-brand-orange"
              >
                <ArrowLeft className="size-4" /> Back to About Ramky
              </a>
            </div>

            <nav aria-label="More about Ramky" className="border-t border-border">
              {ABOUT_SECTIONS.map((item, index) => (
                <Link
                  key={item.slug}
                  to="/about/$slug"
                  params={{ slug: item.slug }}
                  className="group flex items-center justify-between gap-5 border-b border-border py-5"
                  activeProps={{ className: "text-brand-blue" }}
                >
                  <span className="flex items-center gap-4">
                    <span className="font-display text-xs font-bold text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-base font-semibold">{item.title}</span>
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 text-brand-orange transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              ))}
            </nav>
          </div>
        </section>
        {section.slug === "management-systems" && <ManagementSystems />}
        {section.slug === "clientele" && (
          <section className="mx-auto max-w-[1400px] px-5 pb-16 lg:px-10 lg:pb-24">
            <h2 className="mb-8 text-3xl font-bold">Our Clientele</h2>
            <OrgList items={CLIENTELE} />
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function AboutSectionNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex min-h-[70vh] max-w-[1400px] items-center px-5 pt-28 lg:px-10">
        <div>
          <p className="eyebrow">About Ramky</p>
          <h1 className="mt-4 text-4xl font-bold">Section not found</h1>
          <a href="/#about" className="mt-7 inline-flex items-center gap-2 font-display text-sm font-semibold text-brand-blue">
            <ArrowLeft className="size-4" /> Back to About Ramky
          </a>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}