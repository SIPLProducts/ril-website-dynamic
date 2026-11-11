import { useState } from "react";
import { Award, ExternalLink, FileText, HardHat, Leaf, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { CERTIFICATIONS, POLICIES, type Certification, type ManagedDocument, type Policy } from "@/lib/management-systems";
import { aboutDataQuery } from "@/lib/about-data.functions";
import { pageListQuery, type PageListRow } from "@/lib/page-lists.functions";

type Icon = Certification["icon"];
const asIcon = (v: string | null): Icon => (v === "safety" || v === "environment" ? v : "quality");
function fromRows(rows: PageListRow[] | undefined) {
  if (!rows?.length) return { certs: CERTIFICATIONS, policies: POLICIES };
  const doc = (r: PageListRow) => ({ title: r["title"] ?? "", url: r["doc_url"] ?? "", ...(Number(r["doc_page"]) > 0 ? { page: Number(r["doc_page"]) } : {}) });
  const certs: Certification[] = rows.filter((r) => r["kind"] === "certificate").map((r) => ({
    id: r.id, standard: r["standard"] ?? "", title: r["title"] ?? "", icon: asIcon(r["icon"] ?? null), summary: r["summary"] ?? "",
    focusAreas: (r["focus_areas"] ?? "").split(",").map((t) => t.trim()).filter(Boolean), cta: r["cta"] || "View Certificate", document: doc(r),
  }));
  const policies: Policy[] = rows.filter((r) => r["kind"] === "policy").map((r) => ({ id: r.id, title: r["title"] ?? "", summary: r["summary"] ?? "", cta: r["cta"] || "View Policy", document: doc(r) }));
  return { certs, policies };
}

const ICONS = { quality: Award, safety: HardHat, environment: Leaf };

function docSrc(doc: ManagedDocument) {
  return `${doc.url}#${doc.page ? `page=${doc.page}&` : ""}view=FitH`;
}

export function ManagementSystems() {
  const [open, setOpen] = useState<ManagedDocument | null>(null);
  const { data } = useQuery(pageListQuery("management_system_items"));
  const { certs, policies } = fromRows(data);
  const { data: about } = useQuery(aboutDataQuery("management-systems"));
  const x = about?.content?.extra ?? {};
  const t = (k: string, d: string) => (x[k]?.trim() ? x[k] : d);

  return (
    <>
      <section className="mx-auto max-w-[1400px] px-5 pb-16 lg:px-10 lg:pb-24">
        <p className="eyebrow">{t("certEyebrow", "Certified Systems")}</p>
        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{t("certTitle", "Management Systems")}</h2>
        <p className="mt-5 max-w-4xl text-lg leading-relaxed text-muted-foreground">
          {t("certIntro", "Our management systems reflect our commitment to quality, occupational health and safety, and environmental responsibility across the lifecycle of our projects. These internationally recognised standards guide the way we design, engineer, procure, construct, operate and maintain critical infrastructure.")}
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certs.map((c) => {
            const Icon = ICONS[c.icon];
            return (
              <article
                key={c.id}
                className="group flex h-full flex-col border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/40 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex size-14 items-center justify-center bg-brand-blue/10 text-brand-blue">
                    <Icon className="size-7" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <ShieldCheck className="size-5 text-brand-orange" aria-hidden="true" />
                </div>
                <p className="mt-6 font-display text-3xl font-bold text-brand-blue">{c.standard}</p>
                <h3 className="mt-2 font-display text-lg font-semibold leading-snug">{c.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{c.summary}</p>
                <ul className="mb-7 mt-5 flex flex-wrap gap-2" aria-label="Key focus areas">
                  {c.focusAreas.map((t) => (
                    <li key={t} className="border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground">
                      {t}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => c.document.url && setOpen(c.document)}
                  className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 self-start bg-brand-orange px-5 font-display text-sm font-semibold uppercase text-primary-foreground transition-colors hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                >
                  <FileText className="size-4" aria-hidden="true" /> {c.cta ?? "View Certificate"}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-[1400px] px-5 py-16 lg:px-10 lg:py-24">
          <p className="eyebrow">{t("commitEyebrow", "Our Commitment")}</p>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{t("commitTitle", "Our Management Commitments")}</h2>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            {t("commitIntro", "Our management systems are supported by clearly defined Quality and Health, Safety & Environment commitments that guide our people, processes and project delivery.")}
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {policies.map((p) => (
              <article
                key={p.id}
                className="flex h-full flex-col border-l-4 border-brand-blue bg-card p-7 transition-shadow hover:shadow-lg lg:p-9"
              >
                <h3 className="font-display text-2xl font-bold">{p.title}</h3>
                <p className="mt-4 leading-relaxed text-muted-foreground">{p.summary}</p>
                <button
                  type="button"
                  onClick={() => p.document.url && setOpen(p.document)}
                  className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 self-start border border-brand-blue px-5 font-display text-sm font-semibold uppercase text-brand-blue transition-colors hover:bg-brand-blue hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                >
                  <FileText className="size-4" aria-hidden="true" /> {p.cta}
                </button>
              </article>
            ))}
          </div>
          <p className="mt-14 text-center font-display text-lg font-semibold text-brand-blue sm:text-xl">
            {t("tagline", "Integrated management systems. Responsible execution. Consistent performance.")}
          </p>
        </div>
      </section>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="flex h-[90vh] w-[95vw] max-w-5xl flex-col gap-3 p-4 sm:p-6">
          <DialogHeader className="pr-8">
            <DialogTitle>{open?.title}</DialogTitle>
            <DialogDescription>
              Use the viewer controls to zoom, or{" "}
              <a
                href={open ? docSrc(open) : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-brand-blue underline"
              >
                open in a new tab <ExternalLink className="size-3" aria-hidden="true" />
              </a>
              .
            </DialogDescription>
          </DialogHeader>
          {open && (
            <iframe key={docSrc(open)} src={docSrc(open)} title={open.title} className="min-h-0 w-full flex-1 border border-border bg-surface" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
