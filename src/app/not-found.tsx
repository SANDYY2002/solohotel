import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ContourMotif } from "@/components/shared/contour-motif";

export default function NotFound() {
  return (
    <div className="container-hotel flex min-h-[70vh] flex-col items-center justify-center pt-20 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-display text-4xl md:text-5xl">This path doesn&apos;t lead to the cliff</h1>
      <p className="mt-4 max-w-md text-stone-600 dark:text-stone-400">
        The page you&apos;re looking for may have moved, or never existed. Let&apos;s get you back on the terrace.
      </p>
      <ContourMotif className="my-10 h-8 max-w-xs text-bronze-400/50" />
      <Link href="/">
        <Button variant="bronze">Return Home</Button>
      </Link>
    </div>
  );
}
