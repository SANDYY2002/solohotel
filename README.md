# YUKIN — Yukin Cliff House

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

`src/components/booking/booking-widget.tsx` implements the full flow against room data managed via `/admin/content/rooms`, backed by a real database:

1. **Search** — check-in/check-out dates (with validation), guest count, room type, promo code (`YUKIN10` applies a 10% demo discount)
2. **Results** — filtered, priced availability with a simulated network delay
3. **Guest details** — name, email, phone, special requests
4. **Confirmation** — `POST /api/reservations` validates the request, rejects it if the room is already booked for any overlapping date (see below), computes the total server-side, generates a confirmation code, saves it, and sends a confirmation email to the guest plus a notification to staff (see "Email notifications" below) — visible immediately at `/admin/reservations`

**Double-booking is prevented** at the database level: before creating a reservation, the API checks for any other non-cancelled reservation on the same room with overlapping dates, and rejects the request with a 409 if one exists. Back-to-back bookings (a new check-in on the same day another guest checks out) are correctly allowed.

**`/admin/calendar`** shows a visual month-by-month occupancy grid — one row per room, color-coded by status (held vs. confirmed), click any booked day to open that reservation's full detail panel. Useful for spotting gaps or double-checking availability at a glance.

Wire in your PMS/channel manager and a payment provider (see "Going to production" below) for a live property — this still just holds a reservation, no money changes hands yet.

## Admin dashboard (contact messages + reservations)

Both the contact form and the booking widget write to a real **MySQL** database, and staff can view/manage everything at **`/admin`**.

### 1. Get a MySQL database running

Any MySQL 8+ instance works. Easiest local option, via Docker:

```bash
docker run --name yukin-mysql -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=yukin -p 3306:3306 -v yukin-mysql-data:/var/lib/mysql -d mysql:8
```

> **Note:** the `-v yukin-mysql-data:/var/lib/mysql` flag stores the database in a named Docker volume, not inside the container itself. Without it, removing and recreating the container (e.g. `docker rm` + `docker run` again) wipes everything — reservations, contact messages, and all site content edited in `/admin/content`. Stopping/starting the same container (`docker stop` / `docker start`) is safe either way; it's only removal + recreation that loses data.

Or use a managed instance for zero local setup. **[TiDB Cloud Starter](https://tidbcloud.com)** is the one worth using if you want it free: it speaks the MySQL wire protocol (so nothing about this project changes — same `provider = "mysql"` in `prisma/schema.prisma`, same queries), and its free tier is permanent, not a trial — 5GB storage, 50M requests/month, no credit card required. (PlanetScale, once the default answer here, removed its free tier in 2024 and now starts at $5–39/month — TiDB is the closest still-free MySQL-compatible replacement.) Railway and AWS RDS also work with the same `DATABASE_URL` approach, but their free allowances are either small or time-limited.

**Setting up TiDB Cloud Starter:**
1. Sign up at [tidbcloud.com](https://tidbcloud.com) and create a free **Starter** cluster (no card needed).
2. From the cluster's **Connect** panel, copy the host, port, and your generated username — TiDB prefixes it per-cluster, e.g. `xxxxxxxx.root`, not just `root`.
3. Build your `DATABASE_URL` (TiDB requires TLS):
   ```
   DATABASE_URL="mysql://<prefix>.root:<password>@gateway01.<region>.prod.aws.tidbcloud.com:4000/yukin?sslaccept=strict"
   ```
4. Continue with steps 2–3 below as normal (`prisma generate`, `prisma db push`) — no schema or code changes needed.

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL="mysql://root:password@localhost:3306/yukin"
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

Visit `/admin/login`. **The first time**, since no staff accounts exist yet, you'll see a "create the first admin account" form instead of a login form — enter your `ADMIN_PASSWORD` as the setup key, plus your name, email, and a new password (8+ characters). This creates your account as **Owner** and signs you in. `ADMIN_PASSWORD` is never checked again after this — every login from here on is your email + the password you just chose.

You'll land on `/admin`, with:

- **`/admin`** — counts of new messages/reservations, plus today's arrivals and departures
- **`/admin/analytics`** — bookings/revenue trends, status breakdowns, most-booked rooms
- **`/admin/content`** — the site CMS (see "Site content management" below)
- **`/admin/contacts`** — every contact-form submission (including concierge chat messages), searchable/sortable/filterable, with status, internal notes, and delete
- **`/admin/reservations`** — every booking, same tools as contacts, plus CSV export and bulk status changes
- **`/admin/calendar`** — visual month-by-month room occupancy
- **`/admin/newsletter`** — footer signup subscribers, with CSV export
- **`/admin/activity`** — an audit trail: every status change, deletion, content save, and login is logged with who did it and when
- **`/admin/staff`** — **Owners only.** Add/deactivate/delete staff accounts, change roles, reset passwords

**Roles:** **Owner** can do everything, including managing other staff accounts. **Staff** can do everything except that. The system won't let you deactivate, demote, or delete the last active Owner — there's always a way back in.

**Sessions** expire after 8 hours regardless of activity, and separately, **auto-log-out after 25 minutes of inactivity** (with a 60-second warning first) — both enforced by `src/lib/admin-auth.ts` and `src/components/admin/session-timeout.tsx`.

### Going to production (Vercel + TiDB)

1. **Database:** point `DATABASE_URL` at your TiDB Cloud Starter connection string (see above) — no schema changes needed moving from local Docker MySQL to TiDB. Run `npx prisma db push` against it once, before or right after your first deploy — Vercel's build step does **not** run migrations automatically.
2. **Environment variables** — add these in Vercel's Project Settings → Environment Variables:
   - `DATABASE_URL` — your TiDB connection string
   - `ADMIN_PASSWORD` — staff login password
   - `ADMIN_SESSION_SECRET` — a long random string (`openssl rand -hex 32`)
   - `BLOB_READ_WRITE_TOKEN` — added automatically once you create a Blob store under the **Storage** tab (needed for "upload from device" in `/admin/content`; without it, image fields still work by pasting a URL)
3. **Serverless connection limits:** every Vercel function invocation can open its own DB connection, which is the usual way people run into connection-limit errors deploying Prisma to serverless. TiDB Cloud Starter allows up to 400 concurrent connections by default (5,000 once a spending limit is set), which comfortably covers this project's traffic — but if you ever see connection errors under load, add `&connection_limit=1` to the end of your `DATABASE_URL` first as a quick mitigation.
4. **Notifications:** the API routes (`src/app/api/contact/route.ts`, `src/app/api/reservations/route.ts`) have comments marking where to add email notifications (e.g. via Resend/SendGrid) so staff don't have to keep the dashboard open to notice new activity.
5. **Payment:** the booking flow holds a reservation with guest details but doesn't collect payment — wire in Stripe/your PMS at the point marked in `src/app/api/reservations/route.ts` before going live.

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

## Email notifications

Two things trigger email automatically: a guest completing a booking gets a confirmation with their reservation details, and staff get notified at `siteConfig.email` (set under Site Settings) whenever a new reservation or contact message (including the concierge chat widget, which saves through the same pipeline) comes in.

This uses [Resend](https://resend.com) — free for up to 3,000 emails/month, no credit card required.

**Setup:**
1. Sign up at resend.com, go to **API Keys → Create API Key**, copy it.
2. Set `RESEND_API_KEY` in your environment (locally in `.env`, in production via Vercel's Environment Variables).
3. That's it for testing — by default, emails send from Resend's shared sandbox address, which only delivers to the email on your own Resend account. To send to real guests, verify your own domain in Resend (**Domains → Add Domain**, then add the DNS records it gives you) and set `RESEND_FROM_EMAIL` to an address on it, e.g. `reservations@yourdomain.com`.

**If `RESEND_API_KEY` isn't set**, bookings and contact messages work exactly as before — nothing breaks, emails are just skipped. If an email fails to send for any reason (bad API key, Resend outage, etc.), it's recorded in the **Activity Log** so staff notice rather than silently missing a confirmation.


All copy, pricing, staff, and awards are placeholder content for a fictional property, editable via `/admin/content` (see above). Imagery is served from Unsplash for this demo and can be replaced with your own photos directly in the admin dashboard (paste a URL or upload from your device).

## Accessibility & performance

- Visible focus rings everywhere (`:focus-visible`), skip-to-content link, `prefers-reduced-motion` respected globally
- Semantic landmarks, `aria-label`/`aria-expanded`/`role` on interactive widgets (nav, accordion, lightbox, tabs)
- `next/image` with lazy loading + responsive `sizes` throughout; fonts self-hosted via `next/font` with `display: swap`
- Static generation for every route (see build output)
