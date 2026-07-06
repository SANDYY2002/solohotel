import Link from "next/link";
import { Facebook, Instagram, MapPin, Mail, Phone } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { ContourMotif } from "@/components/shared/contour-motif";
import { NewsletterForm } from "@/components/shared/newsletter-form";

export function Footer() {
  return (
    <footer className="bg-conservatory-950 text-stone-300">
      <div className="container-hotel pt-16">
        <ContourMotif className="h-10 text-bronze-400/50" />
      </div>

      <div className="container-hotel grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl uppercase tracking-widest2 text-stone-50">{siteConfig.name}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone-400">{siteConfig.description}</p>
          <div className="mt-6 flex gap-4">
            <a href={siteConfig.social.instagram} aria-label="Instagram" className="text-stone-400 hover:text-bronze-400">
              <Instagram className="h-5 w-5" />
            </a>
            <a href={siteConfig.social.facebook} aria-label="Facebook" className="text-stone-400 hover:text-bronze-400">
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <p className="eyebrow mb-4">Explore</p>
          <ul className="space-y-2 text-sm">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-stone-400 transition-colors hover:text-stone-50">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4">Contact</p>
          <ul className="space-y-3 text-sm text-stone-400">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-bronze-400" /> {siteConfig.location}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 flex-shrink-0 text-bronze-400" /> {siteConfig.phone}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 flex-shrink-0 text-bronze-400" /> {siteConfig.email}
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4">The Coastal Letter</p>
          <p className="mb-4 text-sm text-stone-400">
            Seasonal openings, chef&apos;s table dates, and quiet-week offers — once a month, nothing more.
          </p>
          <NewsletterForm dark />
        </div>
      </div>

      <div className="container-hotel flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-xs text-stone-500 md:flex-row">
        <p>&copy; {new Date().getFullYear()} {siteConfig.fullName}. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/contact" className="hover:text-stone-300">Privacy Policy</Link>
          <Link href="/contact" className="hover:text-stone-300">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
