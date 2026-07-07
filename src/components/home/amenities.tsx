import { Reveal } from "@/components/shared/reveal";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { ContourMotif } from "@/components/shared/contour-motif";
import { getSiteContent } from "@/lib/content-store";
import { resolveIcon } from "@/lib/icon-map";

export async function Amenities() {
  const { home } = await getSiteContent();
  const { amenities, stats } = home;

  return (
    <section className="bg-conservatory-900 py-24 text-stone-100" aria-labelledby="amenities-heading">
      <div className="container-hotel">
        <Reveal className="mb-14 max-w-xl">
          <p className="eyebrow text-bronze-300">On the property</p>
          <h2 id="amenities-heading" className="mt-3 font-display text-4xl md:text-5xl">
            Everything the cliff can hold
          </h2>
        </Reveal>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {amenities.map((a, i) => {
            const Icon = resolveIcon(a.icon);
            return (
              <Reveal key={a.title} delay={i * 0.06} className="flex gap-4">
                <Icon className="mt-1 h-6 w-6 flex-shrink-0 text-bronze-300" aria-hidden />
                <div>
                  <h3 className="font-display text-lg">{a.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-stone-400">{a.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <ContourMotif className="my-16 h-8 text-bronze-400/40" />

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s) => (
            <AnimatedCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
