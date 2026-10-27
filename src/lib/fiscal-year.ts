/** Indian financial year: 1 April – 31 March. `endYear` is the year of the closing 31 March. */
/** `label` is the starting year (FY 1-04-2026 – 31-03-2027 is "2026"). */
export type FY = { endYear: number; label: string; endsOn: string; range: string };

export function fyOf(date: string | Date): FY {
  const d = typeof date === "string" ? new Date(`${date.slice(0, 10)}T00:00:00Z`) : date;
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth(); // 0 = Jan, 3 = April
  return fyFromEnd(m >= 3 ? y + 1 : y);
}

export function fyFromEnd(endYear: number): FY {
  return { endYear, label: String(endYear - 1), endsOn: `31-03-${endYear}`, range: `01-04-${endYear - 1} to 31-03-${endYear}` };
}

/** All FY end-years to show in admin: current FY (even if empty) plus every year that has awards, newest first. */
export function adminFyYears(dates: string[], now: Date = new Date()): number[] {
  const set = new Set(dates.map((d) => fyOf(d).endYear));
  set.add(fyOf(now).endYear);
  return [...set].sort((a, b) => b - a);
}
