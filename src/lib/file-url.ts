/** Stable, same-origin URLs for published uploads; bundled assets and external links stay unchanged. */
export function publishedFileUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("storage:")) return value;
  return "/files/" + value.slice("storage:".length).split("/").map(encodeURIComponent).join("/");
}