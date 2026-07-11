"use client";

import * as React from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ICON_NAMES } from "@/lib/icon-map";
import { ImageUploadField, MultiImageUploadField } from "@/components/admin/image-upload";

export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "boolean" | "tags" | "icon" | "select" | "image" | "images";
  placeholder?: string;
  helpText?: string;
  options?: string[];
};

type Item = Record<string, unknown>;

/**
 * A reusable add/edit/delete/reorder editor for arrays of similarly-shaped
 * objects (rooms, dining venues, spa treatments, testimonials, FAQs, etc.).
 * Purely client-side state — the parent page's "Save" action is what
 * actually persists `items` to the server.
 */
export function ArrayEditor({
  items,
  onChange,
  fields,
  titleKey,
  emptyItem,
  addLabel = "Add item",
}: {
  items: Item[];
  onChange: (items: Item[]) => void;
  fields: FieldDef[];
  titleKey: string;
  emptyItem: Item;
  addLabel?: string;
}) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<number | null>(null);

  function updateItem(index: number, key: string, value: unknown) {
    const next = items.slice();
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  }

  function requestRemove(index: number) {
    if (pendingDelete === index) {
      onChange(items.filter((_, i) => i !== index));
      setOpenIndex(null);
      setPendingDelete(null);
    } else {
      setPendingDelete(index);
      setTimeout(() => setPendingDelete((p) => (p === index ? null : p)), 3000);
    }
  }

  function addItem() {
    onChange([...items, { ...emptyItem }]);
    setOpenIndex(items.length);
  }

  function moveItem(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = items.slice();
    const a = next[index];
    const b = next[target];
    if (a === undefined || b === undefined) return;
    next[index] = b;
    next[target] = a;
    onChange(next);
    setOpenIndex(target);
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const title = String(item[titleKey] ?? `Item ${index + 1}`) || `Item ${index + 1}`;
        return (
          <div key={index} className="rounded-sm border border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2 px-4 py-3">
              <GripVertical className="h-4 w-4 flex-shrink-0 text-stone-300 dark:text-stone-600" aria-hidden />
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex flex-1 items-center justify-between text-left text-sm font-medium"
              >
                <span>{title}</span>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, -1)}
                disabled={index === 0}
                className="rounded-sm p-1.5 text-stone-400 hover:bg-stone-100 disabled:opacity-30 dark:hover:bg-white/5"
                aria-label="Move up"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, 1)}
                disabled={index === items.length - 1}
                className="rounded-sm p-1.5 text-stone-400 hover:bg-stone-100 disabled:opacity-30 dark:hover:bg-white/5"
                aria-label="Move down"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => requestRemove(index)}
                className={
                  pendingDelete === index
                    ? "rounded-sm bg-red-500 px-2 py-1.5 text-xs font-medium text-white"
                    : "rounded-sm p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                }
                aria-label={pendingDelete === index ? `Confirm delete ${title}` : `Delete ${title}`}
              >
                {pendingDelete === index ? "Confirm?" : <Trash2 className="h-3.5 w-3.5" />}
              </button>
            </div>

            {isOpen && (
              <div className="grid gap-4 border-t border-stone-200 p-4 dark:border-stone-800 sm:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.key} className={field.type === "textarea" || field.type === "image" || field.type === "images" ? "sm:col-span-2" : ""}>
                    <Label htmlFor={`${index}-${field.key}`}>{field.label}</Label>
                    <FieldInput
                      id={`${index}-${field.key}`}
                      field={field}
                      value={item[field.key]}
                      onChange={(v) => updateItem(index, field.key, v)}
                    />
                    {field.helpText && <p className="mt-1 text-xs text-stone-400">{field.helpText}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full">
        <Plus className="h-4 w-4" /> {addLabel}
      </Button>
    </div>
  );
}

function FieldInput({
  id,
  field,
  value,
  onChange,
}: {
  id: string;
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.type === "textarea") {
    return (
      <Textarea
        id={id}
        rows={3}
        value={typeof value === "string" ? value : ""}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (field.type === "number") {
    return (
      <Input
        id={id}
        type="number"
        value={typeof value === "number" ? value : 0}
        placeholder={field.placeholder}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    );
  }
  if (field.type === "boolean") {
    return (
      <Select
        id={id}
        value={value ? "true" : "false"}
        onChange={(e) => onChange(e.target.value === "true")}
      >
        <option value="true">Yes</option>
        <option value="false">No</option>
      </Select>
    );
  }
  if (field.type === "tags") {
    const arr = Array.isArray(value) ? (value as string[]) : [];
    return (
      <Textarea
        id={id}
        rows={2}
        value={arr.join(", ")}
        placeholder={field.placeholder ?? "Comma-separated"}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          )
        }
      />
    );
  }
  if (field.type === "image") {
    return <ImageUploadField id={id} value={typeof value === "string" ? value : ""} onChange={onChange} />;
  }
  if (field.type === "images") {
    return (
      <MultiImageUploadField value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} />
    );
  }
  if (field.type === "select") {
    const options = field.options ?? [];
    return (
      <Select id={id} value={typeof value === "string" ? value : options[0]} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </Select>
    );
  }
  if (field.type === "icon") {
    return (
      <Select id={id} value={typeof value === "string" ? value : ICON_NAMES[0]} onChange={(e) => onChange(e.target.value)}>
        {ICON_NAMES.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>
    );
  }
  return (
    <Input
      id={id}
      type="text"
      value={typeof value === "string" ? value : ""}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
