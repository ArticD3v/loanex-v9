import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Admin Users — ShopEase" }] }),
  component: AdminUsers,
});

function AdminUsers() {
  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [{ data: orders }, { data: emis }] = await Promise.all([
        supabase.from("orders").select("user_phone, total, created_at"),
        supabase.from("emis").select("user_phone, principal, status"),
      ]);
      const map = new Map<string, { phone: string; orders: number; spent: number; activeEmis: number; last: string }>();
      (orders || []).forEach((o: any) => {
        const u = map.get(o.user_phone) || { phone: o.user_phone, orders: 0, spent: 0, activeEmis: 0, last: o.created_at };
        u.orders += 1;
        u.spent += Number(o.total);
        if (o.created_at > u.last) u.last = o.created_at;
        map.set(o.user_phone, u);
      });
      (emis || []).forEach((e: any) => {
        const u = map.get(e.user_phone) || { phone: e.user_phone, orders: 0, spent: 0, activeEmis: 0, last: "" };
        if (e.status === "active") u.activeEmis += 1;
        map.set(e.user_phone, u);
      });
      return [...map.values()].sort((a, b) => b.spent - a.spent);
    },
  });

  return (
    <div className="p-5 pb-8">
      <h2 className="text-2xl font-bold">Users</h2>
      <p className="text-sm text-muted-foreground">{users.length} total</p>

      <div className="mt-4 space-y-2">
        {users.map((u) => (
          <div key={u.phone} className="flex items-center gap-3 rounded-xl bg-card border p-3">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              {u.phone.slice(-2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm tabular">+91 {u.phone}</p>
              <p className="text-xs text-muted-foreground">{u.orders} orders · {u.activeEmis} active EMIs</p>
            </div>
            <div className="text-right">
              <p className="font-bold tabular">{inr(u.spent)}</p>
              <p className="text-[10px] text-muted-foreground">spent</p>
            </div>
          </div>
        ))}
        {users.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No users yet</p>}
      </div>
    </div>
  );
}
