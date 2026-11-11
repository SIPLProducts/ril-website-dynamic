import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { publishedFileUrl } from "@/lib/file-url";

/** Admin-editable lists shown on public pages. */
export const PAGE_LIST_TABLES = ["history_milestones", "subsidiaries", "management_system_items", "careers_landing_cards"] as const;
export type PageListTable = (typeof PAGE_LIST_TABLES)[number];
export type PageListRow = Record<string, string | null> & { id: string };

const FILE_KEYS = ["image_url", "doc_url"];

export const getPageList = createServerFn({ method: "GET" })
  .inputValidator((d: { table: PageListTable }) => z.object({ table: z.enum(PAGE_LIST_TABLES) }).parse(d))
  .handler(async ({ data }) => {
    const { publicFileClient } = await import("@/lib/public-files.server");
    const { data: rows, error } = await publicFileClient().from(data.table).select("*").eq("published", true).order("sort_order");
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => {
      const out: PageListRow = { id: String(r.id) };
      for (const [k, v] of Object.entries(r)) {
        if (k === "published" || k === "sort_order" || k === "created_at" || k === "updated_at") continue;
        out[k] = FILE_KEYS.includes(k) ? publishedFileUrl(v as string | null) : v == null ? null : String(v);
      }
      return out;
    });
  });

export const pageListQuery = (table: PageListTable) =>
  queryOptions({ queryKey: ["page-list", table], queryFn: () => getPageList({ data: { table } }) });
