import { useEffect, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import logo from "@/assets/ramky-logo-transparent.png";
import { ABOUT_SECTIONS } from "@/lib/about-sections";
import { ESG_SECTIONS } from "@/lib/esg-sections";
import { IR_CATEGORIES } from "@/lib/investor-relations";

const NAV = [
  { label: "Capabilities", href: "/#businesses" },
  { label: "Accolades", href: "/accolades" },
];

const INVESTOR_LINKS = IR_CATEGORIES.map((c) => ({
  label: c.label,
  slug: c.slug,
  links: c.subTabs.length > 1 ? c.subTabs.map((s) => ({ label: s.label, slug: s.slug })) : [{ label: `View ${c.label}`, slug: c.subTabs[0]!.slug }],
}));

const investorHref = (cat: string, sub: string) => `/investors?cat=${cat}&sub=${sub}`;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [investorsOpen, setInvestorsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background shadow-md" : "bg-background/90 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-5 py-2 lg:px-10">
        <a href="/#top" className="flex shrink-0 items-center" aria-label="Ramky Infrastructure home">
          <img
            src={logo}
            alt="Ramky Infrastructure — Towards sustainable growth"
            width={140}
            height={132}
            className={`w-auto object-contain transition-all duration-300 ${
              scrolled ? "h-14" : "h-16"
            }`}
          />
        </a>

        <nav className="ml-auto hidden items-center gap-7 lg:flex">
          <div className="group relative">
            <a
              href="/#about"
              className="inline-flex items-center gap-1 font-display text-[0.82rem] font-semibold uppercase tracking-[0.09em] text-foreground/75 transition-colors hover:text-brand-blue"
            >
              About Ramky <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" />
            </a>
            <div className="pointer-events-none absolute left-0 top-full pt-5 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
              <div className="w-60 rounded-sm border border-border bg-background p-4 shadow-xl">
                <a href="/history-milestones" className="block py-2 text-sm text-muted-foreground transition-colors hover:text-brand-orange">
                  History &amp; Milestones
                </a>
                {ABOUT_SECTIONS.map((section) => (
                  <div key={section.slug}>
                    <a
                      href={
                        section.slug === "partners"
                          ? "/about/partners/subsidiaries"
                          : `/about/${section.slug}`
                      }
                      className="block py-2 text-sm text-muted-foreground transition-colors hover:text-brand-orange"
                    >
                      {section.title}
                    </a>
                    {section.slug === "partners" && (
                      <a
                        href="/about/partners/subsidiaries"
                        className="block py-1.5 pl-4 text-sm text-muted-foreground transition-colors hover:text-brand-orange"
                      >
                        └ Subsidiaries
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="group relative">
            <a
              href="/#management"
              className="inline-flex items-center gap-1 font-display text-[0.82rem] font-semibold uppercase tracking-[0.09em] text-foreground/75 transition-colors hover:text-brand-blue"
            >
              Management <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" />
            </a>
            <div className="pointer-events-none absolute left-0 top-full pt-5 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
              <div className="w-56 rounded-sm border border-border bg-background p-4 shadow-xl">
                <a href="/#board-of-directors" className="block py-2 text-sm text-muted-foreground transition-colors hover:text-brand-orange">
                  Board Of Directors
                </a>
                <a href="/senior-management" className="block py-2 text-sm text-muted-foreground transition-colors hover:text-brand-orange">
                  Senior Management
                </a>
              </div>
            </div>
          </div>
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-display text-[0.82rem] font-semibold uppercase tracking-[0.09em] text-foreground/75 transition-colors hover:text-brand-blue"
            >
              {item.label}
            </a>
          ))}
          <div className="group relative">
            <a
              href="/#sustainability"
              className="inline-flex items-center gap-1 font-display text-[0.82rem] font-semibold uppercase tracking-[0.09em] text-foreground/75 transition-colors hover:text-brand-blue"
            >
              Sustainability <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" />
            </a>
            <div className="pointer-events-none absolute left-0 top-full pt-5 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
              <div className="w-60 rounded-sm border border-border bg-background p-4 shadow-xl">
                {ESG_SECTIONS.map((section) => (
                  <a
                    key={section.slug}
                    href={`/esg/${section.slug}`}
                    className="block py-2 text-sm text-muted-foreground transition-colors hover:text-brand-orange"
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="group relative">
            <a
              href="/investors"
              className="inline-flex items-center gap-1 font-display text-[0.82rem] font-semibold uppercase tracking-[0.09em] text-foreground/75 transition-colors hover:text-brand-blue"
            >
              Investors <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" />
            </a>
            <div className="pointer-events-none absolute right-0 top-full pt-5 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
              <div className="grid w-[880px] grid-cols-4 gap-7 rounded-sm border border-border bg-background p-7 shadow-xl">
                {INVESTOR_LINKS.map((group) => (
                  <div key={group.label}>
                    <p className="border-b-2 border-brand-orange pb-2 font-display text-xs font-bold uppercase text-brand-blue">
                      {group.label}
                    </p>
                    <div className="mt-3 space-y-2.5">
                      {group.links.map((link) => (
                        <a
                          key={link.slug}
                          href={investorHref(group.slug, link.slug)}
                          className="block text-xs leading-snug text-muted-foreground transition-colors hover:text-brand-orange"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <a
            href="/#contact"
            className="rounded-sm bg-brand-orange px-5 py-2.5 font-display text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-accent-foreground transition-opacity hover:opacity-90"
          >
            Contact
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="ml-auto inline-flex size-10 items-center justify-center rounded-sm border border-border text-foreground lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-5 pb-5 lg:hidden">
          <div className="border-b border-border bg-surface px-4 py-2">
            <p className="block py-2 font-display text-sm font-semibold uppercase tracking-[0.08em] text-foreground/80">
              About Ramky
            </p>
            <a href="/history-milestones" onClick={() => setOpen(false)} className="block py-2 text-sm text-muted-foreground">
              History &amp; Milestones
            </a>
            {ABOUT_SECTIONS.map((section) => (
              <div key={section.slug}>
                <a
                  href={
                    section.slug === "partners"
                      ? "/about/partners/subsidiaries"
                      : `/about/${section.slug}`
                  }
                  onClick={() => setOpen(false)}
                  className="block py-2 text-sm text-muted-foreground"
                >
                  {section.title}
                </a>
                {section.slug === "partners" && (
                  <a
                    href="/about/partners/subsidiaries"
                    onClick={() => setOpen(false)}
                    className="block py-2 pl-4 text-sm text-muted-foreground"
                  >
                    Subsidiaries
                  </a>
                )}
              </div>
            ))}
          </div>
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-border py-3 font-display text-sm font-semibold uppercase tracking-[0.08em] text-foreground/80"
            >
              {item.label}
            </a>
          ))}
          <div className="border-b border-border bg-surface px-4 py-2">
            <a href="/#sustainability" onClick={() => setOpen(false)} className="block py-2 font-display text-sm font-semibold uppercase tracking-[0.08em] text-foreground/80">
              Sustainability
            </a>
            {ESG_SECTIONS.map((section) => (
              <a
                key={section.slug}
                href={`/esg/${section.slug}`}
                onClick={() => setOpen(false)}
                className="block py-2 text-sm text-muted-foreground"
              >
                {section.title}
              </a>
            ))}
          </div>
          <div className="border-b border-border bg-surface px-4 py-2">
            <a href="/#management" onClick={() => setOpen(false)} className="block py-2 font-display text-sm font-semibold uppercase tracking-[0.08em] text-foreground/80">
              Management
            </a>
            <a href="/#board-of-directors" onClick={() => setOpen(false)} className="block py-2 text-sm text-muted-foreground">
              Board Of Directors
            </a>
            <a href="/senior-management" onClick={() => setOpen(false)} className="block py-2 text-sm text-muted-foreground">
              Senior Management
            </a>
          </div>
          <button
            type="button"
            onClick={() => setInvestorsOpen((value) => !value)}
            aria-expanded={investorsOpen}
            className="flex w-full items-center justify-between border-b border-border py-3 font-display text-sm font-semibold uppercase tracking-[0.08em] text-foreground/80"
          >
            Investors
            <ChevronDown className={`size-4 transition-transform ${investorsOpen ? "rotate-180" : ""}`} />
          </button>
          {investorsOpen && (
            <div className="max-h-[55vh] overflow-y-auto border-b border-border bg-surface px-4 py-4">
              {INVESTOR_LINKS.map((group) => (
                <div key={group.label} className="mb-5 last:mb-0">
                  <p className="font-display text-xs font-bold uppercase text-brand-blue">{group.label}</p>
                  <div className="mt-2 grid gap-2">
                    {group.links.map((link) => (
                      <a
                        key={link.slug}
                        href={investorHref(group.slug, link.slug)}
                        onClick={() => setOpen(false)}
                        className="text-sm text-muted-foreground"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <a
            href="/#contact"
            onClick={() => setOpen(false)}
            className="block border-b border-border py-3 font-display text-sm font-semibold uppercase tracking-[0.08em] text-foreground/80"
          >
            Contact
          </a>
        </nav>
      )}
      <div className="h-[3px] w-full bg-gradient-to-r from-brand-orange via-brand-green to-brand-blue" />
    </header>
  );
}
