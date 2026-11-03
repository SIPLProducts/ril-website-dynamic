import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BriefcaseBusiness, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CareersApplication } from "@/components/site/CareersApplication";
import { CareersLayout } from "@/components/site/CareersLayout";
import { useSuspenseQuery } from "@tanstack/react-query";
import { careersHead, type Vacancy } from "@/lib/careers";
import { careersQuery } from "@/lib/site-content.functions";

export const Route = createFileRoute("/current-positions")({
  head: () => careersHead("Current Positions", "Explore current recruitment opportunities and apply to Ramky Infrastructure Limited."),
  loader: ({ context }) => context.queryClient.ensureQueryData(careersQuery()),
  component: CurrentPositionsPage,
});

function CurrentPositionsPage() {
  const [selected, setSelected] = useState<Vacancy | null>(null);
  const [application, setApplication] = useState<{ title: string; id: string } | null>(null);
  const { vacancies, flyers, positionsIntro: POSITIONS_INTRO } = useSuspenseQuery(careersQuery()).data;
  return <CareersLayout title="Current Positions">
    <p className="max-w-5xl whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">{POSITIONS_INTRO}</p>
    <div className="mt-10 grid gap-5 md:grid-cols-2">
      {vacancies.map((job) => <article key={job.id} className="flex flex-col items-start rounded-sm border border-border bg-card p-6 lg:p-8">
        <BriefcaseBusiness className="size-6 text-brand-orange" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold leading-snug text-brand-blue">{job.title}</h2>
        {job.location && <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground"><MapPin className="mt-0.5 size-4 shrink-0" />{job.location}</p>}
        <dl className="mb-6 mt-5 grid w-full grid-cols-2 gap-4 text-sm">
          <div><dt className="text-muted-foreground">Job Req ID</dt><dd className="mt-1 font-semibold">{job.id}</dd></div>
          {job.publishedDate && <div><dt className="text-muted-foreground">Date</dt><dd className="mt-1">{job.publishedDate}</dd></div>}
          {job.division && <div className="col-span-2"><dt className="text-muted-foreground">Business Unit</dt><dd className="mt-1">{job.division}</dd></div>}
        </dl>
        <Button variant="outline" className="mt-auto" onClick={() => setSelected(job)}>View Details<ArrowRight /></Button>
      </article>)}
      {flyers.map((flyer) => <article key={flyer.id} className="rounded-sm border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">{flyer.title}</h2>
        {flyer.imageUrl && <img src={flyer.imageUrl} alt={flyer.title} className="mt-4 h-auto w-full object-contain" loading="lazy" />}
        {flyer.url && <Button asChild variant="outline" className="mt-4"><a href={flyer.url} target="_blank" rel="noopener noreferrer">View full flyer<ArrowRight /></a></Button>}
        <ul className="mt-4 space-y-3">{flyer.roles.map((role) => <li key={role} className="flex flex-wrap items-center justify-between gap-3"><span>{role}</span><Button onClick={() => setApplication({ title: role, id: flyer.id })}>Apply Now</Button></li>)}</ul>
      </article>)}
    </div>
    {vacancies.length === 0 && flyers.length === 0 && <p className="mt-10 border-t border-border py-8 text-muted-foreground">There are currently no open positions. Please check back for future opportunities.</p>}
    <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto">
        <DialogTitle className="pr-5 text-xl leading-snug">{selected?.title}</DialogTitle>
        <DialogDescription>Job Req ID {selected?.id}</DialogDescription>
        {selected && <>
          <dl className="grid gap-4 sm:grid-cols-2">
            {[['Location', selected.location], ['Business Unit', selected.division], ['Date', selected.publishedDate], ['Experience', selected.experience], ['Qualifications', selected.qualification], ['Employment type', selected.employmentType], ['Application deadline', selected.deadline], ['Number of vacancies', selected.vacancies]].filter(([, value]) => value !== undefined && value !== '').map(([label, value]) => <div key={label}><dt className="text-sm text-muted-foreground">{label}</dt><dd className="mt-1 text-base">{value}</dd></div>)}
          </dl>
          {selected.description && <div><h3 className="font-semibold">Job description</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{selected.description}</p></div>}
          {[{ title: 'Key responsibilities', items: selected.responsibilities }, { title: 'Required skills', items: selected.skills }].map(({ title, items }) => items?.length ? <div key={title}><h3 className="font-semibold">{title}</h3><ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">{items.map((item) => <li key={item}>{item}</li>)}</ul></div> : null)}
          <Button className="mt-4 justify-self-start" onClick={() => { setApplication({ title: selected.title, id: selected.id }); setSelected(null); }}>Apply Now<ArrowRight /></Button>
        </>}
      </DialogContent>
    </Dialog>
    {application && <CareersApplication key={`${application.id}-${application.title}`} position={application.title} reference={application.id} open onOpenChange={(open) => { if (!open) setApplication(null); }} />}
  </CareersLayout>;
}