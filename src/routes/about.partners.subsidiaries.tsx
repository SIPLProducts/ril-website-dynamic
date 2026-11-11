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
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {withLogos.map((r) => {
                const name = r["name"] ?? "";
                const initials = name.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w) && !/^(limited|private|pvt|ltd)$/i.test(w)).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
                return (
                  <li key={r.id} className="group relative overflow-hidden border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                    <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-orange to-brand-green transition-transform duration-300 group-hover:scale-x-100" aria-hidden="true" />
                    {r["image_url"] ? (
                      <div className="flex h-full flex-col">
                        <div className="grid h-24 place-items-center px-4 py-3">
                          <img src={r["image_url"]} alt={`${name} logo`} loading="lazy" className="max-h-20 max-w-full object-contain" />
                        </div>
                        <p className="border-t border-border px-4 py-2.5 text-center font-display text-xs font-semibold leading-snug">{name}</p>
                      </div>
                    ) : (
                      <div className="flex h-full min-h-20 items-center gap-3 p-4">
                        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-blue/10 font-display text-sm font-bold text-brand-blue">{initials}</span>
                        <p className="font-display text-sm font-semibold leading-snug text-foreground">{name}</p>
                      </div>
                    )}
                  </li>
                );
              })}
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
