import { prisma } from "@/lib/prisma";
import { StatusSelect } from "@/components/admin/status-select";
import { formatDate } from "@/lib/utils";
import type { ContactSubmission } from "@prisma/client";

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

      <div className="mt-8 overflow-x-auto rounded-sm border border-stone-200 dark:border-stone-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-500 dark:bg-stone-900/40">
            <tr>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
            {submissions.map((s: ContactSubmission) => (
              <tr key={s.id} className="align-top">
                <td className="whitespace-nowrap px-4 py-4 text-stone-500">{formatDate(s.createdAt.toISOString())}</td>
                <td className="px-4 py-4 font-medium">{s.name}</td>
                <td className="px-4 py-4">
                  <p>{s.email}</p>
                  {s.phone && <p className="text-stone-500">{s.phone}</p>}
                </td>
                <td className="px-4 py-4">{s.subject}</td>
                <td className="max-w-xs px-4 py-4 text-stone-600 dark:text-stone-400">{s.message}</td>
                <td className="px-4 py-4">
                  <StatusSelect
                    id={s.id}
                    status={s.status}
                    options={["NEW", "READ", "RESPONDED"]}
                    endpoint="/api/admin/contacts"
                  />
                </td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-stone-500">
                  No messages yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
