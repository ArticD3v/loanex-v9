import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getSession } from "@/lib/session";
import { PageHeader } from "@/components/MobileShell";
import { inr } from "@/lib/format";
import { Wallet, Calendar, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/app/emis")({
  ssr: false,
  head: () => ({ meta: [{ title: "My EMIs — ShopEase" }] }),
  component: Emis,
});

function Emis() {
  const phone = getSession()?.phone || "";
  const qc = useQueryClient();

  const { data: emis = [] } = useQuery({
    queryKey: ["emis", phone],
    queryFn: async () => {
      const { data, error } = await supabase.from("emis").select("*").eq("user_phone", phone).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!phone,
  });

  async function pay(emi: any) {
    const newPaid = emi.paid_months + 1;
    const done = newPaid >= emi.months;
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + 30);
    await supabase
      .from("emis")
      .update({
        paid_months: newPaid,
        status: done ? "closed" : "active",
        next_due_date: nextDue.toISOString().slice(0, 10),
      })
      .eq("id", emi.id);
    qc.invalidateQueries({ queryKey: ["emis", phone] });
  }

  const active = (emis as any[]).filter((e) => e.status === "active");
  const totalDue = active.reduce((s, e) => s + Number(e.monthly_amount), 0);

  return (
    <div className="pb-8">
      <PageHeader title="My EMIs" subtitle="Track your monthly payments" />

      {active.length > 0 && (
        <div className="mx-5 rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.55_0.18_25)] text-primary-foreground p-5">
          <p className="text-xs opacity-80 uppercase font-semibold tracking-wide">Next due total</p>
          <p className="mt-1 text-3xl font-bold tabular">{inr(totalDue)}</p>
          <p className="mt-1 text-xs opacity-90 flex items-center gap-1">
            <Calendar className="size-3" />
            Due {new Date(active[0].next_due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </p>
        </div>
      )}

      {emis.length === 0 ? (
        <div className="px-8 py-16 text-center">
          <Wallet className="size-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No active EMIs</p>
          <p className="text-xs text-muted-foreground mt-1">Choose EMI at checkout to split payments</p>
        </div>
      ) : (
        <div className="mt-5 px-5 space-y-3">
          {(emis as any[]).map((e) => {
            const progress = (e.paid_months / e.months) * 100;
            const closed = e.status === "closed";
            return (
              <div key={e.id} className="rounded-2xl bg-card border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-muted-foreground">EMI #{e.id.slice(0, 8).toUpperCase()}</p>
                    <p className="mt-0.5 text-lg font-bold tabular">{inr(e.monthly_amount)}<span className="text-xs text-muted-foreground font-medium">/mo</span></p>
                  </div>
                  {closed ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-success/15 text-success flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Closed
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-warning/20 text-[oklch(0.5_0.15_60)]">Active</span>
                  )}
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{e.paid_months} of {e.months} paid</span>
                    <span className="tabular">Principal {inr(e.principal)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                {!closed && (
                  <button
                    onClick={() => pay(e)}
                    className="mt-3 w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
                  >
                    Pay {inr(e.monthly_amount)}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
