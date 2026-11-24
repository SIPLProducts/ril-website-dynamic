import { useEffect, useRef, type ReactNode } from "react";

/** One-line card rail: scrolls sideways and auto-advances one card every 3s when cards overflow; pauses on hover, focus or touch. */
export function AutoScrollRail({ children, className = "" }: { children: ReactNode; className?: string }) {
  const rail = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  useEffect(() => {
    const el = rail.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => {
      if (paused.current || el.scrollWidth <= el.clientWidth + 4) return;
      const card = el.firstElementChild as HTMLElement | null;
      const step = (card?.offsetWidth ?? 240) + 20;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: step, behavior: "smooth" });
    }, 3000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div
      ref={rail}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onFocus={() => (paused.current = true)}
      onBlur={() => (paused.current = false)}
      onTouchStart={() => (paused.current = true)}
      onTouchEnd={() => window.setTimeout(() => (paused.current = false), 4000)}
      className={`flex gap-5 snap-x snap-mandatory overflow-x-auto pb-3 [&>*]:shrink-0 [&>*]:snap-start [&>*]:basis-[85%] sm:[&>*]:basis-[calc(50%-10px)] lg:[&>*]:basis-[calc(25%-15px)] ${className}`}
    >
      {children}
    </div>
  );
}
