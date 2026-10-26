import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CareersLayout } from "@/components/site/CareersLayout";
import { careersHead } from "@/lib/careers";
import cultureImageAsset from "@/assets/careers-people-culture.jpg.asset.json";
import projectImageAsset from "@/assets/careers-opportunities.jpg.asset.json";
const cultureImage = cultureImageAsset.url;
const projectImage = projectImageAsset.url;

export const Route = createFileRoute("/careers")({
  head: () => careersHead("People & Careers", "Explore Life at Ramky and Current Positions at Ramky Infrastructure Limited."),
  component: CareersPage,
});

function CareersPage() {
  return <CareersLayout title="People & Careers" landing>
    <div className="grid items-stretch gap-6 md:grid-cols-2">
      <article className="flex flex-col overflow-hidden rounded-sm border border-border bg-card">
        <img src={cultureImage} alt="Illustration of engineering professionals collaborating in an office" width={1536} height={864} className="aspect-[16/9] w-full object-cover" />
        <div className="flex flex-1 flex-col items-start p-6 lg:p-8">
          <p className="eyebrow">People & Culture</p>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Life at Ramky</h2>
          <p className="mb-7 mt-4 text-base leading-relaxed text-muted-foreground">At Ramky, we build more than infrastructure. We build capabilities, careers and a culture of continuous learning.</p>
          <Button asChild className="mt-auto"><Link to="/life-at-ramky">Life at Ramky<ArrowRight /></Link></Button>
        </div>
      </article>
      <article className="flex flex-col overflow-hidden rounded-sm border border-border bg-card">
        <img src={projectImage} alt="Illustration of engineering professionals reviewing plans at a construction site" width={1536} height={864} className="aspect-[16/9] w-full object-cover" />
        <div className="flex flex-1 flex-col items-start p-6 lg:p-8">
          <p className="eyebrow">Career Opportunities</p>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Current Positions</h2>
          <p className="mb-7 mt-4 text-base leading-relaxed text-muted-foreground">Kick start your career with Ramky Team and explore limitless opportunities.</p>
          <Button asChild className="mt-auto"><Link to="/current-positions">Current Positions<ArrowRight /></Link></Button>
        </div>
      </article>
    </div>
  </CareersLayout>;
}
