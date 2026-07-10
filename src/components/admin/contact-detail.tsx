"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Mail, Trash2 } from "lucide-react";
import type { ContactSubmission } from "@prisma/client";
import { StatusEditor } from "@/components/admin/status-editor";
import { NotesEditor } from "@/components/admin/notes-editor";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { PhoneLink } from "@/components/shared/phone-link";
import { useToast } from "@/components/admin/toast-provider";
import { formatDate } from "@/lib/utils";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-stone-400">{label}</p>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}

export function ContactDetail({ submission, onClose }: { submission: ContactSubmission; onClose: () => void }) {
  const router = useRouter();
  const showToast = useToast();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/contacts/${submission.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("success", `Message from ${submission.name} deleted.`);
      onClose();
      router.refresh();
    } catch {
      showToast("error", "Couldn't delete this message — try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-xs text-stone-400">{formatDate(submission.createdAt.toISOString())}</span>
        <StatusEditor
          id={submission.id}
          status={submission.status}
          options={["NEW", "READ", "RESPONDED"]}
          endpoint="/api/admin/contacts"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Name">{submission.name}</Field>
        <Field label="Subject">{submission.subject}</Field>
        <Field label="Email">
          <a href={`mailto:${submission.email}`} className="flex items-center gap-1.5 hover:text-bronze-500">
            <Mail className="h-3.5 w-3.5" /> {submission.email}
          </a>
        </Field>
        <Field label="Phone">
          {submission.phone ? <PhoneLink phone={submission.phone} showIcon={false} /> : <span className="text-stone-400">—</span>}
        </Field>
      </div>

      <Field label="Message">
        <p className="whitespace-pre-wrap text-stone-600 dark:text-stone-400">{submission.message}</p>
      </Field>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-stone-400">Internal notes</p>
        <NotesEditor id={submission.id} notes={submission.notes} endpoint="/api/admin/contacts" onSaved={() => router.refresh()} />
      </div>

      <div className="border-t border-stone-200 pt-4 dark:border-stone-800">
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" /> Delete this message
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this message?"
        description={`This permanently removes the message from ${submission.name}. This can't be undone.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
