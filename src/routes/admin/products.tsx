import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/format";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Admin Products — ShopEase" }] }),
  component: AdminProducts,
});

type Draft = { id?: string; name: string; price: string; category: string; stock: string; image_url: string; description: string };
const empty: Draft = { name: "", price: "", category: "Electronics", stock: "0", image_url: "", description: "" };

function AdminProducts() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Draft | null>(null);
  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await supabase.from("products").select("*").order("created_at", { ascending: false })).data || [],
  });

  async function save() {
    if (!editing) return;
    const payload = {
      name: editing.name,
      price: Number(editing.price),
      category: editing.category,
      stock: Number(editing.stock),
      image_url: editing.image_url || null,
      description: editing.description || null,
    };
    if (editing.id) await supabase.from("products").update(payload).eq("id", editing.id);
    else await supabase.from("products").insert(payload);
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  async function del(id: string) {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  return (
    <div className="p-5 pb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-sm text-muted-foreground">{products.length} total</p>
        </div>
        <button onClick={() => setEditing(empty)} className="rounded-full bg-primary text-primary-foreground w-10 h-10 flex items-center justify-center">
          <Plus className="size-5" />
        </button>
      </div>

      <div className="space-y-2">
        {(products as any[]).map((p) => (
          <div key={p.id} className="flex gap-3 rounded-xl bg-card border p-3">
            <div className="w-14 h-14 rounded-lg bg-secondary overflow-hidden shrink-0">
              {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.category} · stock {p.stock}</p>
              <p className="text-sm font-bold tabular">{inr(p.price)}</p>
            </div>
            <div className="flex flex-col gap-1">
              <button onClick={() => setEditing({ ...p, price: String(p.price), stock: String(p.stock), image_url: p.image_url || "", description: p.description || "" })} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <Pencil className="size-3.5" />
              </button>
              <button onClick={() => del(p.id)} className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-end justify-center" onClick={() => setEditing(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[430px] bg-background rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{editing.id ? "Edit product" : "New product"}</h3>
              <button onClick={() => setEditing(null)}><X className="size-5" /></button>
            </div>
            <div className="space-y-3">
              <Field label="Name"><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full rounded-lg border p-2.5 text-sm bg-card" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price ₹"><input inputMode="numeric" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value.replace(/\D/g, "") })} className="w-full rounded-lg border p-2.5 text-sm tabular bg-card" /></Field>
                <Field label="Stock"><input inputMode="numeric" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: e.target.value.replace(/\D/g, "") })} className="w-full rounded-lg border p-2.5 text-sm tabular bg-card" /></Field>
              </div>
              <Field label="Category">
                <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full rounded-lg border p-2.5 text-sm bg-card">
                  <option>Electronics</option><option>Fashion</option><option>Home</option>
                </select>
              </Field>
              <Field label="Image URL"><input value={editing.image_url} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className="w-full rounded-lg border p-2.5 text-sm bg-card" /></Field>
              <Field label="Description"><textarea rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="w-full rounded-lg border p-2.5 text-sm bg-card resize-none" /></Field>
              <button onClick={save} disabled={!editing.name || !editing.price} className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50">
                {editing.id ? "Save changes" : "Add product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs font-medium text-muted-foreground">{label}</span><div className="mt-1">{children}</div></label>;
}
