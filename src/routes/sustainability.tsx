import { Link, createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Sustainability } from "@/components/site/sections";
import { ESG_SECTIONS } from "@/lib/esg-sections";
import { homeHighlightsQuery } from "@/lib/home-highlights.functions";

const title = "Sustainability | Ramky Infrastructure";
const description = "Ramky Infrastructure’s sustainability commitments, environmental performance, social responsibility and governance.";

export const Route = createFileRoute("/sustainability")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(homeHighlightsQuery());
  },
  head: () => ({ meta: [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: SustainabilityOverview,
  errorComponent: () => <p role="alert" className="p-10">Sustainability content is currently unavailable.</p>,
  notFoundComponent: () => <p className="p-10">Sustainability content not found.</p>,
});

function SustainabilityOverview() {
  useSuspenseQuery(homeHighlightsQuery());
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-20">
        <Sustainability standalone />
        <nav aria-label="ESG sections" className="border-b border-border bg-background">
          <div className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-5 lg:px-10">
            {ESG_SECTIONS.map((section) => (
              <Link key={section.slug} to="/esg/$slug" params={{ slug: section.slug }} className="whitespace-nowrap border-b-2 border-transparent px-4 py-4 font-display text-sm font-semibold uppercase text-muted-foreground transition-colors hover:text-foreground">
                {section.title}
              </Link>
            ))}
          </div>
        </nav>
      </main>
      <SiteFooter sustainabilityOnly />
    </div>
  );
}