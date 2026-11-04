import { createFileRoute, redirect } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { getStaff } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { HomeListEditor } from "@/components/admin/HomeListEditor";

export const Route = createFileRoute("/admin/home/stats")({
  ssr: false,
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  head: () => ({ meta: [{ title: "Key Figures — Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const { staff } = Route.useRouteContext();
  return (
    <AdminShell staff={staff} active={{ kind: "module", module: "home", section: "stats" }} crumbs={["Home Page", "Key Figures"]}>
      <HomeListEditor table="home_stats" title="Key figures" itemName="Figure" icon={BarChart3}
        help="The row of numbers just below the slideshow (e.g. 30+ Years of Experience)"
        fields={[
          { key: "value", label: "Figure", required: true, max: 30, placeholder: "30+" },
          { key: "label", label: "Label", required: true, max: 80, placeholder: "Years of Experience" },
        ]} />
    </AdminShell>
  );
}
