import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { FileText, Layers, ShieldCheck } from "lucide-react";
import { getStaff } from "@/lib/admin-auth";
import { getAboutSection } from "@/lib/about-sections";
import { AdminShell } from "@/components/admin/AdminShell";
import { AboutContentEditor } from "@/components/admin/AboutContentEditor";
import { HomeListEditor } from "@/components/admin/HomeListEditor";

export const Route = createFileRoute("/admin/about/$slug")({
  ssr: false,
  beforeLoad: async () => {
    const staff = await getStaff();
    if (!staff) throw redirect({ to: "/admin/login" });
    return { staff };
  },
  loader: ({ params }) => {
    const section = getAboutSection(params.slug);
    if (!section) throw notFound();
    return { slug: section.slug, title: section.title };
  },
  head: () => ({ meta: [{ title: "About Ramky — Admin" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

const PDF = { key: "doc_url", label: "Document (PDF)", accept: "application/pdf", hint: "PDF, up to 20 MB" };

function Page() {
  const { staff } = Route.useRouteContext();
  const { slug, title } = Route.useLoaderData();
  return (
    <AdminShell staff={staff} active={{ kind: "about", section: slug }} crumbs={["About Ramky", title]}>
      <div className="space-y-6">
        <AboutContentEditor key={slug} slug={slug} label={title} />
        {slug === "management-systems" && (<>
          <HomeListEditor table="management_system_items" filter={{ key: "kind", value: "certificate" }} title="ISO Certificates" itemName="Certificate" icon={ShieldCheck}
            help="Each card shows the standard, title, summary, focus areas and a certificate to view" doc={PDF}
            fields={[
              { key: "standard", label: "Standard", required: true, max: 60, placeholder: "ISO 9001:2015" },
              { key: "title", label: "Title", required: true, max: 120 },
              { key: "icon", label: "Icon", options: [{ value: "quality", label: "Quality (award)" }, { value: "safety", label: "Safety (helmet)" }, { value: "environment", label: "Environment (leaf)" }] },
              { key: "cta", label: "Button text", max: 60, placeholder: "View Certificate" },
              { key: "summary", label: "Summary", long: true, max: 1200 },
              { key: "focus_areas", label: "Focus areas (separate with commas)", long: true, max: 600 },
            ]} />
          <HomeListEditor table="management_system_items" filter={{ key: "kind", value: "policy" }} title="Policies" itemName="Policy" icon={FileText}
            help="Each policy card shows a title, summary and a document to view" doc={PDF}
            fields={[
              { key: "title", label: "Title", required: true, max: 120 },
              { key: "cta", label: "Button text", max: 60, placeholder: "View Policy" },
              { key: "doc_page", label: "Open at page (optional)", max: 4, placeholder: "1" },
              { key: "summary", label: "Summary", long: true, max: 1200 },
            ]} />
        </>)}
        {slug === "strength-strategies" && (
          <HomeListEditor table="strength_pillars" title="Pillars" itemName="Pillar" icon={Layers} withImage imageOptional
            help="Each card shows an optional image, a heading and a description. Start a line with 'Strategic focus:' to highlight it."
            fields={[
              { key: "title", label: "Heading", required: true, max: 160 },
              { key: "body", label: "Description (one paragraph per line)", long: true, max: 4000 },
            ]} />
        )}
      </div>
    </AdminShell>
  );
}
