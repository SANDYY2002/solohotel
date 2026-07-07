"use client";

import { ArrayEditor } from "@/components/admin/array-editor";
import { StringListEditor } from "@/components/admin/string-list-editor";
import { SaveBar, useSaveSection } from "@/components/admin/save-bar";
import type { SpaContent } from "@/lib/content-types";

export function SpaEditor({ initial }: { initial: SpaContent }) {
  const { data, setData, save, state, errorMessage } = useSaveSection("spa", initial);

  return (
    <div>
      <SaveBar
        title="Spa & Wellness"
        description="Treatments, packages, and the facilities list shown on the homepage and spa page."
        state={state}
        errorMessage={errorMessage}
        onSave={save}
      />

      <div className="max-w-3xl space-y-10">
        <section>
          <h2 className="mb-3 font-display text-lg">Treatments</h2>
          <ArrayEditor
            items={data.treatments}
            onChange={(items) => setData({ ...data, treatments: items as SpaContent["treatments"] })}
            titleKey="name"
            addLabel="Add treatment"
            emptyItem={{ name: "New Treatment", duration: "60 min", price: 0, description: "" }}
            fields={[
              { key: "name", label: "Name", type: "text" },
              { key: "duration", label: "Duration", type: "text" },
              { key: "price", label: "Price (USD)", type: "number" },
              { key: "description", label: "Description", type: "textarea" },
            ]}
          />
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg">Packages</h2>
          <ArrayEditor
            items={data.packages}
            onChange={(items) => setData({ ...data, packages: items as SpaContent["packages"] })}
            titleKey="name"
            addLabel="Add package"
            emptyItem={{ name: "New Package", price: 0, includes: [] }}
            fields={[
              { key: "name", label: "Name", type: "text" },
              { key: "price", label: "Price (USD)", type: "number" },
              { key: "includes", label: "Includes", type: "tags", helpText: "Comma-separated" },
            ]}
          />
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg">Facilities</h2>
          <StringListEditor
            items={data.facilities}
            onChange={(items) => setData({ ...data, facilities: items })}
            placeholder="e.g. Basalt thermal circuit"
            addLabel="Add facility"
          />
        </section>
      </div>
    </div>
  );
}
