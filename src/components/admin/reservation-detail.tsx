"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Mail, Trash2 } from "lucide-react";
import type { Reservation } from "@prisma/client";
import { StatusEditor } from "@/components/admin/status-editor";
import { NotesEditor } from "@/components/admin/notes-editor";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { PhoneLink } from "@/components/shared/phone-link";
import { useToast } from "@/components/admin/toast-provider";
import { useSiteContent } from "@/lib/site-content-context";
import { formatDate, formatCurrency } from "@/lib/utils";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-stone-400">{label}</p>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}

export function ReservationDetail({ reservation, onClose }: { reservation: Reservation; onClose: () => void }) {
  const router = useRouter();
  const showToast = useToast();
  const { appearance } = useSiteContent();
  const currencyCode = appearance.currency.code;
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/reservations/${reservation.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("success", `Reservation ${reservation.confirmationCode} deleted.`);
      onClose();
      router.refresh();
    } catch {
      showToast("error", "Couldn't delete this reservation — try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-bronze-500">{reservation.confirmationCode}</span>
        <StatusEditor
          id={reservation.id}
          status={reservation.status}
          options={["HELD", "CONFIRMED", "CANCELLED"]}
          endpoint="/api/admin/reservations"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Guest">{reservation.guestName}</Field>
        <Field label="Guests">{reservation.guests}</Field>
        <Field label="Email">
          <a href={`mailto:${reservation.guestEmail}`} className="flex items-center gap-1.5 hover:text-bronze-500">
            <Mail className="h-3.5 w-3.5" /> {reservation.guestEmail}
          </a>
        </Field>
        <Field label="Phone">
          {reservation.guestPhone ? <PhoneLink phone={reservation.guestPhone} showIcon={false} /> : <span className="text-stone-400">—</span>}
        </Field>
        <Field label="Room">{reservation.roomName}</Field>
        <Field label="Total">{formatCurrency(reservation.totalPriceUsd, currencyCode)}</Field>
        <Field label="Check-in">{reservation.checkIn}</Field>
        <Field label="Check-out">{reservation.checkOut}</Field>
        {reservation.promoCode && <Field label="Promo code">{reservation.promoCode}</Field>}
        <Field label="Booked">{formatDate(reservation.createdAt.toISOString())}</Field>
        <Field label="Payment">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-mono uppercase tracking-wide ${
              reservation.paymentStatus === "PAID"
                ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                : reservation.paymentStatus === "FAILED"
                  ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                  : "bg-stone-200 text-stone-500 dark:bg-stone-800"
            }`}
          >
            {reservation.paymentStatus}
          </span>
          {reservation.paymentMethod && (
            <span className="ml-2 text-xs text-stone-500">
              via {reservation.paymentMethod}
              {reservation.paymentAmountNpr && ` — NPR ${reservation.paymentAmountNpr.toLocaleString()}`}
            </span>
          )}
        </Field>
      </div>

      {reservation.specialRequests && (
        <Field label="Special requests">
          <p className="whitespace-pre-wrap text-stone-600 dark:text-stone-400">{reservation.specialRequests}</p>
        </Field>
      )}

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-stone-400">Internal notes</p>
        <NotesEditor id={reservation.id} notes={reservation.notes} endpoint="/api/admin/reservations" onSaved={() => router.refresh()} />
      </div>

      <div className="border-t border-stone-200 pt-4 dark:border-stone-800">
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" /> Delete this reservation
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this reservation?"
        description={`This permanently removes ${reservation.confirmationCode} for ${reservation.guestName}. This can't be undone.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
