import { useMemo } from "react";
import { publishedSorted, type Organisation } from "@/lib/organisations";

export function OrgList({ items }: { items: Organisation[] }) {
  const sorted = useMemo(() => publishedSorted(items), [items]);

  return (
    <div>
      <ul className="grid grid-cols-1 border-t border-border sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3">
        {sorted.map((o) => (
          <li key={o.id} className="flex gap-3 break-words border-b border-border py-4 font-display text-[0.95rem] font-medium leading-snug text-foreground">
            <span className="mt-2 size-1.5 shrink-0 bg-brand-orange" aria-hidden="true" />
            <span className="min-w-0">{o.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
