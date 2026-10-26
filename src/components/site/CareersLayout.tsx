import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export function CareersLayout({ title, children, landing = false }: { title: string; children: ReactNode; landing?: boolean }) {
  return <div className="min-h-screen bg-background">
    <SiteHeader />
    <main className="pb-20 pt-32 lg:pt-36">
      <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
        {!landing && <Link to="/careers" className="mb-7 inline-flex items-center gap-2 text-sm text-brand-blue"><ArrowLeft className="size-4" />Careers</Link>}
        <p className="eyebrow">{landing ? "People & Careers" : "Careers"}</p>
        <h1 className={landing ? "sr-only" : "mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"}>{title}</h1>
        <nav aria-label="Careers navigation" className="mb-10 mt-7 flex flex-wrap gap-x-7 gap-y-3 border-b border-border pb-4 font-display text-sm">
          <Link to="/life-at-ramky" activeProps={{ className: "font-semibold text-brand-blue" }} inactiveProps={{ className: "text-muted-foreground" }}>Life at Ramky</Link>
          <Link to="/current-positions" activeProps={{ className: "font-semibold text-brand-blue" }} inactiveProps={{ className: "text-muted-foreground" }}>Current Positions</Link>
        </nav>
        {children}
      </div>
    </main>
    <SiteFooter />
  </div>;
}