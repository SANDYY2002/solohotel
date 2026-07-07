"use client";

import { ArrayEditor } from "@/components/admin/array-editor";
import { SaveBar, useSaveSection } from "@/components/admin/save-bar";
import type { GalleryImage } from "@/lib/content-types";

const CATEGORIES = ["Rooms", "Dining", "Spa", "Grounds", "Coastline"];

export function GalleryEditor({ initial }: { initial: GalleryImage[] }) {
  const { data, setData, save, state, errorMessage } = useSaveSection("gallery", initial);

  return (
    <div>
      <SaveBar
        title="Gallery"
        description="Photos shown on the gallery page and the homepage preview strip."
        state={state}
        errorMessage={errorMessage}
        onSave={save}
      />

      <div className="max-w-3xl">
        <ArrayEditor
          items={data}
          onChange={(items) => setData(items as GalleryImage[])}
          titleKey="alt"
          addLabel="Add photo"
          emptyItem={{ src: "", category: "Rooms", alt: "", w: 4, h: 3 }}
          fields={[
            { key: "src", label: "Photo", type: "image" },
            { key: "category", label: "Category", type: "select", options: CATEGORIES },
            { key: "alt", label: "Alt text", type: "text", helpText: "Describes the photo for accessibility & SEO" },
            { key: "w", label: "Aspect width", type: "number" },
            { key: "h", label: "Aspect height", type: "number" },
          ]}
        />
      </div>
    </div>
  );
}
