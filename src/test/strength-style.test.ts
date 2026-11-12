import { describe, expect, it } from "vitest";
import { cleanHtml, splitBox, wrapBox } from "@/lib/strength-style";

describe("strength rich text", () => {
  it("strips scripts, images and javascript links", () => {
    const out = cleanHtml('<p>Hi<script>x</script><img src=x><a href="javascript:alert(1)">l</a></p>');
    expect(out).not.toMatch(/script|img|javascript/);
  });
  it("keeps fill color highlight and box border", () => {
    const out = cleanHtml('<div data-box="1" style="border: 2px dashed #ff0000; padding: 8px"><p><mark style="background-color: #ffff00">x</mark></p></div>');
    expect(out).toContain("background-color:#ffff00");
    expect(out).toContain("border:2px dashed #ff0000");
  });
  it("box settings round-trip and radius caps at 32", () => {
    const w = wrapBox("<p>a</p>", { bg: "#eeeeee", borderColor: "#000000", borderWidth: 2, radius: 99, padding: 10 });
    const { inner, box } = splitBox(w);
    expect(inner).toBe("<p>a</p>");
    expect(box).toMatchObject({ bg: "#eeeeee", borderColor: "#000000", borderWidth: 2, radius: 32, padding: 10 });
  });
});


it("tables with cell colors survive cleaning, scripts do not", () => {
  const out = cleanHtml('<table><tbody><tr><td colspan="2" style="background-color: #ff0000; border-color: #00ff00">A</td></tr></tbody></table><script>x</script>');
  expect(out).toContain('<td colspan="2"');
  expect(out).toContain("background-color:#ff0000");
  expect(out).not.toContain("script");
});
