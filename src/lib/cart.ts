export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  qty: number;
};

const KEY = "app_cart_v1";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:changed"));
}

export const cart = {
  get: read,
  add(item: Omit<CartItem, "qty">, qty = 1) {
    const items = read();
    const found = items.find((i) => i.id === item.id);
    if (found) found.qty += qty;
    else items.push({ ...item, qty });
    write(items);
  },
  setQty(id: string, qty: number) {
    let items = read();
    if (qty <= 0) items = items.filter((i) => i.id !== id);
    else items = items.map((i) => (i.id === id ? { ...i, qty } : i));
    write(items);
  },
  remove(id: string) {
    write(read().filter((i) => i.id !== id));
  },
  clear() {
    write([]);
  },
  total(): number {
    return read().reduce((s, i) => s + i.price * i.qty, 0);
  },
  count(): number {
    return read().reduce((s, i) => s + i.qty, 0);
  },
};
