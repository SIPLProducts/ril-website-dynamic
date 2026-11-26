/** Social headline cards and the sub-figures shown in their hover/tap breakdown. */
export const SOCIAL_BREAKDOWNS: Record<string, string[]> = {
  "lives impacted": ["Health Beneficiaries", "Students Supported", "People Skill-Trained"],
  employees: ["Employee Health Insurance Coverage", "Performance Reviews Completed", "Employees Trained on Health & Safety"],
  "employees covered by equal opportunity policies": ["Medical Coverage for Employees"],
};

const key = (s: string) => s.replace(/<[^>]*>/g, "").trim().toLowerCase();

export function groupSocialMetrics<T extends { label: string }>(metrics: T[]): { metric: T; details: T[] }[] {
  const childKeys = new Set<string>();
  const out: { metric: T; details: T[] }[] = [];
  for (const m of metrics) {
    const children = SOCIAL_BREAKDOWNS[key(m.label)];
    if (!children) continue;
    const found = children.map((c) => metrics.find((x) => key(x.label) === key(c))).filter((x): x is T => Boolean(x));
    found.forEach((f) => childKeys.add(key(f.label)));
  }
  for (const m of metrics) {
    if (childKeys.has(key(m.label))) continue;
    const children = SOCIAL_BREAKDOWNS[key(m.label)] ?? [];
    out.push({ metric: m, details: children.map((c) => metrics.find((x) => key(x.label) === key(c))).filter((x): x is T => Boolean(x)) });
  }
  return out;
}
