import { describe, it, expect } from "vitest";
import { isUrlHidden, hiddenLinksCss, visibilityKey } from "@/lib/page-visibility";

describe("page visibility", () => {
  it("nothing is hidden by default", () => {
    expect(isUrlHidden([], "/about/geographic-presence", "")).toBe(false);
  });
  it("hides an unpublished about sub-page", () => {
    expect(isUrlHidden(["about/geographic-presence"], "/about/geographic-presence", "")).toBe(true);
    expect(isUrlHidden(["about/geographic-presence"], "/about/clientele", "")).toBe(false);
  });
  it("hides only the matching investors tab", () => {
    const k = ["ir/financials/quarterly-results"];
    expect(isUrlHidden(k, "/investors", "?cat=financials&sub=quarterly-results")).toBe(true);
    expect(isUrlHidden(k, "/investors", "?cat=corporate-governance&sub=x")).toBe(false);
  });
  it("hides menu links to hidden pages", () => {
    expect(hiddenLinksCss(["sustainability/social"])).toContain('a[href="/esg/social"]');
  });
  it("maps admin pages to keys", () => {
    expect(visibilityKey({ kind: "about", section: "clientele" })).toBe("about/clientele");
    expect(visibilityKey({ kind: "module", module: "management", section: "board" })).toBe("management/board");
  });
});
