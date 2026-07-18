// Curated font + size options for the admin "Appearance" page.
//
// We use a fixed list (not free text) for two reasons: every option is
// guaranteed to actually exist on Google Fonts, and each one is picked to
// fit the site's existing luxury-hotel design language rather than
// clashing with it. "default" options need no extra network request —
// they're the fonts already bundled via next/font in layout.tsx.

export type FontOption = {
  id: string;
  label: string;
  /** CSS font-family name. */
  family: string;
  /** Google Fonts css2 API param, e.g. "Playfair+Display:wght@400;600". Null for bundled defaults. */
  googleParam: string | null;
  fallback: "serif" | "sans-serif";
};

export const DISPLAY_FONTS: FontOption[] = [
  { id: "fraunces", label: "Fraunces (default)", family: "Fraunces", googleParam: null, fallback: "serif" },
  { id: "playfair", label: "Playfair Display", family: "Playfair Display", googleParam: "Playfair+Display:wght@400;500;600;700", fallback: "serif" },
  { id: "cormorant", label: "Cormorant Garamond", family: "Cormorant Garamond", googleParam: "Cormorant+Garamond:wght@400;500;600;700", fallback: "serif" },
  { id: "dm-serif", label: "DM Serif Display", family: "DM Serif Display", googleParam: "DM+Serif+Display:wght@400", fallback: "serif" },
  { id: "libre-baskerville", label: "Libre Baskerville", family: "Libre Baskerville", googleParam: "Libre+Baskerville:wght@400;700", fallback: "serif" },
  { id: "marcellus", label: "Marcellus", family: "Marcellus", googleParam: "Marcellus:wght@400", fallback: "serif" },
];

export const BODY_FONTS: FontOption[] = [
  { id: "manrope", label: "Manrope (default)", family: "Manrope", googleParam: null, fallback: "sans-serif" },
  { id: "inter", label: "Inter", family: "Inter", googleParam: "Inter:wght@400;500;600;700", fallback: "sans-serif" },
  { id: "work-sans", label: "Work Sans", family: "Work Sans", googleParam: "Work+Sans:wght@400;500;600;700", fallback: "sans-serif" },
  { id: "jost", label: "Jost", family: "Jost", googleParam: "Jost:wght@400;500;600;700", fallback: "sans-serif" },
  { id: "karla", label: "Karla", family: "Karla", googleParam: "Karla:wght@400;500;600;700", fallback: "sans-serif" },
  { id: "outfit", label: "Outfit", family: "Outfit", googleParam: "Outfit:wght@400;500;600;700", fallback: "sans-serif" },
];

export const FONT_SCALES = [
  { id: "compact", label: "Compact", percent: 93.75 },
  { id: "comfortable", label: "Comfortable (default)", percent: 100 },
  { id: "spacious", label: "Spacious", percent: 109.375 },
] as const;

export type FontScaleId = (typeof FONT_SCALES)[number]["id"];

const DEFAULT_DISPLAY_FONT: FontOption = DISPLAY_FONTS[0]!;
const DEFAULT_BODY_FONT: FontOption = BODY_FONTS[0]!;

export function findDisplayFont(id: string): FontOption {
  return DISPLAY_FONTS.find((f) => f.id === id) ?? DEFAULT_DISPLAY_FONT;
}

export function findBodyFont(id: string): FontOption {
  return BODY_FONTS.find((f) => f.id === id) ?? DEFAULT_BODY_FONT;
}

export function findFontScale(id: string): (typeof FONT_SCALES)[number] {
  return FONT_SCALES.find((f) => f.id === id) ?? FONT_SCALES[1];
}

/** Builds the Google Fonts css2 stylesheet URL for whichever picks need it, or null if both are bundled defaults. */
export function buildGoogleFontsHref(displayFont: FontOption, bodyFont: FontOption): string | null {
  const families = [displayFont.googleParam, bodyFont.googleParam].filter((f): f is string => Boolean(f));
  if (families.length === 0) return null;
  const params = families.map((f) => `family=${f}`).join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}
