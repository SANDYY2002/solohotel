import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function BookingPaymentResultPage({
  searchParams,
}: {
  searchParams: { status?: string; code?: string };
}) {
  const success = searchParams.status === "success";

  return (
    <>
      <PageHeader
        eyebrow="Reservations"
        title={success ? "Payment received" : "Payment didn't go through"}
        description={
          success
            ? "Your reservation is confirmed — a confirmation email is on its way."
            : "Nothing was charged. You can try again or reach out if you need a hand."
        }
        image="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2000&auto=format&fit=crop"
      />
      <section className="container-hotel py-20">
        <div className="mx-auto max-w-md text-center">
          {success ? (
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          ) : (
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
          )}

          {searchParams.code && (
            <p className="mt-4 font-mono text-sm text-bronze-500">{searchParams.code}</p>
          )}

          <p className="mt-4 text-stone-600 dark:text-stone-400">
            {success
              ? "Thank you — we're looking forward to hosting you."
              : "This can happen if the payment was cancelled, timed out, or declined. Your reservation is still on hold, so you can pick up where you left off."}
          </p>

          <Link href="/manage-booking" className="mt-8 inline-block">
            <Button variant="bronze">{success ? "View your reservation" : "Try again"}</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
