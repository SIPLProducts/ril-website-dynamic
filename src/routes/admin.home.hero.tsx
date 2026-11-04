import { createFileRoute, redirect } from "@tanstack/react-router";
import { Images } from "lucide-react";
import { getStaff } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { HomeListEditor } from "@/components/admin/HomeListEditor";

export const Route = createFileRoute("/admin/home/hero")({
  ssr: false,
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  head: () => ({ meta: [{ title: "Hero Slides — Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const { staff } = Route.useRouteContext();
  return (
    <AdminShell staff={staff} active={{ kind: "module", module: "home", section: "hero" }} crumbs={["Home Page", "Hero Slides"]}>
      <HomeListEditor table="home_hero_slides" title="Hero slides" itemName="Slide" icon={Images} withImage
        help="The big photo slideshow at the very top of the home page · changes every 5 seconds"
        fields={[
          { key: "project", label: "Project name", required: true, max: 160 },
          { key: "headline", label: "Headline", required: true, max: 160 },
          { key: "alt", label: "Photo description (for screen readers)", max: 200 },
          { key: "sub", label: "Sub-text", long: true, max: 400 },
        ]} />
    </AdminShell>
  );
}
