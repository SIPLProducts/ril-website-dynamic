export interface EsgMetric {
  value: string;
  label: string;
}

export interface EsgAccordion {
  title: string;
  body: string;
}

export interface EsgReport {
  title: string;
  description: string;
  year: string;
  url?: string | null;
}

export interface EsgMetricGroup {
  title: string;
  metrics: EsgMetric[];
}

export interface EsgGovernance {
  highlight: { title: string; value: string; label: string };
  items: string[];
}

export interface EsgSection {
  slug: string;
  title: string;
  eyebrow: string;
  hero: string;
  metricsPeriod?: string;
  metrics: EsgMetric[];
  metricGroups?: EsgMetricGroup[];
  governance?: EsgGovernance;
  accordions: EsgAccordion[];
  reports?: EsgReport[];
  bannerImage?: string | null;
}

export const ESG_SECTIONS: EsgSection[] = [
  {
    slug: "environmental",
    title: "Environmental",
    eyebrow: "Planet First",
    hero: "Infrastructure that respects the planet it is built on — reducing carbon, expanding renewable energy and closing the loop on waste.",
    metricsPeriod: "FY 2025–26 vs FY 2024–25",
    metrics: [
      { value: "22%", label: "Reduction in Energy Consumption" },
      { value: "32%", label: "Reduction in Scope 1 & 2 Emissions" },
      { value: "83%", label: "Reduction in Water Consumption" },
      { value: "98%", label: "of Waste Generated Was Recycled" },
      { value: "100%", label: "Environmental Compliance" },
    ],
    accordions: [
      {
        title: "Carbon Reduction",
        body: "We measure and manage emissions across every project lifecycle — from material sourcing to construction and operations. Energy-efficient equipment, optimized logistics and low-carbon materials have cut our carbon intensity by 40% against our baseline, with a clear roadmap toward deeper reductions.",
      },
      {
        title: "Renewable Energy",
        body: "Our waste-to-energy and solar installations convert environmental liabilities into clean power. India's largest waste-to-energy plant in Delhi, delivered by Ramky, processes municipal waste while feeding renewable electricity into the grid.",
      },
      {
        title: "Waste Management & Circularity",
        body: "From engineered landfills to material recovery and leachate treatment, our approach keeps resources in circulation. We design every water and waste project for maximum recovery, reuse and safe disposal — protecting groundwater, soil and communities.",
      },
      {
        title: "Water Stewardship",
        body: "Water is central to our business and our responsibility. Our treatment plants return hundreds of millions of litres of safe water to the environment every day, and our project designs prioritize recycling and recharge.",
      },
    ],
  },
  {
    slug: "social",
    title: "Social",
    eyebrow: "People & Communities",
    hero: "Progress is only real when people share in it — safe workplaces, inclusive teams and communities that grow alongside our projects.",
    metricsPeriod: "FY 2025–26",
    metrics: [],
    metricGroups: [
      {
        title: "CSR & Social Impact",
        metrics: [
          { value: "45,000+", label: "Lives Impacted" },
          { value: "50+", label: "CSR Activities" },
          { value: "₹58.30 Mn", label: "CSR Spend" },
          { value: "26,095", label: "Health Beneficiaries" },
          { value: "4,686", label: "Students Supported" },
          { value: "2,140", label: "People Skill-Trained" },
        ],
      },
      {
        title: "Workforce & Safety",
        metrics: [
          { value: "1,041", label: "Employees" },
          { value: "100%", label: "Employee Health Insurance Coverage" },
          { value: "100%", label: "Performance Reviews Completed" },
          { value: "0", label: "Workplace Fatalities" },
          { value: "0", label: "POSH Complaints" },
          { value: "87%+", label: "Employees Trained on Health & Safety" },
        ],
      },
      {
        title: "Inclusion & Responsible Business",
        metrics: [
          { value: "100%", label: "Employees Covered by Equal Opportunity Policies" },
          { value: "100%", label: "Medical Coverage for Employees" },
          { value: "13.9%", label: "Procurement from MSMEs" },
          { value: "100%", label: "Operations Assessed for Health & Safety" },
        ],
      },
    ],
    accordions: [
      {
        title: "Diversity & Inclusion",
        body: "We are building a workforce that reflects the communities we serve — expanding opportunities for women in engineering and site leadership, and ensuring fair, merit-based growth at every level of the organization.",
      },
      {
        title: "Community Impact",
        body: "Our CSR programmes focus on education, healthcare, sanitation and skill development in the regions around our projects. We engage local communities early, hire locally where possible, and invest in infrastructure that outlasts construction.",
      },
      {
        title: "Employee Wellness & Safety",
        body: "Safety is a non-negotiable value, not a statistic. Every site operates under rigorous health and safety systems with continuous training, protective equipment and transparent incident reporting — because every person goes home safe, every day.",
      },
      {
        title: "Skills & Livelihoods",
        body: "Through on-the-job training and partnerships with local institutions, we help workers build transferable skills that raise incomes long after a project is complete.",
      },
    ],
  },
  {
    slug: "governance",
    title: "Governance",
    eyebrow: "Ethics & Accountability",
    hero: "Trust is built on how we govern — independent oversight, transparent disclosure and ethics that guide every decision.",
    metricsPeriod: "Current Governance Framework",
    metrics: [],
    governance: {
      highlight: {
        title: "Independent Board Oversight",
        value: "4/7",
        label: "Independent Directors on the Board",
      },
      items: [
        "Risk Management Committee",
        "CSR Committee",
        "Nomination & Remuneration Committee",
        "Stakeholders’ Relationship Committee",
        "Audit Committee",
        "Zero Reported Corruption Cases",
        "Whistle Blower Policy",
      ],
    },
    accordions: [
      {
        title: "Corporate Ethics",
        body: "Our Code of Conduct applies to every employee, director and business partner. It covers anti-bribery and anti-corruption, fair competition, conflicts of interest and respectful workplace conduct — reinforced through mandatory training and leadership accountability.",
      },
      {
        title: "Board Oversight & Leadership Standards",
        body: "A majority-independent Board with dedicated audit, risk and stakeholder committees provides oversight of strategy, compliance and executive performance. Leadership is held to clear standards of integrity, disclosure and succession planning.",
      },
      {
        title: "Data Privacy & Security",
        body: "We protect the data of employees, clients and partners through defined access controls, secure systems and compliance with applicable data protection regulations. Privacy is treated as a governance responsibility, not an IT afterthought.",
      },
      {
        title: "Whistleblower & Grievance Mechanisms",
        body: "Confidential channels allow anyone — employees, vendors or community members — to raise concerns without fear of retaliation. Every report is reviewed independently and tracked to resolution.",
      },
    ],
  },
  {
    slug: "esg-reporting",
    title: "ESG Reporting",
    eyebrow: "Transparency In Action",
    hero: "Formal disclosures, frameworks and reports — download our latest ESG publications and track our performance year over year.",
    metrics: [
      { value: "2026", label: "Latest sustainability report published" },
      { value: "GRI", label: "Reported with reference to global standards" },
      { value: "SASB", label: "Sector-aligned disclosure framework" },
      { value: "BRSR", label: "SEBI-mandated responsibility reporting" },
    ],
    accordions: [
      {
        title: "Our Reporting Approach",
        body: "We report with reference to the Global Reporting Initiative (GRI) Standards and the SASB framework for engineering and construction, alongside SEBI's Business Responsibility and Sustainability Reporting (BRSR) requirements. Our disclosures cover environmental performance, workforce and community impact, and governance practices.",
      },
      {
        title: "Assurance & Data Quality",
        body: "Key ESG data points are compiled under internal controls and reviewed by senior management before publication. We are progressively expanding external assurance across our most material metrics.",
      },
    ],
    reports: [
      {
        title: "Sustainability Report 2026",
        description: "Our flagship annual report covering strategy, performance and targets across environmental, social and governance themes.",
        year: "2026",
      },
      {
        title: "GRI Content Index",
        description: "A topic-by-topic index mapping our disclosures to the GRI Standards for easy reference and comparison.",
        year: "2026",
      },
      {
        title: "SASB Framework Disclosure",
        description: "Sector-specific metrics aligned to the SASB Engineering & Construction Services standard.",
        year: "2026",
      },
      {
        title: "BRSR Report",
        description: "Business Responsibility and Sustainability Report as filed with Indian stock exchanges under SEBI regulations.",
        year: "2025-26",
      },
    ],
  },
];

export function getEsgSection(slug: string) {
  return ESG_SECTIONS.find((section) => section.slug === slug);
}
