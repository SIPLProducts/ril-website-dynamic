import { useEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight, BarChart3, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MetricTrendToggle } from "@/components/esg/MetricTrend";
import { computeChange, formatTrendValue, type MetricTrend } from "@/lib/esg-metric-trends";
import { plainText } from "@/lib/strength-style";

export function SocialKpiCard({ label, value, trend }: { label: string; value: string; trend?: MetricTrend | undefined }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const title = plainText(label);
  const change = trend ? computeChange(trend) : undefined;
  const Indicator = change?.direction === "improved" ? ArrowUpRight : change?.direction === "worsened" ? ArrowDownRight : change?.direction === "unchanged" ? Minus : BarChart3;
  const cancelClose = () => { clearTimeout(closeTimer.current); };
  const scheduleClose = () => { cancelClose(); closeTimer.current = setTimeout(() => setOpen(false), 180); };
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label={`${title} — ${value}`}
          data-social-kpi=""
          onPointerEnter={(event) => { if (event.pointerType === "mouse") { cancelClose(); setOpen(true); } }}
          onPointerLeave={(event) => { if (event.pointerType === "mouse") scheduleClose(); }}
          className="relative flex h-44 w-full min-w-0 flex-col items-start justify-start gap-3 whitespace-normal rounded-sm border-border bg-surface p-3 text-left shadow-none transition-colors hover:border-brand-orange/50 hover:bg-surface focus-visible:ring-brand-orange sm:p-4"
        >
          <span className={`w-full min-w-0 break-words font-display font-bold leading-tight tabular-nums text-brand-green ${value === "Not Disclosed" ? "text-lg" : "text-2xl"}`}>{value}</span>
          <span className="w-full min-w-0 break-words pr-3 text-xs font-medium leading-relaxed text-muted-foreground">{title}</span>
          <Indicator className={`absolute bottom-3 right-3 size-4 ${change?.direction === "improved" ? "text-brand-green" : "text-brand-orange"}`} aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        aria-label={`${title} details`}
        sideOffset={8}
        collisionPadding={12}
        onPointerEnter={cancelClose}
        onPointerLeave={(event) => { if (event.pointerType === "mouse") scheduleClose(); }}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="w-80 max-w-[calc(100vw-24px)] max-h-[min(42rem,80dvh)] overflow-y-auto overscroll-contain border-border bg-popover p-4 motion-reduce:animate-none"
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
          <div className="min-w-0">
            <h3 className="break-words font-display text-sm font-semibold leading-relaxed">{title}</h3>
            <p className="mt-1 break-words text-xl font-bold tabular-nums text-brand-green">{value}</p>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0" aria-label="Close KPI details" onClick={() => setOpen(false)}><X /></Button>
        </div>
        {trend ? <>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            {trend.years.slice(-2).map((point) => <div key={point.year} className="min-w-0">
              <dt className="text-xs text-muted-foreground">{point.year}</dt>
              <dd className="mt-1 break-words text-sm font-semibold tabular-nums">{point.value === null ? "Not Disclosed" : point.approximate ? `${point.value}+` : formatTrendValue(trend, point.value)}</dd>
            </div>)}
          </dl>
          <MetricTrendToggle trend={trend} social compact />
          {trend.summary && <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{trend.summary}</p>}
          {trend.years.map((point) => point.note ? <p key={point.year} className="mt-2 text-xs leading-relaxed text-muted-foreground">{point.year}: {point.note}</p> : null)}
          {trend.source && <p className="mt-3 break-words border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">Source: {trend.source}</p>}
        </> : <p className="mt-4 text-xs text-muted-foreground">Year-on-year comparison: Not Disclosed</p>}
      </PopoverContent>
    </Popover>
  );
}