import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/MobileShell";
import { inr } from "@/lib/format";
import { Search } from "lucide-react";

type Search = { cat?: string };

export const Route = createFileRoute("/app/categories")({
  head: () => ({ meta: [{ title: "Shop — ShopEase" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({ cat: typeof s.cat === "string" ? s.cat : undefined }),
  component: Categories,
});

const CATS = ["All", "Electronics", "Fashion", "Home"];

function Categories() {
  const { cat } = Route.useSearch();
  const nav = Route.useNavigate();
  const [q, setQ] = useState("");
  const active = cat || "All";

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    return (products as any[]).filter((p) => {
      if (active !== "All" && p.category !== active) return false;
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [products, active, q]);

  return (
    <div className="pb-6">
      <PageHeader title="Shop" subtitle={`${filtered.length} products`} />
      <div className="px-5">
        <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="bg-transparent flex-1 outline-none text-sm"
          />
        </div>
      </div>

      <div className="px-5 mt-4 flex gap-2 overflow-x-auto pb-1 -mx-1 px-6">
        {CATS.map((c) => {
          const isActive = c === active;
          return (
            <button
              key={c}
              onClick={() => nav({ search: { cat: c === "All" ? undefined : c } })}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border ${
                isActive ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="mt-4 px-5 grid grid-cols-2 gap-3">
        {filtered.map((p) => (
          <Link key={p.id} to="/app/product/$id" params={{ id: p.id }} className="rounded-2xl bg-card border overflow-hidden">
            <div className="aspect-square bg-secondary overflow-hidden">
              {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
            </div>
            <div className="p-3">
              <p className="text-xs text-muted-foreground">{p.category}</p>
              <p className="text-sm font-semibold line-clamp-1">{p.name}</p>
              <p className="mt-1 text-base font-bold tabular">{inr(p.price)}</p>
              <p className="text-[10px] text-success font-semibold mt-0.5">EMI {inr(Math.round(p.price / 12))}/mo</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
