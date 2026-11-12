import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";

export const adminVisibilityQuery = { queryKey: ["admin-page-visibility"], queryFn: async () => {
  const { data, error } = await supabase.from("page_visibility").select("key,published");
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.published])) as Record<string, boolean>;
} };

export function useAdminVisibility() {
  const qc = useQueryClient();
  const q = useQuery(adminVisibilityQuery);
  const isLive = (key: string) => q.data?.[key] ?? true;
  async function setLive(key: string, published: boolean) {
    const { error } = await supabase.from("page_visibility").upsert({ key, published });
    if (error) { toast.error(error.message); return; }
    toast.success(published ? "Published — page is live on the website" : "Unpublished — page is hidden from the website");
    await qc.invalidateQueries({ queryKey: adminVisibilityQuery.queryKey });
    await qc.invalidateQueries({ queryKey: ["hidden-pages"] });
  }
  return { isLive, setLive, loading: q.isLoading };
}

export function PublishToggle({ pageKey, label }: { pageKey: string; label?: string }) {
  const { isLive, setLive, loading } = useAdminVisibility();
  const live = isLive(pageKey);
  return (
    <label className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${live ? "border-primary/30 bg-primary/5 text-primary" : "border-border bg-muted text-muted-foreground"}`}>
      <Switch checked={live} disabled={loading} onCheckedChange={(v) => setLive(pageKey, v)} aria-label={`Publish ${label ?? "page"}`} />
      {live ? "Published" : "Unpublished"}
    </label>
  );
}
