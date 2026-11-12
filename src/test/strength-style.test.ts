import { describe, expect, it } from "vitest";
import { cleanHtml, merge, cardCss } from "@/lib/strength-style";

describe("strength styles", () => {
  it("strips scripts but keeps allowed formatting", () => {
    const out = cleanHtml('<p style="text-align:center;color:#ff0000">Hi<script>alert(1)</script></p><img src=x onerror=1>');
    expect(out).toBe('<p style="text-align:center;color:#ff0000">Hi</p>');
  });
  it("card values override page defaults", () => {
    expect(merge({ cardBg: "#111111", radius: 4 }, { cardBg: "#222222" })).toEqual({ cardBg: "#222222", radius: 4 });
  });
  it("caps radius at 32px", () => {
    expect(cardCss({ radius: 99 }).borderRadius).toBe(32);
  });
});
