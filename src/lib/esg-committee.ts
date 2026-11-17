// ESG Committee content stored as JSON in esg_pages.committee (governance page).
export type CommitteeMember = { name: string; designation: string; role: string };
export type EsgCommittee = {
  title: string;
  summary: string;
  composition: string;
  members: CommitteeMember[];
  responsibilities: string[];
  meetings: string;
  other: string;
};

export const EMPTY_COMMITTEE: EsgCommittee = { title: "ESG Committee", summary: "", composition: "", members: [], responsibilities: [], meetings: "", other: "" };

const str = (v: unknown, max = 4000) => (typeof v === "string" ? v.slice(0, max) : "");

/** Normalise stored JSON into a safe committee object. */
export function parseCommittee(raw: unknown): EsgCommittee {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const members = Array.isArray(o["members"]) ? o["members"] : [];
  const resp = Array.isArray(o["responsibilities"]) ? o["responsibilities"] : [];
  return {
    title: str(o["title"], 120) || "ESG Committee",
    summary: str(o["summary"]),
    composition: str(o["composition"]),
    members: members.map((m) => { const r = (m ?? {}) as Record<string, unknown>; return { name: str(r["name"], 120), designation: str(r["designation"], 160), role: str(r["role"], 120) }; }).filter((m) => m.name.trim()),
    responsibilities: resp.map((r) => str(r, 600).trim()).filter(Boolean),
    meetings: str(o["meetings"]),
    other: str(o["other"]),
  };
}

/** True when there is anything to show publicly. */
export const hasCommittee = (c: EsgCommittee) => Boolean(c.summary || c.composition || c.members.length || c.responsibilities.length || c.meetings || c.other);
