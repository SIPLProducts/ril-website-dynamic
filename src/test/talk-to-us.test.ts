import { describe, expect, it } from "vitest";
import { DEFAULT_TALK, parseTalk } from "@/lib/site-settings";
describe("Talk To Us settings", () => {
  it("uses admin text and keeps defaults for blanks", () => {
    const t = parseTalk({ heading: "New heading", phone: "  " });
    expect(t.heading).toBe("New heading");
    expect(t.phone).toBe("+91 40 2301 5000");
  });
  it("falls back fully when missing", () => expect(parseTalk(null)).toEqual(DEFAULT_TALK));
});
