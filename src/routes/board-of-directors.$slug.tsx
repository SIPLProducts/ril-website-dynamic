import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { managementQuery } from "@/lib/management.functions";
import { ProfileNotFound, ProfileView } from "@/components/site/ProfileView";

export const Route = createFileRoute("/board-of-directors/$slug")({
  loader: async ({ params, context }) => {
    const people = await context.queryClient.ensureQueryData(managementQuery());
    const p = people.find((x) => x.group === "board" && x.slug === params.slug);
    if (!p) throw notFound();
    return { name: p.name, designation: p.designation, intro: Object.values(p.sections).flat()[0] ?? "" };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name}, ${loaderData.designation} | Ramky Infrastructure` : "Board of Directors | Ramky Infrastructure";
    const description = loaderData ? loaderData.intro.slice(0, 155) : "Board of Directors of Ramky Infrastructure Limited.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary" },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  component: Page,
  notFoundComponent: () => <ProfileNotFound group="board" />,
  errorComponent: () => <ProfileNotFound group="board" />,
});

function Page() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(managementQuery());
  const list = data.filter((x) => x.group === "board");
  const p = list.find((x) => x.slug === slug);
  if (!p) return <ProfileNotFound group="board" />;
  return <ProfileView person={p} others={list.filter((x) => x.slug !== slug)} />;
}
