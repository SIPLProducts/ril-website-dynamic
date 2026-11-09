import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { publishedFileUrl } from "@/lib/file-url";
import { isPublishedFile, validFilePath } from "@/lib/public-files.server";

function clientFor(rows: Record<string, Record<string, unknown>[]>) {
  return { from(table: string) {
    let matching = rows[table] ?? [];
    const query = {
      select() { return query; },
      eq(column: string, value: unknown) { matching = matching.filter((r) => r[column] === value); return query; },
      contains(column: string, value: { url: string }[]) {
        matching = matching.filter((r) => Array.isArray(r[column]) && r[column].some((v: { url?: string }) => v.url === value[0]?.url));
        return query;
      },
      limit() { return Promise.resolve({ data: matching.slice(0, 1), error: null }); },
    };
    return query;
  } } as unknown as SupabaseClient<Database>;
}

describe("uploaded media on every address", () => {
  it.each(["http://10.200.1.8", "https://38.31.132.10", "https://ril.ramky.com"])("uses the visitor's origin: %s", (origin) => {
    const path = publishedFileUrl("storage:footer/group-companies/Chennai logo.png");
    expect(new URL(path ?? "", origin).href).toBe(origin + "/files/footer/group-companies/Chennai%20logo.png");
  });
  it("preserves bundled assets", () => expect(publishedFileUrl("asset:ramky-estates")).toBe("asset:ramky-estates"));
  it("allows a saved published group-company logo", async () => {
    expect(await isPublishedFile(clientFor({ group_companies: [{ id: "company", published: true, logo_url: "storage:footer/logo.png" }] }), "footer/logo.png")).toBe(true);
  });
  it("denies an unpublished company logo", async () => {
    expect(await isPublishedFile(clientFor({ group_companies: [{ published: false, logo_url: "storage:footer/logo.png" }] }), "footer/logo.png")).toBe(false);
  });
  it("never exposes resumes merely because they exist", async () => {
    expect(await isPublishedFile(clientFor({ career_applications: [{ resume_path: "careers/resume.pdf" }] }), "careers/resume.pdf")).toBe(false);
  });
  it("supports home about images in public JSON content", async () => {
    expect(await isPublishedFile(clientFor({ home_top: [{ id: 1, about_images: [{ url: "storage:home/about.png" }] }] }), "home/about.png")).toBe(true);
  });
  it.each(["../secret", "a/../secret", "a\\secret", "/secret", "a//secret", "a\nsecret"])("rejects unsafe paths: %s", (path) => {
    expect(validFilePath(path)).toBe(false);
  });
});