import { createFileRoute, redirect } from "@tanstack/react-router";
import { Network } from "lucide-react";
import { getStaff } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { HomeListEditor } from "@/components/admin/HomeListEditor";

export const Route = createFileRoute("/admin/about/subsidiaries")({
  ssr: false,
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  head: () => ({ meta: [{ title: "Subsidiaries — Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const { staff } = Route.useRouteContext();
  return (
    <AdminShell staff={staff} active={{ kind: "about", section: "subsidiaries" }} crumbs={["About Ramky", "Partners", "Subsidiaries"]}>
      <HomeListEditor table="subsidiaries" title="Subsidiaries" itemName="Subsidiary" icon={Network}
        help="Company names and logos listed on the Subsidiaries page" withImage imageOptional
        fields={[{ key: "name", label: "Company name", required: true, max: 160 }]} />
    </AdminShell>
  );
}
