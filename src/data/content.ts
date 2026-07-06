export const diningVenues = [
  {
    name: "Il Vetro",
    tagline: "Glasshouse dining, cliff-edge",
    hours: "7:30 PM – 11:00 PM · Tue–Sun",
    description:
      "Our signature glasshouse restaurant, built into the rock with a retractable roof. Chef Elena Moretti's tasting menu changes with what the coast gives up each morning.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop",
  },
  {
    name: "La Terrazza",
    tagline: "All-day terrace café",
    hours: "7:00 AM – 6:00 PM · Daily",
    description:
      "Wood-fired focaccia, citrus from the garden, and the coast's best espresso, served on a terrace that catches the morning light.",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1600&auto=format&fit=crop",
  },
  {
    name: "The Grotto Bar",
    tagline: "Cellar bar & cigar lounge",
    hours: "6:00 PM – 1:00 AM · Daily",
    description:
      "A cave-cellar bar stocked with amaro and rare vermouth, where the sommelier pours by candlelight.",
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=1600&auto=format&fit=crop",
  },
];

export const menuSample = {
  title: "Il Vetro — Tasting Menu",
  courses: [
    { course: "Amuse-bouche", item: "Sea urchin, brown butter, lemon leaf" },
    { course: "First", item: "Hand-cut tagliolini, bottarga, wild fennel" },
    { course: "Second", item: "Line-caught turbot, artichoke, coastal herbs" },
    { course: "Third", item: "Slow-roast lamb, charred onion, salsa verde" },
    { course: "Dessert", item: "Limoncello semifreddo, basil, olive oil crumble" },
  ],
  price: 195,
};

export const chef = {
  name: "Elena Moretti",
  title: "Executive Chef",
  bio:
    "Raised in a fishing family on this coastline, Elena trained in Lyon and Modena before returning home to build a menu around what her father still brings in each morning.",
  image: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?q=80&w=1200&auto=format&fit=crop",
};

export const spaTreatments = [
  {
    name: "Stone Ritual",
    duration: "90 min",
    price: 260,
    description: "Warm basalt stones and marjoram oil, worked in long strokes to release the coast from your shoulders.",
  },
  {
    name: "Citrus & Salt Polish",
    duration: "60 min",
    price: 180,
    description: "A whole-body exfoliation using salt from the bay and oil pressed from our own lemon terraces.",
  },
  {
    name: "Grotto Facial",
    duration: "75 min",
    price: 220,
    description: "Cold-water algae and marine collagen, finished with a cryo-jade roller drawn from our plunge pool.",
  },
  {
    name: "Wild Herb Massage",
    duration: "50 min",
    price: 150,
    description: "Rosemary and bay laurel, harvested that morning from the hillside behind the spa.",
  },
];

export const spaPackages = [
  {
    name: "Half-Day Reset",
    price: 340,
    includes: ["60-min massage", "Thermal circuit access", "Garden lunch"],
  },
  {
    name: "Full Coastal Retreat",
    price: 620,
    includes: ["90-min Stone Ritual", "Facial", "Thermal circuit access", "Private cabana", "Lunch + tasting"],
  },
];

export const spaFacilities = [
  "Basalt thermal circuit",
  "Salt-water infinity pool",
  "Cliffside sauna",
  "Cold plunge grotto",
  "Outdoor yoga terrace",
  "Herbal steam room",
];

export const testimonials = [
  {
    name: "Margaux L.",
    origin: "Paris, France",
    quote:
      "Every window at Solterra is composed like a painting. The staff remembered our anniversary without being told twice.",
    rating: 5,
  },
  {
    name: "David & Priya K.",
    origin: "Singapore",
    quote:
      "We've stayed at most of the well-known coastal properties. This is the first one that felt personal rather than performed.",
    rating: 5,
  },
  {
    name: "Julian M.",
    origin: "New York, USA",
    quote:
      "The Grotto Villa's plunge pool at sunrise is worth the trip alone. Booking again before we'd even checked out.",
    rating: 5,
  },
  {
    name: "Anke B.",
    origin: "Hamburg, Germany",
    quote:
      "Il Vetro's tasting menu was the best meal of our trip through Italy — and we ate very well that week.",
    rating: 5,
  },
];

export type GalleryCategory = "Rooms" | "Dining" | "Spa" | "Grounds" | "Coastline";

export const galleryImages: { src: string; category: GalleryCategory; alt: string; w: number; h: number }[] = [
  { src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop", category: "Rooms", alt: "Cliffside room with soaking tub facing the sea", w: 4, h: 5 },
  { src: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1200&auto=format&fit=crop", category: "Rooms", alt: "Garden room with limewashed walls", w: 4, h: 3 },
  { src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop", category: "Dining", alt: "Glasshouse restaurant at dusk", w: 3, h: 4 },
  { src: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1200&auto=format&fit=crop", category: "Dining", alt: "Terrace café breakfast spread", w: 4, h: 3 },
  { src: "https://images.unsplash.com/photo-1544161515638-e0ab5c0a5a4e?q=80&w=1200&auto=format&fit=crop", category: "Spa", alt: "Basalt thermal pool", w: 4, h: 5 },
  { src: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop", category: "Spa", alt: "Spa treatment room with candlelight", w: 3, h: 4 },
  { src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop", category: "Grounds", alt: "Lemon terrace garden path", w: 4, h: 3 },
  { src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200&auto=format&fit=crop", category: "Grounds", alt: "Infinity pool overlooking the coast", w: 4, h: 5 },
  { src: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?q=80&w=1200&auto=format&fit=crop", category: "Coastline", alt: "Amalfi coastline at golden hour", w: 4, h: 3 },
  { src: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1200&auto=format&fit=crop", category: "Coastline", alt: "Private cove access stairway", w: 3, h: 4 },
  { src: "https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=1200&auto=format&fit=crop", category: "Rooms", alt: "Suite lounge with fireplace", w: 4, h: 3 },
  { src: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=1200&auto=format&fit=crop", category: "Dining", alt: "Grotto cellar bar", w: 3, h: 4 },
];

export const faqs = [
  {
    q: "What time is check-in and check-out?",
    a: "Check-in is from 3:00 PM and check-out is by 11:00 AM. Early arrival and late departure can be arranged in advance, subject to availability.",
  },
  {
    q: "Is Solterra suitable for children?",
    a: "We welcome guests of all ages in our Garden Rooms, Suites and Villas. Cliffside View Rooms are recommended for guests 12 and older, given the open-tub layout.",
  },
  {
    q: "Do you offer airport or port transfers?",
    a: "Yes — private car transfers from Naples International Airport and boat transfers from Salerno or Positano can be arranged by our concierge at the time of booking.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Standard rates are fully refundable up to 7 days before arrival. Non-refundable rates offer a reduced price and can be modified only in exceptional circumstances.",
  },
  {
    q: "Is the property accessible?",
    a: "Garden Rooms and the main restaurant are step-free from the lower terrace entrance. Please contact our concierge ahead of arrival so we can prepare accordingly.",
  },
  {
    q: "Are pets allowed?",
    a: "Well-behaved dogs under 15kg are welcome in Garden Rooms and Villas for an additional fee. Please let us know in advance.",
  },
];

export const awards = [
  { year: "2025", title: "Condé Nast Traveler — Gold List" },
  { year: "2024", title: "Michelin Key — Three Keys" },
  { year: "2024", title: "World's Leading Cliffside Retreat, World Travel Awards" },
  { year: "2023", title: "Il Vetro — 1 Michelin Star" },
];

export const staff = [
  {
    name: "Elena Moretti",
    role: "Executive Chef",
    image: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Marco Ferrante",
    role: "General Manager",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Sofia Greco",
    role: "Spa Director",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop",
  },
  {
    name: "Luca Bianchi",
    role: "Head Concierge",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
  },
];
