"use client";

import * as React from "react";
import { Upload, Loader2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error ?? "Upload failed.");
  }
  return body.url as string;
}

/**
 * A single-image field: shows a thumbnail (if there's a URL), a text input
 * for pasting a URL directly, and an upload button for picking a file from
 * the device. Uploads go through /api/admin/upload → Vercel Blob and the
 * resulting URL is written back into the same field.
 */
export function ImageUploadField({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (url: string) => void;
  id?: string;
}) {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-sm border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800">
            {/* Plain <img> — this can be a blob URL, a data URL mid-flight, or any external URL */}
            <img src={value} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-sm border border-dashed border-stone-300 text-stone-300 dark:border-stone-700">
            <Upload className="h-4 w-4" />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input
            id={id}
            type="text"
            value={value}
            placeholder="Paste an image URL, or upload from your device"
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-full rounded-sm border border-stone-300 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-400 focus-visible:outline-2 focus-visible:outline-bronze-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-sm border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 disabled:opacity-60 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-white/5"
              )}
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {uploading ? "Uploading…" : "Upload from device"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1 rounded-sm px-2 py-1.5 text-xs text-stone-400 hover:text-red-500"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {error && (
            <p className="flex items-center gap-1.5 text-xs text-red-500">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /> {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * A multi-image field (e.g. a room's photo gallery): thumbnails in a row,
 * each removable, plus an upload button that appends new photos and a text
 * input for pasting one more URL directly.
 */
export function MultiImageUploadField({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pastedUrl, setPastedUrl] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await Promise.all(Array.from(files).map(uploadFile));
      onChange([...value, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function addPasted() {
    if (!pastedUrl.trim()) return;
    onChange([...value, pastedUrl.trim()]);
    setPastedUrl("");
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((url, index) => (
            <div key={index} className="group relative h-16 w-16 overflow-hidden rounded-sm border border-stone-200 dark:border-stone-700">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-[9px] uppercase tracking-wide text-white">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded-sm border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-100 disabled:opacity-60 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-white/5"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploading ? "Uploading…" : "Upload photos"}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <input
          type="text"
          value={pastedUrl}
          placeholder="…or paste an image URL"
          onChange={(e) => setPastedUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addPasted();
            }
          }}
          className="h-8 flex-1 min-w-[10rem] rounded-sm border border-stone-300 bg-white px-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus-visible:outline-2 focus-visible:outline-bronze-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
        />
        <button
          type="button"
          onClick={addPasted}
          className="rounded-sm border border-stone-300 px-2.5 py-1.5 text-xs text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-white/5"
        >
          Add
        </button>
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
