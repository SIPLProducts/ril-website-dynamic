import { createFileRoute } from "@tanstack/react-router";
import { Compass, Target, BadgeCheck } from "lucide-react";
import { CareersLayout } from "@/components/site/CareersLayout";
import { useSuspenseQuery } from "@tanstack/react-query";
import { careersHead } from "@/lib/careers";
import { careersQuery } from "@/lib/site-content.functions";

export const Route = createFileRoute("/life-at-ramky")({
  head: () => careersHead("Life at Ramky", "Ramky Infrastructure's vision, mission, values, people, learning and development."),
  loader: ({ context }) => context.queryClient.ensureQueryData(careersQuery()),
  component: LifeAtRamkyPage,
});

const CARD = "purpose-card rounded-md border border-border bg-card p-6";

function LifeAtRamkyPage() {
  const { purpose: PURPOSE, sections: LIFE_SECTIONS } = useSuspenseQuery(careersQuery()).data;
  return <CareersLayout title="Life at Ramky">
    <section aria-labelledby="purpose-title" className="border-b border-border pb-12">
      <h2 id="purpose-title" className="text-2xl font-semibold sm:text-3xl">Vision, Mission and Values</h2>
      <div className="mt-7 grid items-start gap-6 min-[800px]:grid-cols-3">
        <div className={CARD}>
          <h3 className="flex items-center gap-3 text-xl font-semibold text-brand-blue"><Compass aria-hidden="true" className="size-5" />Vision</h3>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">{PURPOSE.vision}</p>
        </div>
        <div className={CARD}>
          <h3 className="flex items-center gap-3 text-xl font-semibold text-brand-blue"><Target aria-hidden="true" className="size-5" />Mission</h3>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">{PURPOSE.mission}</p>
        </div>
        <div className={CARD}>
          <h3 className="flex items-center gap-3 text-xl font-semibold text-brand-blue"><BadgeCheck aria-hidden="true" className="size-5" />Values</h3>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">{PURPOSE.valuesIntro}</p>
          <ul className="mt-4 space-y-3">{PURPOSE.values.map((value) => <li key={value} className="flex items-start gap-3 text-base font-semibold"><BadgeCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand-green" />{value}</li>)}</ul>
        </div>
      </div>
    </section>
    <div className="divide-y divide-border">
      {LIFE_SECTIONS.map((section) => <section key={section.id} className="grid gap-5 py-10 lg:grid-cols-[1fr_2fr] lg:gap-14">
        <div><h2 className="text-2xl font-semibold leading-snug">{section.title}</h2></div>
        <div className="space-y-4">{section.imageUrl && <img src={section.imageUrl} alt={section.title} className="w-full rounded-md object-cover" loading="lazy" />}{section.paragraphs.map((text, j) => <p key={j} className="text-base leading-relaxed text-muted-foreground">{text}</p>)}</div>
      </section>)}
    </div>
  </CareersLayout>;
}
