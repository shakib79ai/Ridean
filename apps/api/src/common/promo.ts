/**
 * Promo codes come from PROMO_CODES, e.g. "RIDEAN10:10,WELCOME15:15" (code:percent off).
 * The discount is funded from Ridean's earnings on the booking and is capped at those earnings,
 * so a promo never makes a booking loss-making and never changes what the supplier is owed.
 */
export function promoPercent(code: string | undefined, env = process.env.PROMO_CODES ?? ''): number {
  if (!code) return 0;
  const wanted = code.trim().toUpperCase();
  for (const part of env.split(',')) {
    const [c, pct] = part.split(':').map((x) => x.trim());
    if (c && c.toUpperCase() === wanted) {
      const n = Number(pct);
      return Number.isFinite(n) && n > 0 && n <= 100 ? n : 0;
    }
  }
  return 0;
}

export function promoDiscount(customerPrice: number, earnings: number, percent: number): number {
  if (!percent) return 0;
  return Math.max(0, Math.min(Math.round((customerPrice * percent) / 100), earnings));
}
