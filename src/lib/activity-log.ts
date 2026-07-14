import { prisma } from "@/lib/prisma";

/**
 * Records an admin action for the audit trail (Activity Log page).
 * Pass `actorName` (from getCurrentStaff()) wherever the calling route
 * knows who's acting — falls back to "Staff" for the handful of call
 * sites that don't have that yet (e.g. system-triggered entries).
 *
 * Never throws: a logging failure should never block the actual action
 * (status change, delete, content save) that triggered it.
 */
export async function logActivity(params: {
  action: string;
  entity: string;
  entityId?: string | null;
  summary: string;
  actorName?: string;
}): Promise<void> {
  try {
    await prisma.adminActivityLog.create({
      data: {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId ?? null,
        actorName: params.actorName ?? "Staff",
        summary: params.summary,
      },
    });
  } catch {
    // Non-critical — swallow so a logging hiccup never breaks the real action.
  }
}
