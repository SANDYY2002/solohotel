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
  schema.prisma          Database schema (ContactSubmission, Reservation, SiteContent)
src/
  middleware.ts           Protects /admin/* behind the session cookie
  app/
    layout.tsx            Root layout: fonts, SEO metadata, theme, content provider, nav/footer/chat
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
      admin/content/route.ts            GET/PUT — read & save any site content section
      admin/upload/route.ts             POST — upload an image file to Vercel Blob
    admin/
      login/page.tsx                Staff login
      (dashboard)/layout.tsx        Sidebar shell (not applied to /login)
      (dashboard)/page.tsx          Overview counts
      (dashboard)/contacts/page.tsx      Contact messages table
      (dashboard)/reservations/page.tsx  Reservations table
      (dashboard)/content/page.tsx        Site Content hub — links to every editable section
      (dashboard)/content/{settings,home,rooms,dining,spa,gallery,testimonials,faqs,about}/page.tsx
                                          One editor per section (see "Site content management" below)
  components/
    ui/           shadcn-style primitives (button, input, badge, accordion)
    layout/       navbar, footer
    booking/      the booking widget (search → results → guest details → confirmation)
    home/         hero, featured rooms, amenities, dining/spa teasers, testimonials, FAQ
    rooms/        room card + category-filtered room browser
    gallery/      masonry grid + lightbox
    contact/      contact form
    admin/        logout button, status dropdown, array-editor, string-list-editor, save-bar,
                  image-upload.tsx (device upload + URL paste, single & multi-image),
                  content/  (one editor component per section, paired with the pages above)
    shared/       theme provider/toggle, reveal animation, contour motif, animated counter,
                  newsletter form, live chat placeholder, map, page header, phone-link (call/WhatsApp)
  lib/
    content-store.ts        Reads/writes the SiteContent table (the CMS backend)
    content-defaults.ts     Seed content used the first time the table is empty
    content-types.ts        TypeScript types for every editable field
    site-content-context.tsx  React context so client components can read live content
    icon-map.ts              Name → lucide-react icon lookup (for admin icon pickers)
    utils.ts, prisma.ts, admin-auth.ts
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
docker run --name solterra-mysql -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=solterra -p 3306:3306 -v solterra-mysql-data:/var/lib/mysql -d mysql:8
```

> **Note:** the `-v solterra-mysql-data:/var/lib/mysql` flag stores the database in a named Docker volume, not inside the container itself. Without it, removing and recreating the container (e.g. `docker rm` + `docker run` again) wipes everything — reservations, contact messages, and all site content edited in `/admin/content`. Stopping/starting the same container (`docker stop` / `docker start`) is safe either way; it's only removal + recreation that loses data.

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

This creates the `ContactSubmission`, `Reservation`, and `SiteContent` tables in your MySQL database. Re-run `db push` any time you edit `prisma/schema.prisma`. For a production project with a migration history (recommended once you have real data), use `npx prisma migrate dev` instead of `db push` from the start.

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

## Site content management (admin CMS)

Every piece of marketing copy on the site — not just contact messages and reservations — can be edited by staff at **`/admin/content`**, with no code changes or redeploy:

- **Site Settings** — name, tagline, description, location, phone, WhatsApp number, email, map coordinates, social links, the navigation menu, and the booking button text
- **Home Page** — hero image, the six on-property amenities, and the four stat counters
- **Rooms & Suites** — add, edit, reorder, or delete room types: pricing, size, capacity, description, features, photos, and availability
- **Dining** — restaurants/venues, the sample tasting menu (with courses), and the executive chef bio
- **Spa & Wellness** — treatments, packages, and the facilities list
- **Gallery** — every photo shown on `/gallery` and the homepage preview strip, with category tagging
- **Testimonials** — guest quotes shown in the homepage carousel
- **FAQs** — the accordion shown on the homepage
- **About Page** — the property story, sustainability commitments, staff bios, and awards/press

### How it works

- Content lives in one row of a `SiteContent` table in your MySQL database (see `prisma/schema.prisma`), stored as a single JSON blob and seeded from `src/lib/content-defaults.ts` the first time it's read. It's a database table rather than a file on disk specifically so this works on serverless hosts like Vercel — a JSON file written with `fs` would silently fail to persist there, since the filesystem is read-only at runtime.
- After pulling this change, run `npx prisma db push` (or `npx prisma migrate dev`) once to add the `SiteContent` table to your database.
- Every public page reads through `src/lib/content-store.ts` (server components) or the `useSiteContent()` hook (`src/lib/site-content-context.tsx`, for client components like the booking widget, navbar, and hero) — so a save in the admin dashboard is reflected on the live site immediately, without a rebuild.
- Each admin section is its own page under `/admin/content/*`, guarded by the same session-cookie middleware as the rest of `/admin`. Saving calls `PUT /api/admin/content` with `{ section, data }`, which is also auth-checked server-side.
- Every page that reads site content — the marketing pages and the admin editors alike — is explicitly marked `export const dynamic = "force-dynamic"`, so it always renders fresh from the database per request instead of being pre-rendered once as static HTML at build time. Without this, Next.js would cache the first render and admin edits would never show up on the live site (and would look like they "reset" after a restart, since a restart doesn't trigger a rebuild).
- Icons (for amenities and sustainability items) are stored as a name (e.g. `"Waves"`) and resolved to a `lucide-react` component via `src/lib/icon-map.ts` — add more icons to that map if you want more options in the picker.

### Uploading images from the admin dashboard

Every image field (room photos, gallery photos, staff photos, the hero image, venue and chef photos) has two ways to set an image: paste a URL directly, or click **"Upload from device"** / **"Upload photos"** to pick a file.

Uploads go through `POST /api/admin/upload` to **Vercel Blob**, which returns a permanent public URL that gets saved into the content the same way a pasted URL would. This (rather than saving to the local filesystem) is what makes uploads work on Vercel's serverless runtime, where files written to disk don't persist between requests or deployments.

To enable it:
1. In your Vercel project, go to **Storage → Create Database → Blob**, and create a store.
2. Vercel automatically adds a `BLOB_READ_WRITE_TOKEN` environment variable to your project — no extra setup needed in production.
3. For local development, copy that token into your `.env` file (see `.env.example`), or run `vercel env pull`.

Without a token configured, the upload button returns a clear error explaining it isn't set up yet — pasting a URL still works either way, so the CMS is usable even before you connect Blob storage.



### Call or WhatsApp on every phone number

Every phone number on the site (footer, contact page, the map card) now uses `src/components/shared/phone-link.tsx` instead of a plain `tel:` link. Clicking it opens a small menu with **Call** and **WhatsApp** options — WhatsApp opens `https://wa.me/<number>` in a new tab. Set the WhatsApp number (if it differs from the main phone number) under **Site Settings** in the admin dashboard.

## Content & imagery

All copy, pricing, staff, and awards are placeholder content for a fictional property, editable via `/admin/content` (see above). Imagery is served from Unsplash for this demo and can be replaced with your own photos directly in the admin dashboard (paste a URL or upload from your device).

## Accessibility & performance

- Visible focus rings everywhere (`:focus-visible`), skip-to-content link, `prefers-reduced-motion` respected globally
- Semantic landmarks, `aria-label`/`aria-expanded`/`role` on interactive widgets (nav, accordion, lightbox, tabs)
- `next/image` with lazy loading + responsive `sizes` throughout; fonts self-hosted via `next/font` with `display: swap`
- Static generation for every route (see build output)
