"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm text-stone-500 hover:bg-stone-900/5 hover:text-stone-800 dark:hover:bg-white/5 dark:hover:text-stone-100"
    >
      <LogOut className="h-4 w-4" /> Sign Out
    </button>
  );
}
