import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { cart } from "@/lib/cart";
import { inr, emiMonthly, EMI_OPTIONS } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { getSession } from "@/lib/session";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/app/checkout")({
  ssr: false,
  head: () => ({ meta: [{ title: "Checkout — ShopEase" }] }),
  component: Checkout,
});

function Checkout() {
  const nav = useNavigate();
  const [items] = useState(() => cart.get());
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const [method, setMethod] = useState<"cod" | "emi">("cod");
  const [months, setMonths] = useState<number>(6);
  const [address, setAddress] = useState("");
  const [placing, setPlacing] = useState(false);
  const [done, setDone] = useState(false);

  async function place() {
    const s = getSession();
    if (!s) return nav({ to: "/" });
    if (!address.trim()) return;
    setPlacing(true);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_phone: s.phone,
        items: items as any,
        total,
        status: "confirmed",
        payment_method: method,
        emi_plan_months: method === "emi" ? months : null,
      })
      .select()
      .single();

    if (error || !order) {
      alert(error?.message || "Order failed");
      setPlacing(false);
      return;
    }

    if (method === "emi") {
      await supabase.from("emis").insert({
        order_id: order.id,
        user_phone: s.phone,
        principal: total,
        months,
        monthly_amount: emiMonthly(total, months),
      });
    }

    cart.clear();
    setDone(true);
    setPlacing(false);
  }

  if (done) {
    return (
      <MobileShell>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mb-4">
            <CheckCircle2 className="size-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold">Order placed!</h1>
          <p className="text-muted-foreground mt-2">Your order is confirmed. {method === "emi" && "Your EMI plan is now active."}</p>
          <div className="mt-8 w-full space-y-2">
            <button onClick={() => nav({ to: "/app/orders" })} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold">
              View my orders
            </button>
            <button onClick={() => nav({ to: "/app" })} className="w-full h-12 rounded-xl border font-semibold">
              Continue shopping
            </button>
          </div>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="flex-1 flex flex-col overflow-y-auto pb-32">
        <header className="px-5 pt-6 pb-4 flex items-center gap-3">
          <button onClick={() => nav({ to: "/app/cart" })} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="size-4" />
          </button>
          <h1 className="text-xl font-bold">Checkout</h1>
        </header>

        <section className="px-5">
          <h2 className="text-sm font-bold mb-2">Delivery address</h2>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            placeholder="House / Flat, Street, City, PIN"
            className="w-full rounded-xl border border-input bg-card p-3 text-sm outline-none focus:border-primary resize-none"
          />
        </section>

        <section className="px-5 mt-5">
          <h2 className="text-sm font-bold mb-2">Payment method</h2>
          <div className="space-y-2">
            <MethodCard
              active={method === "cod"}
              onClick={() => setMethod("cod")}
              title="Cash on Delivery"
              desc="Pay when your order arrives"
            />
            <MethodCard
              active={method === "emi"}
              onClick={() => setMethod("emi")}
              title="Easy EMI"
              desc="Split into monthly payments"
            />
          </div>

          {method === "emi" && (
            <div className="mt-3 rounded-2xl bg-accent/50 border border-accent p-4">
              <p className="text-xs font-semibold mb-2">Choose EMI tenure</p>
              <div className="flex gap-2">
                {EMI_OPTIONS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMonths(m)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border ${
                      months === m ? "bg-primary text-primary-foreground border-primary" : "bg-card"
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
              <div className="mt-3 flex justify-between items-baseline">
                <span className="text-xs text-muted-foreground">Monthly payment</span>
                <span className="text-xl font-bold tabular text-primary">{inr(emiMonthly(total, months))}/mo</span>
              </div>
            </div>
          )}
        </section>

        <section className="px-5 mt-5">
          <h2 className="text-sm font-bold mb-2">Order summary</h2>
          <div className="rounded-2xl bg-card border p-4 space-y-2 text-sm">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between">
                <span className="text-muted-foreground truncate mr-2">{i.name} × {i.qty}</span>
                <span className="tabular font-semibold shrink-0">{inr(i.price * i.qty)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
              <span>Total</span><span className="tabular">{inr(total)}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 p-4 border-t bg-background/95 backdrop-blur">
        <button
          onClick={place}
          disabled={placing || !address.trim() || items.length === 0}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50"
        >
          {placing ? "Placing…" : `Place order · ${inr(total)}`}
        </button>
      </div>
    </MobileShell>
  );
}

function MethodCard({ active, onClick, title, desc }: { active: boolean; onClick: () => void; title: string; desc: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border-2 p-3 flex items-center gap-3 ${
        active ? "border-primary bg-accent/40" : "border-border bg-card"
      }`}
    >
      <div className={`w-4 h-4 rounded-full border-2 ${active ? "border-primary" : "border-muted-foreground"} flex items-center justify-center`}>
        {active && <div className="w-2 h-2 rounded-full bg-primary" />}
      </div>
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </button>
  );
}
