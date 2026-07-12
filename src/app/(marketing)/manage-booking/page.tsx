import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { ManageBookingForm } from "@/components/booking/manage-booking-form";

// Reads live content from the database on every request — without this,
// Next.js would statically prerender this page at build time and never
// pick up admin edits made afterward.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage Your Booking",
  description: "Look up your reservation with your confirmation code and email — view details or cancel.",
};

export default function ManageBookingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Reservations"
        title="Manage your booking"
        description="Enter your confirmation code and the email you booked with to view or cancel your reservation."
        image="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2000&auto=format&fit=crop"
      />
      <section className="container-hotel py-20">
        <Reveal>
          <ManageBookingForm />
        </Reveal>
      </section>
    </>
  );
}
