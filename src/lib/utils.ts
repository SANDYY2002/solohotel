import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names and resolve Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as currency, e.g. formatCurrency(480, "EUR") -> "€480". Falls back to USD for an invalid/unknown code rather than throwing. */
export function formatCurrency(amount: number, currencyCode: string = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  }
}

/** Format an ISO date string as "Sat, 12 Jul 2026". */
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Nights between two ISO date strings, minimum 1. */
export function nightsBetween(checkIn: string, checkOut: string) {
  const inD = new Date(checkIn).getTime();
  const outD = new Date(checkOut).getTime();
  const diff = Math.round((outD - inD) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 1);
}
