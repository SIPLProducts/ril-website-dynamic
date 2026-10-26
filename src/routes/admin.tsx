import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Portal | Ramky Infrastructure" },
      { name: "description", content: "Restricted administration area for Ramky Infrastructure website content." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin Portal | Ramky Infrastructure" },
      { property: "og:description", content: "Restricted administration area." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});
