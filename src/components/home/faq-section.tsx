import { getSiteContent } from "@/lib/content-store";
import { Reveal } from "@/components/shared/reveal";
import { Accordion } from "@/components/ui/accordion";

export async function FaqSection() {
  const { faqs } = await getSiteContent();
  return (
    <section className="container-hotel py-24" aria-labelledby="faq-heading">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Good to know</p>
        <h2 id="faq-heading" className="mt-3 font-display text-4xl md:text-5xl">
          Frequently asked
        </h2>
      </Reveal>
      <Reveal delay={0.1} className="mx-auto mt-12 max-w-2xl">
        <Accordion items={faqs.map((f, i) => ({ id: String(i), question: f.q, answer: f.a }))} />
      </Reveal>
    </section>
  );
}