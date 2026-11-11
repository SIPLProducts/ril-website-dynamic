import { createFileRoute, redirect } from "@tanstack/react-router";
import { History } from "lucide-react";
import { getStaff } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { HomeListEditor } from "@/components/admin/HomeListEditor";

export const Route = createFileRoute("/admin/about/history-milestones")({
  ssr: false,
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  head: () => ({ meta: [{ title: "History & Milestones — Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const { staff } = Route.useRouteContext();
  return (
    <AdminShell staff={staff} active={{ kind: "about", section: "history-milestones" }} crumbs={["About Ramky", "History & Milestones"]}>
      <HomeListEditor table="history_milestones" title="Milestones" itemName="Milestone" icon={History}
        help="Each milestone shows a year and a short text on the timeline"
        fields={[
          { key: "year", label: "Year", required: true, max: 20, placeholder: "1994" },
          { key: "text", label: "Text", required: true, long: true, max: 300 },
        ]} />
    </AdminShell>
  );
}
