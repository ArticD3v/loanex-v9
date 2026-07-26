import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getSession } from "@/lib/session";
import { PageHeader } from "@/components/MobileShell";
import { inr } from "@/lib/format";
import { Package } from "lucide-react";

export const Route = createFileRoute("/app/orders")({
  ssr: false,
  head: () => ({ meta: [{ title: "My Orders — ShopEase" }] }),
  component: Orders,
});

function Orders() {
  const phone = getSession()?.phone || "";
  const { data: orders = [] } = useQuery({
    queryKey: ["orders", phone],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").eq("user_phone", phone).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!phone,
  });

  return (
    <div className="pb-8">
      <PageHeader title="My Orders" subtitle={`${orders.length} total`} />
      {orders.length === 0 ? (
        <div className="px-8 py-16 text-center">
          <Package className="size-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        <div className="px-5 space-y-3">
          {(orders as any[]).map((o) => (
            <div key={o.id} className="rounded-2xl bg-card border p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-muted-foreground">Order #{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  o.status === "delivered" ? "bg-success/15 text-success" : "bg-warning/20 text-[oklch(0.5_0.15_60)]"
                }`}>{o.status}</span>
              </div>
              <div className="mt-2 space-y-0.5">
                {(o.items as any[]).slice(0, 2).map((i: any, idx: number) => (
                  <p key={idx} className="text-sm truncate">{i.name} × {i.qty}</p>
                ))}
                {(o.items as any[]).length > 2 && <p className="text-xs text-muted-foreground">+{(o.items as any[]).length - 2} more</p>}
              </div>
              <div className="mt-2 flex justify-between items-baseline pt-2 border-t">
                <span className="text-xs text-muted-foreground uppercase">{o.payment_method === "emi" ? `EMI ${o.emi_plan_months}m` : "COD"}</span>
                <span className="font-bold tabular">{inr(o.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
