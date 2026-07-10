"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowUp, ArrowDown, ArrowUpDown, Download } from "lucide-react";
import { StatusEditor } from "@/components/admin/status-editor";
import { PhoneLink } from "@/components/shared/phone-link";
import { Drawer } from "@/components/admin/drawer";
import { ContactDetail } from "@/components/admin/contact-detail";
import { Pagination } from "@/components/admin/pagination";
import { BulkActionBar } from "@/components/admin/bulk-action-bar";
import { downloadCsv } from "@/lib/csv-export";
import { useToast } from "@/components/admin/toast-provider";
import { formatDate } from "@/lib/utils";
import type { ContactSubmission } from "@prisma/client";

const STATUS_OPTIONS = ["NEW", "READ", "RESPONDED"] as const;
type SortKey = "createdAt" | "name" | "status";

function SortButton({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1 hover:text-stone-700 dark:hover:text-stone-200">
      {label}
      {active ? dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" /> : <ArrowUpDown className="h-3 w-3 opacity-40" />}
    </button>
  );
}

export function ContactsTable({ submissions }: { submissions: ContactSubmission[] }) {
  const router = useRouter();
  const showToast = useToast();

  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [query, setQuery] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = React.useState<string>(STATUS_OPTIONS[0]);
  const [bulkApplying, setBulkApplying] = React.useState(false);
  const [detail, setDetail] = React.useState<ContactSubmission | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return submissions.filter((s) => {
      if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
      const created = new Date(s.createdAt).toISOString().slice(0, 10);
      if (dateFrom && created < dateFrom) return false;
      if (dateTo && created > dateTo) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.subject.toLowerCase().includes(q) ||
        s.message.toLowerCase().includes(q)
      );
    });
  }, [submissions, statusFilter, query, dateFrom, dateTo]);

  const sorted = React.useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "createdAt") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageItems = sorted.slice((page - 1) * pageSize, page * pageSize);

  React.useEffect(() => {
    setPage(1);
  }, [statusFilter, query, dateFrom, dateTo, pageSize]);

  React.useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function toggleSelect(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const pageIds = pageItems.map((s) => s.id);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  function toggleSelectAllOnPage() {
    setSelected((s) => {
      const next = new Set(s);
      if (allOnPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }

  async function applyBulk() {
    setBulkApplying(true);
    try {
      const res = await fetch("/api/admin/contacts/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), status: bulkStatus }),
      });
      if (!res.ok) throw new Error();
      showToast("success", `Updated ${selected.size} message${selected.size !== 1 ? "s" : ""} to ${bulkStatus}.`);
      setSelected(new Set());
      router.refresh();
    } catch {
      showToast("error", "Bulk update failed — try again.");
    } finally {
      setBulkApplying(false);
    }
  }

  function exportCsv() {
    const rows = sorted.map((s) => ({
      name: s.name,
      email: s.email,
      phone: s.phone ?? "",
      subject: s.subject,
      message: s.message,
      status: s.status,
      received: formatDate(new Date(s.createdAt).toISOString()),
    }));
    downloadCsv(
      `contact-messages-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "subject", label: "Subject" },
        { key: "message", label: "Message" },
        { key: "status", label: "Status" },
        { key: "received", label: "Received" },
      ],
      rows
    );
    showToast("success", `Exported ${rows.length} message${rows.length !== 1 ? "s" : ""} to CSV.`);
  }

  return (
    <div>
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, subject, message…"
            className="h-9 w-64 rounded-sm border border-stone-300 bg-white pl-9 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus-visible:outline-2 focus-visible:outline-bronze-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-stone-500">Received from</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-9 rounded-sm border border-stone-300 bg-white px-2 text-xs dark:border-stone-700 dark:bg-stone-900"
          />
          <label className="text-xs text-stone-500">to</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-9 rounded-sm border border-stone-300 bg-white px-2 text-xs dark:border-stone-700 dark:bg-stone-900"
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
        <button
          type="button"
          onClick={exportCsv}
          className="ml-auto flex items-center gap-1.5 rounded-sm border border-stone-300 px-3 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-white/5"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      <BulkActionBar
        count={selected.size}
        options={[...STATUS_OPTIONS]}
        value={bulkStatus}
        onChange={setBulkStatus}
        onApply={applyBulk}
        onClear={() => setSelected(new Set())}
        applying={bulkApplying}
      />

      <div className="mt-4 overflow-x-auto rounded-sm border border-stone-200 dark:border-stone-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900/40">
            <tr>
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={allOnPageSelected} onChange={toggleSelectAllOnPage} aria-label="Select all on page" />
              </th>
              <th className="px-4 py-3">
                <SortButton label="Received" active={sortKey === "createdAt"} dir={sortDir} onClick={() => toggleSort("createdAt")} />
              </th>
              <th className="px-4 py-3">
                <SortButton label="Name" active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")} />
              </th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">
                <SortButton label="Status" active={sortKey === "status"} dir={sortDir} onClick={() => toggleSort("status")} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
            {pageItems.map((s) => (
              <tr
                key={s.id}
                className="cursor-pointer align-top hover:bg-stone-50 dark:hover:bg-white/[0.03]"
                onClick={() => setDetail(s)}
              >
                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSelect(s.id)} aria-label={`Select message from ${s.name}`} />
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-stone-500">{formatDate(new Date(s.createdAt).toISOString())}</td>
                <td className="px-4 py-4 font-medium">{s.name}</td>
                <td className="px-4 py-4">
                  <p>{s.email}</p>
                  {s.phone && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <PhoneLink phone={s.phone} className="text-stone-500" showIcon={false} />
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">{s.subject}</td>
                <td className="max-w-xs truncate px-4 py-4 text-stone-600 dark:text-stone-400">{s.message}</td>
                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                  <StatusEditor id={s.id} status={s.status} options={[...STATUS_OPTIONS]} endpoint="/api/admin/contacts" />
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-stone-500">
                  {submissions.length === 0 ? "No messages yet." : "No messages match this filter."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageCount={pageCount} pageSize={pageSize} totalItems={sorted.length} onPageChange={setPage} onPageSizeChange={setPageSize} />

      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.name ?? ""} subtitle={detail?.subject}>
        {detail && <ContactDetail submission={detail} onClose={() => setDetail(null)} />}
      </Drawer>
    </div>
  );
}
