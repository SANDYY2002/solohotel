"use client";

import * as React from "react";
import { Download, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/components/admin/toast-provider";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

export function ContentBackupCard() {
  const showToast = useToast();
  const [downloading, setDownloading] = React.useState(false);
  const [restoring, setRestoring] = React.useState(false);
  const [pendingFile, setPendingFile] = React.useState<File | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch("/api/admin/content/backup");
      if (!res.ok) throw new Error();
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `site-content-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("success", "Backup downloaded.");
    } catch {
      showToast("error", "Couldn't download a backup — try again.");
    } finally {
      setDownloading(false);
    }
  }

  function handleFilePicked(file: File | undefined) {
    if (!file) return;
    setPendingFile(file);
  }

  async function confirmRestore() {
    if (!pendingFile) return;
    setRestoring(true);
    try {
      const text = await pendingFile.text();
      const json = JSON.parse(text);
      const res = await fetch("/api/admin/content/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error ?? "Restore failed.");
      showToast("success", "Site content restored from backup. Refresh any open pages to see it.");
    } catch (e) {
      showToast("error", e instanceof Error ? e.message : "Couldn't restore that file.");
    } finally {
      setRestoring(false);
      setPendingFile(null);
    }
  }

  return (
    <div className="mt-8 rounded-sm border border-stone-200 p-5 dark:border-stone-800">
      <h2 className="font-display text-lg">Backup & restore</h2>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
        Download every section above as one file, or restore everything from a previous backup. Useful before a big edit,
        or as a safety net — content saves here don&apos;t have version history otherwise.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-1.5 rounded-sm border border-stone-300 px-3 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 disabled:opacity-60 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-white/5"
        >
          {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          Download backup
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-sm border border-stone-300 px-3 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-white/5"
        >
          <Upload className="h-3.5 w-3.5" /> Restore from backup
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => handleFilePicked(e.target.files?.[0])}
        />
      </div>

      <ConfirmDialog
        open={!!pendingFile}
        title="Restore from this backup?"
        description={`This replaces every section of site content (settings, rooms, dining, spa, gallery, testimonials, FAQs, about) with what's in "${pendingFile?.name}". Anything not saved elsewhere will be overwritten.`}
        confirmLabel="Restore"
        busy={restoring}
        onConfirm={confirmRestore}
        onCancel={() => setPendingFile(null)}
      />
    </div>
  );
}
