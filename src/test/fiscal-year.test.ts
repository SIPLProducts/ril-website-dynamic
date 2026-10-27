import { describe, expect, it } from "vitest";
import { adminFyYears, fyOf } from "@/lib/fiscal-year";

describe("financial year", () => {
  it("15-01-2027 falls in the FY ending 31-03-2027", () => {
    expect(fyOf("2027-01-15").endsOn).toBe("31-03-2027");
  });
  it("31-03-2027 is still under 2026", () => {
    expect(fyOf("2027-03-31").label).toBe("2026");
  });
  it("01-04-2027 is under 2027", () => {
    expect(fyOf("2027-04-01").label).toBe("2027");
  });
  it("10-04-2027 starts the FY ending 31-03-2028", () => {
    expect(fyOf("2027-04-10").endYear).toBe(2028);
  });
  it("admin shows a new empty FY card once 31-03-2027 has passed", () => {
    expect(adminFyYears(["2027-01-15"], new Date("2027-04-01T06:00:00Z"))).toEqual([2028, 2027]);
  });
});
