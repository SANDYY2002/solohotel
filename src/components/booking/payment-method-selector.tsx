"use client";

import * as React from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { formatUSD } from "@/lib/utils";

/**
 * Shown wherever a guest needs to pay for a reservation — right after
 * booking, or later via /manage-booking if they abandoned payment the
 * first time. Both eSewa and Khalti end with the browser navigating away
 * from this site entirely (eSewa via an auto-submitted form POST, Khalti
 * via a redirect to payment_url), so there's no "success" state to show
 * here — the guest lands back on /booking-payment-result afterward.
 */
export function PaymentMethodSelector({
  reservationId,
  email,
  amountDueUsd,
  amountDueNpr,
}: {
  reservationId: string;
  email: string;
  amountDueUsd: number;
  amountDueNpr?: number;
}) {
  const [loading, setLoading] = React.useState<"esewa" | "khalti" | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function payWithEsewa() {
    setLoading("esewa");
    setError(null);
    try {
      const res = await fetch("/api/payments/esewa/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't start eSewa payment.");
        setLoading(null);
        return;
      }
      // eSewa requires a real form POST, not a GET redirect — build one and submit it.
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.formUrl;
      for (const [key, value] of Object.entries(data.fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
    } catch {
      setError("Could not reach the server. Please try again.");
      setLoading(null);
    }
  }

  async function payWithKhalti() {
    setLoading("khalti");
    setError(null);
    try {
      const res = await fetch("/api/payments/khalti/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't start Khalti payment.");
        setLoading(null);
        return;
      }
      window.location.href = data.paymentUrl;
    } catch {
      setError("Could not reach the server. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div>
      <p className="text-sm text-stone-600 dark:text-stone-400">
        Amount due: <span className="font-medium text-stone-900 dark:text-stone-100">{formatUSD(amountDueUsd)}</span>
        {amountDueNpr !== undefined && <span className="text-stone-400"> (≈ NPR {amountDueNpr.toLocaleString()})</span>}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={payWithEsewa}
          disabled={loading !== null}
          className="flex h-14 items-center justify-center gap-2 rounded-sm border border-stone-300 bg-white text-sm font-medium text-stone-800 transition-colors hover:border-green-500 disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
        >
          {loading === "esewa" && <Loader2 className="h-4 w-4 animate-spin" />}
          Pay with <span className="font-display text-green-600">eSewa</span>
        </button>
        <button
          type="button"
          onClick={payWithKhalti}
          disabled={loading !== null}
          className="flex h-14 items-center justify-center gap-2 rounded-sm border border-stone-300 bg-white text-sm font-medium text-stone-800 transition-colors hover:border-purple-500 disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
        >
          {loading === "khalti" && <Loader2 className="h-4 w-4 animate-spin" />}
          Pay with <span className="font-display text-purple-600">Khalti</span>
        </button>
      </div>
      {error && (
        <p className="mt-3 flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
        </p>
      )}
      <p className="mt-3 text-xs text-stone-400">You&apos;ll be redirected to complete payment securely, then brought back here.</p>
    </div>
  );
}
