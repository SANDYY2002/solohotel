// Shared types for the editable site content (backed by content-store.ts).
// Every field here is something the admin dashboard can change.

export type NavItem = { label: string; href: string };

export type SiteConfig = {
  name: string;
  fullName: string;
  tagline: string;
  description: string;
  location: string;
  phone: string;
  /** Number used for the WhatsApp "chat" option. Falls back to `phone` if left blank. */
  whatsapp: string;
  email: string;
  coordinates: { lat: number; lng: number };
  social: {
    instagram: string;
    facebook: string;
    pinterest: string;
    x: string;
  };
  nav: NavItem[];
  bookingCta: string;
  /** Percentage of the total charged online at booking (0-100). 100 = full payment, lower = a deposit. */
  depositPercentage: number;
  /** USD → NPR conversion used to charge eSewa/Khalti, which only accept NPR. Update periodically — this is not a live rate. */
  usdToNprRate: number;
};

export type Amenity = { icon: string; title: string; desc: string };
export type Stat = { value: number; suffix?: string; label: string };

export type HomeContent = {
  heroImage: string;
  amenities: Amenity[];
  stats: Stat[];
};

export type RoomCategory = string;

export type Room = {
  slug: string;
  name: string;
  category: RoomCategory;
  pricePerNight: number;
  size: string;
  maxGuests: number;
  bedType: string;
  view: string;
  description: string;
  features: string[];
  images: string[];
  available: boolean;
  unitsLeft: number;
};

export type DiningVenue = {
  name: string;
  tagline: string;
  hours: string;
  description: string;
  image: string;
};

export type MenuCourse = { course: string; item: string };
export type MenuSample = { title: string; courses: MenuCourse[]; price: number };
export type Chef = { name: string; title: string; bio: string; image: string };

export type DiningContent = {
  venues: DiningVenue[];
  menu: MenuSample;
  chef: Chef;
};

export type SpaTreatment = { name: string; duration: string; price: number; description: string };
export type SpaPackage = { name: string; price: number; includes: string[] };

export type SpaContent = {
  treatments: SpaTreatment[];
  packages: SpaPackage[];
  facilities: string[];
};

export type GalleryCategory = "Rooms" | "Dining" | "Spa" | "Grounds" | "Coastline";
export type GalleryImage = { src: string; category: GalleryCategory; alt: string; w: number; h: number };

export type Testimonial = { name: string; origin: string; quote: string; rating: number };
export type Faq = { q: string; a: string };
export type Award = { year: string; title: string };
export type StaffMember = { name: string; role: string; image: string };
export type SustainabilityItem = { icon: string; title: string; desc: string };

export type AboutContent = {
  storyHeading: string;
  storyParagraphs: string[];
  sustainability: SustainabilityItem[];
  staff: StaffMember[];
  awards: Award[];
};

// Two base colors the admin picks; every brand shade used across the site
// (see tailwind.config.ts) is derived from these so the whole palette
// stays consistent without a picker per shade.
export type ThemeColors = { primary: string; accent: string };

// Homepage sections an admin can show/hide and reorder. Hero and the
// location map are structural (booking widget + SEO) and stay fixed.
export type HomeSectionKey =
  | "featuredRooms"
  | "amenities"
  | "dining"
  | "spa"
  | "testimonials"
  | "gallery"
  | "faq";

export type HomeSectionToggle = { key: HomeSectionKey; label: string; visible: boolean };

// ISO 4217 currency code, picked from the curated list in lib/currencies.ts.
export type CurrencyContent = { code: string };

// Font + size picks, from the curated lists in lib/typography.ts.
export type TypographyContent = {
  displayFontId: string;
  bodyFontId: string;
  fontScaleId: string;
};

export type AppearanceContent = {
  theme: ThemeColors;
  currency: CurrencyContent;
  typography: TypographyContent;
  homeSections: HomeSectionToggle[];
};

export type SiteContent = {
  siteConfig: SiteConfig;
  appearance: AppearanceContent;
  home: HomeContent;
  rooms: Room[];
  dining: DiningContent;
  spa: SpaContent;
  gallery: GalleryImage[];
  testimonials: Testimonial[];
  faqs: Faq[];
  about: AboutContent;
};

export const CONTENT_SECTIONS = [
  "siteConfig",
  "appearance",
  "home",
  "rooms",
  "dining",
  "spa",
  "gallery",
  "testimonials",
  "faqs",
  "about",
] as const;

export type ContentSection = (typeof CONTENT_SECTIONS)[number];
