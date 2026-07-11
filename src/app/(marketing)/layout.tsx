import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LiveChat } from "@/components/shared/live-chat";

/**
 * Shell for every public/guest-facing page (home, rooms, dining, spa,
 * gallery, about, contact) — navbar, footer, and the live-chat widget.
 * Deliberately not applied to /admin/**, which has its own dashboard
 * shell (sidebar nav) and no reason to carry public site chrome.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
      <LiveChat />
    </>
  );
}
