import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/MobileShell";
import { inr } from "@/lib/format";
import { Search, Bell, Zap } from "lucide-react";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Home — ShopEase" }] }),
  component: Home,
});

const categories = [
  { name: "Electronics", emoji: "📱", color: "bg-[oklch(0.92_0.05_50)]" },
  { name: "Fashion", emoji: "👕", color: "bg-[oklch(0.92_0.05_20)]" },
  { name: "Home", emoji: "🏠", color: "bg-[oklch(0.92_0.05_145)]" },
];

function Home() {
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="pb-6">
      <PageHeader
        title="Hi there 👋"
        subtitle="What are we shopping for today?"
        right={
          <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <Bell className="size-4" />
          </button>
        }
      />

      <div className="px-5">
        <Link to="/app/categories" className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-muted-foreground">
          <Search className="size-4" />
          <span className="text-sm">Search products, brands…</span>
        </Link>
      </div>

      {/* Hero banner */}
      <div className="mx-5 mt-5 rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.55_0.18_25)] text-primary-foreground p-5 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold">
            <Zap className="size-3" /> NO-COST EMI
          </div>
          <h2 className="mt-2 text-xl font-bold leading-tight">Shop now,<br />pay in easy installments</h2>
          <p className="text-sm text-primary-foreground/80 mt-1">3 / 6 / 9 / 12 month plans</p>
          <Link to="/app/categories" className="mt-3 inline-block rounded-full bg-white text-primary px-4 py-1.5 text-sm font-semibold">
            Shop now
          </Link>
        </div>
        <div className="absolute -right-6 -bottom-6 text-8xl opacity-20">🛍️</div>
      </div>

      {/* Categories */}
      <section className="mt-6 px-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold">Categories</h3>
          <Link to="/app/categories" className="text-xs text-primary font-semibold">See all</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((c) => (
            <Link
              key={c.name}
              to="/app/categories"
              search={{ cat: c.name } as any}
              className={`${c.color} rounded-2xl p-3 flex flex-col items-center gap-1`}
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-xs font-semibold">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="mt-6 px-5">
        <h3 className="text-base font-bold mb-3">Trending now</h3>
        <div className="grid grid-cols-2 gap-3">
          {products.slice(0, 6).map((p: any) => (
            <Link key={p.id} to="/app/product/$id" params={{ id: p.id }} className="rounded-2xl bg-card border overflow-hidden">
              <div className="aspect-square bg-secondary overflow-hidden">
                {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
              </div>
              <div className="p-3">
                <p className="text-xs text-muted-foreground">{p.category}</p>
                <p className="text-sm font-semibold line-clamp-1">{p.name}</p>
                <p className="mt-1 text-base font-bold tabular">{inr(p.price)}</p>
                <p className="text-[10px] text-success font-semibold mt-0.5">EMI from {inr(Math.round(p.price / 12))}/mo</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
