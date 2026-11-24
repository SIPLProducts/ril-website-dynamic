import { computeChange, formatTrendValue, trendSign, type MetricTrend } from "@/lib/esg-metric-trends";

const DIR_STYLE = {
  improved: "text-emerald-700 bg-emerald-700/10",
  worsened: "text-destructive bg-destructive/10",
  unchanged: "text-muted-foreground bg-muted",
  changed: "text-foreground bg-muted",
  unavailable: "text-muted-foreground bg-muted",
} as const;

export function MetricTrendToggle({ trend, environmental = false }: { trend: MetricTrend; environmental?: boolean }) {
  const chartType = environmental ? "bar" : trend.chartType ?? "bar";
  const change = computeChange(trend);
  const sign = trendSign(trend);
  const changeStyle = environmental
    ? sign === "negative" ? "text-destructive bg-destructive/10" : sign === "positive" ? "text-brand-green bg-brand-green/10" : "text-muted-foreground bg-muted"
    : DIR_STYLE[change.direction];
  const values = trend.years.map((p) => p.value).filter((v): v is number => v !== null);
  const max = trend.percent ? 100 : Math.max(...values, 0) || 1;
  const barColor = change.direction === "worsened" ? "bg-destructive/80" : change.direction === "improved" ? "bg-emerald-600" : "bg-muted-foreground/60";

  return (
    <div className="mt-4 border-t border-border pt-3">
      <div className="flex min-h-8 items-center justify-between gap-2">
        <p className={`min-w-0 font-display text-xs font-bold uppercase tracking-[0.12em] ${environmental ? "text-brand-orange" : "text-brand-green"}`}>{trend.title?.trim() || "Trend"}</p>
      </div>
      {(
        <div data-testid="metric-trend" className="mt-4">
          {chartType === "line" ? <LineChart trend={trend} max={max} color={change.direction === "worsened" ? "var(--destructive)" : change.direction === "improved" ? "var(--brand-green)" : "currentColor"} /> : <div role="img" aria-label={`${trend.label} by financial year${environmental ? ", bars with overlaid trend line" : ""}`} className="relative h-44 border-b border-l border-border pl-2">
            <div className="relative flex h-full items-end gap-3">
            {environmental && <BarTrendOverlay trend={trend} max={max} />}
            {trend.years.map((p, i) => {
              const y = p.year;
              const last = i === trend.years.length - 1;
              if (p.value === null) {
                return (
                  <div key={y} className="flex h-full flex-1 flex-col justify-end">
                    <div className="flex h-24 items-center justify-center rounded-t-sm border border-dashed border-muted-foreground/50 px-1 text-center text-[10px] font-semibold uppercase leading-tight text-muted-foreground">
                      {p.note ?? "Not available"}
                    </div>
                  </div>
                );
              }
              const h = Math.max((p.value / max) * 100, p.value === 0 ? 0 : 3);
              return (
                <div key={y} className="flex h-full flex-1 flex-col justify-end">
                  <p className="mb-1 text-center text-[11px] font-bold leading-tight text-foreground">
                    {p.approximate ? `${p.value}+` : formatTrendValue(trend, p.value)}
                  </p>
                  <div className={`rounded-t-sm ${environmental ? last ? "border border-brand-orange bg-brand-orange" : "border border-brand-orange bg-background" : last ? barColor : "bg-muted-foreground/40"}`} style={{ height: `${h * 0.78}%`, minHeight: p.value === 0 ? 2 : undefined }} />
                </div>
              );
            })}
            </div>
          </div>}
          <div className="mt-1 flex gap-3 pl-2">
            {trend.years.map(({ year: y }) => (
              <p key={y} className="flex-1 text-center text-[10px] font-semibold text-muted-foreground">{y}</p>
            ))}
          </div>
          <p className={`mt-3 inline-block rounded-sm px-2 py-1 text-xs font-semibold ${changeStyle}`}>
            {change.text}
            {!environmental && change.direction === "improved" && " · Positive"}
            {!environmental && change.direction === "worsened" && " · Needs attention"}
          </p>
          {!environmental && <>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{trend.summary}</p>
            <p className="mt-1 text-[10px] text-muted-foreground/80">Source: {trend.source}</p>
          </>}
        </div>
      )}
    </div>
  );
}

/** Connect bar tops on the same plot; undisclosed years never become zero or get bridged. */
function BarTrendOverlay({ trend, max }: { trend: MetricTrend; max: number }) {
  const n = trend.years.length;
  if (!n) return null;
  const top = (value: number) => 100 - Math.max((value / max) * 100, value === 0 ? 0 : 3) * 0.78;
  const center = (i: number) => `calc(${((i + 0.5) / n) * 100}% + ${((i + 0.5) / n - 0.5) * 12}px)`;
  return <svg data-testid="metric-trend-overlay" className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible text-brand-green" aria-hidden="true">
    {trend.years.map((point, i) => {
      if (point.value === null) return null;
      const next = trend.years[i + 1];
      return <g key={point.year}>
        {next && next.value !== null && <line x1={center(i)} y1={`${top(point.value)}%`} x2={center(i + 1)} y2={`${top(next.value)}%`} stroke="currentColor" strokeWidth={2.5} />}
        <circle cx={center(i)} cy={`${top(point.value)}%`} r={4} className="fill-background" stroke="currentColor" strokeWidth={2} />
      </g>;
    })}
  </svg>;
}

/** Line variant: same labels and "not disclosed" handling as the bars; missing years break the line. */
function LineChart({ trend, max, color }: { trend: MetricTrend; max: number; color: string }) {
  const n = trend.years.length;
  const xs = (i: number) => ((i + 0.5) / n) * 100;
  const ys = (v: number) => 100 - Math.max(0, Math.min(1, v / max)) * 78 - 8;
  const segs: string[][] = [];
  let cur: string[] = [];
  trend.years.forEach((p, i) => {
    if (p.value === null) { if (cur.length) segs.push(cur); cur = []; }
    else cur.push(`${xs(i)},${ys(p.value)}`);
  });
  if (cur.length) segs.push(cur);
  return (
    <div data-testid="metric-trend-line" role="img" aria-label={`${trend.label} by financial year`} className="relative h-44 border-b border-l border-border text-muted-foreground">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {segs.map((sg, i) => <polyline key={i} points={sg.join(" ")} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />)}
      </svg>
      {trend.years.map((p, i) => p.value === null ? (
        <span key={p.year} className="absolute bottom-2 -translate-x-1/2 rounded-sm border border-dashed border-muted-foreground/50 px-1 text-center text-[10px] font-semibold uppercase leading-tight" style={{ left: `${xs(i)}%` }}>{p.note ?? "Not available"}</span>
      ) : (
        <span key={p.year} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${xs(i)}%`, top: `${ys(p.value)}%` }}>
          <span className="block size-2.5 rounded-full border-2 bg-background" style={{ borderColor: color }} />
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-bold text-foreground">{p.approximate ? `${p.value}+` : formatTrendValue(trend, p.value)}</span>
        </span>
      ))}
    </div>
  );
}
