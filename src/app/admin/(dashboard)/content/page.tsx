import Link from "next/link";
import { Settings, Home, BedDouble, UtensilsCrossed, Flower2, Image as ImageIcon, Quote, HelpCircle, Users, ArrowRight } from "lucide-react";
import { ContentBackupCard } from "@/components/admin/content-backup-card";

const SECTIONS = [
  { href: "/admin/content/settings", icon: Settings, title: "Site Settings", desc: "Name, tagline, contact info, social links, nav menu." },
  { href: "/admin/content/home", icon: Home, title: "Home Page", desc: "Hero image, amenities, and the stat counters." },
  { href: "/admin/content/rooms", icon: BedDouble, title: "Rooms & Suites", desc: "Add, edit, or remove rooms, pricing, and photos." },
  { href: "/admin/content/dining", icon: UtensilsCrossed, title: "Dining", desc: "Restaurants, the sample tasting menu, and the chef bio." },
  { href: "/admin/content/spa", icon: Flower2, title: "Spa & Wellness", desc: "Treatments, packages, and facilities list." },
  { href: "/admin/content/gallery", icon: ImageIcon, title: "Gallery", desc: "Photos shown on the gallery page and homepage preview." },
  { href: "/admin/content/testimonials", icon: Quote, title: "Testimonials", desc: "Guest quotes shown on the homepage." },
  { href: "/admin/content/faqs", icon: HelpCircle, title: "FAQs", desc: "Frequently asked questions on the homepage." },
  { href: "/admin/content/about", icon: Users, title: "About Page", desc: "Property story, sustainability, staff, and awards." },
];

export default function AdminContentHub() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl">Site Content</h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Everything here updates the live site immediately after you save — no code changes or redeploy needed.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map(({ href, icon: Icon, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col rounded-sm border border-stone-200 bg-white p-5 transition-colors hover:border-bronze-400 dark:border-stone-800 dark:bg-conservatory-900"
          >
            <Icon className="h-5 w-5 text-bronze-400" aria-hidden />
            <div className="mt-3 flex items-center justify-between">
              <h2 className="font-display text-lg">{title}</h2>
              <ArrowRight className="h-4 w-4 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-bronze-400" aria-hidden />
            </div>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{desc}</p>
          </Link>
        ))}
      </div>

      <ContentBackupCard />
    </div>
  );
}
