"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/** Editor for a plain array of strings — one row per entry, add/remove. */
export function StringListEditor({
  items,
  onChange,
  placeholder,
  multiline = false,
  addLabel = "Add",
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  multiline?: boolean;
  addLabel?: string;
}) {
  function update(index: number, value: string) {
    const next = items.slice();
    next[index] = value;
    onChange(next);
  }
  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }
  function add() {
    onChange([...items, ""]);
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2">
          {multiline ? (
            <Textarea rows={2} value={item} placeholder={placeholder} onChange={(e) => update(index, e.target.value)} />
          ) : (
            <Input value={item} placeholder={placeholder} onChange={(e) => update(index, e.target.value)} />
          )}
          <button
            type="button"
            onClick={() => remove(index)}
            className="mt-1 flex-shrink-0 rounded-sm p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
            aria-label="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="h-4 w-4" /> {addLabel}
      </Button>
    </div>
  );
}
