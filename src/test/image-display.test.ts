import { describe, expect, it } from "vitest";
import { imageDisplayKey, imageDisplaySource, parseImageDisplays } from "@/lib/image-display";

describe("shared image display settings", () => {
  it("normalizes uploads to the same path on private IP, public IP and domain", () => {
    expect(imageDisplayKey("storage:management/photo one.jpg")).toBe("media:/files/management/photo%20one.jpg");
    expect(imageDisplayKey("/files/management/photo%20one.jpg")).toBe("media:/files/management/photo%20one.jpg");
    expect(imageDisplayKey("https://10.200.1.8/files/management/photo%20one.jpg")).toBe("media:/files/management/photo%20one.jpg");
    expect(imageDisplayKey("https://38.31.132.10/files/management/photo%20one.jpg")).toBe("media:/files/management/photo%20one.jpg");
    expect(imageDisplayKey("https://ril.siplproducts.com/files/management/photo%20one.jpg")).toBe("media:/files/management/photo%20one.jpg");
  });
  it("retains square options without mixing in existing award entries", () => {
    const options = parseImageDisplays({
      "award-id": { shape: "portrait" },
      "media:/files/management/photo.jpg": { shape: "square", fit: "contain", size: "small", resolution: "1920x1080" },
    });
    expect(Object.keys(options)).toEqual(["/files/management/photo.jpg"]);
    expect(options["/files/management/photo.jpg"]).toEqual({ shape: "square", fit: "contain", size: "small", resolution: "1920x1080" });
  });
  it("leaves images without saved choices unconfigured", () => {
    expect(parseImageDisplays(undefined)).toEqual({});
    expect(parseImageDisplays([])).toEqual({});
  });
  it("resolves built-in image references to their displayed media URL", () => {
    expect(imageDisplaySource("asset:who-main")).toContain("who-we-are-main.jpg");
    expect(imageDisplaySource(null)).toBe("");
  });
});