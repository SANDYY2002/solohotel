import { prisma } from "@/lib/prisma";
import { formatUSD } from "@/lib/utils";
import {
  BookingsTrendChart,
  RevenueTrendChart,
  StatusPieChart,
  TopRoomsChart,
  MessagesTrendChart,
} from "@/components/admin/analytics-charts";

export const dynamic = "force-dynamic";

const MONTH_LABEL = new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit" });

function lastNMonths(n: number): { key: string; label: string }[] {
  const months: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: MONTH_LABEL.format(d) });
  }
  return months;
}

export default async function AnalyticsPage() {
  const [reservations, contacts] = await Promise.all([
    prisma.reservation.findMany({ select: { createdAt: true, totalPriceUsd: true, status: true, roomName: true } }),
    prisma.contactSubmission.findMany({ select: { createdAt: true } }),
  ]);

  const months = lastNMonths(12);

  const bookingsByMonth = new Map<string, { bookings: number; revenue: number }>();
  months.forEach((m) => bookingsByMonth.set(m.key, { bookings: 0, revenue: 0 }));
  for (const r of reservations) {
    const key = `${r.createdAt.getFullYear()}-${String(r.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (!bookingsByMonth.has(key)) continue;
    const entry = bookingsByMonth.get(key)!;
    entry.bookings += 1;
    if (r.status !== "CANCELLED") entry.revenue += r.totalPriceUsd;
  }
  const monthlyData = months.map((m) => ({
    month: m.label,
    bookings: bookingsByMonth.get(m.key)!.bookings,
    revenue: bookingsByMonth.get(m.key)!.revenue,
  }));

  const messagesByMonth = new Map<string, number>();
  months.forEach((m) => messagesByMonth.set(m.key, 0));
  for (const c of contacts) {
    const key = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (messagesByMonth.has(key)) messagesByMonth.set(key, messagesByMonth.get(key)! + 1);
  }
  const messagesData = months.map((m) => ({ month: m.label, count: messagesByMonth.get(m.key)! }));

  const statusCounts: Record<string, number> = { HELD: 0, CONFIRMED: 0, CANCELLED: 0 };
  for (const r of reservations) statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
  const statusData = Object.entries(statusCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const roomCounts = new Map<string, number>();
  for (const r of reservations) roomCounts.set(r.roomName, (roomCounts.get(r.roomName) ?? 0) + 1);
  const topRooms = Array.from(roomCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, bookings]) => ({ name, bookings }))
    .reverse();

  const totalRevenue = reservations.filter((r) => r.status !== "CANCELLED").reduce((sum, r) => sum + r.totalPriceUsd, 0);
  const avgBookingValue = reservations.length > 0 ? Math.round(totalRevenue / reservations.length) : 0;

  return (
    <div>
      <h1 className="font-display text-3xl">Analytics</h1>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Trends across the last 12 months.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-sm border border-stone-200 p-5 dark:border-stone-800">
          <p className="font-display text-3xl">{formatUSD(totalRevenue)}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">Total revenue (non-cancelled)</p>
        </div>
        <div className="rounded-sm border border-stone-200 p-5 dark:border-stone-800">
          <p className="font-display text-3xl">{reservations.length}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">Total reservations</p>
        </div>
        <div className="rounded-sm border border-stone-200 p-5 dark:border-stone-800">
          <p className="font-display text-3xl">{formatUSD(avgBookingValue)}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">Average booking value</p>
        </div>
        <div className="rounded-sm border border-stone-200 p-5 dark:border-stone-800">
          <p className="font-display text-3xl">{contacts.length}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">Total messages</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <BookingsTrendChart data={monthlyData} />
        <RevenueTrendChart data={monthlyData} />
        <StatusPieChart data={statusData} title="Reservations by status" />
        <TopRoomsChart data={topRooms} />
        <MessagesTrendChart data={messagesData} />
      </div>
    </div>
  );
}
