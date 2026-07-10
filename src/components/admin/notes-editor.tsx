"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/admin/toast-provider";

export function NotesEditor({
  id,
  notes,
  endpoint,
  onSaved,
}: {
  id: string;
  notes: string | null;
  endpoint: string;
  onSaved?: () => void;
}) {
  const showToast = useToast();
  const [value, setValue] = React.useState(notes ?? "");
  const [saved, setSaved] = React.useState(notes ?? "");
  const [saving, setSaving] = React.useState(false);

  const dirty = value !== saved;

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`${endpoint}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: value }),
      });
      if (!res.ok) throw new Error();
      setSaved(value);
      showToast("success", "Notes saved.");
      onSaved?.();
    } catch {
      showToast("error", "Couldn't save notes — try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Textarea
        rows={4}
        value={value}
        placeholder="Internal notes — not visible to the guest…"
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="mt-2 flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={handleSave} disabled={!dirty || saving}>
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {saving ? "Saving…" : "Save notes"}
        </Button>
      </div>
    </div>
  );
}
