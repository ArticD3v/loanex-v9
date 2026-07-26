import { Link, useLocation } from "@tanstack/react-router";
import { Home, LayoutGrid, ShoppingCart, Wallet, User } from "lucide-react";
import { useEffect, useState } from "react";
import { cart } from "@/lib/cart";

type NavItem = { to: string; label: string; icon: any; exact?: boolean; badge?: boolean };
const items: NavItem[] = [
  { to: "/app", label: "Home", icon: Home, exact: true },
  { to: "/app/categories", label: "Shop", icon: LayoutGrid },
  { to: "/app/cart", label: "Cart", icon: ShoppingCart, badge: true },
  { to: "/app/emis", label: "EMIs", icon: Wallet },
  { to: "/app/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const [count, setCount] = useState(0);
  useEffect(() => {
    const sync = () => setCount(cart.count());
    sync();
    window.addEventListener("cart:changed", sync);
    return () => window.removeEventListener("cart:changed", sync);
  }, []);

  return (
    <nav className="sticky bottom-0 border-t bg-background/95 backdrop-blur pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 px-2 grid grid-cols-5 gap-1">
      {items.map(({ to, label, icon: Icon, exact, badge }) => {
        const active = exact ? pathname === to : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[11px] font-medium relative transition-colors ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div className="relative">
              <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
              {badge && count > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[9px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
                  {count}
                </span>
              )}
            </div>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
