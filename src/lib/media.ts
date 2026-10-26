export type MediaType =
  | "Press Release"
  | "Media Coverage"
  | "News"
  | "Publication"
  | "Corporate Announcement"
  | "Article"
  | "Magazine Feature";

export type MediaItem = {
  id: string;
  /** ISO publication date, e.g. "2026-10-06". Optional until the source document provides one. */
  date?: string;
  title: string;
  summary?: string;
  type: MediaType;
  source?: string;
  thumbnail?: string;
  documentUrl?: string;
  externalUrl?: string;
  published: boolean;
  /** Optional heading line shown above the title. */
  kicker?: string;
  /** Optional full article paragraphs (shown instead of summary). */
  paragraphs?: string[];
  /** Optional visible "read more" link label for externalUrl. */
  linkLabel?: string;
};

/** Media records — to be managed via the admin portal. Newest first. */
export const MEDIA_ITEMS: MediaItem[] = [
  {
    id: "forbes-india-building-what-comes-next",
    kicker: "Leadership Perspective | Featured in Forbes India",
    title: "Building What Comes Next",
    paragraphs: [
      "Ramky Infrastructure Limited's vision for the future takes centre stage in this featured article published by Forbes India, highlighting the leadership perspective of our CEO and the company's journey in shaping the next chapter of infrastructure development.",
      "With a focus on the future of infrastructure, this feature offers an opportunity to explore Ramky's leadership vision, evolving priorities, and commitment to delivering infrastructure that creates lasting value.",
    ],
    type: "Media Coverage",
    source: "Forbes India",
    externalUrl:
      "https://www.forbesindia.com/article/upfront/brand-connect/ramky-infrastructure-limited-building-what-comes-next/2999365/1",
    linkLabel: "Read the full article",
    published: true,
  },
  {
    id: "rvnl-bacheli-loa-2026",
    title: "Ramky Infrastructure receives LOA for ₹588.60 Cr work from RVNL at Bacheli, Chhattisgarh",
    summary:
      "Ramky Infrastructure received LOA for ₹588.60 Cr of work from RVNL at Bacheli, Chhattisgarh on Engineering, Procurement and Construction (EPC) basis.",
    type: "Press Release",
    published: true,
  },
];

export function publishedMedia(items: MediaItem[] = MEDIA_ITEMS): MediaItem[] {
  return items.filter((m) => m.published).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}
