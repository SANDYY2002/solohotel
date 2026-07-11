import { prisma } from "@/lib/prisma";

/**
 * Records an admin action for the audit trail (Activity Log page).
 * There's a single shared admin password rather than per-user accounts,
 * so every entry is attributed to "Staff" — this still answers *what*
 * changed and *when*, which covers most of what an audit trail is for.
 *
 * Never throws: a logging failure should never block the actual action
 * (status change, delete, content save) that triggered it.
 */
export async function logActivity(params: {
  action: string;
  entity: string;
  entityId?: string | null;
  summary: string;
}): Promise<void> {
  try {
    await prisma.adminActivityLog.create({
      data: {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId ?? null,
        summary: params.summary,
      },
    });
  } catch {
    // Non-critical — swallow so a logging hiccup never breaks the real action.
  }
}
