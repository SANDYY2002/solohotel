"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { StatusEditor } from "@/components/admin/status-editor";
import { formatDate } from "@/lib/utils";
import type { ContactSubmission } from "@prisma/client";

const STATUS_OPTIONS = ["NEW", "READ", "RESPONDED"] as const;

export function ContactsTable({ submissions }: { submissions: ContactSubmission[] }) {
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return submissions.filter((s) => {
      if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.subject.toLowerCase().includes(q) ||
        s.message.toLowerCase().includes(q)
      );
    });
  }, [submissions, statusFilter, query]);

  return (
    <div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, subject, message…"
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
          {filtered.length} of {submissions.length}
        </p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-sm border border-stone-200 dark:border-stone-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900/40">
            <tr>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
            {filtered.map((s) => (
              <tr key={s.id} className="align-top">
                <td className="whitespace-nowrap px-4 py-4 text-stone-500">{formatDate(s.createdAt.toISOString())}</td>
                <td className="px-4 py-4 font-medium">{s.name}</td>
                <td className="px-4 py-4">
                  <p>{s.email}</p>
                  {s.phone && <p className="text-stone-500">{s.phone}</p>}
                </td>
                <td className="px-4 py-4">{s.subject}</td>
                <td className="max-w-xs px-4 py-4 text-stone-600 dark:text-stone-400">{s.message}</td>
                <td className="px-4 py-4">
                  <StatusEditor
                    id={s.id}
                    status={s.status}
                    options={[...STATUS_OPTIONS]}
                    endpoint="/api/admin/contacts"
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-stone-500">
                  {submissions.length === 0 ? "No messages yet." : "No messages match this filter."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
