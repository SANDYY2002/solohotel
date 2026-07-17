// Small color-math helpers for the admin "Appearance" theme controls.
//
// Admins pick two base colors (primary + accent) in /admin/appearance.
// Rather than exposing a picker for every shade in the palette, we derive
// the handful of shades actually used across the site (see the
// "conservatory" and "bronze" entries in tailwind.config.ts) from those
// two inputs, so the whole site repaints consistently from one save.

type Rgb = [number, number, number];

// Falls back to the site's original design tokens if a stored value is
// missing or malformed — the theme should never break the page.
const DEFAULT_PRIMARY: Rgb = [15, 46, 29]; // #0F2E1D — conservatory-900
const DEFAULT_ACCENT: Rgb = [176, 141, 87]; // #B08D57 — bronze-400

function parseHex(hex: string): Rgb | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  const digits = match?.[1];
  if (!digits) return null;
  const int = parseInt(digits, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function mix(rgb: Rgb, target: number, amount: number): Rgb {
  return rgb.map((c) => Math.round(c + (target - c) * amount)) as Rgb;
}

function triplet(rgb: Rgb): string {
  return `${rgb[0]} ${rgb[1]} ${rgb[2]}`;
}

export type ThemeColorsInput = { primary: string; accent: string } | undefined;

/**
 * Builds the CSS custom properties that drive the site's brand colors.
 * Applied on <html> in the root layout, these override the fallback
 * values baked into tailwind.config.ts + globals.css, so every
 * `bg-conservatory-900`, `text-bronze-400`, etc. class across the app
 * repaints — no per-component changes needed.
 */
export function buildThemeCssVars(theme: ThemeColorsInput): Record<string, string> {
  const primary = (theme?.primary && parseHex(theme.primary)) || DEFAULT_PRIMARY;
  const accent = (theme?.accent && parseHex(theme.accent)) || DEFAULT_ACCENT;

  return {
    "--color-primary-900": triplet(primary),
    "--color-primary-950": triplet(mix(primary, 0, 0.3)),
    "--color-accent-300": triplet(mix(accent, 255, 0.22)),
    "--color-accent-400": triplet(accent),
    "--color-accent-500": triplet(mix(accent, 0, 0.2)),
  };
}
