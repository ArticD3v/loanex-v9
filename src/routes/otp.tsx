import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ArrowLeft } from "lucide-react";
import { setSession } from "@/lib/session";

export const Route = createFileRoute("/otp")({
  ssr: false,
  head: () => ({ meta: [{ title: "Verify OTP — ShopEase" }] }),
  component: Otp,
});

function Otp() {
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => {
    const p = sessionStorage.getItem("pending_phone") || "";
    if (!p) { nav({ to: "/" }); return; }
    setPhone(p);
    setTimeout(() => refs[0].current?.focus(), 100);
  }, [nav]);

  function onChange(i: number, v: string) {
    const c = v.replace(/\D/g, "").slice(0, 1);
    const next = [...digits];
    next[i] = c;
    setDigits(next);
    setError(null);
    if (c && i < 3) refs[i + 1].current?.focus();
    if (next.every((d) => d !== "")) verify(next.join(""));
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs[i - 1].current?.focus();
  }

  function verify(code: string) {
    if (code === "0000") {
      setSession({ phone, role: "admin" });
      sessionStorage.removeItem("pending_phone");
      nav({ to: "/admin" });
    } else if (code === "1111") {
      setSession({ phone, role: "customer" });
      sessionStorage.removeItem("pending_phone");
      nav({ to: "/app" });
    } else {
      setError("Invalid OTP. Try 0000 (admin) or 1111 (customer).");
      setDigits(["", "", "", ""]);
      refs[0].current?.focus();
    }
  }

  return (
    <MobileShell>
      <div className="flex-1 flex flex-col px-6 pt-6 pb-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-fit">
          <ArrowLeft className="size-4" /> Back
        </Link>

        <div className="mt-8">
          <h1 className="text-2xl font-bold tracking-tight">Verify your number</h1>
          <p className="text-muted-foreground mt-1">
            We sent a 4-digit code to <span className="font-medium text-foreground">+91 {phone}</span>
          </p>
        </div>

        <div className="mt-10 flex gap-3 justify-center">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              value={d}
              onChange={(e) => onChange(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              inputMode="numeric"
              className="w-16 h-16 rounded-xl border-2 border-input bg-card text-center text-2xl font-bold font-mono focus:border-primary focus:outline-none"
              maxLength={1}
            />
          ))}
        </div>

        {error && <p className="mt-4 text-center text-sm text-destructive">{error}</p>}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Didn't get it? <button className="text-primary font-medium">Resend in 30s</button>
        </p>
      </div>
    </MobileShell>
  );
}
