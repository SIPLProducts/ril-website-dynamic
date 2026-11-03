import { PanelBottom, Award, Newspaper, Briefcase, Building2, FileText, Landmark, LayoutDashboard, Leaf, Users, UsersRound, Wrench, type LucideIcon } from "lucide-react";
import { IR_SECTIONS } from "@/lib/investor-relations";
import { ABOUT_SECTIONS } from "@/lib/about-sections";
import { ESG_SECTIONS } from "@/lib/esg-sections";

/** A website page in the admin menu. It is editable ("ready") when it has a `to` admin path. */
export type AdminPage = { key: string; label: string; to?: string | undefined; children?: AdminPage[] | undefined };
/** A website module, in the same order as the public site header. */
export type AdminModule = { key: string; label: string; icon: LucideIcon; to?: string | undefined; children?: AdminPage[] | undefined };

const ADMIN_PATHS: Record<string, string> = {
  "about/clientele": "/admin/about/clientele",
  "management/board": "/admin/management/board",
  "management/executive": "/admin/management/executive",
  "management/senior": "/admin/management/senior",
  ...Object.fromEntries(ESG_SECTIONS.map((s) => [`esg/${s.slug}`, `/admin/sustainability/${s.slug}`])),
};
const page = (mod: string, key: string, label: string, children?: AdminPage[]): AdminPage => ({ key, label, to: ADMIN_PATHS[`${mod}/${key}`], children });

export const ADMIN_MODULES: AdminModule[] = [
  {
    key: "about", label: "About Ramky", icon: Building2,
    children: [
      page("about", "history-milestones", "History & Milestones"),
      ...ABOUT_SECTIONS.map((s) => page("about", s.slug, s.title, s.slug === "partners" ? [page("about", "subsidiaries", "Subsidiaries")] : undefined)),
    ],
  },
  { key: "management", label: "Management", icon: UsersRound, children: [page("management", "board", "Board Of Directors"), page("management", "executive", "Executive Leadership"), page("management", "senior", "Senior Management")] },
  { key: "capabilities", label: "Capabilities", icon: Wrench },
  { key: "accolades", label: "Accolades", icon: Award, children: [{ key: "awards", label: "Awards", to: "/admin/accolades" }] },
  { key: "sustainability", label: "Sustainability", icon: Leaf, children: [...ESG_SECTIONS.map((s) => page("esg", s.slug, s.title))] },
  { key: "company", label: "Company", icon: Newspaper, children: [{ key: "csr", label: "CSR", to: "/admin/company/csr" }, { key: "media", label: "Media", to: "/admin/company/media" }] },
  { key: "footer", label: "Footer", icon: PanelBottom, children: [{ key: "links", label: "Link Columns", to: "/admin/footer/links" }, { key: "group-companies", label: "Group Companies", to: "/admin/footer/group-companies" }, { key: "contact", label: "Contact & About", to: "/admin/footer/contact" }] },
  { key: "careers", label: "Careers", icon: Briefcase, children: [{ key: "life", label: "Life at Ramky", to: "/admin/careers/life" }, { key: "positions", label: "Current Positions", to: "/admin/careers/positions" }, { key: "applications", label: "Applications", to: "/admin/careers/applications" }] },
];

export const isReady = (n: AdminPage | AdminModule): boolean => !!n.to || (n.children ?? []).some(isReady);

export const CONTACTS_SECTION = "contacts";
export const DASHBOARD_ICON = LayoutDashboard;
export const INVESTORS_ICON = Landmark;
export const USERS_ICON = Users;
export const DOC_ICON = FileText;

/** Investors sub-menu grouped like the website's Investors dropdown. */
export function investorGroups() {
  const m = new Map<string, { key: string; label: string }[]>();
  for (const s of IR_SECTIONS) m.set(s.categoryLabel, [...(m.get(s.categoryLabel) ?? []), { key: s.key, label: s.label }]);
  const groups = [...m.entries()].map(([label, items]) => ({ label, items }));
  const sh = groups.find((g) => g.label === "Shareholders Information");
  (sh ?? groups[groups.length - 1]!).items.push({ key: CONTACTS_SECTION, label: "Investor Contacts" });
  return groups;
}
