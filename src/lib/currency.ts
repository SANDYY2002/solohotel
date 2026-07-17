/**
 * The site prices everything in USD, but eSewa and Khalti only accept NPR
 * — this converts using an admin-configurable rate (Site Settings →
 * Payments) rather than a hardcoded or live-fetched one. It's deliberately
 * simple: a manually-updated rate is more predictable for a small
 * property than depending on a third-party FX API being up at checkout.
 */
export function usdToNpr(usdAmount: number, rate: number): number {
  return Math.round(usdAmount * rate);
}

/** The amount actually charged online today, honoring the deposit-percentage setting. */
export function depositAmountUsd(totalUsd: number, depositPercentage: number): number {
  return Math.round(totalUsd * (Math.max(0, Math.min(100, depositPercentage)) / 100));
}
