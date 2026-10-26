import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function SiteHeader() {
  const link = "text-sm font-semibold uppercase tracking-wider text-navy-foreground/80 hover:text-gold transition-colors";
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center bg-gold font-display text-lg font-black text-navy">R</span>
          <span className="font-display text-xl font-extrabold tracking-tight text-navy-foreground">
            RAMKY <span className="text-gold">INFRA</span>
          </span>
        </Link>
        <nav className="flex items-center gap-8">
          <Link to="/" className={link} activeProps={{ className: "text-gold" }} activeOptions={{ exact: true }}>Home</Link>
          <Link to="/about" className={link} activeProps={{ className: "text-gold" }}>About</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-xl font-extrabold">RAMKY <span className="text-gold">INFRA</span></p>
          <p className="mt-3 text-sm text-navy-foreground/70">Building the infrastructure that powers a growing nation.</p>
        </div>
        <div className="text-sm text-navy-foreground/70">
          <p className="eyebrow mb-3">Headquarters</p>
          <p>Hyderabad, Telangana, India</p>
        </div>
        <div className="text-sm text-navy-foreground/70">
          <p className="eyebrow mb-3">Explore</p>
          <div className="flex flex-col gap-2">
            <Link to="/" className="hover:text-gold">Home</Link>
            <Link to="/about" className="hover:text-gold">About Us</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-navy-foreground/10 py-5 text-center text-xs text-navy-foreground/50">
        © {new Date().getFullYear()} Ramky Infrastructure Limited. All rights reserved.
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
