import { describe, expect, it } from "vitest";
import { isSustainabilityPage } from "@/lib/sustainability-navigation";

describe("Sustainability navigation scope", () => {
  it("locks navigation on every Sustainability subpage", () => {
    for (const slug of ["policies", "environmental", "social", "governance", "esg-reporting"]) {
      expect(isSustainabilityPage(`/esg/${slug}`)).toBe(true);
    }
  });

  it("leaves main-site and admin navigation unlocked", () => {
    for (const path of ["/", "/investors", "/about/clientele", "/admin/sustainability/policies"]) {
      expect(isSustainabilityPage(path)).toBe(false);
    }
  });
});