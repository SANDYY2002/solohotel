import Link from "next/link";
import { Mail, CalendarCheck, Inbox, CheckCircle2, XCircle, Clock, MessageSquareReply, MailOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [
    newContacts,
    readContacts,
    respondedContacts,
    totalContacts,
    heldReservations,
    confirmedReservations,
    cancelledReservations,
    totalReservations,
  ] = await Promise.all([
    prisma.contactSubmission.count({ where: { status: "NEW" } }),
    prisma.contactSubmission.count({ where: { status: "READ" } }),
    prisma.contactSubmission.count({ where: { status: "RESPONDED" } }),
    prisma.contactSubmission.count(),
    prisma.reservation.count({ where: { status: "HELD" } }),
    prisma.reservation.count({ where: { status: "CONFIRMED" } }),
    prisma.reservation.count({ where: { status: "CANCELLED" } }),
    prisma.reservation.count(),
  ]);

  const stats = [
    { label: "New Messages", value: newContacts, icon: Inbox, href: "/admin/contacts" },
    { label: "Total Messages", value: totalContacts, icon: Mail, href: "/admin/contacts" },
    { label: "Pending Reservations", value: heldReservations, icon: CalendarCheck, href: "/admin/reservations" },
    { label: "Total Reservations", value: totalReservations, icon: CalendarCheck, href: "/admin/reservations" },
  ];

  const reservationBreakdown = [
    { label: "Held", value: heldReservations, icon: Clock, filter: "HELD" },
    { label: "Confirmed", value: confirmedReservations, icon: CheckCircle2, filter: "CONFIRMED" },
    { label: "Cancelled", value: cancelledReservations, icon: XCircle, filter: "CANCELLED" },
  ];

  const contactBreakdown = [
    { label: "New", value: newContacts, icon: Inbox, filter: "NEW" },
    { label: "Read", value: readContacts, icon: MailOpen, filter: "READ" },
    { label: "Responded", value: respondedContacts, icon: MessageSquareReply, filter: "RESPONDED" },
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

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-xl">Reservations by status</h2>
          <div className="mt-4 space-y-2">
            {reservationBreakdown.map((s) => {
              const Icon = s.icon;
              const pct = totalReservations > 0 ? Math.round((s.value / totalReservations) * 100) : 0;
              return (
                <Link
                  key={s.label}
                  href="/admin/reservations"
                  className="flex items-center gap-3 rounded-sm border border-stone-200 px-4 py-3 transition-colors hover:border-bronze-400 dark:border-stone-800"
                >
                  <Icon className="h-4 w-4 flex-shrink-0 text-bronze-400" />
                  <span className="text-sm font-medium">{s.label}</span>
                  <div className="ml-auto flex items-center gap-3">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                      <div className="h-full bg-bronze-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right font-mono text-sm">{s.value}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl">Messages by status</h2>
          <div className="mt-4 space-y-2">
            {contactBreakdown.map((s) => {
              const Icon = s.icon;
              const pct = totalContacts > 0 ? Math.round((s.value / totalContacts) * 100) : 0;
              return (
                <Link
                  key={s.label}
                  href="/admin/contacts"
                  className="flex items-center gap-3 rounded-sm border border-stone-200 px-4 py-3 transition-colors hover:border-bronze-400 dark:border-stone-800"
                >
                  <Icon className="h-4 w-4 flex-shrink-0 text-bronze-400" />
                  <span className="text-sm font-medium">{s.label}</span>
                  <div className="ml-auto flex items-center gap-3">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                      <div className="h-full bg-bronze-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right font-mono text-sm">{s.value}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
