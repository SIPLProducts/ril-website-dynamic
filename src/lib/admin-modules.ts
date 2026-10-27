import { Award, Briefcase, Building2, FileText, Film, Landmark, LayoutDashboard, Leaf, Users, UsersRound, Wrench, type LucideIcon } from "lucide-react";
import { IR_SECTIONS } from "@/lib/investor-relations";

/** Website modules shown in the admin sidebar, in public-menu order. Set `ready` when a module becomes editable. */
export type AdminModule = { key: string; label: string; icon: LucideIcon; ready: boolean };

export const ADMIN_MODULES: AdminModule[] = [
  { key: "about", label: "About Us", icon: Building2, ready: true },
  { key: "management", label: "Management", icon: UsersRound, ready: false },
  { key: "capabilities", label: "Capabilities", icon: Wrench, ready: false },
  { key: "accolades", label: "Accolades", icon: Award, ready: false },
  { key: "sustainability", label: "Sustainability", icon: Leaf, ready: false },
  { key: "careers", label: "Careers", icon: Briefcase, ready: false },
  { key: "media", label: "Media", icon: Film, ready: false },
];

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
