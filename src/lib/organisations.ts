// Admin-manageable organisation lists. Extra fields (logo, website, etc.) may be added later.
export type OrgStatus = "published" | "draft";

export interface Organisation {
  id: string;
  name: string;
  displayOrder: number;
  status: OrgStatus;
}

function build(prefix: string, names: string[]): Organisation[] {
  return names.map((name, i) => ({ id: `${prefix}-${i + 1}`, name, displayOrder: i + 1, status: "published" }));
}

export const SUBSIDIARIES: Organisation[] = build("sub", [
  "Chennai Biomining Limited",
  "Eco Carbon Engineering Solutions Limited",
  "Ever Blooming Eco Solutions Limited",
  "Frank Llyod Tech Management Services Limited",
  "Hyderabad STPS’ Limited",
  "Hospet Chitradurga Tollways Limited",
  "Maha Integrated Life Sciences City",
  "Mallannasagar Water Supply Limited",
  "MDDA-Ramky ISBus Terminal Limited",
  "Pantnagar CETP Private Limited",
  "Ramdil EPC Works Limited",
  "Ramky Enclave Limited",
  "Ramky MIDC Agro Processing Park Limited",
  "Ramky Multi Product Industrial Park Limited",
  "Ramky Towers Limited",
  "Srinagar Banihal Expressway Limited",
]);

export const CLIENTELE: Organisation[] = build("client", [
  "Bihar State Road Development Corporation Ltd.",
  "Hyderabad Growth Corridor Limited",
  "Hyderabad Metropolitan Water Supply and Sewerage Board (HMWSSB)",
  "Indore Muncipal Corporation",
  "Irrigation & CAD Department-Govt of Andhra Pradesh",
  "Kanpur Development Authority",
  "Karnataka Urban Water Supply & Drainage Board",
  "Kolkata Municipal Corporation",
  "Lucknow Development Authority",
  "Maharashtra Industrial Development Corporation (MIDC)",
  "Mathura-Vrindavan Development Authority -Govt of UP",
  "National Highways Authority of India (NHAI)",
  "NTPC Limited",
  "PHED-Govt of Andhra Pradesh",
  "PHED-Govt of Rajasthan",
  "PHED-Govt of Telangana",
  "Power Grid Corporation of India",
  "Rail Vikas Nigam Limited (RVNL)",
  "Rajiv Gandhi Housing Corporation Limited",
  "Uttar Pradesh Jal Nigam",
  "V.O. Chidambaranar (VOC) Port",
]);

/** Published records, always alphabetical by displayed name. */
export function publishedSorted(list: Organisation[]): Organisation[] {
  return list
    .filter((o) => o.status === "published")
    .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
}
