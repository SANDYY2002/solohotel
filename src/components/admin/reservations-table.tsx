"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowUp, ArrowDown, ArrowUpDown, Download } from "lucide-react";
import { StatusEditor } from "@/components/admin/status-editor";
import { PhoneLink } from "@/components/shared/phone-link";
import { Drawer } from "@/components/admin/drawer";
import { ReservationDetail } from "@/components/admin/reservation-detail";
import { Pagination } from "@/components/admin/pagination";
import { BulkActionBar } from "@/components/admin/bulk-action-bar";
import { downloadCsv } from "@/lib/csv-export";
import { useToast } from "@/components/admin/toast-provider";
import { formatDate, formatUSD } from "@/lib/utils";
import type { Reservation } from "@prisma/client";

const STATUS_OPTIONS = ["HELD", "CONFIRMED", "CANCELLED"] as const;
type SortKey = "createdAt" | "checkIn" | "guestName" | "totalPriceUsd" | "status";

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

export function ReservationsTable({ reservations }: { reservations: Reservation[] }) {
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
  const [detail, setDetail] = React.useState<Reservation | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return reservations.filter((r) => {
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      const created = new Date(r.createdAt).toISOString().slice(0, 10);
      if (dateFrom && created < dateFrom) return false;
      if (dateTo && created > dateTo) return false;
      if (!q) return true;
      return (
        r.guestName.toLowerCase().includes(q) ||
        r.guestEmail.toLowerCase().includes(q) ||
        r.confirmationCode.toLowerCase().includes(q) ||
        r.roomName.toLowerCase().includes(q)
      );
    });
  }, [reservations, statusFilter, query, dateFrom, dateTo]);

  const sorted = React.useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "createdAt") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortKey === "checkIn") cmp = a.checkIn.localeCompare(b.checkIn);
      else if (sortKey === "guestName") cmp = a.guestName.localeCompare(b.guestName);
      else if (sortKey === "totalPriceUsd") cmp = a.totalPriceUsd - b.totalPriceUsd;
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

  const pageIds = pageItems.map((r) => r.id);
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
      const res = await fetch("/api/admin/reservations/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), status: bulkStatus }),
      });
      if (!res.ok) throw new Error();
      showToast("success", `Updated ${selected.size} reservation${selected.size !== 1 ? "s" : ""} to ${bulkStatus}.`);
      setSelected(new Set());
      router.refresh();
    } catch {
      showToast("error", "Bulk update failed — try again.");
    } finally {
      setBulkApplying(false);
    }
  }

  function exportCsv() {
    const rows = sorted.map((r) => ({
      confirmationCode: r.confirmationCode,
      guestName: r.guestName,
      guestEmail: r.guestEmail,
      guestPhone: r.guestPhone ?? "",
      roomName: r.roomName,
      checkIn: r.checkIn,
      checkOut: r.checkOut,
      guests: r.guests,
      totalPriceUsd: r.totalPriceUsd,
      status: r.status,
      booked: formatDate(new Date(r.createdAt).toISOString()),
    }));
    downloadCsv(
      `reservations-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: "confirmationCode", label: "Confirmation" },
        { key: "guestName", label: "Guest" },
        { key: "guestEmail", label: "Email" },
        { key: "guestPhone", label: "Phone" },
        { key: "roomName", label: "Room" },
        { key: "checkIn", label: "Check-in" },
        { key: "checkOut", label: "Check-out" },
        { key: "guests", label: "Guests" },
        { key: "totalPriceUsd", label: "Total (USD)" },
        { key: "status", label: "Status" },
        { key: "booked", label: "Booked" },
      ],
      rows
    );
    showToast("success", `Exported ${rows.length} reservation${rows.length !== 1 ? "s" : ""} to CSV.`);
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
            placeholder="Search guest, email, confirmation, room…"
            className="h-9 w-64 rounded-sm border border-stone-300 bg-white pl-9 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus-visible:outline-2 focus-visible:outline-bronze-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-stone-500">Booked from</label>
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
              <th className="px-4 py-3">Confirmation</th>
              <th className="px-4 py-3">
                <SortButton label="Guest" active={sortKey === "guestName"} dir={sortDir} onClick={() => toggleSort("guestName")} />
              </th>
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">
                <SortButton label="Check-in" active={sortKey === "checkIn"} dir={sortDir} onClick={() => toggleSort("checkIn")} />
              </th>
              <th className="px-4 py-3">Guests</th>
              <th className="px-4 py-3">
                <SortButton label="Total" active={sortKey === "totalPriceUsd"} dir={sortDir} onClick={() => toggleSort("totalPriceUsd")} />
              </th>
              <th className="px-4 py-3">
                <SortButton label="Booked" active={sortKey === "createdAt"} dir={sortDir} onClick={() => toggleSort("createdAt")} />
              </th>
              <th className="px-4 py-3">
                <SortButton label="Status" active={sortKey === "status"} dir={sortDir} onClick={() => toggleSort("status")} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
            {pageItems.map((r) => (
              <tr
                key={r.id}
                className="cursor-pointer align-top hover:bg-stone-50 dark:hover:bg-white/[0.03]"
                onClick={() => setDetail(r)}
              >
                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} aria-label={`Select ${r.confirmationCode}`} />
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-mono text-xs text-bronze-500">
                  {r.confirmationCode}
                  {r.paymentStatus === "PAID" && <span className="ml-1.5 text-green-500" title="Paid">●</span>}
                  {r.paymentStatus === "FAILED" && <span className="ml-1.5 text-red-500" title="Payment failed">●</span>}
                  {r.paymentStatus === "PENDING" && <span className="ml-1.5 text-stone-300" title="Payment pending">●</span>}
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium">{r.guestName}</p>
                  <p className="text-stone-500">{r.guestEmail}</p>
                  {r.guestPhone && (
                    <PhoneLink phone={r.guestPhone} className="text-stone-500" showIcon={false} />
                  )}
                </td>
                <td className="px-4 py-4">{r.roomName}</td>
                <td className="whitespace-nowrap px-4 py-4 text-stone-600 dark:text-stone-400">
                  {r.checkIn} → {r.checkOut}
                </td>
                <td className="px-4 py-4">{r.guests}</td>
                <td className="whitespace-nowrap px-4 py-4">{formatUSD(r.totalPriceUsd)}</td>
                <td className="whitespace-nowrap px-4 py-4 text-stone-500">{formatDate(new Date(r.createdAt).toISOString())}</td>
                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                  <StatusEditor id={r.id} status={r.status} options={[...STATUS_OPTIONS]} endpoint="/api/admin/reservations" />
                </td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-stone-500">
                  {reservations.length === 0 ? "No reservations yet." : "No reservations match this filter."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} pageCount={pageCount} pageSize={pageSize} totalItems={sorted.length} onPageChange={setPage} onPageSizeChange={setPageSize} />

      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.guestName ?? ""} subtitle={detail?.confirmationCode}>
        {detail && <ReservationDetail reservation={detail} onClose={() => setDetail(null)} />}
      </Drawer>
    </div>
  );
}
