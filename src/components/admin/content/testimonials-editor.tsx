"use client";

import { ArrayEditor } from "@/components/admin/array-editor";
import { SaveBar, useSaveSection } from "@/components/admin/save-bar";
import type { Testimonial } from "@/lib/content-types";

export function TestimonialsEditor({ initial }: { initial: Testimonial[] }) {
  const { data, setData, save, state, errorMessage } = useSaveSection("testimonials", initial);

  return (
    <div>
      <SaveBar
        title="Testimonials"
        description="Guest quotes shown in the homepage carousel."
        state={state}
        errorMessage={errorMessage}
        onSave={save}
      />

      <div className="max-w-3xl">
        <ArrayEditor
          items={data}
          onChange={(items) => setData(items as Testimonial[])}
          titleKey="name"
          addLabel="Add testimonial"
          emptyItem={{ name: "New Guest", origin: "", quote: "", rating: 5 }}
          fields={[
            { key: "name", label: "Guest name", type: "text" },
            { key: "origin", label: "Origin (e.g. Paris, France)", type: "text" },
            { key: "rating", label: "Rating (1–5)", type: "number" },
            { key: "quote", label: "Quote", type: "textarea" },
          ]}
        />
      </div>
    </div>
  );
}
