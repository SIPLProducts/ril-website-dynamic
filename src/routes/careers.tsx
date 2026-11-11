import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pageListQuery } from "@/lib/page-lists.functions";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CareersLayout } from "@/components/site/CareersLayout";
import { careersHead } from "@/lib/careers";
import cultureImageAsset from "@/assets/careers-people-culture.jpg.asset.json";
import projectImageAsset from "@/assets/careers-opportunities.jpg.asset.json";
const cultureImage = cultureImageAsset.url;
const projectImage = projectImageAsset.url;

const DEFAULT_CARDS = [
  { id: "life", eyebrow: "People & Culture", title: "Life at Ramky", text: "At Ramky, we build more than infrastructure. We build capabilities, careers and a culture of continuous learning.", href: "/life-at-ramky", image: cultureImage },
  { id: "positions", eyebrow: "Career Opportunities", title: "Current Positions", text: "Kick start your career with Ramky Team and explore limitless opportunities.", href: "/current-positions", image: projectImage },
];

export const Route = createFileRoute("/careers")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageListQuery("careers_landing_cards")).catch(() => null),
  head: () => careersHead("People & Careers", "Explore Life at Ramky and Current Positions at Ramky Infrastructure Limited."),
  component: CareersPage,
});

function CareersPage() {
  const { data } = useQuery(pageListQuery("careers_landing_cards"));
  const cards = data?.length ? data.map((r) => ({ id: r.id, eyebrow: r["eyebrow"] ?? "", title: r["title"] ?? "", text: r["text"] ?? "", href: r["href"] || "/careers", image: r["image_url"] })) : DEFAULT_CARDS;
  return <CareersLayout title="People & Careers" landing>
    <div className="grid items-stretch gap-6 md:grid-cols-2">
      {cards.map((c) => (
        <article key={c.id} className="flex flex-col overflow-hidden rounded-sm border border-border bg-card">
          {c.image && <img src={c.image} alt={c.title} width={1536} height={864} className="aspect-[16/9] w-full object-cover" />}
          <div className="flex flex-1 flex-col items-start p-6 lg:p-8">
            {c.eyebrow && <p className="eyebrow">{c.eyebrow}</p>}
            <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">{c.title}</h2>
            <p className="mb-7 mt-4 text-base leading-relaxed text-muted-foreground">{c.text}</p>
            <Button asChild className="mt-auto"><a href={c.href}>{c.title}<ArrowRight /></a></Button>
          </div>
        </article>
      ))}
    </div>
  </CareersLayout>;
}
