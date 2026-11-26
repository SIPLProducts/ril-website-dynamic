import { describe, expect, it } from "vitest";
import { parseAccoladeImage, shapeRatio, sizeWidth } from "@/lib/accolade-image";

describe("accolade image options", () => {
  it("falls back to auto shape, whole photo, medium size", () => {
    expect(parseAccoladeImage(undefined)).toEqual({ shape: "auto", fit: "contain", size: "medium", resolution: "original" });
  });
  it("keeps a portrait choice chosen in admin", () => {
    expect(parseAccoladeImage({ shape: "portrait", fit: "cover", size: "large" }).shape).toBe("portrait");
    expect(shapeRatio("portrait")).toBe("3 / 4");
    expect(sizeWidth("large")).toBe("28rem");
  });
  it("auto shape has no fixed frame", () => {
    expect(shapeRatio("auto")).toBeNull();
  });
});
