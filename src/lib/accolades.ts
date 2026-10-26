import bronzeOrbitAsset from "@/assets/Bronze_Award_-_EHS_Excellence_-Orbit.png.asset.json";
import cidcAsset from "@/assets/CIDC_2025.png.asset.json";
import iinaAsset from "@/assets/IINA_Awards_2026.png.asset.json";
import safetyOrbitAsset from "@/assets/International_Safety_Award_-Orbit.png.asset.json";
import safetyOrionAsset from "@/assets/International_Safety_Award_-Orion.png.asset.json";

// Accolades — data-driven, admin-panel ready.
export type Award = {
  id: string;
  year: number;
  awardTitle: string;
  awardCategory?: string;
  awardingOrganisation: string;
  projectOrInitiative?: string;
  description?: string;
  image: string | null;
  imageAltText?: string;
  displayOrder: number;
  status: "published" | "draft";
  featured?: boolean;
  /** Manual override: always list this award under Past Awards. */
  alwaysPast?: boolean;
};

/** Section-level settings, admin-panel ready. */
export type AccoladesSettings = {
  rowTitle: string;
  pastLabel: string;
  yearRowCount: number;
  /** null = current calendar year */
  defaultExpandedYear: number | null;
};

export const ACCOLADES_SETTINGS: AccoladesSettings = {
  rowTitle: "AWARDS",
  pastLabel: "PAST AWARDS",
  yearRowCount: 3,
  defaultExpandedYear: null,
};

export const AWARDS: Award[] = [
  {
    id: "2026-excellence-wastewater-management",
    year: 2026,
    awardTitle: "Excellence in Wastewater Management",
    awardingOrganisation: "Economic Times – Infra Leadership Awards",
    projectOrInitiative: "Legacy Leachate Treatment Facility, Jawahar Nagar",
    description: "Recognised for excellence in wastewater management through the legacy leachate treatment facility.",
    image: null,
    displayOrder: 1,
    status: "published",
  },
  {
    id: "2026-construction-health-safety-environment",
    year: 2026,
    awardTitle: "Construction Health, Safety & Environment",
    awardingOrganisation: "CIDC Vishwakarma Awards",
    projectOrInitiative: "Ramky One GenNext Tower & GenNext Square",
    description: "Recognised for construction health, safety and environmental practices.",
    image: cidcAsset.url,
    displayOrder: 2,
    status: "published",
  },
  {
    id: "2026-gold-best-practices-hse",
    year: 2026,
    awardTitle: "Gold – Best Practices in HSE",
    awardingOrganisation: "IINA Awards",
    projectOrInitiative: "Ramky One Symphony",
    description: "Recognised with Gold for best practices in Health, Safety and Environment.",
    image: iinaAsset.url,
    displayOrder: 3,
    status: "published",
  },
  {
    id: "2026-certificate-merit-occupational-safety-health",
    year: 2026,
    awardTitle: "Certificate of Merit – Occupational Safety & Health",
    awardingOrganisation: "NSCI Safety Awards",
    projectOrInitiative: "Ramky Fortuna",
    description: "Recognised for achievement in occupational safety and health practices.",
    image: null,
    displayOrder: 4,
    status: "published",
  },
  {
    id: "2025-international-safety-ramky-one-orion",
    year: 2025,
    awardTitle: "International Safety Award",
    awardingOrganisation: "British Safety Council – International Safety Awards 2025",
    projectOrInitiative: "Ramky One Orion",
    description: "Recognised for adherence to international best practices in occupational health and safety management.",
    image: safetyOrionAsset.url,
    displayOrder: 1,
    status: "published",
  },
  {
    id: "2025-international-safety-ramky-one-orbit",
    year: 2025,
    awardTitle: "International Safety Award",
    awardingOrganisation: "British Safety Council – International Safety Awards 2025",
    projectOrInitiative: "Ramky One Orbit",
    description: "Recognised for strong occupational health and safety practices aligned with international standards.",
    image: safetyOrbitAsset.url,
    displayOrder: 2,
    status: "published",
  },
  {
    id: "2025-bronze-ehs-excellence",
    year: 2025,
    awardTitle: "Bronze Award – EHS Excellence",
    awardingOrganisation: "CII Southern Region EHS Excellence Awards 2024",
    projectOrInitiative: "Ramky One Orbit",
    description: "Recognised for performance and initiatives in Environmental, Health & Safety management.",
    image: bronzeOrbitAsset.url,
    displayOrder: 3,
    status: "published",
  },
  {
    id: "2025-performance-excellence",
    year: 2025,
    awardTitle: "Performance Excellence Award 2024–25",
    awardingOrganisation: "Indian Institution of Industrial Engineering (IIIE)",
    projectOrInitiative: "Ramky Infrastructure Limited",
    description: "Recognised for its contribution towards the progress of the nation and organisational performance excellence.",
    image: null,
    displayOrder: 4,
    status: "published",
  },
  {
    id: "2025-finance-transformation",
    year: 2025,
    awardTitle: "Best Finance Transformation Initiative of the Year",
    awardingOrganisation: "5th NXTGEN CFO Awards",
    projectOrInitiative: "Ramky Infrastructure Limited",
    description: "Recognised for its finance transformation initiative and strengthening of financial processes and capabilities.",
    image: null,
    displayOrder: 5,
    status: "published",
  },
  {
    id: "2025-certificate-appreciation-construction",
    year: 2025,
    awardTitle: "Certificate of Appreciation – Construction Sector, Group A",
    awardingOrganisation: "National Safety Council of India – NSCI Safety Awards 2024",
    projectOrInitiative: "Ramky One Odyssey, Ramky One Symphony, Ramky Genext & WTE Deonar",
    description: "Recognised for exceptional safety practices implemented across four flagship projects.",
    image: null,
    displayOrder: 6,
    status: "published",
  },
  {
    id: "2024-most-admired-water-infrastructure",
    year: 2024,
    awardTitle: "Most Admired Emerging Company in Water Infrastructure",
    awardingOrganisation: "ET NOW Infra Focus Awards – 9th Edition",
    projectOrInitiative: "Treatment & Disposal of Legacy Leachate",
    description: "Recognised for its innovative treatment and disposal of legacy leachate until restoration and stabilisation of adjoining ponds.",
    image: null,
    displayOrder: 1,
    status: "published",
  },
  {
    id: "2024-sustainable-cities",
    year: 2024,
    awardTitle: "Sustainable Cities",
    awardingOrganisation: "FICCI Smart Urban Innovation Awards – 5th Edition",
    projectOrInitiative: "Legacy Leachate Treatment Project",
    description: "Recognised for an innovative sustainable urban solution for treatment and disposal of legacy leachate.",
    image: null,
    displayOrder: 2,
    status: "published",
  },
  {
    id: "2024-third-fastest-growing-construction-company",
    year: 2024,
    awardTitle: "3rd Fastest Growing Construction Company – Medium Category",
    awardingOrganisation: "Construction World Global Awards – FCC PERGRO 2024",
    projectOrInitiative: "Ramky Infrastructure Limited",
    description: "Recognised among the fastest-growing construction companies in the medium category.",
    image: null,
    displayOrder: 3,
    status: "published",
  },
  {
    id: "2024-best-professionally-managed-company",
    year: 2024,
    awardTitle: "Achievement Award – Best Professionally Managed Company",
    awardingOrganisation: "CIDC Vishwakarma Awards – 15th Edition",
    projectOrInitiative: "Ramky Infrastructure Limited",
    description: "Recognised for professional management practices and organisational excellence in the construction domain.",
    image: null,
    displayOrder: 4,
    status: "published",
  },
  {
    id: "2024-best-construction-project",
    year: 2024,
    awardTitle: "Achievement Award – Best Construction Project",
    awardingOrganisation: "CIDC Vishwakarma Awards – 15th Edition",
    projectOrInitiative: "Legacy Leachate Treatment Plant, Jawahar Nagar",
    description: "Recognised for treatment and disposal of legacy leachate and restoration and stabilisation of adjoining ponds.",
    image: null,
    displayOrder: 5,
    status: "published",
  },
  {
    id: "2024-construction-health-safety-environment",
    year: 2024,
    awardTitle: "Achievement Award – Construction Health, Safety & Environment",
    awardingOrganisation: "CIDC Vishwakarma Awards – 15th Edition",
    projectOrInitiative: "Ramky One Odyssey",
    description: "Recognised for strong construction health, safety and environmental implementation.",
    image: null,
    displayOrder: 6,
    status: "published",
  },
  {
    id: "2024-social-development-impact",
    year: 2024,
    awardTitle: "Achievement Award – Creating Social Development & Impact",
    awardingOrganisation: "CIDC Vishwakarma Awards – 15th Edition",
    projectOrInitiative: "CSR Activities – Striving for Sustainable Development",
    description: "Recognised for CSR initiatives contributing to social development and sustainable community impact.",
    image: null,
    displayOrder: 7,
    status: "published",
  },
];

/** Calendar-year rows (current year + previous N-1) followed by older/flagged awards as Past Awards. */
export function groupAwards(settings: AccoladesSettings = ACCOLADES_SETTINGS, now: Date = new Date()) {
  const currentYear = now.getFullYear();
  const oldestRowYear = currentYear - Math.max(1, settings.yearRowCount) + 1;
  const sort = (list: Award[]) =>
    [...list].sort(
      (a, b) => b.year - a.year || Number(!!b.featured) - Number(!!a.featured) || a.displayOrder - b.displayOrder,
    );
  const published = AWARDS.filter((a) => a.status === "published");
  const isPast = (a: Award) => a.alwaysPast || a.year < oldestRowYear;
  const years = [...new Set(published.filter((a) => !isPast(a) && a.year <= currentYear).map((a) => a.year))].sort((a, b) => b - a);
  return {
    currentYear,
    expandedYear: settings.defaultExpandedYear ?? currentYear,
    rows: years.map((y) => ({ year: y, awards: sort(published.filter((a) => a.year === y && !isPast(a))) })),
    past: sort(published.filter(isPast)),
  };
}
