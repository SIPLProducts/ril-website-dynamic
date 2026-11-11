import { createFileRoute, redirect } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { getStaff } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { HomeListEditor } from "@/components/admin/HomeListEditor";

export const Route = createFileRoute("/admin/careers/landing")({
  ssr: false,
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  head: () => ({ meta: [{ title: "Careers Page — Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const { staff } = Route.useRouteContext();
  return (
    <AdminShell staff={staff} active={{ kind: "module", module: "careers", section: "landing" }} crumbs={["Careers", "Careers Page"]}>
      <HomeListEditor table="careers_landing_cards" title="Careers page cards" itemName="Card" icon={Briefcase} withImage
        help="Cards on the People & Careers page, each with a photo, text and a button"
        fields={[
          { key: "title", label: "Title", required: true, max: 80 },
          { key: "eyebrow", label: "Small heading", max: 60 },
          { key: "href", label: "Button link", required: true, max: 200, placeholder: "/life-at-ramky" },
          { key: "text", label: "Text", long: true, max: 400 },
        ]} />
    </AdminShell>
  );
}
