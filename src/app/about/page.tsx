import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { ContourMotif } from "@/components/shared/contour-motif";
import { getSiteContent } from "@/lib/content-store";
import { resolveIcon } from "@/lib/icon-map";

// Reads live content from the database on every request — without this,
// Next.js would statically prerender this page at build time and never
// pick up admin edits made afterward.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description: "The story of Solterra Cliff House — a family property carved into the Amalfi coastline, its people, its awards, and its approach to sustainability.",
};

export default async function AboutPage() {
  const { about } = await getSiteContent();
  const { storyHeading, storyParagraphs, sustainability, staff, awards } = about;
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Built into the cliff, not on top of it"
        description="Solterra began as a single fisherman's house on this rock face in 1961. Three generations later, it's still a family that runs it."
        image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop"
      />

      {/* Story */}
      <section className="container-hotel py-20">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <Reveal>
            <p className="eyebrow">Our story</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">{storyHeading}</h2>
            {storyParagraphs.map((p, i) => (
              <p key={i} className="mt-5 text-stone-600 first:mt-5 dark:text-stone-400">
                {p}
              </p>
            ))}
          </Reveal>
          <Reveal delay={0.1} className="relative aspect-[4/5] overflow-hidden rounded-sm">
            <Image
              src="https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?q=80&w=1600&auto=format&fit=crop"
              alt="Solterra Cliff House terraces"
              fill
              loading="lazy"
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </Reveal>
        </div>
      </section>

      {/* Staff */}
      <section className="bg-conservatory-900 py-20 text-stone-100">
        <div className="container-hotel">
          <Reveal className="mb-12 max-w-lg">
            <p className="eyebrow text-bronze-300">The people</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">Who you&apos;ll meet</h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {staff.map((s, i) => (
              <Reveal key={s.name} delay={i * 0.06}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-sm">
                  <Image src={s.image} alt={s.name} fill loading="lazy" className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                </div>
                <p className="mt-3 font-display text-lg">{s.name}</p>
                <p className="text-xs font-mono uppercase tracking-widest2 text-bronze-300">{s.role}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="container-hotel py-20">
        <Reveal className="mb-10 max-w-lg">
          <p className="eyebrow">Recognition</p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl">Awards & press</h2>
        </Reveal>
        <div className="divide-y divide-stone-200 dark:divide-stone-800">
          {awards.map((a, i) => (
            <Reveal key={a.title} delay={i * 0.05} className="flex items-center justify-between py-5">
              <span className="font-display text-lg md:text-xl">{a.title}</span>
              <span className="font-mono text-sm text-bronze-500">{a.year}</span>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="container-hotel">
        <ContourMotif className="h-10 text-bronze-400/40" />
      </div>

      {/* Sustainability */}
      <section className="container-hotel py-20">
        <Reveal className="mb-12 max-w-lg">
          <p className="eyebrow">Sustainability</p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl">Left the way we found it</h2>
        </Reveal>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {sustainability.map((s, i) => {
            const Icon = resolveIcon(s.icon);
            return (
              <Reveal key={s.title} delay={i * 0.06}>
                <Icon className="h-6 w-6 text-bronze-400" aria-hidden />
                <h3 className="mt-3 font-display text-lg">{s.title}</h3>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{s.desc}</p>
              </Reveal>
            );
          })}
        </div>
      </section>
    </>
  );
}
