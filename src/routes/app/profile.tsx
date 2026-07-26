import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/MobileShell";
import { getSession, clearSession } from "@/lib/session";
import { Package, Wallet, MapPin, HelpCircle, LogOut, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/app/profile")({
  ssr: false,
  head: () => ({ meta: [{ title: "Profile — ShopEase" }] }),
  component: Profile,
});

function Profile() {
  const nav = useNavigate();
  const s = getSession();

  return (
    <div className="pb-8">
      <PageHeader title="Profile" />

      <div className="mx-5 rounded-2xl bg-card border p-4 flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
          {s?.phone.slice(-2) || "U"}
        </div>
        <div>
          <p className="font-bold">Customer</p>
          <p className="text-sm text-muted-foreground tabular">+91 {s?.phone}</p>
        </div>
      </div>

      <div className="mx-5 mt-5 rounded-2xl bg-card border divide-y">
        <RowLink to="/app/orders" icon={Package} label="My Orders" />
        <RowLink to="/app/emis" icon={Wallet} label="My EMIs" />
        <RowItem icon={MapPin} label="Addresses" />
        <RowItem icon={HelpCircle} label="Help & Support" />
      </div>

      <button
        onClick={() => { clearSession(); nav({ to: "/" }); }}
        className="mt-5 mx-5 w-[calc(100%-40px)] h-12 rounded-xl border border-destructive/40 text-destructive font-semibold flex items-center justify-center gap-2"
      >
        <LogOut className="size-4" /> Sign out
      </button>

      <p className="mt-6 text-center text-xs text-muted-foreground">ShopEase v1.0</p>
    </div>
  );
}

function RowLink({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link to={to as any} className="flex items-center gap-3 p-4">
      <Icon className="size-5 text-primary" />
      <span className="flex-1 font-medium text-sm">{label}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </Link>
  );
}

function RowItem({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <Icon className="size-5 text-primary" />
      <span className="flex-1 font-medium text-sm">{label}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </div>
  );
}
