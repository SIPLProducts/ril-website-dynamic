import { describe, expect, it } from "vitest";
import { IR_CATEGORIES } from "@/lib/investor-relations";

describe("Investor Relations document placement", () => {
  it("places Terms of Appointment of Independent Directors only under Corporate Governance Policies", () => {
    const locations = IR_CATEGORIES.flatMap((category) =>
      category.subTabs.flatMap((tab) =>
        tab.documents
          .filter((document) => document.title === "Terms of Appointment of Independent Directors")
          .map(() => `${category.slug}/${tab.slug}`),
      ),
    );
    expect(locations).toEqual(["corporate-governance/policies"]);
  });
});