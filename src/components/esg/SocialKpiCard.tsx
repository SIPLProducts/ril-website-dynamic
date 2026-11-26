import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MetricTrendToggle } from "@/components/esg/MetricTrend";
import type { MetricTrend } from "@/lib/esg-metric-trends";
import { plainText } from "@/lib/strength-style";

export function SocialKpiCard({ label, value, trend, details = [] }: { label: string; value: string; trend?: MetricTrend | undefined; details?: { label: string; value: string }[] }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cancel = () => clearTimeout(timer.current);
  const close = () => { cancel(); timer.current = setTimeout(() => setOpen(false), 180); };
  useEffect(() => () => clearTimeout(timer.current), []);
  const title = plainText(label);
  const head = <>
    <p className={`font-display font-bold tabular-nums text-brand-green ${value === "Not Disclosed" ? "text-xl" : "text-4xl lg:text-5xl"}`}>{value}</p>
    <p className="mt-3 min-h-10 text-sm font-medium leading-relaxed text-muted-foreground">{title}</p>
  </>;
  return (
    <div data-social-kpi="" className="flex min-w-0 flex-col overflow-hidden rounded-sm border border-border bg-surface p-6 transition-shadow hover:shadow-lg">
      {details.length > 0 ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button type="button" aria-label={`${title} — ${value}. Show breakdown`}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") { cancel(); setOpen(true); } }}
              onPointerLeave={(e) => { if (e.pointerType === "mouse") close(); }}
              className="relative w-full rounded-sm text-left focus-visible:outline-2 focus-visible:outline-brand-orange">
              {head}
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand-orange"><Info className="size-3.5" aria-hidden="true" /> View breakdown</span>
            </button>
          </PopoverTrigger>
          <PopoverContent sideOffset={8} collisionPadding={12} onPointerEnter={cancel} onPointerLeave={(e) => { if (e.pointerType === "mouse") close(); }} onOpenAutoFocus={(e) => e.preventDefault()} className="w-80 max-w-[calc(100vw-24px)] border-border bg-popover p-4">
            <h3 className="font-display text-sm font-semibold">{title} — breakdown</h3>
            <dl className="mt-3 divide-y divide-border">
              {details.map((d) => <div key={d.label} className="flex items-baseline justify-between gap-3 py-2">
                <dt className="text-sm text-muted-foreground">{plainText(d.label)}</dt>
                <dd className="font-display text-lg font-bold tabular-nums text-brand-green">{d.value}</dd>
              </div>)}
            </dl>
          </PopoverContent>
        </Popover>
      ) : head}
      {trend ? <MetricTrendToggle trend={trend} social /> : <p className="mt-5 border-t border-border pt-5 text-xs text-muted-foreground">Year-on-year comparison: Not Disclosed</p>}
    </div>
  );
}
