"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Drawer } from "@/components/admin/drawer";
import { ReservationDetail } from "@/components/admin/reservation-detail";
import type { Reservation } from "@prisma/client";

const STATUS_COLOR: Record<string, string> = {
  HELD: "bg-amber-300/70 hover:bg-amber-300 dark:bg-amber-500/40 dark:hover:bg-amber-500/60",
  CONFIRMED: "bg-conservatory-500/70 hover:bg-conservatory-500 dark:bg-conservatory-400/50 dark:hover:bg-conservatory-400/70",
};

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function BookingCalendar({
  rooms,
  reservations,
}: {
  rooms: { slug: string; name: string }[];
  reservations: Reservation[];
}) {
  const [monthOffset, setMonthOffset] = React.useState(0);
  const [detail, setDetail] = React.useState<Reservation | null>(null);

  const viewDate = React.useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1));
  const todayIso = isoDay(new Date());

  // For each room, build a lookup of day -> reservation covering that day (if any).
  const byRoom = React.useMemo(() => {
    const map = new Map<string, Map<string, Reservation>>();
    for (const room of rooms) map.set(room.slug, new Map());
    for (const r of reservations) {
      if (r.status === "CANCELLED") continue;
      const roomMap = map.get(r.roomSlug);
      if (!roomMap) continue;
      const start = new Date(r.checkIn);
      const end = new Date(r.checkOut);
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        roomMap.set(isoDay(d), r);
      }
    }
    return map;
  }, [rooms, reservations]);

  return (
    <div>
      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-xl">{monthLabel(viewDate)}</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMonthOffset((m) => m - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-sm border border-stone-300 dark:border-stone-700"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setMonthOffset(0)}
            className="rounded-sm border border-stone-300 px-3 py-1.5 text-xs dark:border-stone-700"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setMonthOffset((m) => m + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-sm border border-stone-300 dark:border-stone-700"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-stone-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-amber-300/70 dark:bg-amber-500/40" /> Held
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-conservatory-500/70 dark:bg-conservatory-400/50" /> Confirmed
        </span>
      </div>

      <div className="mt-3 overflow-x-auto rounded-sm border border-stone-200 dark:border-stone-800">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-[140px] border-b border-r border-stone-200 bg-stone-100 px-3 py-2 dark:border-stone-800 dark:bg-stone-900/60">
                Room
              </th>
              {days.map((d) => (
                <th
                  key={d.toISOString()}
                  className={`min-w-[32px] border-b border-stone-200 px-1 py-2 text-center font-normal dark:border-stone-800 ${
                    isoDay(d) === todayIso ? "bg-bronze-100 dark:bg-bronze-400/10" : "bg-stone-100 dark:bg-stone-900/60"
                  }`}
                >
                  {d.getDate()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.slug}>
                <td className="sticky left-0 z-10 border-r border-b border-stone-200 bg-white px-3 py-2 font-medium dark:border-stone-800 dark:bg-conservatory-900">
                  {room.name}
                </td>
                {days.map((d) => {
                  const iso = isoDay(d);
                  const reservation = byRoom.get(room.slug)?.get(iso);
                  return (
                    <td
                      key={iso}
                      className={`h-9 border-b border-stone-100 p-0.5 dark:border-stone-800 ${
                        iso === todayIso ? "bg-bronze-50/50 dark:bg-bronze-400/5" : ""
                      }`}
                    >
                      {reservation && (
                        <button
                          type="button"
                          onClick={() => setDetail(reservation)}
                          title={`${reservation.guestName} — ${reservation.confirmationCode}`}
                          className={`h-full w-full rounded-sm transition-colors ${STATUS_COLOR[reservation.status] ?? "bg-stone-300"}`}
                          aria-label={`${reservation.guestName}, ${reservation.status}`}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.guestName ?? ""} subtitle={detail?.confirmationCode}>
        {detail && <ReservationDetail reservation={detail} onClose={() => setDetail(null)} />}
      </Drawer>
    </div>
  );
}
