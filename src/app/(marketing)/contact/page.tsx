import type { Metadata } from "next";
import { Mail, Instagram, Facebook } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { LocationMap } from "@/components/shared/location-map";
import { ContactForm } from "@/components/contact/contact-form";
import { PhoneLink } from "@/components/shared/phone-link";
import { getSiteContent } from "@/lib/content-store";

// Reads live content from the database on every request — without this,
// Next.js would statically prerender this page at build time and never
// pick up admin edits made afterward.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach the Yukin Cliff House concierge team by phone, email, or message — or find us on the Path of the Gods.",
};

export default async function ContactPage() {
  const { siteConfig } = await getSiteContent();

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="We're easiest to reach directly"
        description="For reservations, events, or anything in between, our concierge team is on call daily from 7am to 11pm CET."
        image="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=2000&auto=format&fit=crop"
      />

      <div className="cp-root">
        <style>{`
          .cp-root {
            --ink: #132420;
            --parchment: #F4EEDE;
            --brass: #A97C34;
            --brass-light: #C9A362;
            --clay: #8C4A3A;
            --moss: #4C6B58;
            --charcoal: #201D18;
            --mist: #C9C2AC;
          }
          .cp-root * { box-sizing: border-box; }
          .cp-serif { font-family: 'Fraunces', Georgia, 'Times New Roman', serif; }
          .cp-mono { font-family: 'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace; }

          .cp-section {
            padding: 4rem 0 6rem;
          }
          .cp-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 3.5rem;
            align-items: start;
          }
          @media (min-width: 1024px) {
            .cp-grid { grid-template-columns: 1.05fr 0.95fr; gap: 3rem; }
          }

          .cp-form-col .cp-eyebrow,
          .cp-info-col .cp-eyebrow {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.72rem;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            color: var(--brass);
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.6rem;
            margin: 0 0 0.85rem;
          }
          .cp-eyebrow::before {
            content: "";
            width: 20px;
            height: 1px;
            background: var(--brass);
            opacity: 0.6;
          }
          .cp-form-col h2,
          .cp-info-col h2 {
            font-size: clamp(1.7rem, 2.6vw, 2.1rem);
            line-height: 1.15;
            font-weight: 600;
            color: var(--charcoal);
            margin: 0 0 2rem;
          }

          /* --- info panel, mirrors the form panel's ink/brass language --- */
          .cp-info-panel {
            background: var(--ink);
            color: var(--parchment);
            border-radius: 22px;
            padding: 2.5rem 2.25rem;
            position: relative;
            overflow: hidden;
            box-shadow: 0 20px 60px -25px rgba(19, 36, 32, 0.45);
          }
          .cp-info-panel::before {
            content: "";
            position: absolute;
            inset: 0;
            background:
              radial-gradient(circle at 12% 8%, rgba(169, 124, 52, 0.18), transparent 45%),
              radial-gradient(circle at 92% 90%, rgba(169, 124, 52, 0.10), transparent 40%);
            pointer-events: none;
          }
          .cp-info-panel > * { position: relative; z-index: 1; }

          .cp-channel-list {
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: 1.15rem;
          }
          .cp-channel-row {
            display: flex;
            align-items: baseline;
            gap: 0.85rem;
            font-size: 0.9rem;
          }
          .cp-channel-row--phone { flex-wrap: wrap; row-gap: 0.3rem; }
          .cp-channel-label {
            font-size: 0.66rem;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--mist);
            min-width: 108px;
            flex-shrink: 0;
          }
          .cp-channel-label--inline { min-width: 0; width: 100%; }
          .cp-channel-value { color: var(--parchment); overflow-wrap: anywhere; }
          .cp-channel-value a { color: inherit; text-decoration: none; }
          .cp-channel-value a:hover { color: var(--brass-light); }
          .cp-phonelink,
          .cp-phonelink * { color: var(--parchment) !important; }
          .cp-phonelink-icon,
          .cp-phonelink-icon * { color: var(--brass-light) !important; }

          .cp-divider {
            border: none;
            border-top: 1px solid rgba(244, 238, 222, 0.14);
            margin: 1.75rem 0 1.4rem;
          }

          .cp-social-row {
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          .cp-social-label {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.66rem;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--mist);
          }
          .cp-social-links { display: flex; gap: 0.9rem; }
          .cp-social-links a {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 34px;
            height: 34px;
            border-radius: 999px;
            border: 1px solid rgba(244, 238, 222, 0.2);
            color: var(--parchment);
            transition: border-color 140ms ease, color 140ms ease;
          }
          .cp-social-links a:hover {
            border-color: var(--brass-light);
            color: var(--brass-light);
          }
          .cp-social-links svg { width: 14px; height: 14px; }

          /* --- map card --- */
          .cp-map-card {
            margin-top: 1.75rem;
            border-radius: 18px;
            overflow: hidden;
            border: 1px solid rgba(19, 36, 32, 0.1);
          }
          .cp-map-frame { line-height: 0; }

          @media (max-width: 480px) {
            .cp-info-panel { padding: 2rem 1.5rem; }
            .cp-social-row { flex-direction: column; align-items: flex-start; gap: 0.85rem; }
          }
        `}</style>

        <section className="cp-section container-hotel">
          <div className="cp-grid">
            <Reveal>
              <div className="cp-form-col">
                <p className="cp-eyebrow">Send a message</p>
                <h2 className="cp-serif">Tell us what you need</h2>
                <ContactForm />
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="cp-info-col">
                <p className="cp-eyebrow">Direct lines</p>
                <h2 className="cp-serif">Talk to the concierge</h2>

                <div className="cp-info-panel">
                  <ul className="cp-channel-list">
                    <li className="cp-channel-row cp-channel-row--phone">
                      <span className="cp-channel-label cp-mono cp-channel-label--inline">
                        Phone / WhatsApp
                      </span>
                      <PhoneLink
                        phone={siteConfig.phone}
                        whatsapp={siteConfig.whatsapp}
                        className="cp-phonelink"
                        iconClassName="cp-phonelink-icon"
                      />
                    </li>

                    <li className="cp-channel-row">
                      <span className="cp-channel-label cp-mono">Email</span>
                      <span className="cp-channel-value">
                        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
                      </span>
                    </li>

                    <li className="cp-channel-row">
                      <span className="cp-channel-label cp-mono">Hours</span>
                      <span className="cp-channel-value">Daily, 7am – 11pm CET</span>
                    </li>
                  </ul>

                  <hr className="cp-divider" />

                  <div className="cp-social-row">
                    <span className="cp-social-label cp-mono">Follow</span>
                    <div className="cp-social-links">
                      <a href={siteConfig.social.instagram} aria-label="Instagram">
                        <Instagram />
                      </a>
                      <a href={siteConfig.social.facebook} aria-label="Facebook">
                        <Facebook />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="cp-map-card">
                  <div className="cp-map-frame">
                    <LocationMap />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </>
  );
}