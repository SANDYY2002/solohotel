import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { spaTreatments, spaPackages, spaFacilities, galleryImages } from "@/data/content";
import { formatUSD } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Spa & Wellness",
  description: "A basalt thermal circuit carved into the cliff, treatments drawn from the hillside and the sea, and a salt-water infinity pool.",
};

export default function SpaPage() {
  const spaImages = galleryImages.filter((g) => g.category === "Spa");

  return (
    <>
      <PageHeader
        eyebrow="Spa & Wellness"
        title="Carved into the rock itself"
        description="A basalt thermal circuit fed by the same spring that has warmed this coastline for centuries."
        image="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2000&auto=format&fit=crop"
      />

      {/* Treatments */}
      <section className="container-hotel py-20">
        <Reveal className="mb-10 max-w-lg">
          <p className="eyebrow">Treatments</p>
          <h2 className="mt-3 font-display text-4xl">Drawn from the hillside and the sea</h2>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2">
          {spaTreatments.map((t, i) => (
            <Reveal
              key={t.name}
              delay={i * 0.06}
              className="flex items-start justify-between gap-6 rounded-sm border border-stone-200/70 p-6 dark:border-stone-800"
            >
              <div>
                <h3 className="font-display text-xl">{t.name}</h3>
                <p className="mt-1 text-xs font-mono uppercase tracking-widest2 text-stone-500">{t.duration}</p>
                <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">{t.description}</p>
              </div>
              <p className="whitespace-nowrap font-display text-xl text-bronze-500">{formatUSD(t.price)}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Packages */}
      <section className="bg-stone-100 py-20 dark:bg-stone-900/40">
        <div className="container-hotel">
          <Reveal className="mb-10 max-w-lg">
            <p className="eyebrow">Packages</p>
            <h2 className="mt-3 font-display text-4xl">Half-day or full retreat</h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            {spaPackages.map((p, i) => (
              <Reveal
                key={p.name}
                delay={i * 0.08}
                className="flex flex-col rounded-sm bg-white p-8 shadow-glass dark:bg-conservatory-900"
              >
                <h3 className="font-display text-2xl">{p.name}</h3>
                <p className="mt-1 font-display text-3xl text-bronze-500">{formatUSD(p.price)}</p>
                <ul className="mt-6 space-y-2 text-sm text-stone-600 dark:text-stone-300">
                  {p.includes.map((inc) => (
                    <li key={inc} className="flex items-center gap-2">
                      <Check className="h-4 w-4 flex-shrink-0 text-bronze-400" /> {inc}
                    </li>
                  ))}
                </ul>
                <Button variant="primary" className="mt-8">
                  Book Package
                </Button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities + gallery */}
      <section className="container-hotel py-20">
        <div className="grid gap-12 md:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Facilities</p>
            <h2 className="mt-3 font-display text-3xl">Everything the circuit includes</h2>
            <ul className="mt-6 grid grid-cols-2 gap-y-3 text-sm text-stone-600 dark:text-stone-300">
              {spaFacilities.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-bronze-400" /> {f}
                </li>
              ))}
            </ul>
          </Reveal>
          <div className="grid grid-cols-2 gap-3">
            {spaImages.map((img) => (
              <Reveal key={img.src} className="relative aspect-square overflow-hidden rounded-sm">
                <Image src={img.src} alt={img.alt} fill loading="lazy" className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
