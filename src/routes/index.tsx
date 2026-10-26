import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/SiteLayout";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ramky Infra — Engineering India's Infrastructure" },
      { name: "description", content: "Ramky Infra delivers roads, bridges, water, and urban infrastructure projects across India." },
      { property: "og:title", content: "Ramky Infra — Engineering India's Infrastructure" },
      { property: "og:description", content: "Roads, bridges, water, and urban infrastructure built to last." },
    ],
  }),
  component: Index,
});

const stats = [
  { value: "25+", label: "Years of experience" },
  { value: "300+", label: "Projects delivered" },
  { value: "18", label: "States served" },
  { value: "10k+", label: "Workforce" },
];

const sectors = [
  { title: "Roads & Highways", text: "Expressways, flyovers and bridges connecting cities and regions." },
  { title: "Water & Wastewater", text: "Treatment plants, pipelines and irrigation systems at scale." },
  { title: "Urban Development", text: "Smart city, housing and commercial infrastructure." },
  { title: "Industrial & Power", text: "Industrial parks, utilities and energy infrastructure." },
];

function Index() {
  return (
    <PageShell>
      <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-navy">
        <img src={hero} alt="Bridge under construction at dusk" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto w-full max-w-7xl px-6 pt-24">
          <p className="eyebrow">Ramky Infrastructure Limited</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[1.02] text-navy-foreground md:text-7xl">
            Engineering the <span className="text-gold">backbone</span> of a growing nation.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-navy-foreground/80">
            From highways to water networks, we design, build and operate infrastructure that lasts for generations.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/about" className="btn-gold">Discover Ramky →</Link>
          </div>
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="border-r px-6 py-10 last:border-r-0">
              <p className="font-display text-4xl font-black text-primary md:text-5xl">{s.value}</p>
              <p className="mt-2 text-sm uppercase tracking-wider text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <p className="eyebrow">What we build</p>
        <h2 className="mt-3 max-w-2xl text-4xl font-black md:text-5xl">Infrastructure across every critical sector.</h2>
        <div className="mt-14 grid gap-px bg-border md:grid-cols-2 lg:grid-cols-4">
          {sectors.map((s, i) => (
            <div key={s.title} className="group bg-background p-8 transition-colors hover:bg-navy">
              <p className="font-display text-sm font-bold text-gold">0{i + 1}</p>
              <h3 className="mt-6 text-xl font-extrabold group-hover:text-navy-foreground">{s.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground group-hover:text-navy-foreground/70">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-16 md:flex-row md:items-center">
          <h2 className="max-w-2xl text-3xl font-black text-navy-foreground md:text-4xl">
            Building with integrity, safety and sustainability.
          </h2>
          <Link to="/about" className="btn-gold">Our story</Link>
        </div>
      </section>
    </PageShell>
  );
}
