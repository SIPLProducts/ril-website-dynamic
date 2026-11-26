import { describe, expect, it } from "vitest";
import { groupSocialMetrics } from "@/lib/esg-social-groups";
const csr = ["Lives Impacted","CSR Activities","CSR Spend","Health Beneficiaries","Students Supported","People Skill-Trained"].map((label) => ({ label, value: "1" }));
describe("Social card grouping", () => {
  it("CSR shows 3 cards with Lives Impacted holding 3 breakdown figures", () => {
    const g = groupSocialMetrics(csr);
    expect(g.map((x) => x.metric.label)).toEqual(["Lives Impacted","CSR Activities","CSR Spend"]);
    expect(g[0]?.details.map((d) => d.label)).toEqual(["Health Beneficiaries","Students Supported","People Skill-Trained"]);
  });
});
