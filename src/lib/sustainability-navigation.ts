/** Only public Sustainability pages lock the shared site navigation. */
export function isSustainabilityPage(pathname: string): boolean {
  return /^\/esg\/[^/]+\/?$/.test(pathname);
}