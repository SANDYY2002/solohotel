"use client";

import { Input, Label } from "@/components/ui/input";
import { ArrayEditor } from "@/components/admin/array-editor";
import { SaveBar, useSaveSection } from "@/components/admin/save-bar";
import type { HomeContent } from "@/lib/content-types";

export function HomeEditor({ initial }: { initial: HomeContent }) {
  const { data, setData, save, state, errorMessage } = useSaveSection("home", initial);

  return (
    <div>
      <SaveBar
        title="Home Page"
        description="The hero image, on-property amenities list, and the stat counters."
        state={state}
        errorMessage={errorMessage}
        onSave={save}
      />

      <div className="max-w-2xl space-y-8">
        <section>
          <Label htmlFor="heroImage">Hero image URL</Label>
          <Input
            id="heroImage"
            value={data.heroImage}
            onChange={(e) => setData({ ...data, heroImage: e.target.value })}
          />
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg">Amenities</h2>
          <ArrayEditor
            items={data.amenities}
            onChange={(items) => setData({ ...data, amenities: items as HomeContent["amenities"] })}
            titleKey="title"
            addLabel="Add amenity"
            emptyItem={{ icon: "Sparkles", title: "New Amenity", desc: "" }}
            fields={[
              { key: "icon", label: "Icon", type: "icon" },
              { key: "title", label: "Title", type: "text" },
              { key: "desc", label: "Description", type: "textarea" },
            ]}
          />
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg">Stat counters</h2>
          <ArrayEditor
            items={data.stats}
            onChange={(items) => setData({ ...data, stats: items as HomeContent["stats"] })}
            titleKey="label"
            addLabel="Add stat"
            emptyItem={{ value: 0, suffix: "", label: "New Stat" }}
            fields={[
              { key: "value", label: "Value", type: "number" },
              { key: "suffix", label: "Suffix (e.g. %, k+)", type: "text" },
              { key: "label", label: "Label", type: "text" },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
