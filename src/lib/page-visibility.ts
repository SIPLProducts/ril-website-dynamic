import { ABOUT_SECTIONS } from "@/lib/about-sections";
import { ESG_SECTIONS } from "@/lib/esg-sections";
import { IR_SECTIONS } from "@/lib/investor-relations";

/** A website sub-page that staff can publish or unpublish. `paths` are its public URLs. */
export type VisibilityPage = { key: string; module: string; label: string; paths: string[] };

const aboutPath = (slug: string) => (slug === "partners" ? ["/about/partners"] : [`/about/${slug}`]);

export const VISIBILITY_PAGES: VisibilityPage[] = [
  { key: "about/history-milestones", module: "About Ramky", label: "History & Milestones", paths: ["/history-milestones"] },
  ...ABOUT_SECTIONS.map((s) => ({ key: `about/${s.slug}`, module: "About Ramky", label: s.title, paths: aboutPath(s.slug) })),
  { key: "about/subsidiaries", module: "About Ramky", label: "Subsidiaries", paths: ["/about/partners/subsidiaries"] },
  { key: "management/board", module: "Management", label: "Board Of Directors", paths: ["/board-of-directors", "/#board-of-directors"] },
  { key: "management/executive", module: "Management", label: "Executive Leadership", paths: ["/executive-leadership"] },
  { key: "management/senior", module: "Management", label: "Senior Management", paths: ["/senior-management"] },
  { key: "capabilities/projects", module: "Capabilities", label: "Business pages", paths: ["/businesses"] },
  { key: "accolades/awards", module: "Accolades", label: "Awards", paths: ["/accolades"] },
  ...ESG_SECTIONS.map((s) => ({ key: `sustainability/${s.slug}`, module: "Sustainability", label: s.title, paths: [`/esg/${s.slug}`] })),
  { key: "company/media", module: "Company", label: "Media", paths: ["/media"] },
  { key: "careers/landing", module: "Careers", label: "Careers Page", paths: ["/careers"] },
  { key: "careers/life", module: "Careers", label: "Life at Ramky", paths: ["/life-at-ramky"] },
  { key: "careers/positions", module: "Careers", label: "Current Positions", paths: ["/current-positions"] },
  ...IR_SECTIONS.map((s) => {
    const [cat, sub] = s.key.split("/");
    return { key: `ir/${s.key}`, module: "Investors", label: `${s.categoryLabel} – ${s.label}`, paths: [`/investors?cat=${cat}&sub=${sub}`] };
  }),
];

const BY_KEY = new Map(VISIBILITY_PAGES.map((p) => [p.key, p]));
export const visibilityPage = (key: string | undefined) => (key ? BY_KEY.get(key) : undefined);

/** Admin "active" location → visibility key. */
export function visibilityKey(a: { kind: string; module?: string; section?: string }): string | undefined {
  if (a.kind === "about" && a.section) return `about/${a.section}`;
  if (a.kind === "module" && a.module && a.section) return `${a.module}/${a.section}`;
  if (a.kind === "investors" && a.section) return `ir/${a.section}`;
  return undefined;
}

/** True when the given URL (pathname + search) belongs to a hidden sub-page. Missing keys are published. */
export function isUrlHidden(hidden: string[], pathname: string, search: string): boolean {
  const params = new URLSearchParams(search);
  return hidden.some((k) => (BY_KEY.get(k)?.paths ?? []).some((p) => {
    if (p.startsWith("/#")) return false;
    const [path, q] = p.split("?");
    const pathMatch = pathname === path || (!q && pathname.startsWith(`${path}/`));
    if (!pathMatch) return false;
    if (!q) return true;
    return [...new URLSearchParams(q)].every(([n, v]) => params.get(n) === v);
  }));
}

/** CSS that hides every link pointing at a hidden sub-page (menus, footer, in-page tabs). */
export function hiddenLinksCss(hidden: string[]): string {
  const sel = hidden.flatMap((k) => BY_KEY.get(k)?.paths ?? []).flatMap((p) => {
    const e = p.replace(/"/g, "");
    return [`a[href="${e}"]`, `a[href^="${e}&"]`, `a[href^="${e}/"]`];
  });
  return sel.length ? `${sel.join(",")}{display:none!important}` : "";
}
