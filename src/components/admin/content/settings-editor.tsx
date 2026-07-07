"use client";

import { Input, Label, Textarea } from "@/components/ui/input";
import { ArrayEditor } from "@/components/admin/array-editor";
import { SaveBar, useSaveSection } from "@/components/admin/save-bar";
import type { SiteConfig } from "@/lib/content-types";

export function SiteConfigEditor({ initial }: { initial: SiteConfig }) {
  const { data, setData, save, state, errorMessage } = useSaveSection("siteConfig", initial);

  function set<K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) {
    setData({ ...data, [key]: value });
  }

  return (
    <div>
      <SaveBar
        title="Site Settings"
        description="Identity, contact details, and the navigation menu shown across every page."
        state={state}
        errorMessage={errorMessage}
        onSave={save}
      />

      <div className="max-w-2xl space-y-8">
        <section className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Short name</Label>
            <Input id="name" value={data.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" value={data.fullName} onChange={(e) => set("fullName", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" value={data.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">Description (used for SEO & metadata)</Label>
            <Textarea id="description" rows={3} value={data.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={data.location} onChange={(e) => set("location", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={data.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="whatsapp">WhatsApp number</Label>
            <Input
              id="whatsapp"
              value={data.whatsapp}
              placeholder="Leave blank to reuse the phone number"
              onChange={(e) => set("whatsapp", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={data.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="bookingCta">Booking button text</Label>
            <Input id="bookingCta" value={data.bookingCta} onChange={(e) => set("bookingCta", e.target.value)} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg">Map coordinates</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="any"
                value={data.coordinates.lat}
                onChange={(e) => set("coordinates", { ...data.coordinates, lat: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                type="number"
                step="any"
                value={data.coordinates.lng}
                onChange={(e) => set("coordinates", { ...data.coordinates, lng: Number(e.target.value) })}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg">Social links</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {(["instagram", "facebook", "pinterest", "x"] as const).map((key) => (
              <div key={key}>
                <Label htmlFor={key} className="capitalize">
                  {key}
                </Label>
                <Input
                  id={key}
                  value={data.social[key]}
                  onChange={(e) => set("social", { ...data.social, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg">Navigation menu</h2>
          <ArrayEditor
            items={data.nav}
            onChange={(items) => set("nav", items as SiteConfig["nav"])}
            titleKey="label"
            addLabel="Add nav item"
            emptyItem={{ label: "New Page", href: "/" }}
            fields={[
              { key: "label", label: "Label", type: "text" },
              { key: "href", label: "Link (e.g. /rooms)", type: "text" },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
