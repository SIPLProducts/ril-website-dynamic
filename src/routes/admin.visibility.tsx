import { createFileRoute, redirect } from "@tanstack/react-router";
import { getStaff } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { FormSection } from "@/components/admin/AdminDialog";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { VISIBILITY_PAGES } from "@/lib/page-visibility";

export const Route = createFileRoute("/admin/visibility")({
  ssr: false,
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  component: Page,
});

function Page() {
  const { staff } = Route.useRouteContext();
  const modules = [...new Set(VISIBILITY_PAGES.map((p) => p.module))];
  return (
    <AdminShell staff={staff} active={{ kind: "visibility" }} crumbs={["Page visibility"]}>
      <p className="mb-4 text-sm text-muted-foreground">Turn a sub-page off to hide it from the website menus and links. Its content is kept and comes back when you turn it on again.</p>
      <div className="space-y-4">
        {modules.map((m) => (
          <FormSection key={m} title={m}>
            <ul className="divide-y divide-border">
              {VISIBILITY_PAGES.filter((p) => p.module === m).map((p) => (
                <li key={p.key} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span>{p.label}</span><PublishToggle pageKey={p.key} label={p.label} />
                </li>
              ))}
            </ul>
          </FormSection>
        ))}
      </div>
    </AdminShell>
  );
}
