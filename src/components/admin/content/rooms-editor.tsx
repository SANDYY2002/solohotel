"use client";

import { ArrayEditor } from "@/components/admin/array-editor";
import { SaveBar, useSaveSection } from "@/components/admin/save-bar";
import type { Room } from "@/lib/content-types";

export function RoomsEditor({ initial }: { initial: Room[] }) {
  const { data, setData, save, state, errorMessage } = useSaveSection("rooms", initial);

  return (
    <div>
      <SaveBar
        title="Rooms & Suites"
        description="Add, edit, reorder, or remove room types. Slug should be unique and URL-safe (e.g. garden-room)."
        state={state}
        errorMessage={errorMessage}
        onSave={save}
      />

      <div className="max-w-3xl">
        <ArrayEditor
          items={data}
          onChange={(items) => setData(items as Room[])}
          titleKey="name"
          addLabel="Add room type"
          emptyItem={{
            slug: "new-room",
            name: "New Room",
            category: "Garden",
            pricePerNight: 0,
            size: "",
            maxGuests: 2,
            bedType: "",
            view: "",
            description: "",
            features: [],
            images: [],
            available: true,
            unitsLeft: 0,
          }}
          fields={[
            { key: "name", label: "Name", type: "text" },
            { key: "slug", label: "Slug", type: "text", helpText: "Used in the URL, e.g. /rooms#garden-room" },
            { key: "category", label: "Category", type: "text", helpText: "e.g. Garden, Cliffside, Suite, Villa" },
            { key: "pricePerNight", label: "Price per night (USD)", type: "number" },
            { key: "size", label: "Size", type: "text", placeholder: "e.g. 38 m²" },
            { key: "maxGuests", label: "Max guests", type: "number" },
            { key: "bedType", label: "Bed type", type: "text" },
            { key: "view", label: "View", type: "text" },
            { key: "available", label: "Available for booking", type: "boolean" },
            { key: "unitsLeft", label: "Units left", type: "number" },
            { key: "description", label: "Description", type: "textarea" },
            { key: "features", label: "Features", type: "tags", helpText: "Comma-separated" },
            { key: "images", label: "Image URLs", type: "tags", helpText: "Comma-separated, first is used as the cover photo" },
          ]}
        />
      </div>
    </div>
  );
}
