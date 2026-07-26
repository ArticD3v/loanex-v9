import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { Smartphone, ShoppingBag, Wallet } from "lucide-react";
import { getSession } from "@/lib/session";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ShopEase — Shop & EMI in one app" },
      { name: "description", content: "Sign in to shop, pay in easy EMIs, and manage your orders." },
      { property: "og:title", content: "ShopEase — Shop & EMI" },
      { property: "og:description", content: "Shop & pay in easy monthly EMIs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (s?.role === "admin") nav({ to: "/admin" });
    else if (s?.role === "customer") nav({ to: "/app" });
  }, [nav]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) return;
    setLoading(true);
    sessionStorage.setItem("pending_phone", phone);
    setTimeout(() => nav({ to: "/otp" }), 400);
  }

  return (
    <MobileShell>
      <div className="flex-1 flex flex-col px-6 pt-16 pb-8">
        <div className="mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-5">
            <ShoppingBag className="size-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight leading-tight">
            Shop now.<br />Pay in easy EMIs.
          </h1>
          <p className="text-muted-foreground mt-2">Sign in with your mobile number to continue.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-foreground/80">Mobile number</span>
            <div className="mt-1.5 flex items-center rounded-xl border border-input bg-card px-3 focus-within:ring-2 focus-within:ring-ring">
              <Smartphone className="size-4 text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground mr-2">+91</span>
              <input
                inputMode="numeric"
                autoFocus
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="98765 43210"
                className="flex-1 bg-transparent outline-none py-3 text-base tabular"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading || phone.length < 10}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-50 transition-opacity"
          >
            {loading ? "Sending OTP…" : "Send OTP"}
          </button>
        </form>

        <div className="mt-8 rounded-xl bg-accent/60 border border-accent p-4 text-sm">
          <p className="font-semibold text-accent-foreground mb-1">Demo OTPs</p>
          <p className="text-accent-foreground/80"><span className="font-mono font-semibold">0000</span> → Admin dashboard</p>
          <p className="text-accent-foreground/80"><span className="font-mono font-semibold">1111</span> → Customer app</p>
        </div>

        <div className="mt-auto pt-8 grid grid-cols-2 gap-3">
          <Feature icon={ShoppingBag} label="10,000+ products" />
          <Feature icon={Wallet} label="Flexible EMIs" />
        </div>
      </div>
    </MobileShell>
  );
}

function Feature({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="rounded-xl border bg-card p-3 flex items-center gap-2">
      <Icon className="size-4 text-primary" />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
