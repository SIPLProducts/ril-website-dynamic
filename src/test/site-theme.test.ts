import { describe, expect, it } from "vitest";
import { cleanTheme, themeCss } from "@/lib/site-settings";
describe("site theme", () => {
  it("drops unknown fonts and bad colours", () => {
    expect(cleanTheme({ headingFont: "Comic", primary: "red;}" , green: "#00aa00" })).toMatchObject({ headingFont: "", primary: "", green: "#00aa00" });
  });
  it("empty theme leaves design unchanged", () => { expect(themeCss(cleanTheme({}))).toBe(""); });
  it("sets heading font", () => { expect(themeCss(cleanTheme({ headingFont: "Montserrat" }))).toContain('"Montserrat"'); });
});
