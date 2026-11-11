import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { OrgList } from "@/components/site/OrgList";
import { SUBSIDIARIES, type Organisation } from "@/lib/organisations";
import { useQuery } from "@tanstack/react-query";
import { pageListQuery } from "@/lib/page-lists.functions";

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
  loader: ({ context }) => context.queryClient.ensureQueryData(pageListQuery("subsidiaries")).catch(() => null),
  component: SubsidiariesPage,
});

function SubsidiariesPage() {
  const { data } = useQuery(pageListQuery("subsidiaries"));
  const items: Organisation[] = data?.length ? data.map((r, i) => ({ id: r.id, name: r["name"] ?? "", displayOrder: i + 1, status: "published" })) : SUBSIDIARIES;
  const withLogos = data?.some((r) => r["image_url"]) ? data : null;
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
          {withLogos ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {withLogos.map((r) => (
                <li key={r.id} className="flex flex-col items-center border border-border bg-card p-5 text-center transition-shadow hover:shadow-lg">
                  <div className="grid h-32 w-full place-items-center bg-background">
                    {r["image_url"] ? <img src={r["image_url"]} alt={`${r["name"] ?? ""} logo`} loading="lazy" className="max-h-28 max-w-full object-contain" /> : <span className="font-display text-lg font-bold text-brand-blue">{r["name"]}</span>}
                  </div>
                  <p className="mt-4 font-display text-sm font-semibold">{r["name"]}</p>
                </li>
              ))}
            </ul>
          ) : <OrgList items={items} />}
          <a href="/about/partners" className="mt-10 inline-flex items-center gap-2 font-display text-sm font-semibold uppercase text-brand-blue hover:text-brand-orange">
            <ArrowLeft className="size-4" /> Back to Partners
          </a>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
