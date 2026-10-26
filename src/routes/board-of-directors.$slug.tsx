import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, UserRound } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PROFILE_SECTIONS, getDirector, publishedDirectors } from "@/lib/directors";

export const Route = createFileRoute("/board-of-directors/$slug")({
  loader: ({ params }) => {
    const director = getDirector(params.slug);
    if (!director) throw notFound();
    return director;
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name}, ${loaderData.designation} | Ramky Infrastructure` : "Board of Directors | Ramky Infrastructure";
    const description = loaderData
      ? (loaderData.biography[0] ?? loaderData.education[0] ?? loaderData.professionalExperience[0] ?? "").slice(0, 155)
      : "Board of Directors of Ramky Infrastructure Limited.";
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
  component: DirectorPage,
  notFoundComponent: DirectorNotFound,
});

function BackLink() {
  return (
    <a href="/#board-of-directors" className="inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.08em] text-brand-blue transition-colors hover:text-brand-orange">
      <ArrowLeft className="size-4" /> Back to Board of Directors
    </a>
  );
}

function DirectorPage() {
  const d = Route.useLoaderData();
  const sections = PROFILE_SECTIONS.filter((s) => d[s.key].length > 0);
  const others = publishedDirectors().filter((x) => x.slug !== d.slug);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pb-20 pt-32 lg:pt-36">
        <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
          <p className="eyebrow">Board of Directors</p>
          <div className="mt-4"><BackLink /></div>

          <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,18rem)_1fr] lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16">
            <div className="mx-auto w-full max-w-xs md:mx-0 md:max-w-none">
              <div className="md:sticky md:top-32">
                {d.profileImage ? (
                  <img src={d.profileImage} alt={d.name} className="aspect-[4/5] w-full rounded-sm border border-border bg-surface object-cover object-[50%_25%]" />
                ) : (
                  <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-3 rounded-sm border border-border bg-surface text-muted-foreground" role="img" aria-label={`Photograph of ${d.name} to be added`}>
                    <UserRound className="size-20" strokeWidth={1} />
                    <span className="text-xs uppercase tracking-wider">Photograph coming soon</span>
                  </div>
                )}
                <div className="mt-4 h-1 w-full bg-gradient-to-r from-brand-orange via-brand-green to-brand-blue" />
              </div>
            </div>

            <div className="min-w-0 max-w-3xl">
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{d.name}</h1>
              <p className="mt-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-brand-orange">{d.designation}</p>
              <div className="mt-8 space-y-10">
                {sections.map((s) => (
                  <section key={s.key}>
                    <h2 className="border-l-4 border-brand-orange pl-3 font-display text-lg font-semibold text-brand-blue">{s.heading}</h2>
                    <div className="mt-4 space-y-4">
                      {d[s.key].map((para, i) => (
                        <p key={i} className="text-base leading-relaxed text-foreground/85">{para}</p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>

          <nav aria-label="Other directors" className="mt-16 border-t border-border pt-8">
            <p className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">Other directors</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {others.map((o) => (
                <Link key={o.slug} to="/board-of-directors/$slug" params={{ slug: o.slug }} className="rounded-full border border-border px-4 py-1.5 text-sm text-foreground/80 transition-colors hover:border-brand-blue hover:text-brand-blue">
                  {o.name}
                </Link>
              ))}
            </div>
            <div className="mt-8"><BackLink /></div>
          </nav>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function DirectorNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex min-h-[70vh] max-w-[1200px] items-center px-5 pt-28 lg:px-10">
        <div>
          <p className="eyebrow">Board of Directors</p>
          <h1 className="mt-4 text-3xl font-bold">Director not found</h1>
          <div className="mt-6"><BackLink /></div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
