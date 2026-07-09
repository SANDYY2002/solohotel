import { prisma } from "@/lib/prisma";
import { ReservationsTable } from "@/components/admin/reservations-table";

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
      <ReservationsTable reservations={reservations} />
    </div>
  );
}
