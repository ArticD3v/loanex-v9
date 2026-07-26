import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/MobileShell";
import { cart, type CartItem } from "@/lib/cart";
import { inr } from "@/lib/format";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/app/cart")({
  head: () => ({ meta: [{ title: "Cart — ShopEase" }] }),
  component: Cart,
});

function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const nav = useNavigate();

  useEffect(() => {
    const sync = () => setItems(cart.get());
    sync();
    window.addEventListener("cart:changed", sync);
    return () => window.removeEventListener("cart:changed", sync);
  }, []);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <PageHeader title="Cart" />
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
            <ShoppingBag className="size-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-bold">Your cart is empty</h2>
          <p className="text-sm text-muted-foreground mt-1">Browse products and add favourites to your cart.</p>
          <Link to="/app/categories" className="mt-6 rounded-xl bg-primary text-primary-foreground px-6 py-3 font-semibold">
            Start shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32">
      <PageHeader title="Cart" subtitle={`${items.length} item${items.length > 1 ? "s" : ""}`} />

      <div className="px-5 space-y-3">
        {items.map((i) => (
          <div key={i.id} className="flex gap-3 bg-card border rounded-2xl p-3">
            <div className="w-20 h-20 rounded-xl bg-secondary overflow-hidden shrink-0">
              {i.image_url && <img src={i.image_url} alt={i.name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm line-clamp-2">{i.name}</p>
              <p className="text-base font-bold tabular mt-1">{inr(i.price)}</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="inline-flex items-center rounded-full border">
                  <button onClick={() => cart.setQty(i.id, i.qty - 1)} className="w-7 h-7 flex items-center justify-center">
                    <Minus className="size-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold tabular">{i.qty}</span>
                  <button onClick={() => cart.setQty(i.id, i.qty + 1)} className="w-7 h-7 flex items-center justify-center">
                    <Plus className="size-3" />
                  </button>
                </div>
                <button onClick={() => cart.remove(i.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 mx-5 rounded-2xl bg-card border p-4 space-y-2 text-sm">
        <Row label="Subtotal" value={inr(total)} />
        <Row label="Delivery" value="FREE" success />
        <div className="border-t pt-2 mt-2 flex justify-between font-bold text-base">
          <span>Total</span><span className="tabular">{inr(total)}</span>
        </div>
      </div>

      <div className="fixed left-0 right-0 bottom-0 mx-auto max-w-[430px] p-4 border-t bg-background/95 backdrop-blur">
        <button
          onClick={() => nav({ to: "/app/checkout" })}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold"
        >
          Checkout · {inr(total)}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, success }: { label: string; value: string; success?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`tabular font-semibold ${success ? "text-success" : ""}`}>{value}</span>
    </div>
  );
}
