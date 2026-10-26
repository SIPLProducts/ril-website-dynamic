// Senior Management — photo + name + designation only. Admin-panel ready.
import p1 from "@/assets/senior-mgmt-1.jpg.asset.json";
import p2 from "@/assets/senior-mgmt-2.jpg.asset.json";
import p3 from "@/assets/senior-mgmt-3.jpg.asset.json";
import p4 from "@/assets/senior-mgmt-4.jpg.asset.json";
import p5 from "@/assets/senior-mgmt-5.jpg.asset.json";
import p6 from "@/assets/senior-mgmt-6.jpg.asset.json";
import p7 from "@/assets/senior-mgmt-7.jpg.asset.json";
import p8 from "@/assets/senior-mgmt-8.jpg.asset.json";
import p9 from "@/assets/senior-mgmt-9.jpg.asset.json";
import p10 from "@/assets/senior-mgmt-10.jpg.asset.json";
import p11 from "@/assets/senior-mgmt-11.jpg.asset.json";
import p12 from "@/assets/senior-mgmt-12.jpg.asset.json";
import p13 from "@/assets/senior-mgmt-13.jpg.asset.json";
import p14 from "@/assets/senior-mgmt-14.jpg.asset.json";
import p15 from "@/assets/senior-mgmt-15.jpg.asset.json";

export type SeniorManager = {
  id: string;
  name: string;
  designation: string;
  image: string | null;
  /** Optional manual override; when omitted the default Dr.-first, then first-name order applies. */
  displayOrder?: number;
  status: "published" | "draft";
};

export const SENIOR_MANAGEMENT: SeniorManager[] = [
  { id: "rachala-mallikarjun-reddy", name: "Mr. Rachala Mallikarjun Reddy", designation: "Head - Contracts & Claims", image: p1.url, status: "published" },
  { id: "udaya-kumari-modugula", name: "Ms. Udaya Kumari Modugula", designation: "Head - Risk & Insurance", image: p2.url, status: "published" },
  { id: "kanchrla-venkat-narayan-reddy", name: "Mr. Kanchrla Venkat Narayan Reddy", designation: "Head - IT", image: p3.url, status: "published" },
  { id: "krishna-murty-kopparty", name: "Mr. Krishna Murty Kopparty", designation: "Head - Proposals", image: p4.url, status: "published" },
  { id: "divakar-marri", name: "Dr. Divakar Marri", designation: "Head - Corporate Strategy", image: p5.url, status: "published" },
  { id: "brijesh-kabra", name: "Mr. Brijesh Kabra", designation: "Head - SCM", image: p6.url, status: "published" },
  { id: "ashwini-kumar-shukla", name: "Mr. Ashwini Kumar Shukla", designation: "Head - QA/QC", image: p7.url, status: "published" },
  { id: "anshu-kumar-singh", name: "Mr. Anshu Kumar Singh", designation: "Head - Urban Infra-Buildings", image: p8.url, status: "published" },
  { id: "akhilesh-kumar-mishra", name: "Mr. Akhilesh Kumar Mishra", designation: "Head - Legal", image: p9.url, status: "published" },
  { id: "thanigaivel-krishna-subramani", name: "Mr. Thanigaivel Krishna Subramani", designation: "Head - BD", image: p10.url, status: "published" },
  { id: "sudarsan-srinivasan", name: "Mr. Sudarsan Srinivasan", designation: "Head - CPC", image: p11.url, status: "published" },
  { id: "subodh-mishra", name: "Mr. Subodh Mishra", designation: "Head - HR & Admin", image: p12.url, status: "published" },
  { id: "ravi-prasad-polimetla", name: "Dr. Ravi Prasad Polimetla", designation: "Head - EPC", image: p13.url, status: "published" },
  { id: "ravi-kumar-ch", name: "Mr. Ravi Kumar Ch.", designation: "Head - P&M", image: p14.url, status: "published" },
  { id: "gunda-ramana-reddy", name: "Mr. Gunda Ramana Reddy", designation: "Head - HSE", image: p15.url, status: "published" },
];

const isDr = (n: string) => /^dr\.?\s/i.test(n);
const firstName = (n: string) => n.replace(/^(dr|mr|ms|mrs)\.?\s+/i, "").toLowerCase();

export const publishedSeniorManagement = () =>
  SENIOR_MANAGEMENT.filter((m) => m.status === "published").sort((a, b) => {
    if (a.displayOrder != null && b.displayOrder != null) return a.displayOrder - b.displayOrder;
    if (isDr(a.name) !== isDr(b.name)) return isDr(a.name) ? -1 : 1;
    return firstName(a.name).localeCompare(firstName(b.name));
  });
