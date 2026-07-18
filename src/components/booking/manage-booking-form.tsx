"use client";

import * as React from "react";
import { Search, Loader2, XCircle, AlertCircle } from "lucide-react";
<<<<<<< HEAD
import { formatUSD } from "@/lib/utils";
import { PaymentMethodSelector } from "@/components/booking/payment-method-selector";
=======
import { formatCurrency } from "@/lib/utils";
import { useSiteContent } from "@/lib/site-content-context";
>>>>>>> feature/admin-appearance-v2

type Reservation = {
  id: string;
  confirmationCode: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPriceUsd: number;
  guestName: string;
  guestEmail: string;
  specialRequests: string | null;
  status: string;
  paymentStatus: string;
  dueUsd: number;
};

export function ManageBookingForm() {
  const { appearance } = useSiteContent();
  const currencyCode = appearance.currency.code;
  const [confirmationCode, setConfirmationCode] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [reservation, setReservation] = React.useState<Reservation | null>(null);
  const [status, setStatus] = React.useState<"idle" | "searching" | "found" | "error">("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [cancelling, setCancelling] = React.useState(false);
  const [confirmCancel, setConfirmCancel] = React.useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setStatus("searching");
    setError(null);
    try {
      const res = await fetch("/api/reservations/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmationCode, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }
      setReservation(data);
      setStatus("found");
    } catch {
      setError("Could not reach the server. Please try again.");
      setStatus("error");
    }
  }

  async function handleCancel() {
    if (!reservation) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/reservations/${reservation.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmationCode: reservation.confirmationCode, email: reservation.guestEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't cancel this reservation.");
        setCancelling(false);
        setConfirmCancel(false);
        return;
      }
      setReservation({ ...reservation, status: "CANCELLED" });
      setConfirmCancel(false);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setCancelling(false);
    }
  }

  function reset() {
    setReservation(null);
    setStatus("idle");
    setError(null);
    setConfirmationCode("");
    setEmail("");
  }

  if (reservation) {
    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-sm border border-stone-200 p-6 dark:border-stone-800">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-bronze-500">{reservation.confirmationCode}</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-mono uppercase tracking-wide ${
                reservation.status === "CANCELLED"
                  ? "bg-stone-200 text-stone-500 dark:bg-stone-800"
                  : reservation.status === "CONFIRMED"
                    ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                    : "bg-bronze-100 text-bronze-700 dark:bg-bronze-400/10 dark:text-bronze-300"
              }`}
            >
              {reservation.status}
            </span>
          </div>

          <h2 className="mt-4 font-display text-2xl">{reservation.roomName}</h2>
          <p className="mt-1 text-sm text-stone-500">
            {reservation.checkIn} → {reservation.checkOut} · {reservation.guests} guest{reservation.guests !== 1 ? "s" : ""}
          </p>

          <div className="mt-4 space-y-1 border-t border-stone-200 pt-4 text-sm dark:border-stone-800">
            <div className="flex justify-between">
              <span className="text-stone-500">Guest</span>
              <span>{reservation.guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Total</span>
              <span className="font-medium">{formatCurrency(reservation.totalPriceUsd, currencyCode)}</span>
            </div>
            {reservation.specialRequests && (
              <div className="pt-2">
                <span className="text-stone-500">Special requests</span>
                <p className="mt-1 text-stone-700 dark:text-stone-300">{reservation.specialRequests}</p>
              </div>
            )}
          </div>

          {reservation.status !== "CANCELLED" && reservation.paymentStatus !== "PAID" && reservation.dueUsd > 0 && (
            <div className="mt-6 rounded-sm border border-bronze-300 bg-bronze-50 p-4 dark:border-bronze-400/30 dark:bg-bronze-400/10">
              <p className="text-sm font-medium">
                {reservation.paymentStatus === "FAILED" ? "Your last payment attempt didn't go through." : "Payment still needed to confirm this reservation."}
              </p>
              <div className="mt-3">
                <PaymentMethodSelector
                  reservationId={reservation.id}
                  email={reservation.guestEmail}
                  amountDueUsd={reservation.dueUsd}
                />
              </div>
            </div>
          )}

          {reservation.status === "CANCELLED" ? (
            <div className="mt-6 flex items-center gap-2 rounded-sm bg-stone-100 p-3 text-sm text-stone-500 dark:bg-stone-900">
              <XCircle className="h-4 w-4 flex-shrink-0" /> This reservation has been cancelled.
            </div>
          ) : confirmCancel ? (
            <div className="mt-6 rounded-sm border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
              <p className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" /> Cancel this reservation? This can&apos;t be undone.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex items-center gap-1.5 rounded-sm bg-red-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                >
                  {cancelling && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {cancelling ? "Cancelling…" : "Yes, cancel it"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmCancel(false)}
                  disabled={cancelling}
                  className="rounded-sm border border-stone-300 px-4 py-2 text-sm hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-white/5"
                >
                  Never mind
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmCancel(true)}
              className="mt-6 text-sm text-red-500 hover:text-red-600"
            >
              Cancel this reservation
            </button>
          )}

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        </div>

        <button type="button" onClick={reset} className="mt-4 text-sm text-stone-500 hover:text-bronze-500">
          ← Look up a different reservation
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label htmlFor="confirmationCode" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Confirmation code
          </label>
          <input
            id="confirmationCode"
            type="text"
            required
            placeholder="YKN-XXXXX"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            className="mt-1 h-11 w-full rounded-sm border border-stone-300 bg-white px-3 text-sm uppercase dark:border-stone-700 dark:bg-stone-900"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Email you booked with
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 h-11 w-full rounded-sm border border-stone-300 bg-white px-3 text-sm dark:border-stone-700 dark:bg-stone-900"
          />
        </div>
        <button
          type="submit"
          disabled={status === "searching"}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-bronze-400 text-sm font-medium text-ink hover:bg-bronze-300 disabled:opacity-60"
        >
          {status === "searching" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {status === "searching" ? "Searching…" : "Find my reservation"}
        </button>
        {status === "error" && error && (
          <p className="flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
          </p>
        )}
      </form>
    </div>
  );
}
