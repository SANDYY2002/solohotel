import { prisma } from "@/lib/prisma";
import { NewsletterList } from "@/components/admin/newsletter-list";

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-display text-3xl">Newsletter Subscribers</h1>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Everyone who&apos;s signed up via the footer form.</p>
      <NewsletterList subscribers={subscribers} />
    </div>
  );
}
