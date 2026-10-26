import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, UserRound } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { EXECUTIVE_SECTIONS, getExecutive } from "@/lib/executives";

export const Route = createFileRoute("/executive-leadership/$slug")({
  loader: ({ params }) => {
    const e = getExecutive(params.slug);
    if (!e) throw notFound();
    return e;
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name}, ${loaderData.designation} | Ramky Infrastructure` : "Executive Leadership | Ramky Infrastructure";
    const description = loaderData ? (loaderData.biography[0] ?? "").slice(0, 155) : "Executive Leadership of Ramky Infrastructure Limited.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary" },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  component: ExecutivePage,
  notFoundComponent: ExecutiveNotFound,
});

function BackLink() {
  return (
    <a href="/#executive-leadership" className="inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.08em] text-brand-blue transition-colors hover:text-brand-orange">
      <ArrowLeft className="size-4" /> Back to Executive Leadership
    </a>
  );
}

function ExecutivePage() {
  const e = Route.useLoaderData();
  const sections = EXECUTIVE_SECTIONS.filter((s) => e[s.key].length > 0);
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pb-20 pt-32 lg:pt-36">
        <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
          <p className="eyebrow">Executive Leadership</p>
          <div className="mt-4"><BackLink /></div>
          <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,18rem)_1fr] lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16">
            <div className="mx-auto w-full max-w-xs md:mx-0 md:max-w-none">
              <div className="md:sticky md:top-32">
                {e.image ? (
                  <img src={e.image} alt={e.name} className="h-auto w-full rounded-sm border border-border object-contain" />
                ) : (
                  <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-3 rounded-sm border border-border bg-surface text-muted-foreground" role="img" aria-label={`Photograph of ${e.name} to be added`}>
                    <UserRound className="size-20" strokeWidth={1} />
                    <span className="text-xs uppercase tracking-wider">Photograph coming soon</span>
                  </div>
                )}
                <div className="mt-4 h-1 w-full bg-gradient-to-r from-brand-orange via-brand-green to-brand-blue" />
              </div>
            </div>
            <div className="min-w-0 max-w-3xl">
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{e.name}</h1>
              <p className="mt-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-brand-orange">{e.designation}</p>
              <div className="mt-8 space-y-10">
                {sections.map((s) => (
                  <section key={s.key}>
                    <h2 className="border-l-4 border-brand-orange pl-3 font-display text-lg font-semibold text-brand-blue">{s.heading}</h2>
                    <div className="mt-4 space-y-4">
                      {e[s.key].map((para, i) => (
                        <p key={i} className="text-base leading-relaxed text-foreground/85">{para}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-16 border-t border-border pt-8"><BackLink /></div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ExecutiveNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex min-h-[70vh] max-w-[1200px] items-center px-5 pt-28 lg:px-10">
        <div>
          <p className="eyebrow">Executive Leadership</p>
          <h1 className="mt-4 text-3xl font-bold">Profile not found</h1>
          <div className="mt-6"><BackLink /></div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
