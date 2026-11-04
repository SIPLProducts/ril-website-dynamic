import { createFileRoute, redirect } from "@tanstack/react-router";
import { History } from "lucide-react";
import { getStaff } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { HomeListEditor } from "@/components/admin/HomeListEditor";
import { HomeTopHeading } from "@/components/admin/HomeTopHeading";

export const Route = createFileRoute("/admin/home/journey")({
  ssr: false,
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  head: () => ({ meta: [{ title: "Our Journey — Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const { staff } = Route.useRouteContext();
  return (
    <AdminShell staff={staff} active={{ kind: "module", module: "home", section: "journey" }} crumbs={["Home Page", "Our Journey"]}>
      <div className="space-y-6">
        <HomeTopHeading eyebrowKey="journey_eyebrow" titleKey="journey_title" anchor="journey" help="The heading above the milestone cards." />
        <HomeListEditor table="home_journey_milestones" title="Milestones" itemName="Milestone" icon={History}
          help="Each card shows a year, a title and a short text"
          fields={[
            { key: "year", label: "Year", required: true, max: 20, placeholder: "1994" },
            { key: "title", label: "Title", required: true, max: 100 },
            { key: "text", label: "Text", long: true, max: 400 },
          ]} />
      </div>
    </AdminShell>
  );
}
