import Image from "next/image";
import { Reveal } from "@/components/shared/reveal";

export function PageHeader({
  eyebrow,
  title,
  description,
  image,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
}) {
  return (
    <section className="relative flex min-h-[60vh] items-end overflow-hidden pt-20">
      <Image src={image} alt="" fill priority className="object-cover" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-t from-conservatory-950 via-conservatory-950/50 to-conservatory-950/10" />
      <div className="container-hotel relative z-10 pb-16 text-stone-50">
        <Reveal>
          <p className="eyebrow text-bronze-200">{eyebrow}</p>
          <h1 className="mt-3 max-w-2xl text-balance font-display text-4xl md:text-6xl">{title}</h1>
          <p className="mt-5 max-w-lg text-stone-200">{description}</p>
        </Reveal>
      </div>
    </section>
  );
}
