import { describe, expect, it } from "vitest";
import { ADMIN_MODULES, isLiveHost, isModuleReady, isReady } from "@/lib/admin-modules";

const mod = (key: string) => ADMIN_MODULES.find((m) => m.key === key)!;

describe("admin menu", () => {
  it("follows the website header order", () => {
    expect(ADMIN_MODULES.map((m) => m.label)).toEqual(["Home", "About Ramky", "Management", "Capabilities", "Accolades", "Sustainability", "Company", "Footer", "Careers"]);
  });
  it("only Clientele is editable under About Ramky", () => {
    const about = mod("about");
    expect(about.children!.filter((p) => p.to).map((p) => p.label)).toEqual(["Clientele"]);
    expect(isReady(about)).toBe(true);
  });
  it("all four Sustainability pages are editable", () => {
    expect(mod("sustainability").children!.filter((p) => p.to).map((p) => p.label)).toEqual(["Sustainability Section", "Environmental", "Social", "Governance", "ESG Reporting"]);
  });
  it("Home Page has its four editable screens", () => {
    expect(mod("home").children!.filter((p) => p.to).map((p) => p.label)).toEqual(["Hero Slides", "Key Figures", "Who We Are", "Our Journey"]);
  });
  it("recognises the live addresses", () => {
    expect(isLiveHost("ril.siplproducts.com")).toBe(true);
    expect(isLiveHost("ril-website-dynamic.lovable.app")).toBe(true);
    expect(isLiveHost("localhost")).toBe(false);
  });
  it("locks Company and Careers on the live site only", () => {
    expect(isModuleReady(mod("company"), true)).toBe(false);
    expect(isModuleReady(mod("careers"), true)).toBe(false);
    expect(isModuleReady(mod("company"), false)).toBe(true);
    expect(isModuleReady(mod("careers"), false)).toBe(true);
  });
  it("keeps the finished modules open on the live site", () => {
    for (const k of ["home", "about", "management", "capabilities", "accolades", "sustainability", "footer"]) expect(isModuleReady(mod(k), true)).toBe(true);
  });
});
