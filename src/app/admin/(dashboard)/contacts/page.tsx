import { prisma } from "@/lib/prisma";
import { ContactsTable } from "@/components/admin/contacts-table";

export const dynamic = "force-dynamic";

export default async function AdminContactsPage() {
  const submissions = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl">Contact Messages</h1>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
        {submissions.length} message{submissions.length !== 1 ? "s" : ""} received via the contact form.
      </p>
      <ContactsTable submissions={submissions} />
    </div>
  );
}
