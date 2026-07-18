import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { getSiteContent } from "@/lib/content-store";
import { SiteContentProvider } from "@/lib/site-content-context";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { buildThemeCssVars } from "@/lib/theme-colors";
import { findDisplayFont, findBodyFont, findFontScale, buildGoogleFontsHref } from "@/lib/typography";

// Every page reads live content from the database via getSiteContent().
// Without this, Next.js would try to pre-render pages as static HTML at
// build time and keep serving that frozen snapshot afterward — so admin
// edits would never show up (and would look like they "reset" on restart,
// since a restart doesn't trigger a rebuild). Setting this on the root
// layout forces every route in the app to render fresh on each request.
export const dynamic = "force-dynamic";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F5F0" },
    { media: "(prefers-color-scheme: dark)", color: "#0F2E1D" },
  ],
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const { siteConfig } = await getSiteContent();
  return {
    metadataBase: new URL("https://www.yukincliffhouse.com"),
    title: {
      default: `${siteConfig.name} — Five-Star Cliffside Retreat, Amalfi Coast`,
      template: `%s — ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: ["luxury hotel amalfi coast", "five star hotel italy", "cliffside resort", "boutique hotel praiano"],
    openGraph: {
      title: `${siteConfig.name} — ${siteConfig.tagline}`,
      description: siteConfig.description,
      url: "https://www.yukincliffhouse.com",
      siteName: siteConfig.name,
      images: [{ url: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?q=80&w=1600&auto=format&fit=crop", width: 1600, height: 900 }],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteConfig.name} — ${siteConfig.tagline}`,
      description: siteConfig.description,
    },
    robots: { index: true, follow: true },
    icons: { icon: "/favicon.ico" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();
  const { theme, typography } = content.appearance ?? {};

  // Admin-chosen brand colors from /admin/appearance, applied as CSS custom
  // properties. tailwind.config.ts reads these for its "conservatory" and
  // "bronze" shades, so this one line repaints the whole site.
  const themeVars = buildThemeCssVars(theme);

  // Admin-chosen fonts + text size. "Default" picks reuse the fonts already
  // bundled via next/font above (no extra request); anything else is
  // loaded from Google Fonts and swapped in via the same CSS custom
  // properties next/font itself defines (--font-fraunces / --font-manrope),
  // so every font-display/font-body utility class picks it up for free.
  const displayFont = findDisplayFont(typography?.displayFontId ?? "fraunces");
  const bodyFont = findBodyFont(typography?.bodyFontId ?? "manrope");
  const fontScale = findFontScale(typography?.fontScaleId ?? "comfortable");
  const googleFontsHref = buildGoogleFontsHref(displayFont, bodyFont);

  const htmlStyle: React.CSSProperties = {
    ...themeVars,
    fontSize: `${fontScale.percent}%`,
    ...(displayFont.googleParam ? { "--font-fraunces": `'${displayFont.family}', ${displayFont.fallback}` } : {}),
    ...(bodyFont.googleParam ? { "--font-manrope": `'${bodyFont.family}', ${bodyFont.fallback}` } : {}),
  } as React.CSSProperties;

  return (
    <html lang="en" suppressHydrationWarning style={htmlStyle}>
      {googleFontsHref && (
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={googleFontsHref} />
        </head>
      )}
      <body className={`${fraunces.variable} ${manrope.variable} ${plexMono.variable} font-body`}>
        <SiteContentProvider value={content}>
          <ThemeProvider>
            {/* Skip link — accessibility floor for keyboard users */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-bronze-400 focus:px-4 focus:py-2 focus:text-ink"
            >
              Skip to content
            </a>
            {children}
          </ThemeProvider>
        </SiteContentProvider>
      </body>
    </html>
  );
}
