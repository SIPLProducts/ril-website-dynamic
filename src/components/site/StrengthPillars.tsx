import { useQuery } from "@tanstack/react-query";
import { pageListQuery } from "@/lib/page-lists.functions";

const D = {
  pillarsTitle: "Pillars of Ramky Infrastructure",
  introTitle: "Strengths & Strategies",
  introTagline: "PROVEN CAPABILITIES. INTEGRATED RESOURCES. SUSTAINABLE EXECUTION.",
  introSubtitle: "Our Strengths. Our Strategic Advantage.",
  introBody:
    "At Ramky Infrastructure Limited, our strength lies in the ability to bring together the critical resources and capabilities required to develop and deliver complex infrastructure projects. Built on decades of engineering and execution experience, our integrated capabilities across people, materials, machinery, methodology and financial resources enable us to undertake projects across diverse sectors and geographies.\n\nOur 5M framework represents the foundation of our execution capabilities and our commitment to quality, timely delivery, operational excellence and sustainable growth.",
};

function Line({ text }: { text: string }) {
  const m = /^(strategic focus:)(.*)$/i.exec(text);
  if (m) return <p><em className="font-semibold text-foreground">{m[1]}</em>{m[2]}</p>;
  return <p>{text}</p>;
}

export function StrengthPillars({ extra }: { extra: Record<string, string> }) {
  const { data: rows } = useQuery(pageListQuery("strength_pillars"));
  const x = (k: keyof typeof D) => (extra[k] ?? "").trim() || D[k];
  const pillars = rows ?? [];
  const paras = x("introBody").split(/\\n|\r?\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <section className="mx-auto max-w-[1400px] space-y-16 px-5 pb-16 lg:px-10 lg:pb-24">
      {pillars.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">{x("pillarsTitle")}</h2>
          <ul className="mt-8 divide-y divide-border border-y border-border">
            {pillars.map((p, i) => (
              <li key={p.id} className="grid gap-5 py-7 sm:grid-cols-[11rem_1fr] sm:gap-8">
                {p["image_url"] && <img src={p["image_url"]} alt={p["title"] ?? ""} loading="lazy" className="aspect-square w-full max-w-[11rem] rounded-lg object-cover" />}
                <div className={p["image_url"] ? "" : "sm:col-span-2"}>
                  <h3 className="font-display text-lg font-semibold"><span className="mr-2 text-brand-orange">{String(i + 1).padStart(2, "0")}.</span>{p["title"]}</h3>
                  <div className="mt-3 space-y-2 leading-relaxed text-muted-foreground">
                    {(p["body"] ?? "").split(/\\n|\r?\n/).map((l) => l.trim()).filter(Boolean).map((l, j) => <Line key={j} text={l} />)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="max-w-4xl">
        <h2 className="text-2xl font-bold sm:text-3xl">{x("introTitle")}</h2>
        <p className="eyebrow mt-3">{x("introTagline")}</p>
        <p className="mt-6 font-display text-lg font-semibold">{x("introSubtitle")}</p>
        <div className="mt-4 space-y-4 leading-relaxed text-muted-foreground">
          {paras.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>
    </section>
  );
}
