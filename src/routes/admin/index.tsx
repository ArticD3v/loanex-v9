import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/format";
import { TrendingUp, ShoppingBag, Wallet, Package } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard — ShopEase" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [p, o, e] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total, user_phone, status, created_at"),
        supabase.from("emis").select("principal, status"),
      ]);
      const orders = o.data || [];
      const emis = e.data || [];
      const revenue = orders.reduce((s: number, x: any) => s + Number(x.total), 0);
      const emiOutstanding = emis.filter((x: any) => x.status === "active").reduce((s: number, x: any) => s + Number(x.principal), 0);
      const users = new Set(orders.map((x: any) => x.user_phone)).size;
      return {
        products: p.count ?? 0,
        orders: orders.length,
        revenue,
        emiOutstanding,
        users,
        recent: orders.slice().sort((a: any, b: any) => (b.created_at > a.created_at ? 1 : -1)).slice(0, 5),
      };
    },
  });

  return (
    <div className="p-5 pb-8 space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Overview</h2>
        <p className="text-sm text-muted-foreground">Today's snapshot</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat icon={TrendingUp} label="Revenue" value={inr(stats?.revenue || 0)} tone="primary" />
        <Stat icon={ShoppingBag} label="Orders" value={String(stats?.orders || 0)} tone="warning" />
        <Stat icon={Wallet} label="EMI outstanding" value={inr(stats?.emiOutstanding || 0)} tone="success" />
        <Stat icon={Package} label="Products" value={String(stats?.products || 0)} tone="muted" />
      </div>

      <div>
        <h3 className="text-base font-bold mb-2">Recent orders</h3>
        <div className="rounded-2xl bg-card border divide-y">
          {(stats?.recent || []).length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No orders yet</div>}
          {(stats?.recent as any[] || []).map((o: any) => (
            <div key={o.created_at} className="p-3 flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold tabular">+91 {o.user_phone}</p>
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("en-IN")}</p>
              </div>
              <span className="font-bold tabular">{inr(o.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: "primary" | "success" | "warning" | "muted" }) {
  const toneMap = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-[oklch(0.5_0.15_60)]",
    muted: "bg-secondary text-foreground",
  };
  return (
    <div className="rounded-2xl bg-card border p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${toneMap[tone]}`}>
        <Icon className="size-4" />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold tabular">{value}</p>
    </div>
  );
}
