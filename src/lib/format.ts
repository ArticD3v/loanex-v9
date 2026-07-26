export function inr(n: number | string): string {
  const v = typeof n === "string" ? Number(n) : n;
  if (!isFinite(v)) return "₹0";
  return "₹" + v.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

/** Simple EMI (flat, no interest for demo). */
export function emiMonthly(principal: number, months: number): number {
  if (months <= 0) return principal;
  return Math.round(principal / months);
}

export const EMI_OPTIONS = [3, 6, 9, 12] as const;
