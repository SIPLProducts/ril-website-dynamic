// Turns a signed storage URL into one the visitor's browser can load.
// Self-hosted: origin-relative (/storage/v1/...) so it works on any IP/domain via Nginx.
// Hosted backend: keep the absolute backend URL.
export function browserStorageUrl(signedUrl: string): string {
  try {
    const u = new URL(signedUrl);
    const backend = process.env["VITE_SUPABASE_URL"] ?? process.env["SUPABASE_URL"] ?? "";
    if (/\.supabase\.(co|in)$/.test(new URL(backend || signedUrl).hostname)) {
      return backend ? signedUrl.replace(u.origin, new URL(backend).origin) : signedUrl;
    }
    return u.pathname + u.search;
  } catch {
    return signedUrl;
  }
}
