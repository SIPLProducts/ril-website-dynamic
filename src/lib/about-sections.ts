export const ABOUT_SECTIONS = [
  {
    slug: "partners",
    title: "Partners",
    eyebrow: "Working Together",
    description: "Collaboration that strengthens delivery and creates enduring value.",
    statement:
      "Ramky Infrastructure works through purposeful partnerships built around shared standards, dependable execution and long-term outcomes.",
  },
  {
    slug: "management-systems",
    title: "Management Systems",
    eyebrow: "Built For Consistency",
    description: "Structured systems that support quality, accountability and continual improvement.",
    statement:
      "Our management approach brings clear processes, responsible oversight and disciplined delivery together across every stage of infrastructure development.",
  },
  {
    slug: "strength-strategies",
    title: "Strength & Strategies",
    eyebrow: "How We Move Forward",
    description: "Experience, capability and focused strategy aligned for sustainable growth.",
    statement:
      "Ramky Infrastructure combines sector experience with an integrated approach to planning, execution and long-term value creation.",
  },
  {
    slug: "clientele",
    title: "Clientele",
    eyebrow: "Relationships That Endure",
    description: "Trusted relationships shaped by commitment, performance and shared purpose.",
    statement:
      "Every client relationship is approached with the same focus: understand the objective, deliver responsibly and build confidence through performance.",
  },
  {
    slug: "geographic-presence",
    title: "Geographic Presence",
    eyebrow: "Where We Operate",
    description: "Infrastructure capabilities extending across India and overseas.",
    statement:
      "Our presence reflects decades of experience adapting infrastructure expertise to varied regions, environments and project requirements.",
  },
] as const;

export type AboutSection = (typeof ABOUT_SECTIONS)[number];

export function getAboutSection(slug: string) {
  return ABOUT_SECTIONS.find((section) => section.slug === slug);
}