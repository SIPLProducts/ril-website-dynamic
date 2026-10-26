import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ExternalLink, Newspaper } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { publishedMedia, type MediaItem } from "@/lib/media";

const TITLE = "Media & Press Releases | Ramky Infrastructure";
const DESC = "News, press releases, media coverage and official publications from Ramky Infrastructure, latest first.";

export const Route = createFileRoute("/media")({
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
  component: MediaPage,
});

const PAGE = 9;
const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

function MediaPage() {
  const items = publishedMedia();
  const [count, setCount] = useState(PAGE);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="bg-surface pb-20 pt-32">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
            <Link to="/" className="hover:text-brand-blue">Home</Link> / <span className="text-foreground">Media</span>
          </nav>
          <p className="eyebrow mt-6">Media Centre</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl">Media &amp; Press Releases</h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">News, press releases, media coverage and official publications — latest first.</p>

          {items.length === 0 ? (
            <div className="mt-12 rounded-sm border border-border bg-card px-6 py-16 text-center shadow-[var(--shadow-card)]">
              <Newspaper className="mx-auto size-10 text-brand-orange" strokeWidth={1.5} />
              <h2 className="mt-4 text-xl font-semibold">Media &amp; Press Releases</h2>
              <p className="mt-2 text-sm italic text-muted-foreground">Latest news, publications and media updates will appear here.</p>
            </div>
          ) : (
            <>
              <ul className="mt-12">
                {items.slice(0, count).map((m) => <MediaRow key={m.id} m={m} />)}
              </ul>
              {count < items.length && (
                <div className="mt-10 text-center">
                  <button onClick={() => setCount((c) => c + PAGE)} className="rounded-sm border border-brand-blue px-6 py-3 font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-blue hover:bg-brand-blue hover:text-primary-foreground">
                    Load more
                  </button>
                </div>
              )}
            </>
          )}

          <Link to="/" hash="media" className="mt-12 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:text-brand-orange">
            <ArrowLeft className="size-4" /> Back to home
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function MediaRow({ m }: { m: MediaItem }) {
  const href = m.documentUrl ?? m.externalUrl;
  const title = (
    <h2 className="text-lg font-semibold leading-snug sm:text-xl">
      {m.title}
      {href && <ExternalLink className="ml-2 inline size-4 align-[-2px] text-brand-blue" />}
    </h2>
  );
  return (
    <li className="media-rule py-8">
      {m.kicker && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-orange">{m.kicker}</p>}
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="group block">
          <span className="group-hover:text-brand-blue">{title}</span>
        </a>
      ) : (
        title
      )}
      {m.date && <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{fmt(m.date)}</p>}
      {m.paragraphs
        ? m.paragraphs.map((p, i) => <p key={i} className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{p}</p>)
        : m.summary && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{m.summary}</p>}
      {m.source && <p className="mt-3 text-sm text-foreground"><span className="font-semibold">Published in:</span> {m.source}</p>}
      {href && m.linkLabel && (
        <p className="mt-2 text-sm">
          <span className="font-semibold text-foreground">{m.linkLabel}:</span>{" "}
          <a href={href} target="_blank" rel="noopener noreferrer" className="break-all text-brand-blue underline hover:text-brand-orange">{href}</a>
        </p>
      )}
      <p className="mt-4 text-xs font-medium uppercase italic tracking-[0.12em] text-foreground">{m.type}{m.source ? ` · ${m.source}` : ""}</p>
    </li>
  );
}
