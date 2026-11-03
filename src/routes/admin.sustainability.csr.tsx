import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/sustainability/csr")({
  beforeLoad: () => { throw redirect({ to: "/admin/company/csr" }); },
});
