import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/capabilities/sustainability")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/admin/sustainability/section" });
  },
});
