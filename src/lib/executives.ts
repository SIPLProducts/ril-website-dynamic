import sunilNairImage from "@/assets/sunil-s-nair.jpg.asset.json";
import sravanthRayapudiImage from "@/assets/sravanth-rayapudi.jpg.asset.json";

// Executive Leadership (CEO / CFO) — data-driven so an admin panel can manage it later.
export type Executive = {
  id: string;
  slug: string;
  name: string;
  designation: string;
  image: string | null;
  displayOrder: number;
  status: "published" | "draft";
  biography: string[];
  qualifications: string[];
  professionalExperience: string[];
  expertise: string[];
  awards: string[];
  otherInformation: string[];
};

export const EXECUTIVE_SECTIONS = [
  { key: "biography", heading: "Professional Profile" },
  { key: "qualifications", heading: "Qualifications" },
  { key: "professionalExperience", heading: "Professional Experience" },
  { key: "expertise", heading: "Areas of Expertise" },
  { key: "awards", heading: "Awards & Recognition" },
  { key: "otherInformation", heading: "At Ramky" },
] as const;

export const EXECUTIVES: Executive[] = [
  {
    id: "ceo",
    slug: "sunil-s-nair",
    name: "Mr. Sunil S Nair",
    designation: "Chief Executive Officer",
    image: sunilNairImage.url,
    displayOrder: 1,
    status: "published",
    biography: [
      "Mr. Sunil S Nair, Chief Executive Officer, is a Chemical Engineering Graduated from Calicut University also holds a CFA certification and has completed the Advanced Management Program at INSEAD. He brings with him strong technical expertise, strategic leadership, and strong commercial acumen.",
    ],
    qualifications: [],
    professionalExperience: [
      "Mr. Sunil Nair brings with him a wealth of leadership experience, having served as Chief Executive Officer (CEO) and Managing Director (MD) across several organizations including Utico FZC, Litwin PEL, CAE, and Galfar Engineering. At Utico FZC, he led the growth of the water business from a modest local portfolio to a fully integrated developer with in-house EPC capabilities. He oversees a $200 million P&L, manages multi million in assets, and executes large-scale projects ranging from $25 million to $400 million, including BOO, EPC, and O&M contracts.",
      "Previously, as CEO for UAE, Oman, and Africa regions, Mr. Sunil Nair has successfully turned around the company from near bankruptcy, growing revenue from $10 million to $250 million while maintaining healthy profit margins. He has also led strategic acquisitions, organizational restructuring, and business development initiatives across multiple geographies.",
    ],
    expertise: [],
    awards: [],
    otherInformation: [],
  },
  {
    id: "cfo",
    slug: "sravanth-rayapudi",
    name: "Mr. Sravanth Rayapudi",
    designation: "Chief Financial Officer",
    image: sravanthRayapudiImage.url,
    displayOrder: 2,
    status: "published",
    biography: [
      "Sravanth Rayapudi is a qualified Chartered Accountant and finance strategist with over 15 years of diversified experience spanning Healthcare, Real Estate, Infrastructure, Investment Advisory, Transaction Advisory, and Corporate Finance.",
    ],
    qualifications: [],
    professionalExperience: [
      "Prior to RAMKY, Sravanth spent over eight years as Head of Finance at GAR Infobahn (GAR Corporation Ltd), a Hyderabad-based commercial real estate operator with a 10-million-square-foot portfolio, where he drove financial transformation, scaled operations, and led large-scale fundraising initiatives. Earlier in his career, he spent seven years as Lead Finance for the Infrastructure vertical at Incor Infrastructure Pvt Ltd, a commercial and residential real estate developer, reporting directly to the Chairman and Managing Director — following an initial engagement with Omni Hospitals on the due diligence for a ₹65 crore private placement supporting its expansion.",
    ],
    expertise: [
      "Across his career, Sravanth has built deep expertise in fund raising and investor relations, mergers and acquisitions, due diligence and transaction structuring, financial modeling and valuation, risk management, and corporate governance. He has led the raising, consolidation, and refinancing of debt exceeding ₹2,500 crore, bringing borrowing costs down from as high as ~16% to single digits, and has evaluated and executed acquisition and investment opportunities worth several thousand crores.",
      "A resilient crisis leader, he steered organizations with disciplined liquidity planning and cash flow management, helping his teams outperform industry benchmarks on financial sustainability. He is equally recognized for building best-in-class MIS, budgeting, and internal control frameworks.",
    ],
    awards: [
      "Sravanth’s contributions have been recognized with the “CFO of the Year 2026– Infrastructure” award at the Great India Forum, and he is frequently invited as a thought leader and panel speaker at industry conclaves.",
    ],
    otherInformation: [
      "At RAMKY, he continues to spearhead strategic acquisitions, equity fundraising, and governance initiatives that support the company’s next phase of growth.",
    ],
  },
];

export const publishedExecutives = () =>
  EXECUTIVES.filter((e) => e.status === "published").sort((a, b) => a.displayOrder - b.displayOrder);

export const getExecutive = (slug: string) => publishedExecutives().find((e) => e.slug === slug);
