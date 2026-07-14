import { ShieldAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentStaffFromCookies } from "@/lib/current-staff";
import { StaffManager } from "@/components/admin/staff-manager";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const currentStaff = await getCurrentStaffFromCookies();

  if (!currentStaff || currentStaff.role !== "OWNER") {
    return (
      <div>
        <h1 className="font-display text-3xl">Staff Accounts</h1>
        <div className="mt-8 flex items-center gap-3 rounded-sm border border-stone-200 p-6 text-sm text-stone-500 dark:border-stone-800">
          <ShieldAlert className="h-5 w-5 flex-shrink-0 text-bronze-400" />
          Only Owner accounts can manage staff. Ask an owner to make changes here.
        </div>
      </div>
    );
  }

  const staff = await prisma.staffAccount.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, active: true, lastLoginAt: true, createdAt: true },
  });

  return (
    <div>
      <h1 className="font-display text-3xl">Staff Accounts</h1>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
        Owners can manage other staff accounts and reset passwords. Staff can do everything else in the dashboard.
      </p>
      <StaffManager
        initial={staff.map((s) => ({ ...s, lastLoginAt: s.lastLoginAt?.toISOString() ?? null, createdAt: s.createdAt.toISOString() }))}
        currentStaffId={currentStaff.id}
      />
    </div>
  );
}
