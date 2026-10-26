import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, UserRound } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { publishedSeniorManagement } from "@/lib/senior-management";

const TITLE = "Senior Management | Ramky Infrastructure";
const DESCRIPTION = "The senior management team leading operations, projects and functions at Ramky Infrastructure.";

export const Route = createFileRoute("/senior-management")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SeniorManagementPage,
});

function SeniorManagementPage() {
  const members = publishedSeniorManagement();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pb-20 pt-32 lg:pt-36">
        <div className="mx-auto max-w-[1200px] px-5 lg:px-10">
          <p className="eyebrow">Management</p>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Senior Management</h1>
          <a href="/#senior-management" className="mt-4 inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.08em] text-brand-blue hover:text-brand-orange">
            <ArrowLeft className="size-4" /> Back to Management
          </a>
          {members.length === 0 ? (
            <p className="mt-12 text-muted-foreground">Senior Management details will be published shortly.</p>
          ) : (
            <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {members.map((m) => (
                <li key={m.id} className="text-center">
                  {m.image ? (
                    <img src={m.image} alt={m.name} loading="lazy" className="aspect-[4/5] w-full rounded-sm border border-border bg-surface object-cover object-[50%_20%]" />
                  ) : (
                    <div className="flex aspect-[4/5] w-full items-center justify-center rounded-sm border border-border bg-surface text-muted-foreground">
                      <UserRound className="size-16" strokeWidth={1} />
                    </div>
                  )}
                  <p className="mt-4 font-display text-base font-semibold">{m.name}</p>
                  <p className="mt-1 font-display text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-brand-orange">{m.designation}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
