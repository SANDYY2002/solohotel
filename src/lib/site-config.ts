export const siteConfig = {
  name: "SOLTERRA",
  fullName: "Solterra Cliff House",
  tagline: "A conservatory above the sea",
  description:
    "Solterra Cliff House is a 42-suite five-star retreat set into the botanical cliffs above the Amalfi coastline — glasshouse dining, a stone-carved spa, and rooms built around the view.",
  location: "Path of the Gods, Praiano, Amalfi Coast, Italy",
  phone: "+39 089 555 0142",
  email: "reservations@solterracliffhouse.com",
  coordinates: { lat: 40.6157, lng: 14.4756 },
  social: {
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    pinterest: "https://pinterest.com",
    x: "https://x.com",
  },
  nav: [
    { label: "Rooms & Suites", href: "/rooms" },
    { label: "Dining", href: "/dining" },
    { label: "Spa & Wellness", href: "/spa" },
    { label: "Gallery", href: "/gallery" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  bookingCta: "Check Availability",
};

export type SiteConfig = typeof siteConfig;
