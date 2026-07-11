"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Users, Tag, Search, CheckCircle2, Loader2, User, Mail, Phone } from "lucide-react";
import { Label, Select, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/lib/site-content-context";
import { formatUSD, nightsBetween } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Step = "search" | "results" | "details" | "confirmed";

function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function BookingWidget({ compact = false }: { compact?: boolean }) {
  const { rooms } = useSiteContent();
  const [step, setStep] = React.useState<Step>("search");
  const [checkIn, setCheckIn] = React.useState(todayISO(14));
  const [checkOut, setCheckOut] = React.useState(todayISO(17));
  const [guests, setGuests] = React.useState("2");
  const [roomType, setRoomType] = React.useState("Any");
  const [promo, setPromo] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<(typeof rooms)[number] | null>(null);
  const [confirmation, setConfirmation] = React.useState<string | null>(null);
  const [confirmedTotal, setConfirmedTotal] = React.useState<number | null>(null);
  const [dateError, setDateError] = React.useState<string | null>(null);
  const [guestName, setGuestName] = React.useState("");
  const [guestEmail, setGuestEmail] = React.useState("");
  const [guestPhone, setGuestPhone] = React.useState("");
  const [specialRequests, setSpecialRequests] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const nights = nightsBetween(checkIn, checkOut);
  const promoDiscount = promo.trim().toUpperCase() === "YUKIN10" ? 0.1 : 0;

  const matches = React.useMemo(
    () => rooms.filter((r) => (roomType === "Any" ? true : r.category === roomType) && Number(guests) <= r.maxGuests),
    [roomType, guests, rooms]
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (new Date(checkOut) <= new Date(checkIn)) {
      setDateError("Check-out must be after check-in.");
      return;
    }
    setDateError(null);
    setLoading(true);
    // Simulate an availability lookup against the PMS
    setTimeout(() => {
      setLoading(false);
      setStep("results");
    }, 700);
  }

  function handleSelectRoom(room: (typeof rooms)[number]) {
    setSelected(room);
    setSubmitError(null);
    setStep("details");
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomSlug: selected.slug,
          checkIn,
          checkOut,
          guests: Number(guests),
          promoCode: promo,
          guestName,
          guestEmail,
          guestPhone,
          specialRequests,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not complete the reservation.");
      }
      setConfirmation(data.confirmationCode);
      setConfirmedTotal(data.totalPriceUsd);
      setStep("confirmed");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      id="booking-widget"
      className={cn(
        "glass-panel relative w-full rounded-md p-6 md:p-8",
        compact ? "max-w-3xl" : "max-w-5xl"
      )}
    >
      <AnimatePresence mode="wait">
        {step === "search" && (
          <motion.form
            key="search"
            onSubmit={handleSearch}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4 md:grid-cols-5"
          >
            <div className="md:col-span-1">
              <Label htmlFor="check-in">
                <CalendarDays className="mr-1 inline h-3.5 w-3.5" /> Check-in
              </Label>
              <Input id="check-in" type="date" value={checkIn} min={todayISO()} onChange={(e) => setCheckIn(e.target.value)} required />
            </div>
            <div className="md:col-span-1">
              <Label htmlFor="check-out">
                <CalendarDays className="mr-1 inline h-3.5 w-3.5" /> Check-out
              </Label>
              <Input id="check-out" type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} required />
            </div>
            <div className="md:col-span-1">
              <Label htmlFor="guests">
                <Users className="mr-1 inline h-3.5 w-3.5" /> Guests
              </Label>
              <Select id="guests" value={guests} onChange={(e) => setGuests(e.target.value)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} Guest{n > 1 ? "s" : ""}
                  </option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-1">
              <Label htmlFor="room-type">Room Type</Label>
              <Select id="room-type" value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                {["Any", ...Array.from(new Set(rooms.map((r) => r.category)))].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-1">
              <Label htmlFor="promo">
                <Tag className="mr-1 inline h-3.5 w-3.5" /> Promo Code
              </Label>
              <Input id="promo" placeholder="Optional" value={promo} onChange={(e) => setPromo(e.target.value)} />
            </div>

            {dateError && <p className="md:col-span-5 text-sm text-red-500">{dateError}</p>}

            <div className="flex items-center justify-between md:col-span-5">
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {nights} night{nights > 1 ? "s" : ""} selected
                {promoDiscount > 0 && " · promo applied: 10% off"}
              </p>
              <Button type="submit" variant="bronze" disabled={loading} className="min-w-[180px]">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {loading ? "Searching…" : "Check Availability"}
              </Button>
            </div>
          </motion.form>
        )}

        {step === "results" && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {matches.length} room type{matches.length !== 1 ? "s" : ""} available · {nights} night
                {nights > 1 ? "s" : ""}
              </p>
              <button onClick={() => setStep("search")} className="text-sm text-bronze-500 underline-offset-4 hover:underline">
                Edit search
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {matches.map((room) => {
                const total = Math.round(room.pricePerNight * nights * (1 - promoDiscount));
                return (
                  <div
                    key={room.slug}
                    className="flex items-center justify-between gap-4 rounded-sm border border-stone-200/70 bg-white/50 p-4 dark:border-stone-800 dark:bg-stone-900/30"
                  >
                    <div>
                      <p className="font-display text-base">{room.name}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {room.size} · {room.bedType} · {room.available ? `${room.unitsLeft} left` : "Sold out"}
                      </p>
                      <p className="mt-1 text-sm font-medium text-bronze-500">
                        {formatUSD(total)} <span className="text-stone-400">total</span>
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={room.available ? "primary" : "outline"}
                      disabled={!room.available}
                      onClick={() => handleSelectRoom(room)}
                    >
                      {room.available ? "Reserve" : "Waitlist"}
                    </Button>
                  </div>
                );
              })}
              {matches.length === 0 && (
                <p className="col-span-2 py-8 text-center text-sm text-stone-500">
                  No rooms match that party size and category. Try adjusting guests or room type.
                </p>
              )}
            </div>
          </motion.div>
        )}

        {step === "details" && selected && (
          <motion.form
            key="details"
            onSubmit={handleConfirm}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-lg"
          >
            <button
              type="button"
              onClick={() => setStep("results")}
              className="mb-4 text-sm text-bronze-500 underline-offset-4 hover:underline"
            >
              ← Back to results
            </button>
            <div className="mb-6 rounded-sm border border-stone-200/70 bg-white/50 p-4 text-sm dark:border-stone-800 dark:bg-stone-900/30">
              <p className="font-display text-base">{selected.name}</p>
              <p className="text-stone-500 dark:text-stone-400">
                {checkIn} → {checkOut} · {nights} night{nights > 1 ? "s" : ""} · {guests} guest{Number(guests) > 1 ? "s" : ""}
              </p>
              <p className="mt-1 font-medium text-bronze-500">
                {formatUSD(Math.round(selected.pricePerNight * nights * (1 - promoDiscount)))} total
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="guest-name">
                  <User className="mr-1 inline h-3.5 w-3.5" /> Full Name
                </Label>
                <Input id="guest-name" required value={guestName} onChange={(e) => setGuestName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="guest-email">
                  <Mail className="mr-1 inline h-3.5 w-3.5" /> Email
                </Label>
                <Input id="guest-email" type="email" required value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="guest-phone">
                  <Phone className="mr-1 inline h-3.5 w-3.5" /> Phone (optional)
                </Label>
                <Input id="guest-phone" type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="requests">Special Requests (optional)</Label>
                <Textarea id="requests" rows={3} value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} />
              </div>
            </div>

            {submitError && <p className="mt-3 text-sm text-red-500">{submitError}</p>}

            <Button type="submit" variant="bronze" className="mt-6 w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting ? "Confirming…" : "Confirm Reservation"}
            </Button>
          </motion.form>
        )}

        {step === "confirmed" && selected && (
          <motion.div
            key="confirmed"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-6 text-center"
          >
            <CheckCircle2 className="h-12 w-12 text-conservatory-500" />
            <h3 className="mt-4 font-display text-2xl">Reservation Held</h3>
            <p className="mt-2 max-w-md text-sm text-stone-600 dark:text-stone-400">
              {selected.name} · {checkIn} → {checkOut} · {guests} guest{Number(guests) > 1 ? "s" : ""}
            </p>
            {confirmedTotal !== null && (
              <p className="mt-1 text-sm font-medium text-bronze-500">{formatUSD(confirmedTotal)} total</p>
            )}
            <p className="mt-4 font-mono text-sm text-bronze-500">Confirmation #{confirmation}</p>
            <p className="mt-1 text-xs text-stone-500">
              A confirmation email will be sent to {guestEmail} to complete payment details.
            </p>
            <Button
              className="mt-6"
              variant="outline"
              onClick={() => {
                setStep("search");
                setGuestName("");
                setGuestEmail("");
                setGuestPhone("");
                setSpecialRequests("");
              }}
            >
              Make another search
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
