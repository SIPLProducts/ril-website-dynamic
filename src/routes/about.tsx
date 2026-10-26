import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/SiteLayout";
import about from "@/assets/about.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Ramky Infra — Our Story, Vision & Values" },
      { name: "description", content: "Learn about Ramky Infra's journey, vision, and the values behind India's infrastructure projects." },
      { property: "og:title", content: "About Ramky Infra" },
      { property: "og:description", content: "Our journey, vision and values in building India's infrastructure." },
    ],
  }),
  component: About,
});

const values = [
  { title: "Integrity", text: "Transparent, ethical conduct in every contract and community." },
  { title: "Safety First", text: "Zero-harm culture across every site and every shift." },
  { title: "Quality", text: "Engineering excellence built to outlast expectations." },
  { title: "Sustainability", text: "Responsible construction that protects resources." },
];

function About() {
  return (
    <PageShell>
      <section className="bg-navy pb-20 pt-40">
        <div className="mx-auto max-w-7xl px-6">
          <p className="eyebrow">About us</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black text-navy-foreground md:text-6xl">
            Over two decades of building <span className="text-gold">what matters.</span>
          </h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-2">
        <img src={about} alt="Engineers reviewing plans on site" width={1280} height={960} loading="lazy" className="w-full object-cover" />
        <div>
          <p className="eyebrow">Our story</p>
          <h2 className="mt-3 text-4xl font-black">From Hyderabad to the nation.</h2>
          <p className="mt-6 text-muted-foreground">
            Ramky Infra is a leading infrastructure development company headquartered in Hyderabad. We execute complex projects in roads, water, urban development and industrial infrastructure — from concept and design through construction and operation.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="border-l-4 border-gold pl-5">
              <h3 className="text-lg font-extrabold">Vision</h3>
              <p className="mt-2 text-sm text-muted-foreground">To be India's most trusted partner in building sustainable infrastructure.</p>
            </div>
            <div className="border-l-4 border-gold pl-5">
              <h3 className="text-lg font-extrabold">Mission</h3>
              <p className="mt-2 text-sm text-muted-foreground">Deliver projects safely, on time and to the highest quality standards.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="eyebrow">Our values</p>
          <h2 className="mt-3 text-4xl font-black">What guides every project.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="bg-card p-8 shadow-sm">
                <div className="h-1 w-10 bg-gold" />
                <h3 className="mt-6 text-xl font-extrabold">{v.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
