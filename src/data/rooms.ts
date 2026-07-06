export type Room = {
  slug: string;
  name: string;
  category: "Garden" | "Cliffside" | "Suite" | "Villa";
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

export const rooms: Room[] = [
  {
    slug: "conservatory-garden-room",
    name: "Conservatory Garden Room",
    category: "Garden",
    pricePerNight: 480,
    size: "38 m²",
    maxGuests: 2,
    bedType: "1 King Bed",
    view: "Terraced Garden",
    description:
      "Ground-floor rooms opening onto the lemon terraces, with limewashed walls, brass fittings, and a private sitting nook framed by climbing jasmine.",
    features: ["Private terrace", "Rain shower", "Espresso bar", "Linen loungewear", "Ceiling fan + AC"],
    images: [
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=1600&auto=format&fit=crop",
    ],
    available: true,
    unitsLeft: 6,
  },
  {
    slug: "cliffside-view-room",
    name: "Cliffside View Room",
    category: "Cliffside",
    pricePerNight: 620,
    size: "42 m²",
    maxGuests: 2,
    bedType: "1 King Bed",
    view: "Open Sea",
    description:
      "Set two floors above the water, each room is oriented for uninterrupted sunset views, with a stone soaking tub positioned at the window.",
    features: ["Window-side soaking tub", "Private balcony", "Nespresso + minibar", "Egyptian cotton linens", "Smart climate control"],
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1600&auto=format&fit=crop",
    ],
    available: true,
    unitsLeft: 4,
  },
  {
    slug: "belvedere-suite",
    name: "Belvedere Suite",
    category: "Suite",
    pricePerNight: 980,
    size: "68 m²",
    maxGuests: 3,
    bedType: "1 King Bed + Daybed",
    view: "Panoramic Coastline",
    description:
      "A corner suite wrapped in glass on two sides, with a sunken lounge, wood-burning fireplace, and a wraparound balcony that catches both sunrise and sunset.",
    features: ["Wraparound balcony", "Wood-burning fireplace", "Separate lounge", "Butler service", "Freestanding copper tub"],
    images: [
      "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?q=80&w=1600&auto=format&fit=crop",
    ],
    available: true,
    unitsLeft: 2,
  },
  {
    slug: "grotto-villa",
    name: "Grotto Villa",
    category: "Villa",
    pricePerNight: 1850,
    size: "140 m²",
    maxGuests: 5,
    bedType: "2 King Beds",
    view: "Private Cove",
    description:
      "A stand-alone villa carved into the rock face with direct stair access to a private cove, its own infinity plunge pool, and a resident host on call.",
    features: ["Private plunge pool", "Direct cove access", "Full kitchen", "Dedicated host", "Outdoor dining terrace"],
    images: [
      "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1600&auto=format&fit=crop",
    ],
    available: false,
    unitsLeft: 0,
  },
];

export const roomCategories = ["All", "Garden", "Cliffside", "Suite", "Villa"] as const;
