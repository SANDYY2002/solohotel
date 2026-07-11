"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/admin/toast-provider";

/**
 * Status dropdown + explicit Save button, used for both contact messages
 * and reservations. Nothing is written until Save is clicked — the button
 * only appears once the selection differs from what's saved, and feedback
 * goes through the shared toast system.
 */
export function StatusEditor({
  id,
  status,
  options,
  endpoint,
}: {
  id: string;
  status: string;
  options: string[];
  endpoint: string;
}) {
  const router = useRouter();
  const showToast = useToast();
  const [value, setValue] = React.useState(status);
  const [saved, setSaved] = React.useState(status);
  const [saving, setSaving] = React.useState(false);

  const dirty = value !== saved;

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`${endpoint}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value }),
      });
      if (!res.ok) throw new Error();
      setSaved(value);
      showToast("success", `Status updated to ${value}.`);
      router.refresh();
    } catch {
      showToast("error", "Couldn't update status — try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        disabled={saving}
        onChange={(e) => setValue(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "rounded-full border border-stone-300 bg-transparent px-3 py-1 text-xs font-mono uppercase tracking-wide dark:border-stone-700",
          saving && "opacity-50"
        )}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>

      {dirty && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSave();
          }}
          disabled={saving}
          className="flex items-center gap-1 rounded-full bg-bronze-400 px-2.5 py-1 text-xs font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving && <Loader2 className="h-3 w-3 animate-spin" />}
          {saving ? "Saving…" : "Save"}
        </button>
      )}
    </div>
  );
}
