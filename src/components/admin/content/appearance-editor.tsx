"use client";

import * as React from "react";
import { ArrowUp, ArrowDown, Eye, EyeOff, RotateCcw } from "lucide-react";
import { Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SaveBar, useSaveSection } from "@/components/admin/save-bar";
import { cn } from "@/lib/utils";
import { DEFAULT_CONTENT } from "@/lib/content-defaults";
import type { AppearanceContent, HomeSectionToggle } from "@/lib/content-types";

const DEFAULT_THEME = DEFAULT_CONTENT.appearance.theme;

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const isValid = /^#[0-9a-fA-F]{6}$/.test(value);

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={isValid ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-14 cursor-pointer rounded-sm border border-stone-300 bg-transparent p-1 dark:border-stone-700"
          aria-label={`${label} color picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#0F2E1D"
          spellCheck={false}
          className={cn(
            "h-11 w-32 rounded-sm border bg-white/60 px-3 font-mono text-sm text-stone-800",
            "dark:bg-stone-900/40 dark:text-stone-100",
            isValid ? "border-stone-300 dark:border-stone-700" : "border-red-400"
          )}
        />
        {!isValid && <span className="text-xs text-red-500">Use a 6-digit hex code</span>}
      </div>
    </div>
  );
}

function SectionToggleList({
  sections,
  onChange,
}: {
  sections: HomeSectionToggle[];
  onChange: (next: HomeSectionToggle[]) => void;
}) {
  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    const a = sections[index];
    const b = sections[target];
    if (!a || !b) return;
    const next = [...sections];
    next[index] = b;
    next[target] = a;
    onChange(next);
  }

  function toggleVisible(index: number) {
    const current = sections[index];
    if (!current) return;
    const next = [...sections];
    next[index] = { ...current, visible: !current.visible };
    onChange(next);
  }

  return (
    <ul className="max-w-xl divide-y divide-stone-200 overflow-hidden rounded-sm border border-stone-200 dark:divide-stone-800 dark:border-stone-800">
      {sections.map((section, index) => (
        <li
          key={section.key}
          className={cn(
            "flex items-center justify-between gap-3 bg-white/60 px-4 py-3 dark:bg-stone-900/30",
            !section.visible && "opacity-50"
          )}
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-stone-400">{index + 1}</span>
            <span className="text-sm">{section.label}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => move(index, -1)}
              disabled={index === 0}
              aria-label={`Move ${section.label} up`}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => move(index, 1)}
              disabled={index === sections.length - 1}
              aria-label={`Move ${section.label} down`}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => toggleVisible(index)}
              aria-label={section.visible ? `Hide ${section.label}` : `Show ${section.label}`}
            >
              {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AppearanceEditor({ initial }: { initial: AppearanceContent }) {
  const { data, setData, save, state, errorMessage } = useSaveSection("appearance", initial);

  return (
    <div>
      <SaveBar
        title="Appearance"
        description="Brand colors and homepage section layout — changes apply across the whole site immediately."
        state={state}
        errorMessage={errorMessage}
        onSave={save}
      />

      <div className="max-w-2xl space-y-10">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg">Theme colors</h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setData({ ...data, theme: { ...DEFAULT_THEME } })}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset to default
            </Button>
          </div>
          <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">
            Primary is the deep brand color used for dark backgrounds and primary buttons. Accent is
            the highlight color used for links, borders, and small details throughout the site.
          </p>
          <div className="flex flex-wrap gap-6">
            <ColorField
              label="Primary color"
              value={data.theme.primary}
              onChange={(hex) => setData({ ...data, theme: { ...data.theme, primary: hex } })}
            />
            <ColorField
              label="Accent color"
              value={data.theme.accent}
              onChange={(hex) => setData({ ...data, theme: { ...data.theme, accent: hex } })}
            />
          </div>

          {/* Live preview so the admin can see the pairing before saving */}
          <div
            className="mt-6 flex items-center gap-4 rounded-sm border border-stone-200 p-4 dark:border-stone-800"
            style={
              {
                "--preview-primary": /^#[0-9a-fA-F]{6}$/.test(data.theme.primary) ? data.theme.primary : "#0F2E1D",
                "--preview-accent": /^#[0-9a-fA-F]{6}$/.test(data.theme.accent) ? data.theme.accent : "#B08D57",
              } as React.CSSProperties
            }
          >
            <div
              className="flex h-16 flex-1 items-center justify-center rounded-sm text-xs font-medium uppercase tracking-widest2"
              style={{ background: "var(--preview-primary)", color: "white" }}
            >
              Primary
            </div>
            <div
              className="flex h-16 flex-1 items-center justify-center rounded-sm text-xs font-medium uppercase tracking-widest2 text-ink"
              style={{ background: "var(--preview-accent)" }}
            >
              Accent
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-1 font-display text-lg">Homepage layout</h2>
          <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">
            Show, hide, and reorder the sections below the hero. The hero and the &ldquo;Find us&rdquo;
            map at the bottom are always shown.
          </p>
          <SectionToggleList
            sections={data.homeSections}
            onChange={(homeSections) => setData({ ...data, homeSections })}
          />
        </section>
      </div>
    </div>
  );
}
