import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getSiteContent } from "@/lib/content-store";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";

const SPA_IMAGE = "https://images.unsplash.com/photo-1544161515638-e0ab5c0a5a4e?q=80&w=1600&auto=format&fit=crop";

export async function SpaSection() {
  const { spa } = await getSiteContent();
  return (
    <section className="bg-stone-100 dark:bg-stone-900/40" aria-labelledby="spa-heading">
      <div className="container-hotel grid gap-10 py-24 md:grid-cols-2 md:items-center">
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-sm">
          <Image
            src={SPA_IMAGE}
            alt="Basalt thermal pool at the Yukin spa"
            fill
            loading="lazy"
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </Reveal>
        <Reveal>
          <p className="eyebrow">Spa & Wellness</p>
          <h2 id="spa-heading" className="mt-3 font-display text-4xl md:text-5xl">
            Carved into the rock itself
          </h2>
          <p className="mt-5 max-w-md text-stone-600 dark:text-stone-400">
            A basalt thermal circuit built directly into the cliff face, fed by the same spring that has warmed
            this coastline for centuries.
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-y-2 text-sm text-stone-600 dark:text-stone-400">
            {spa.facilities.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-bronze-400" aria-hidden /> {f}
              </li>
            ))}
          </ul>
          <Link href="/spa" className="mt-8 inline-block">
            <Button variant="primary" className="group">
              Discover the Spa{" "}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Button>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}