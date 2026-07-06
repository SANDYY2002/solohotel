"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function StatusSelect({
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
  const [saving, setSaving] = React.useState(false);

  async function handleChange(next: string) {
    setValue(next);
    setSaving(true);
    try {
      await fetch(`${endpoint}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={value}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value)}
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
  );
}
