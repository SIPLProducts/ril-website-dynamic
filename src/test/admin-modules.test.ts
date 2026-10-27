import { describe, expect, it } from "vitest";
import { ADMIN_MODULES, isReady } from "@/lib/admin-modules";

describe("admin menu", () => {
  it("follows the website header order", () => {
    expect(ADMIN_MODULES.map((m) => m.label)).toEqual(["About Ramky", "Management", "Capabilities", "Accolades", "Sustainability", "Careers"]);
  });
  it("only Clientele is editable under About Ramky", () => {
    const about = ADMIN_MODULES[0]!;
    expect(about.children!.filter((p) => p.to).map((p) => p.label)).toEqual(["Clientele"]);
    expect(isReady(about)).toBe(true);
    expect(isReady(ADMIN_MODULES[1]!)).toBe(false);
  });
});
