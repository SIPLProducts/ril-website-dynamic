import { STRENGTH_DEFAULTS } from "@/lib/strength-defaults";
import { useQuery } from "@tanstack/react-query";
import { pageListQuery } from "@/lib/page-lists.functions";
import { cardCss, cleanHtml, headerCss, isHtml, merge, parseStyles, spacingCss, type CardStyle } from "@/lib/strength-style";

const D = STRENGTH_DEFAULTS;
const RICH = "space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6";

function Line({ text }: { text: string }) {
  const m = /^(strategic focus:)(.*)$/i.exec(text);
  if (m) return <p><em className="font-semibold text-foreground">{m[1]}</em>{m[2]}</p>;
  return <p>{text}</p>;
}

function Body({ text, style }: { text: string; style: CardStyle }) {
  const c = style.contentColor ? { color: style.contentColor } : undefined;
  if (isHtml(text)) return <div className={`mt-3 leading-relaxed ${style.contentColor ? "" : "text-muted-foreground"} ${RICH}`} style={c} dangerouslySetInnerHTML={{ __html: cleanHtml(text) }} />;
  return (
    <div className={`mt-3 space-y-2 leading-relaxed ${style.contentColor ? "" : "text-muted-foreground"}`} style={c}>
      {text.split(/\\n|\r?\n/).map((l) => l.trim()).filter(Boolean).map((l, j) => <Line key={j} text={l} />)}
    </div>
  );
}

export type Pillar = { id: string; title: string; body: string; image_url: string | null };

export function PillarCard({ p, n, style }: { p: Pillar; n: number; style: CardStyle }) {
  const title = (style.headerText?.trim() || p.title || "").replace(/^\s*\d+\s*[.)\-–:]?\s*/, "");
  return (
    <li className="grid gap-5 py-7 sm:grid-cols-[11rem_1fr] sm:gap-8" style={{ ...cardCss(style), ...spacingCss(style) }}>
      {p.image_url && <img src={p.image_url} alt={p.title} loading="lazy" className="aspect-square w-full max-w-[11rem] rounded-lg object-cover" />}
      <div className={p.image_url ? "min-w-0" : "min-w-0 sm:col-span-2"}>
        <h3 className="font-display text-lg font-semibold" style={headerCss(style)}>
          <span className="mr-2" style={{ color: style.headerColor ? undefined : "var(--color-primary)" }}>{n}.</span>{title}
        </h3>
        <Body text={style.bodyHtml?.trim() ? style.bodyHtml : p.body} style={style} />
      </div>
    </li>
  );
}

export function IntroCard({ x, style }: { x: (k: keyof typeof D) => string; style: CardStyle }) {
  const body = x("introBody");
  return (
    <div className="max-w-4xl" style={cardCss(style)}>
      <h2 className="text-2xl font-bold sm:text-3xl" style={headerCss(style)}>{style.headerText?.trim() || x("introTitle")}</h2>
      <p className="eyebrow mt-3">{x("introTagline")}</p>
      <p className="mt-6 font-display text-lg font-semibold" style={style.contentColor ? { color: style.contentColor } : undefined}>{x("introSubtitle")}</p>
      {isHtml(body) ? <div className={`mt-4 leading-relaxed ${style.contentColor ? "" : "text-muted-foreground"} ${RICH}`} style={{ color: style.contentColor }} dangerouslySetInnerHTML={{ __html: cleanHtml(body) }} />
        : <div className={`mt-4 space-y-4 leading-relaxed ${style.contentColor ? "" : "text-muted-foreground"}`} style={{ color: style.contentColor }}>
          {body.split(/\\n|\r?\n/).map((p) => p.trim()).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
        </div>}
    </div>
  );
}

export function StrengthPillars({ extra }: { extra: Record<string, string> }) {
  const { data: rows } = useQuery(pageListQuery("strength_pillars"));
  const x = (k: keyof typeof D) => (extra[k] ?? "").trim() || D[k];
  const styles = parseStyles(extra["styles"]);
  const pillars = (rows ?? []) as unknown as Pillar[];
  const anyCardStyle = Boolean(styles.page && Object.keys(styles.page).length) || Object.keys(styles.pillars ?? {}).length > 0;
  return (
    <section className="mx-auto max-w-[1400px] space-y-16 px-5 pb-16 lg:px-10 lg:pb-24">
      {pillars.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">{x("pillarsTitle")}</h2>
          <ul className={`mt-8 ${anyCardStyle ? "" : "divide-y divide-border border-y border-border"}`}>
            {pillars.map((p, i) => <PillarCard key={p.id} p={p} n={i + 1} style={merge(styles.page, styles.pillars?.[p.id])} />)}
          </ul>
        </div>
      )}
      <IntroCard x={x} style={styles.intro ?? {}} />
    </section>
  );
}
