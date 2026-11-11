import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pageListQuery } from "@/lib/page-lists.functions";
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
  loader: ({ context }) => context.queryClient.ensureQueryData(pageListQuery("history_milestones")).catch(() => null),
  component: HistoryMilestonesPage,
});

function HistoryMilestonesPage() {
  const { data } = useQuery(pageListQuery("history_milestones"));
  const items = (data ?? []).map((r) => ({ year: r["year"] ?? "", text: r["text"] ?? "" }));
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <HistoryMilestones items={items} />
      <SiteFooter />
    </div>
  );
}