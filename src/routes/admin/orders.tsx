import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Admin Orders — ShopEase" }] }),
  component: AdminOrders,
});

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

function AdminOrders() {
  const qc = useQueryClient();
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => (await supabase.from("orders").select("*").order("created_at", { ascending: false })).data || [],
  });

  async function setStatus(id: string, status: string) {
    await supabase.from("orders").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  }

  return (
    <div className="p-5 pb-8">
      <h2 className="text-2xl font-bold">Orders</h2>
      <p className="text-sm text-muted-foreground">{orders.length} total</p>

      <div className="mt-4 space-y-3">
        {(orders as any[]).map((o) => (
          <div key={o.id} className="rounded-2xl bg-card border p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground">#{o.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm font-semibold tabular">+91 {o.user_phone}</p>
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("en-IN")}</p>
              </div>
              <span className="font-bold tabular">{inr(o.total)}</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {(o.items as any[]).length} item(s) · {o.payment_method === "emi" ? `EMI ${o.emi_plan_months}m` : "COD"}
            </div>
            <select
              value={o.status}
              onChange={(e) => setStatus(o.id, e.target.value)}
              className="mt-3 w-full rounded-lg border bg-background p-2 text-sm font-semibold capitalize"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
