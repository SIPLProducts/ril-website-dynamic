import { createFileRoute } from "@tanstack/react-router";
import { HistoryMilestones } from "@/components/site/HistoryMilestones";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

const TITLE = "History & Milestones | Ramky Infrastructure";
const DESCRIPTION =
  "Explore Ramky Infrastructure's defining milestones from its founding in 1994 through three decades of sustainable infrastructure growth.";

export const Route = createFileRoute("/history-milestones")({
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
  component: HistoryMilestonesPage,
});

function HistoryMilestonesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <HistoryMilestones />
      <SiteFooter />
    </div>
  );
}