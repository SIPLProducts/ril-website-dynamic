import { STRENGTH_DEFAULTS } from "@/lib/strength-defaults";
import { useQuery } from "@tanstack/react-query";
import { pageListQuery } from "@/lib/page-lists.functions";
import { cleanHtml, isHtml, parseStyles, plainText } from "@/lib/strength-style";

const D = STRENGTH_DEFAULTS;
const RICH = "space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:text-primary [&_a]:underline [&_hr]:my-3 [&_mark]:rounded-sm [&_mark]:px-0.5";
const html = (s: string) => ({ __html: cleanHtml(s) });

function Line({ text }: { text: string }) {
  const m = /^(strategic focus:)(.*)$/i.exec(text);
  if (m) return <p><em className="font-semibold text-foreground">{m[1]}</em>{m[2]}</p>;
  return <p>{text}</p>;
}

/** Text that may be admin-formatted (HTML) or plain. */
function Inline({ text, className = "" }: { text: string; className?: string }) {
  return isHtml(text) ? <div className={`${RICH} ${className}`} dangerouslySetInnerHTML={html(text)} /> : <span className={className}>{text}</span>;
}

function Body({ text, className }: { text: string; className: string }) {
  if (isHtml(text)) return <div className={`${className} ${RICH}`} dangerouslySetInnerHTML={html(text)} />;
  return (
    <div className={`${className} space-y-2`}>
      {text.split(/\\n|\r?\n/).map((l) => l.trim()).filter(Boolean).map((l, j) => <Line key={j} text={l} />)}
    </div>
  );
}

export type Pillar = { id: string; title: string; body: string; image_url: string | null };

export function PillarCard({ p, n, legacyBody }: { p: Pillar; n: number; legacyBody?: string | undefined }) {
  const title = isHtml(p.title) ? p.title : (p.title || "").replace(/^\s*\d+\s*[.)\-–:]?\s*/, "");
  return (
    <li className="grid gap-5 py-7 sm:grid-cols-[11rem_1fr] sm:gap-8">
      {p.image_url && <img src={p.image_url} alt={plainText(p.title)} loading="lazy" className="aspect-square w-full max-w-[11rem] rounded-lg object-cover" />}
      <div className={p.image_url ? "min-w-0" : "min-w-0 sm:col-span-2"}>
        <h3 className="flex gap-2 font-display text-lg font-semibold">
          <span className="text-primary">{n}.</span><Inline text={title} className="min-w-0 flex-1" />
        </h3>
        <Body text={isHtml(p.body) || !legacyBody?.trim() ? p.body : legacyBody} className="mt-3 leading-relaxed text-muted-foreground" />
      </div>
    </li>
  );
}

export function StrengthPillars({ extra }: { extra: Record<string, string> }) {
  const { data: rows } = useQuery(pageListQuery("strength_pillars"));
  const x = (k: keyof typeof D) => (extra[k] ?? "").trim() || D[k];
  const legacy = parseStyles(extra["styles"]).pillars ?? {};
  const pillars = (rows ?? []) as unknown as Pillar[];
  return (
    <section className="mx-auto max-w-[1400px] space-y-16 px-5 pb-16 lg:px-10 lg:pb-24">
      {pillars.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl"><Inline text={x("pillarsTitle")} /></h2>
          <ul className="mt-8 divide-y divide-border border-y border-border">
            {pillars.map((p, i) => <PillarCard key={p.id} p={p} n={i + 1} legacyBody={legacy[p.id]?.bodyHtml} />)}
          </ul>
        </div>
      )}
      <div className="max-w-4xl">
        <h2 className="text-2xl font-bold sm:text-3xl"><Inline text={x("introTitle")} /></h2>
        <div className="eyebrow mt-3"><Inline text={x("introTagline")} /></div>
        <div className="mt-6 font-display text-lg font-semibold"><Inline text={x("introSubtitle")} /></div>
        {isHtml(x("introBody")) ? <div className={`mt-4 leading-relaxed text-muted-foreground ${RICH}`} dangerouslySetInnerHTML={html(x("introBody"))} />
          : <div className="mt-4 space-y-4 leading-relaxed text-muted-foreground">
            {x("introBody").split(/\\n|\r?\n/).map((p) => p.trim()).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          </div>}
      </div>
    </section>
  );
}
