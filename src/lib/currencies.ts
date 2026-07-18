// Curated currency list for the admin "Appearance" page. Deliberately a
// fixed set (not free text) so formatCurrency() in utils.ts always gets a
// valid ISO 4217 code that Intl.NumberFormat can render correctly.

export type CurrencyOption = { code: string; label: string };

export const CURRENCIES: CurrencyOption[] = [
  { code: "USD", label: "US Dollar ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "British Pound (£)" },
  { code: "NPR", label: "Nepalese Rupee (Rs)" },
  { code: "INR", label: "Indian Rupee (₹)" },
  { code: "JPY", label: "Japanese Yen (¥)" },
  { code: "AUD", label: "Australian Dollar (A$)" },
  { code: "CAD", label: "Canadian Dollar (C$)" },
  { code: "CHF", label: "Swiss Franc (CHF)" },
  { code: "AED", label: "UAE Dirham (AED)" },
];

export function isKnownCurrency(code: string): boolean {
  return CURRENCIES.some((c) => c.code === code);
}
