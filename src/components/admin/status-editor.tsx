"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Status dropdown + explicit Save button, used for both contact messages
 * and reservations. Unlike the old auto-save-on-change behavior, nothing
 * is written until Save is clicked — the button stays disabled until the
 * selection actually differs from what's saved, and shows a brief
 * confirmation (or error) after saving.
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
  const [value, setValue] = React.useState(status);
  const [saved, setSaved] = React.useState(status);
  const [state, setState] = React.useState<"idle" | "saving" | "saved" | "error">("idle");

  const dirty = value !== saved;

  async function handleSave() {
    setState("saving");
    try {
      const res = await fetch(`${endpoint}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value }),
      });
      if (!res.ok) throw new Error();
      setSaved(value);
      setState("saved");
      router.refresh();
      setTimeout(() => setState((s) => (s === "saved" ? "idle" : s)), 2000);
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        disabled={state === "saving"}
        onChange={(e) => {
          setValue(e.target.value);
          setState("idle");
        }}
        className={cn(
          "rounded-full border border-stone-300 bg-transparent px-3 py-1 text-xs font-mono uppercase tracking-wide dark:border-stone-700",
          state === "saving" && "opacity-50"
        )}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>

      {dirty && state !== "saved" && (
        <button
          type="button"
          onClick={handleSave}
          disabled={state === "saving"}
          className="flex items-center gap-1 rounded-full bg-bronze-400 px-2.5 py-1 text-xs font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {state === "saving" && <Loader2 className="h-3 w-3 animate-spin" />}
          {state === "saving" ? "Saving…" : "Save"}
        </button>
      )}
      {state === "saved" && (
        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
          <Check className="h-3.5 w-3.5" /> Saved
        </span>
      )}
      {state === "error" && (
        <span className="flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3.5 w-3.5" /> Failed — retry
        </span>
      )}
    </div>
  );
}
