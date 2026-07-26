import { createFileRoute, Outlet, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { MobileShell } from "@/components/MobileShell";
import { getSession, clearSession } from "@/lib/session";
import { LayoutDashboard, Package, ShoppingBag, Wallet, Users, LogOut } from "lucide-react";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/emis", label: "EMIs", icon: Wallet },
  { to: "/admin/users", label: "Users", icon: Users },
];

function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const s = getSession();
    if (!s) navigate({ to: "/" });
    else if (s.role !== "admin") navigate({ to: "/app" });
  }, [navigate]);

  return (
    <MobileShell>
      <div className="bg-foreground text-background px-5 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider opacity-60">Admin</p>
            <h1 className="text-lg font-bold">ShopEase Console</h1>
          </div>
          <button
            onClick={() => { clearSession(); navigate({ to: "/" }); }}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Outlet />
      </div>

      <nav className="sticky bottom-0 border-t bg-background/95 backdrop-blur pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 px-2 grid grid-cols-5 gap-1">
        {nav.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to as any}
              className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[10px] font-medium ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>
    </MobileShell>
  );
}
