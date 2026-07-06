import Link from "next/link";
import { Mail, CalendarCheck, Inbox } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [newContacts, totalContacts, heldReservations, totalReservations] = await Promise.all([
    prisma.contactSubmission.count({ where: { status: "NEW" } }),
    prisma.contactSubmission.count(),
    prisma.reservation.count({ where: { status: "HELD" } }),
    prisma.reservation.count(),
  ]);

  const stats = [
    { label: "New Messages", value: newContacts, icon: Inbox, href: "/admin/contacts" },
    { label: "Total Messages", value: totalContacts, icon: Mail, href: "/admin/contacts" },
    { label: "Pending Reservations", value: heldReservations, icon: CalendarCheck, href: "/admin/reservations" },
    { label: "Total Reservations", value: totalReservations, icon: CalendarCheck, href: "/admin/reservations" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl">Overview</h1>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">A snapshot of what needs attention.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="rounded-sm border border-stone-200 p-5 transition-colors hover:border-bronze-400 dark:border-stone-800"
            >
              <Icon className="h-5 w-5 text-bronze-400" />
              <p className="mt-3 font-display text-3xl">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">{s.label}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
