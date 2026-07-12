import { prisma } from "@/lib/prisma";
import { getSiteContent } from "@/lib/content-store";
import { BookingCalendar } from "@/components/admin/booking-calendar";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const [{ rooms }, reservations] = await Promise.all([
    getSiteContent(),
    prisma.reservation.findMany({ where: { status: { not: "CANCELLED" } } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl">Booking Calendar</h1>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
        Occupancy by room, one room type per row. Click any booked day to see the reservation.
      </p>
      <BookingCalendar rooms={rooms.map((r) => ({ slug: r.slug, name: r.name }))} reservations={reservations} />
    </div>
  );
}
