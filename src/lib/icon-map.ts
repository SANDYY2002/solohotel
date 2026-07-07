// Icons the admin can pick from for amenities / sustainability entries.
// Content is stored as JSON, so icons are saved as a name string and
// resolved to a lucide-react component here at render time.
import {
  Waves,
  UtensilsCrossed,
  Flower2,
  Sailboat,
  Wine,
  Dumbbell,
  Sun,
  Droplets,
  Leaf,
  Recycle,
  Sparkles,
  Anchor,
  Mountain,
  ShieldCheck,
  Star,
  Compass,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  Waves,
  UtensilsCrossed,
  Flower2,
  Sailboat,
  Wine,
  Dumbbell,
  Sun,
  Droplets,
  Leaf,
  Recycle,
  Sparkles,
  Anchor,
  Mountain,
  ShieldCheck,
  Star,
  Compass,
};

export const ICON_NAMES = Object.keys(ICON_MAP);

export function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Sparkles;
}
