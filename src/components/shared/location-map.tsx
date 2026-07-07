import { MapPin, Mail } from "lucide-react";
import { getSiteContent } from "@/lib/content-store";
import { PhoneLink } from "@/components/shared/phone-link";

export async function LocationMap({ minimal = false }: { minimal?: boolean }) {
  const { siteConfig } = await getSiteContent();
  const { lat, lng } = siteConfig.coordinates;
  const bbox = `${lng - 0.02},${lat - 0.012},${lng + 0.02},${lat + 0.012}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="relative overflow-hidden rounded-sm">
      <iframe
        title={`Map showing the location of ${siteConfig.fullName}`}
        src={src}
        className="h-[420px] w-full grayscale-[15%] contrast-[1.05] md:h-[520px]"
        loading="lazy"
        style={{ border: 0 }}
      />
      {!minimal && (
        <div className="glass-panel absolute bottom-4 left-4 max-w-xs rounded-sm p-5">
          <p className="font-display text-lg">{siteConfig.fullName}</p>
          <ul className="mt-3 space-y-2 text-sm text-stone-600 dark:text-stone-300">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-bronze-400" /> {siteConfig.location}
            </li>
            <li>
              <PhoneLink phone={siteConfig.phone} whatsapp={siteConfig.whatsapp} iconClassName="text-bronze-400" />
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 flex-shrink-0 text-bronze-400" /> {siteConfig.email}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
