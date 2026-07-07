import type { Metadata } from "next";
import Image from "next/image";
import { Clock } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { getSiteContent } from "@/lib/content-store";
import { formatUSD } from "@/lib/utils";

// Reads live content from the database on every request — without this,
// Next.js would statically prerender this page at build time and never
// pick up admin edits made afterward.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dining",
  description: "Il Vetro, La Terrazza, and The Grotto Bar — three dining venues at Solterra Cliff House, led by Executive Chef Elena Moretti.",
};

export default async function DiningPage() {
  const { dining } = await getSiteContent();
  const { venues: diningVenues, menu: menuSample, chef } = dining;
  return (
    <>
      <PageHeader
        eyebrow="Dining"
        title="A table built into the cliff"
        description="Three venues, one philosophy: cook what the coast gives up that morning, and let the view do the rest."
        image="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2000&auto=format&fit=crop"
      />

      {/* Venues */}
      <section className="container-hotel py-20">
        <div className="grid gap-8 md:grid-cols-3">
          {diningVenues.map((venue, i) => (
            <Reveal key={venue.name} delay={i * 0.08} className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
                <Image
                  src={venue.image}
                  alt={venue.name}
                  fill
                  loading="lazy"
                  className="object-cover transition-transform duration-700 ease-signature group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <h3 className="mt-4 font-display text-2xl">{venue.name}</h3>
              <p className="text-sm font-medium text-bronze-500">{venue.tagline}</p>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">{venue.description}</p>
              <p className="mt-3 flex items-center gap-2 font-mono text-xs uppercase tracking-widest2 text-stone-500">
                <Clock className="h-3.5 w-3.5" /> {venue.hours}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Sample menu */}
      <section className="bg-conservatory-900 py-20 text-stone-100">
        <div className="container-hotel grid gap-12 md:grid-cols-2">
          <Reveal>
            <p className="eyebrow text-bronze-300">Sample Tasting Menu</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">{menuSample.title}</h2>
            <ul className="mt-8 divide-y divide-white/10">
              {menuSample.courses.map((c) => (
                <li key={c.course} className="flex justify-between gap-6 py-4">
                  <span className="font-mono text-xs uppercase tracking-widest2 text-bronze-300">{c.course}</span>
                  <span className="text-right text-stone-200">{c.item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">
              <span className="text-sm text-stone-400">Per guest, wine pairing available</span>
              <span className="font-display text-2xl text-bronze-300">{formatUSD(menuSample.price)}</span>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
              <Image src={chef.image} alt={chef.name} fill loading="lazy" className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
            <p className="mt-4 font-display text-xl">{chef.name}</p>
            <p className="text-sm text-bronze-300">{chef.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-stone-400">{chef.bio}</p>
          </Reveal>
        </div>
      </section>

      {/* Reservation CTA */}
      <section className="container-hotel py-20 text-center">
        <Reveal>
          <p className="eyebrow">Book a table</p>
          <h2 className="mx-auto mt-3 max-w-lg font-display text-3xl md:text-4xl">
            Il Vetro seats 32 guests a night — reserve ahead of your stay
          </h2>
          <Button variant="bronze" size="lg" className="mt-8">
            Reserve a Table
          </Button>
        </Reveal>
      </section>
    </>
  );
}
