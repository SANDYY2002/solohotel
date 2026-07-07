"use client";

import * as React from "react";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ContentSection } from "@/lib/content-types";

type SaveState = "idle" | "saving" | "saved" | "error";

export function useSaveSection<T>(section: ContentSection, initial: T) {
  const [data, setData] = React.useState<T>(initial);
  const [state, setState] = React.useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  async function save() {
    setState("saving");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, data }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setErrorMessage(body.error ?? "Something went wrong.");
        setState("error");
        return;
      }
      setState("saved");
      setTimeout(() => setState((s) => (s === "saved" ? "idle" : s)), 2500);
    } catch {
      setErrorMessage("Could not reach the server.");
      setState("error");
    }
  }

  return { data, setData, save, state, errorMessage };
}

export function SaveBar({
  title,
  description,
  state,
  errorMessage,
  onSave,
}: {
  title: string;
  description?: string;
  state: SaveState;
  errorMessage?: string | null;
  onSave: () => void;
}) {
  return (
    <div className="sticky top-0 z-10 -mx-6 mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 bg-stone-50/95 px-6 py-4 backdrop-blur dark:border-stone-800 dark:bg-conservatory-950/95 md:-mx-10 md:px-10">
      <div>
        <h1 className="font-display text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        {state === "saved" && (
          <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
        {state === "error" && (
          <span className="flex items-center gap-1.5 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" /> {errorMessage ?? "Error saving"}
          </span>
        )}
        <Button type="button" variant="bronze" onClick={onSave} disabled={state === "saving"}>
          {state === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
          {state === "saving" ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
