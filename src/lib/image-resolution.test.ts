import { describe, expect, it } from "vitest";
import { fitSize } from "./image-resolution";
describe("fitSize", () => {
  it("shrinks 4000x3000 into Full HD keeping proportions", () => expect(fitSize(4000, 3000, "1920x1080")).toEqual({ w: 1440, h: 1080 }));
  it("never enlarges a small photo", () => expect(fitSize(800, 600, "3840x2160")).toEqual({ w: 800, h: 600 }));
  it("original keeps the size", () => expect(fitSize(5000, 2000, "original")).toEqual({ w: 5000, h: 2000 }));
});

import { coverSize, isVideo } from "./image-resolution";
describe("uniform hero media", () => {
  it("crops a tall photo to 16:9", () => { const b = coverSize(3000, 3000, "1920x1080"); expect([b.w, b.h]).toEqual([1920, 1080]); expect(b.sh).toBe(1688); });
  it("never upscales a small photo", () => { const b = coverSize(800, 600, "1920x1080"); expect([b.w, b.h]).toEqual([800, 450]); });
  it("detects videos", () => { expect(isVideo("storage:home/x.mp4")).toBe(true); expect(isVideo("storage:home/x.gif")).toBe(false); });
});
