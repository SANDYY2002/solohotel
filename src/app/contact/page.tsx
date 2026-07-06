import type { Metadata } from "next";
import { Phone, Mail, Instagram, Facebook } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { LocationMap } from "@/components/shared/location-map";
import { ContactForm } from "@/components/contact/contact-form";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach the Solterra Cliff House concierge team by phone, email, or message — or find us on the Path of the Gods.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="We're easiest to reach directly"
        description="For reservations, events, or anything in between, our concierge team is on call daily from 7am to 11pm CET."
        image="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=2000&auto=format&fit=crop"
      />

      <section className="container-hotel grid gap-16 py-20 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow">Send a message</p>
          <h2 className="mt-3 mb-8 font-display text-3xl">Tell us what you need</h2>
          <ContactForm />
        </Reveal>

        <Reveal delay={0.1}>
          <p className="eyebrow">Direct lines</p>
          <h2 className="mt-3 mb-8 font-display text-3xl">Talk to the concierge</h2>
          <ul className="space-y-4 text-stone-700 dark:text-stone-300">
            <li className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-bronze-400" />
              <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} className="hover:text-bronze-500">
                {siteConfig.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-bronze-400" />
              <a href={`mailto:${siteConfig.email}`} className="hover:text-bronze-500">
                {siteConfig.email}
              </a>
            </li>
          </ul>
          <div className="mt-6 flex gap-4">
            <a href={siteConfig.social.instagram} aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 hover:border-bronze-400 hover:text-bronze-500 dark:border-stone-700">
              <Instagram className="h-4 w-4" />
            </a>
            <a href={siteConfig.social.facebook} aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 hover:border-bronze-400 hover:text-bronze-500 dark:border-stone-700">
              <Facebook className="h-4 w-4" />
            </a>
          </div>  

          <div className="mt-10">
            <LocationMap />
          </div>
        </Reveal>
      </section>
    </>
  );
}
