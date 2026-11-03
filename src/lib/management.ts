// Management module: groups and profile sections are code-controlled; people live in the database.

export type MgmtGroup = "board" | "executive" | "senior";

export type MgmtSection = { key: string; heading: string };

export const MGMT_GROUPS: { key: MgmtGroup; label: string; hasProfile: boolean; sections: MgmtSection[] }[] = [
  {
    key: "board", label: "Board Of Directors", hasProfile: true,
    sections: [
      { key: "biography", heading: "Professional Profile" },
      { key: "education", heading: "Education & Qualifications" },
      { key: "professionalExperience", heading: "Professional Experience" },
      { key: "expertise", heading: "Areas of Expertise" },
      { key: "awards", heading: "Awards & Recognition" },
      { key: "otherInformation", heading: "Professional Contributions" },
    ],
  },
  {
    key: "executive", label: "Executive Leadership", hasProfile: true,
    sections: [
      { key: "biography", heading: "Professional Profile" },
      { key: "qualifications", heading: "Qualifications" },
      { key: "professionalExperience", heading: "Professional Experience" },
      { key: "expertise", heading: "Areas of Expertise" },
      { key: "awards", heading: "Awards & Recognition" },
      { key: "otherInformation", heading: "At Ramky" },
    ],
  },
  { key: "senior", label: "Senior Management", hasProfile: false, sections: [] },
];

export const getMgmtGroup = (key: string) => MGMT_GROUPS.find((g) => g.key === key);

export type MgmtPerson = {
  id: string;
  group: MgmtGroup;
  slug: string;
  name: string;
  designation: string;
  image: string | null;
  sections: Record<string, string[]>;
};

/** URL-friendly slug from a person's name, dropping honorifics. */
export function slugifyName(name: string): string {
  return name
    .replace(/^(dr|mr|ms|mrs)\.?\s+/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Split textarea text into paragraphs (blank-line separated). */
export const toParagraphs = (text: string) => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
export const fromParagraphs = (paras: string[] | undefined) => (paras ?? []).join("\n\n");
