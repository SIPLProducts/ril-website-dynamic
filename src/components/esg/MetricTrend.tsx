import { TREND_YEARS, computeChange, formatTrendValue, type MetricTrend } from "@/lib/esg-metric-trends";

const DIR_STYLE = {
  improved: "text-emerald-700 bg-emerald-700/10",
  worsened: "text-destructive bg-destructive/10",
  unchanged: "text-muted-foreground bg-muted",
  changed: "text-foreground bg-muted",
  unavailable: "text-muted-foreground bg-muted",
} as const;

export function MetricTrendToggle({ trend }: { trend: MetricTrend }) {
  const change = computeChange(trend);
  const values = TREND_YEARS.map((y) => trend.years[y].value).filter((v): v is number => v !== null);
  const max = trend.percent ? 100 : Math.max(...values, 0) || 1;
  const barColor = change.direction === "worsened" ? "bg-destructive/80" : change.direction === "improved" ? "bg-emerald-600" : "bg-muted-foreground/60";

  return (
    <div className="mt-4 border-t border-border pt-3">
      <p className="font-display text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">Trend</p>
      {(
        <div data-testid="metric-trend" className="mt-4">
          <div role="img" aria-label={`${trend.label} by financial year`} className="flex h-44 items-end gap-3 border-b border-l border-border pl-2">
            {TREND_YEARS.map((y, i) => {
              const p = trend.years[y];
              const last = i === TREND_YEARS.length - 1;
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
                  <div className={`rounded-t-sm ${last ? barColor : "bg-muted-foreground/40"}`} style={{ height: `${h * 0.78}%`, minHeight: p.value === 0 ? 2 : undefined }} />
                </div>
              );
            })}
          </div>
          <div className="mt-1 flex gap-3 pl-2">
            {TREND_YEARS.map((y) => (
              <p key={y} className="flex-1 text-center text-[10px] font-semibold text-muted-foreground">{y}</p>
            ))}
          </div>
          <p className={`mt-3 inline-block rounded-sm px-2 py-1 text-xs font-semibold ${DIR_STYLE[change.direction]}`}>
            {change.text}
            {change.direction === "improved" && " · Positive"}
            {change.direction === "worsened" && " · Needs attention"}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{trend.summary}</p>
          <p className="mt-1 text-[10px] text-muted-foreground/80">Source: {trend.source}</p>
        </div>
      )}
    </div>
  );
}
