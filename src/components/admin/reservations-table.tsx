"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { StatusEditor } from "@/components/admin/status-editor";
import { PhoneLink } from "@/components/shared/phone-link";
import { formatDate, formatUSD } from "@/lib/utils";
import type { Reservation } from "@prisma/client";

const STATUS_OPTIONS = ["HELD", "CONFIRMED", "CANCELLED"] as const;

export function ReservationsTable({ reservations }: { reservations: Reservation[] }) {
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return reservations.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.guestName.toLowerCase().includes(q) ||
        r.guestEmail.toLowerCase().includes(q) ||
        r.confirmationCode.toLowerCase().includes(q) ||
        r.roomName.toLowerCase().includes(q)
      );
    });
  }, [reservations, statusFilter, query]);

  return (
    <div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guest, email, confirmation, room…"
            className="h-9 w-72 rounded-sm border border-stone-300 bg-white pl-9 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus-visible:outline-2 focus-visible:outline-bronze-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(["ALL", ...STATUS_OPTIONS] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full border px-3 py-1.5 text-xs font-mono uppercase tracking-wide transition-colors ${
                statusFilter === s
                  ? "border-bronze-400 bg-bronze-400 text-ink"
                  : "border-stone-300 text-stone-600 hover:border-bronze-400 dark:border-stone-700 dark:text-stone-300"
              }`}
            >
              {s === "ALL" ? "All" : s}
            </button>
          ))}
        </div>
        <p className="ml-auto text-sm text-stone-500">
          {filtered.length} of {reservations.length}
        </p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-sm border border-stone-200 dark:border-stone-800">
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
            {filtered.map((r) => (
              <tr key={r.id} className="align-top">
                <td className="whitespace-nowrap px-4 py-4 font-mono text-xs text-bronze-500">{r.confirmationCode}</td>
                <td className="px-4 py-4">
                  <p className="font-medium">{r.guestName}</p>
                  <p className="text-stone-500">{r.guestEmail}</p>
                  {r.guestPhone && <PhoneLink phone={r.guestPhone} className="text-stone-500" showIcon={false} />}
                </td>
                <td className="px-4 py-4">{r.roomName}</td>
                <td className="whitespace-nowrap px-4 py-4 text-stone-600 dark:text-stone-400">
                  {r.checkIn} → {r.checkOut}
                </td>
                <td className="px-4 py-4">{r.guests}</td>
                <td className="whitespace-nowrap px-4 py-4">{formatUSD(r.totalPriceUsd)}</td>
                <td className="whitespace-nowrap px-4 py-4 text-stone-500">{formatDate(r.createdAt.toISOString())}</td>
                <td className="px-4 py-4">
                  <StatusEditor
                    id={r.id}
                    status={r.status}
                    options={[...STATUS_OPTIONS]}
                    endpoint="/api/admin/reservations"
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-stone-500">
                  {reservations.length === 0 ? "No reservations yet." : "No reservations match this filter."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
