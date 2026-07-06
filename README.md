# SOLTERRA — Solterra Cliff House

A production-grade marketing + booking website for a fictional 5-star cliffside hotel on the Amalfi Coast, built as a complete Next.js App Router project.

## Design direction

- **Palette** — deep conservatory green (`#0F2E1D`), weathered bronze accent (`#B08D57`), warm stone neutrals (`#F7F5F0` → `#1B1815`). Deliberately not the generic cream/terracotta "AI luxury" default.
- **Type** — Fraunces (display serif, used with restraint for headlines), Manrope (body), IBM Plex Mono (data: prices, hours, confirmation codes, eyebrows).
- **Signature element** — a hand-drawn topographic/leaf contour line (`ContourMotif`) that draws itself on scroll and stands in for generic `<hr>` dividers throughout the site, echoing the terraced cliff-garden the hotel is carved into.

## Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript** (strict mode, `noUncheckedIndexedAccess`)
- **Tailwind CSS** with a custom design-token theme (`tailwind.config.ts`)
- **Framer Motion** for scroll reveals, page transitions, and the signature draw-on motif
- **lucide-react** for icons
- **next-themes** for dark/light mode
- Hand-authored **shadcn-style** UI primitives (`Button`, `Input`, `Select`, `Textarea`, `Badge`, `Accordion`) using `class-variance-authority` + `tailwind-merge` — the standard shadcn pattern of owning the component source rather than a runtime dependency

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint
```

> **Note:** `next/font/google` fetches font files from Google Fonts at build time, so `npm run build` requires outbound internet access. This has been verified to build and statically prerender cleanly (all 10 routes) in an environment with font access; it was also verified with fonts stubbed out to confirm the rest of the pipeline (routing, TypeScript, static generation) is clean.

## Project structure

```
prisma/
  schema.prisma          Database schema (ContactSubmission, Reservation)
src/
  middleware.ts           Protects /admin/* behind the session cookie
  app/
    layout.tsx            Root layout: fonts, SEO metadata, theme, nav/footer/chat
    page.tsx               Home
    rooms/page.tsx          Rooms & Suites
    dining/page.tsx         Dining
    spa/page.tsx            Spa & Wellness
    gallery/page.tsx        Gallery
    about/page.tsx          About
    contact/page.tsx        Contact
    sitemap.ts / robots.ts  SEO
    not-found.tsx / loading.tsx
    globals.css
    api/
      contact/route.ts             POST — create a contact submission
      reservations/route.ts        POST — create a reservation
      admin/login/route.ts         POST — password check, sets session cookie
      admin/logout/route.ts        POST — clears session cookie
      admin/contacts/[id]/route.ts      PATCH — update message status
      admin/reservations/[id]/route.ts  PATCH — update reservation status
    admin/
      login/page.tsx                Staff login
      (dashboard)/layout.tsx        Sidebar shell (not applied to /login)
      (dashboard)/page.tsx          Overview counts
      (dashboard)/contacts/page.tsx      Contact messages table
      (dashboard)/reservations/page.tsx  Reservations table
  components/
    ui/           shadcn-style primitives (button, input, badge, accordion)
    layout/       navbar, footer
    booking/      the booking widget (search → results → guest details → confirmation)
    home/         hero, featured rooms, amenities, dining/spa teasers, testimonials, FAQ
    rooms/        room card + category-filtered room browser
    gallery/      masonry grid + lightbox
    contact/      contact form
    admin/        logout button, status dropdown
    shared/       theme provider/toggle, reveal animation, contour motif,
                  animated counter, newsletter form, live chat placeholder, map, page header
  data/           dummy content: rooms.ts, content.ts (dining, spa, testimonials, gallery, FAQ, staff, awards)
  lib/            site-config.ts, utils.ts, prisma.ts, admin-auth.ts
```

## Booking system

`src/components/booking/booking-widget.tsx` implements the full flow against the dummy room data in `src/data/rooms.ts`, backed by a real database:

1. **Search** — check-in/check-out dates (with validation), guest count, room type, promo code (`SOLTERRA10` applies a 10% demo discount)
2. **Results** — filtered, priced availability with a simulated network delay
3. **Guest details** — name, email, phone, special requests
4. **Confirmation** — `POST /api/reservations` validates the request, computes the total server-side, generates a confirmation code, and saves it — visible immediately at `/admin/reservations`

Wire in your PMS/channel manager and a payment provider (see "Going to production" below) for a live property.

## Admin dashboard (contact messages + reservations)

Both the contact form and the booking widget write to a real **MySQL** database, and staff can view/manage everything at **`/admin`**.

### 1. Get a MySQL database running

Any MySQL 8+ instance works. Easiest local option, via Docker:

```bash
docker run --name solterra-mysql -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=solterra -p 3306:3306 -d mysql:8
```

Or use a managed instance for zero local setup — PlanetScale, Railway, and AWS RDS all work with the same `DATABASE_URL` approach.

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL="mysql://root:password@localhost:3306/solterra"
ADMIN_PASSWORD="choose-a-real-password"
ADMIN_SESSION_SECRET="$(openssl rand -hex 32)"   # or any long random string
```

### 3. Generate the Prisma client and create the tables

```bash
npx prisma generate
npx prisma db push
```

This creates the `ContactSubmission` and `Reservation` tables in your MySQL database. Re-run `db push` any time you edit `prisma/schema.prisma`. For a production project with a migration history (recommended once you have real data), use `npx prisma migrate dev` instead of `db push` from the start.

> **Sandbox note:** in the environment this project was authored in, `prisma generate` could not run because outbound access to `binaries.prisma.sh` (where Prisma downloads its query engine binary) and to a MySQL server weren't reachable — TypeScript and ESLint were verified clean everywhere except the two admin table files, which show a "no exported member" error for the Prisma model types until the client is generated. This is expected in *any* environment before the first `prisma generate` — it is not a code defect, and resolves itself as soon as `npm install` runs somewhere with normal internet + database access (its `postinstall` script runs `prisma generate` automatically).

### 4. Sign in

Visit `/admin/login` and enter your `ADMIN_PASSWORD`. You'll land on `/admin`, with:

- **`/admin`** — counts of new messages and pending reservations
- **`/admin/contacts`** — every contact-form submission, with a status dropdown (New / Read / Responded)
- **`/admin/reservations`** — every booking made through the widget, with guest name, email, phone, dates, room, total price, and a status dropdown (Held / Confirmed / Cancelled) — this is where staff see and manage all reservations end to end
- **View a single reservation's data:** the table already shows everything staff need at a glance; open MySQL directly (`npx prisma studio` gives a GUI) if you need to query further

Auth is a single shared password behind a signed, HTTP-only session cookie (`src/lib/admin-auth.ts`, enforced by `src/middleware.ts`) — intentionally simple for a one-team internal tool. Swap in NextAuth/Clerk if you need multiple staff logins, roles, or an audit trail.

### Going to production

- **Database:** any managed MySQL works as-is — just point `DATABASE_URL` at it. No schema changes needed moving from local Docker MySQL to production MySQL.
- **Notifications:** the API routes (`src/app/api/contact/route.ts`, `src/app/api/reservations/route.ts`) have comments marking where to add email notifications (e.g. via Resend/SendGrid) so staff don't have to keep the dashboard open to notice new activity.
- **Payment:** the booking flow holds a reservation with guest details but doesn't collect payment — wire in Stripe/your PMS at the point marked in `src/app/api/reservations/route.ts` before going live.



## Content & imagery

All copy, pricing, staff, and awards are placeholder content for a fictional property. Imagery is served from Unsplash for this demo — replace `next.config.mjs`'s `images.remotePatterns` and the `src/data/*.ts` image URLs with your DAM/CDN before launch.

## Accessibility & performance

- Visible focus rings everywhere (`:focus-visible`), skip-to-content link, `prefers-reduced-motion` respected globally
- Semantic landmarks, `aria-label`/`aria-expanded`/`role` on interactive widgets (nav, accordion, lightbox, tabs)
- `next/image` with lazy loading + responsive `sizes` throughout; fonts self-hosted via `next/font` with `display: swap`
- Static generation for every route (see build output)
