"use client";

import { Loader2, X } from "lucide-react";

export function BulkActionBar({
  count,
  options,
  value,
  onChange,
  onApply,
  onClear,
  applying,
}: {
  count: number;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  onApply: () => void;
  onClear: () => void;
  applying: boolean;
}) {
  if (count === 0) return null;

  return (
    <div className="mt-3 flex items-center gap-3 rounded-sm border border-bronze-300 bg-bronze-50 px-4 py-2.5 text-sm dark:border-bronze-400/30 dark:bg-bronze-400/10">
      <span className="font-medium">
        {count} selected
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-mono uppercase tracking-wide dark:border-stone-700 dark:bg-stone-900"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            Set to {o}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onApply}
        disabled={applying}
        className="flex items-center gap-1.5 rounded-full bg-bronze-400 px-3 py-1 text-xs font-medium text-ink hover:opacity-90 disabled:opacity-60"
      >
        {applying && <Loader2 className="h-3 w-3 animate-spin" />}
        {applying ? "Applying…" : "Apply"}
      </button>
      <button
        type="button"
        onClick={onClear}
        className="ml-auto flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
      >
        <X className="h-3.5 w-3.5" /> Clear selection
      </button>
    </div>
  );
}
