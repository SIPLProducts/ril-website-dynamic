export type Vacancy = {
  id: string; title: string; location?: string; division?: string; publishedDate?: string;
  experience?: string; qualification?: string; employmentType?: string; description?: string;
  responsibilities?: string[]; skills?: string[]; vacancies?: number; deadline?: string;
  status: "open" | "closed" | "filled" | "draft";
};
export type RecruitmentFlyer = { id: string; title: string; url: string; imageUrl?: string; roles: string[]; status: "open" | "closed" | "draft" };

export type CareersData = {
  purpose: { id: string; title: string; body: string; bullets: string[] }[];
  positionsIntro: string;
  sections: { id: string; title: string; paragraphs: string[]; imageUrl?: string }[];
  vacancies: Vacancy[];
  flyers: RecruitmentFlyer[];
};
export function careersHead(title: string, description: string) {
  const fullTitle = `${title} | Ramky Infrastructure`;
  return { meta: [{ title: fullTitle }, { name: "description", content: description }, { property: "og:title", content: fullTitle }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
}
