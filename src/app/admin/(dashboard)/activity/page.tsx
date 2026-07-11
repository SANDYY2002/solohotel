import { History, CalendarCheck, Mail, LayoutTemplate } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ENTITY_ICON: Record<string, typeof History> = {
  reservation: CalendarCheck,
  contact: Mail,
  content: LayoutTemplate,
};

export default async function ActivityLogPage() {
  const entries = await prisma.adminActivityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h1 className="font-display text-3xl">Activity Log</h1>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
        The last {entries.length} admin action{entries.length !== 1 ? "s" : ""} — status changes, deletions, and content edits.
      </p>

      <div className="mt-6 divide-y divide-stone-200 rounded-sm border border-stone-200 dark:divide-stone-800 dark:border-stone-800">
        {entries.map((e) => {
          const Icon = ENTITY_ICON[e.entity] ?? History;
          return (
            <div key={e.id} className="flex items-start gap-3 px-4 py-3.5">
              <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-bronze-400" />
              <div className="flex-1">
                <p className="text-sm">{e.summary}</p>
                <p className="mt-0.5 text-xs text-stone-400">{formatDate(e.createdAt.toISOString())}</p>
              </div>
            </div>
          );
        })}
        {entries.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-stone-500">
            No activity recorded yet — changes you make across the admin dashboard will show up here.
          </div>
        )}
      </div>
    </div>
  );
}
