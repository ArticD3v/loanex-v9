import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MobileShell } from "@/components/MobileShell";
import { inr, emiMonthly, EMI_OPTIONS } from "@/lib/format";
import { cart } from "@/lib/cart";
import { ArrowLeft, ShoppingCart, Zap, ShieldCheck, Truck } from "lucide-react";

export const Route = createFileRoute("/app/product/$id")({
  ssr: false,
  head: () => ({ meta: [{ title: "Product — ShopEase" }] }),
  component: Product,
});

function Product() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const [months, setMonths] = useState<number>(6);

  const { data: p } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (!p) {
    return (
      <MobileShell>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading…</div>
      </MobileShell>
    );
  }

  const monthly = emiMonthly(Number(p.price), months);

  return (
    <MobileShell>
      <div className="flex-1 flex flex-col overflow-y-auto pb-32">
        <div className="relative">
          <div className="aspect-square bg-secondary overflow-hidden">
            {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
          </div>
          <button
            onClick={() => nav({ to: "/app/categories" })}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow"
          >
            <ArrowLeft className="size-5" />
          </button>
          <Link to="/app/cart" className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow">
            <ShoppingCart className="size-5" />
          </Link>
        </div>

        <div className="px-5 pt-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{p.category}</p>
          <h1 className="text-2xl font-bold mt-1">{p.name}</h1>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular">{inr(p.price)}</span>
            <span className="text-sm text-muted-foreground line-through tabular">{inr(Math.round(Number(p.price) * 1.2))}</span>
            <span className="text-sm text-success font-semibold">20% off</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{p.description}</p>

          {/* EMI calculator */}
          <div className="mt-5 rounded-2xl bg-accent/50 border border-accent p-4">
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-primary" />
              <h3 className="font-bold text-sm">EMI Calculator</h3>
            </div>
            <div className="mt-3 flex gap-2">
              {EMI_OPTIONS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMonths(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border ${
                    months === m ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">Monthly payment</span>
              <span className="text-2xl font-bold tabular text-primary">{inr(monthly)}<span className="text-sm text-muted-foreground font-medium">/mo</span></span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">No-cost EMI · {months} months · total {inr(monthly * months)}</p>
          </div>

          {/* Perks */}
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <Perk icon={Truck} label="Free delivery" />
            <Perk icon={ShieldCheck} label="1yr warranty" />
            <Perk icon={Zap} label="Easy return" />
          </div>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur p-4 flex gap-3">
        <button
          onClick={() => {
            cart.add({ id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url });
            nav({ to: "/app/cart" });
          }}
          className="flex-1 h-12 rounded-xl border-2 border-primary text-primary font-semibold"
        >
          Add to cart
        </button>
        <button
          onClick={() => {
            cart.clear();
            cart.add({ id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url });
            nav({ to: "/app/checkout" });
          }}
          className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold"
        >
          Buy now
        </button>
      </div>
    </MobileShell>
  );
}

function Perk({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-2">
      <Icon className="size-4 text-primary" />
      <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
    </div>
  );
}
