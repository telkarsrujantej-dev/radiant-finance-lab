import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { isAdmin } from "@/lib/members.functions";

export const Route = createFileRoute("/_authenticated/_admin")({
  beforeLoad: async () => {
    const { admin } = await isAdmin();
    if (!admin) throw redirect({ to: "/" });
  },
  component: () => <Outlet />,
});
