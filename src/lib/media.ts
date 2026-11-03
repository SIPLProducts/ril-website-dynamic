export const MEDIA_TYPES = [
  "Press Release",
  "Media Coverage",
  "News",
  "Publication",
  "Corporate Announcement",
  "Article",
  "Magazine Feature",
] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export type MediaItem = {
  id: string;
  /** ISO publication date, e.g. "2026-10-06". */
  date?: string;
  title: string;
  summary?: string;
  type: MediaType;
  source?: string;
  thumbnail?: string;
  documentUrl?: string;
  externalUrl?: string;
  published: boolean;
  kicker?: string;
  paragraphs?: string[];
  linkLabel?: string;
};
