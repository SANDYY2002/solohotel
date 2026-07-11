import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getSiteContent } from "@/lib/content-store";
import { Reveal } from "@/components/shared/reveal";

export async function GalleryPreview() {
  const { gallery } = await getSiteContent();
  const images = gallery.slice(0, 5);
  return (
    <section className="container-hotel py-24" aria-labelledby="gallery-heading">
      <Reveal className="mb-10 flex items-end justify-between">
        <div>
          <p className="eyebrow">A closer look</p>
          <h2 id="gallery-heading" className="mt-3 font-display text-4xl md:text-5xl">
            The gallery
          </h2>
        </div>
        <Link href="/gallery" className="group hidden items-center gap-1 text-sm font-medium text-bronze-500 md:flex">
          Full gallery
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </Reveal>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {images.map((img, i) => (
          <Reveal
            key={img.src}
            delay={i * 0.05}
            className={i === 0 ? "col-span-2 row-span-2 md:col-span-2" : ""}
          >
            <Link
              href="/gallery"
              className="group relative block h-full min-h-[140px] overflow-hidden rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze-400 md:min-h-[220px]"
            >
              <Image
                src={img.src}
                alt={img.alt || "Photo from Yukin Cliff House"}
                fill
                loading="lazy"
                sizes="(max-width: 768px) 50vw, 20vw"
                className="object-cover transition-transform duration-500 ease-signature group-hover:scale-105"
              />
            </Link>
          </Reveal>
        ))}
      </div>
      <Link href="/gallery" className="mt-8 flex items-center gap-1 text-sm font-medium text-bronze-500 md:hidden">
        Full gallery <ArrowUpRight className="h-4 w-4" aria-hidden />
      </Link>
    </section>
  );
}