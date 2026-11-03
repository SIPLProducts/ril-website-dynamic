import { createFileRoute } from "@tanstack/react-router";
import { managementQuery } from "@/lib/management.functions";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import {
  About,
  Businesses,
  Hero,
  InvestorsCareers,
  Journey,
  Management,
  Projects,
  StatsBand,
  Sustainability,
} from "@/components/site/sections";

const TITLE = "Ramky Infrastructure | Integrated Infrastructure Developer";
const DESCRIPTION =
  "Ramky Infrastructure delivers water, transportation, irrigation, environment, industrial and urban infrastructure across India — towards sustainable growth.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(managementQuery()).catch(() => null),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <StatsBand />
        <About />
        <Journey />
        <Management />
        <Businesses />
        <Projects />
        <Sustainability />
        <InvestorsCareers />
      </main>
      <SiteFooter />
    </div>
  );
}
