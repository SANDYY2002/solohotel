import Link from "next/link";
import { LayoutDashboard, Mail, CalendarCheck, LayoutTemplate, BarChart3, History, Send } from "lucide-react";
import { getSiteContent } from "@/lib/content-store";
import { AdminLogoutButton } from "@/components/admin/logout-button";
import { ToastProvider } from "@/components/admin/toast-provider";

// Always read the latest content from the database on every request.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { siteConfig } = await getSiteContent();
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-stone-50 dark:bg-conservatory-950">
        <aside className="hidden w-64 flex-shrink-0 border-r border-stone-200 p-6 dark:border-stone-800 md:block">
          <p className="font-display text-lg uppercase tracking-widest2">{siteConfig.name}</p>
          <p className="mb-8 text-xs text-stone-500">Staff Admin</p>
          <nav className="space-y-1">
            <Link href="/admin" className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-stone-900/5 dark:hover:bg-white/5">
              <LayoutDashboard className="h-4 w-4" /> Overview
            </Link>
            <Link href="/admin/analytics" className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-stone-900/5 dark:hover:bg-white/5">
              <BarChart3 className="h-4 w-4" /> Analytics
            </Link>
            <Link href="/admin/content" className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-stone-900/5 dark:hover:bg-white/5">
              <LayoutTemplate className="h-4 w-4" /> Site Content
            </Link>
            <Link href="/admin/contacts" className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-stone-900/5 dark:hover:bg-white/5">
              <Mail className="h-4 w-4" /> Contact Messages
            </Link>
            <Link href="/admin/reservations" className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-stone-900/5 dark:hover:bg-white/5">
              <CalendarCheck className="h-4 w-4" /> Reservations
            </Link>
            <Link href="/admin/newsletter" className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-stone-900/5 dark:hover:bg-white/5">
              <Send className="h-4 w-4" /> Newsletter
            </Link>
            <Link href="/admin/activity" className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-stone-900/5 dark:hover:bg-white/5">
              <History className="h-4 w-4" /> Activity Log
            </Link>
          </nav>
          <div className="mt-8 border-t border-stone-200 pt-4 dark:border-stone-800">
            <AdminLogoutButton />
          </div>
        </aside>
        <main id="main-content" className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </ToastProvider>
  );
}
