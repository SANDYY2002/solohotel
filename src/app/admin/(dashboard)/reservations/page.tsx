import { prisma } from "@/lib/prisma";
import { StatusSelect } from "@/components/admin/status-select";
import { formatDate, formatUSD } from "@/lib/utils";
import type { Reservation } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminReservationsPage() {
  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl">Reservations</h1>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
        {reservations.length} reservation{reservations.length !== 1 ? "s" : ""} made through the site.
      </p>

      <div className="mt-8 overflow-x-auto rounded-sm border border-stone-200 dark:border-stone-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900/40">
            <tr>
              <th className="px-4 py-3">Confirmation</th>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Guests</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Booked</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
            {reservations.map((r: Reservation) => (
              <tr key={r.id} className="align-top">
                <td className="whitespace-nowrap px-4 py-4 font-mono text-xs text-bronze-500">{r.confirmationCode}</td>
                <td className="px-4 py-4">
                  <p className="font-medium">{r.guestName}</p>
                  <p className="text-stone-500">{r.guestEmail}</p>
                  {r.guestPhone && <p className="text-stone-500">{r.guestPhone}</p>}
                </td>
                <td className="px-4 py-4">{r.roomName}</td>
                <td className="whitespace-nowrap px-4 py-4 text-stone-600 dark:text-stone-400">
                  {r.checkIn} → {r.checkOut}
                </td>
                <td className="px-4 py-4">{r.guests}</td>
                <td className="whitespace-nowrap px-4 py-4">{formatUSD(r.totalPriceUsd)}</td>
                <td className="whitespace-nowrap px-4 py-4 text-stone-500">{formatDate(r.createdAt.toISOString())}</td>
                <td className="px-4 py-4">
                  <StatusSelect
                    id={r.id}
                    status={r.status}
                    options={["HELD", "CONFIRMED", "CANCELLED"]}
                    endpoint="/api/admin/reservations"
                  />
                </td>
              </tr>
            ))}
            {reservations.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-stone-500">
                  No reservations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
