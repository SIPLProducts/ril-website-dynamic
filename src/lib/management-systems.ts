import iso9001 from "@/assets/iso-9001-certificate.pdf.asset.json";
import iso45001 from "@/assets/iso-45001-certificate.pdf.asset.json";
import iso14001 from "@/assets/iso-14001-certificate.pdf.asset.json";
import policies from "@/assets/quality-hse-policies.pdf.asset.json";

// Content and document references kept as data so a future admin panel can replace them.
export type ManagedDocument = { title: string; url: string; page?: number };

export type Certification = {
  id: string;
  standard: string;
  title: string;
  icon: "quality" | "safety" | "environment";
  summary: string;
  focusAreas: string[];
  document: ManagedDocument;
};

export type Policy = {
  id: string;
  title: string;
  summary: string;
  cta: string;
  document: ManagedDocument;
};

const SECTOR_TAGS = [
  "Engineering",
  "Procurement",
  "Construction",
  "Operations & Maintenance",
  "Buildings",
  "Industrial",
  "Water & Waste Water",
  "Roads & Bridges",
];

export const CERTIFICATIONS: Certification[] = [
  {
    id: "iso-9001",
    standard: "ISO 9001:2015",
    title: "Quality Management System",
    icon: "quality",
    summary:
      "A comprehensive quality management framework supporting the design, development, engineering, procurement, construction, operations and maintenance of projects across Buildings, Industrial, Water & Waste Water, Roads and Infrastructure, together with power-sector sub-stations and distribution-line projects.",
    focusAreas: [
      "Design & Development",
      "Engineering",
      "Procurement",
      "Construction",
      "Operations & Maintenance",
      "Power Sub-Stations",
      "Distribution Lines",
    ],
    document: { title: "ISO 9001:2015 Certificate", url: iso9001.url },
  },
  {
    id: "iso-45001",
    standard: "ISO 45001:2018",
    title: "Occupational Health & Safety Management System",
    icon: "safety",
    summary:
      "A structured health and safety management framework supporting engineering, procurement, construction, operations and maintenance of infrastructure development projects across Buildings, Industrial, Water & Waste Water, Roads and Bridges.",
    focusAreas: SECTOR_TAGS,
    document: { title: "ISO 45001:2018 Certificate", url: iso45001.url },
  },
  {
    id: "iso-14001",
    standard: "ISO 14001:2015",
    title: "Environmental Management System",
    icon: "environment",
    summary:
      "An environmental management framework integrated into the engineering, procurement, construction, operations and maintenance of infrastructure development projects across Buildings, Industrial, Water & Waste Water, Roads and Bridges.",
    focusAreas: SECTOR_TAGS,
    document: { title: "ISO 14001:2015 Certificate", url: iso14001.url },
  },
];

export const POLICIES: Policy[] = [
  {
    id: "quality-policy",
    title: "Quality Policy",
    summary:
      "Our Quality Policy establishes a consistent approach to delivering reliable, compliant and high-quality engineering and infrastructure solutions, with a focus on customer requirements, continual improvement and disciplined project execution.",
    cta: "View Quality Policy",
    document: { title: "Quality Policy", url: policies.url, page: 1 },
  },
  {
    id: "hse-policy",
    title: "HSE Policy",
    summary:
      "Our HSE Policy reflects our commitment to protecting people, maintaining safe workplaces and minimising environmental impact through responsible practices across project execution and operations.",
    cta: "View HSE Policy",
    document: { title: "HSE Policy", url: policies.url, page: 2 },
  },
];
