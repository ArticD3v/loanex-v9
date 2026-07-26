import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { MobileShell } from "@/components/MobileShell";
import { BottomNav } from "@/components/BottomNav";
import { getSession } from "@/lib/session";

export const Route = createFileRoute("/app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const nav = useNavigate();
  useEffect(() => {
    const s = getSession();
    if (!s) nav({ to: "/" });
    else if (s.role === "admin") nav({ to: "/admin" });
  }, [nav]);

  return (
    <MobileShell>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Outlet />
      </div>
      <BottomNav />
    </MobileShell>
  );
}
