import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/media")({
  beforeLoad: () => { throw redirect({ to: "/admin/company/media" }); },
});
