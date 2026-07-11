"use client";

import { Download } from "lucide-react";
import { downloadCsv } from "@/lib/csv-export";
import { useToast } from "@/components/admin/toast-provider";
import { formatDate } from "@/lib/utils";
import type { NewsletterSubscriber } from "@prisma/client";

export function NewsletterList({ subscribers }: { subscribers: NewsletterSubscriber[] }) {
  const showToast = useToast();

  function exportCsv() {
    const rows = subscribers.map((s) => ({ email: s.email, subscribed: formatDate(new Date(s.createdAt).toISOString()) }));
    downloadCsv(
      `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: "email", label: "Email" },
        { key: "subscribed", label: "Subscribed" },
      ],
      rows
    );
    showToast("success", `Exported ${rows.length} subscriber${rows.length !== 1 ? "s" : ""} to CSV.`);
  }

  return (
    <div>
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-stone-500">{subscribers.length} total</p>
        <button
          type="button"
          onClick={exportCsv}
          disabled={subscribers.length === 0}
          className="flex items-center gap-1.5 rounded-sm border border-stone-300 px-3 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 disabled:opacity-40 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-white/5"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      <div className="mt-4 divide-y divide-stone-200 rounded-sm border border-stone-200 dark:divide-stone-800 dark:border-stone-800">
        {subscribers.map((s) => (
          <div key={s.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span>{s.email}</span>
            <span className="text-xs text-stone-400">{formatDate(new Date(s.createdAt).toISOString())}</span>
          </div>
        ))}
        {subscribers.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-stone-500">No subscribers yet.</div>
        )}
      </div>
    </div>
  );
}
