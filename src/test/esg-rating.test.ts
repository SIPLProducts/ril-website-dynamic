import { describe, expect, it } from "vitest";
import { extractRating } from "@/lib/esg-rating";

const page = `NSE Sustainability Ratings & Analytics
Ramky Infrastructure Ltd
Construction | Civil Construction
Ramky Infrastructure Ltd
Last Review Date: 15th October 2026
Environment Score
32
Social Score
70
Goverance Score
72
FY2026
ESG Rating
56
FY2025 *
ESG Rating
48
Rating Category : Moderate
Ramky Infrastructure Limited (Ramky Infra) is an integrated construction company in India.
We have assessed the company across the three pillars
Environment
Weightage
40%
For FY2026, the company has achieved a core Rating of 42, Comprising`;

describe("extractRating", () => {
  const r = extractRating(page);
  it("reads year-wise ratings newest first, marking revised years", () => {
    expect(r.ratings).toEqual([{ year: "FY2026", score: "56", note: "" }, { year: "FY2025", score: "48", note: "Revised" }]);
  });
  it("reads the rating category with its NSE descriptor", () => {
    expect(r.category).toBe("Moderate");
    expect(r.categoryNote).toBe("Displays basic ESG practices with limited strategic depth.");
  });
  it("reads pillar scores, core rating and review date", () => {
    expect(r.pillars.map((p) => p.score)).toEqual(["32", "70", "72"]);
    expect(r.pillars[0]?.weight).toBe("40%");
    expect(r.coreRating).toBe("42");
    expect(r.reviewDate).toBe("15th October 2026");
  });
  it("leaves missing values empty instead of guessing", () => {
    const e = extractRating("unrelated text");
    expect(e.ratings).toEqual([]);
    expect(e.category).toBe("");
  });
});
