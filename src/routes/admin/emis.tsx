import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/admin/emis")({
  head: () => ({ meta: [{ title: "Admin EMIs — ShopEase" }] }),
  component: AdminEmis,
});

function AdminEmis() {
  const qc = useQueryClient();
  const { data: emis = [] } = useQuery({
    queryKey: ["admin-emis"],
    queryFn: async () => (await supabase.from("emis").select("*").order("created_at", { ascending: false })).data || [],
  });

  async function markPaid(e: any) {
    const newPaid = e.paid_months + 1;
    const done = newPaid >= e.months;
    await supabase.from("emis").update({ paid_months: newPaid, status: done ? "closed" : "active" }).eq("id", e.id);
    qc.invalidateQueries({ queryKey: ["admin-emis"] });
  }

  async function close(id: string) {
    await supabase.from("emis").update({ status: "closed" }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-emis"] });
  }

  const outstanding = (emis as any[]).filter((e) => e.status === "active").reduce((s, e) => s + Number(e.principal), 0);

  return (
    <div className="p-5 pb-8">
      <h2 className="text-2xl font-bold">EMIs</h2>
      <p className="text-sm text-muted-foreground">Outstanding <span className="font-bold text-foreground tabular">{inr(outstanding)}</span></p>

      <div className="mt-4 space-y-3">
        {(emis as any[]).map((e) => (
          <div key={e.id} className="rounded-2xl bg-card border p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground">#{e.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm font-semibold tabular">+91 {e.user_phone}</p>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${e.status === "closed" ? "bg-success/15 text-success" : "bg-warning/20 text-[oklch(0.5_0.15_60)]"}`}>{e.status}</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <Info label="Principal" value={inr(e.principal)} />
              <Info label="Monthly" value={inr(e.monthly_amount)} />
              <Info label="Progress" value={`${e.paid_months}/${e.months}`} />
            </div>
            {e.status === "active" && (
              <div className="mt-3 flex gap-2">
                <button onClick={() => markPaid(e)} className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">Mark installment paid</button>
                <button onClick={() => close(e.id)} className="h-10 px-3 rounded-lg border text-sm font-semibold">Close</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary p-2">
      <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
      <p className="text-sm font-bold tabular">{value}</p>
    </div>
  );
}
