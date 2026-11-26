import type { ReactNode } from "react";

/** Card grid: up to 4 cards per row on desktop; extra cards wrap onto new rows (no auto-scrolling). */
export function AutoScrollRail({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>{children}</div>;
}
