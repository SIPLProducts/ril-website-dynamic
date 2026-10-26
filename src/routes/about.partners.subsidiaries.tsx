import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { OrgList } from "@/components/site/OrgList";
import { SUBSIDIARIES } from "@/lib/organisations";

export const Route = createFileRoute("/about/partners/subsidiaries")({
  head: () => ({
    meta: [
      { title: "Subsidiaries | Ramky Infrastructure" },
      { name: "description", content: "Subsidiary companies of Ramky Infrastructure Limited." },
      { property: "og:title", content: "Subsidiaries | Ramky Infrastructure" },
      { property: "og:description", content: "Subsidiary companies of Ramky Infrastructure Limited." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SubsidiariesPage,
});

function SubsidiariesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="ink-panel pb-16 pt-36 lg:pb-20 lg:pt-44">
          <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
            <p className="eyebrow">About Ramky · Partners</p>
            <h1 className="mt-5 text-4xl font-bold text-ink-foreground sm:text-5xl lg:text-6xl">Subsidiaries</h1>
          </div>
        </section>
        <section className="mx-auto max-w-[1400px] px-5 py-14 lg:px-10 lg:py-20">
          <OrgList items={SUBSIDIARIES} />
          <a href="/about/partners" className="mt-10 inline-flex items-center gap-2 font-display text-sm font-semibold uppercase text-brand-blue hover:text-brand-orange">
            <ArrowLeft className="size-4" /> Back to Partners
          </a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
