import { describe, expect, it } from "vitest";
import { percentageSign } from "@/lib/esg-metric-trends";

describe("Environmental displayed percentage signs", () => {
  it("classifies 22%, 32%, 83% and 100% as positive", () => {
    for (const value of ["22%", "32%", "83%", "100%"]) {
      expect(percentageSign(value)).toBe("positive");
    }
  });
  it("classifies negative percentages as negative", () => {
    expect(percentageSign("-22%")).toBe("negative");
    expect(percentageSign("−32%")).toBe("negative");
  });
  it("leaves zero, missing and non-percentage values neutral", () => {
    for (const value of ["0%", "", "Not disclosed", "2026"]) {
      expect(percentageSign(value)).toBe("neutral");
    }
  });
});