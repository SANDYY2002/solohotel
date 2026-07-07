"use client";

import { Input, Label } from "@/components/ui/input";
import { ArrayEditor } from "@/components/admin/array-editor";
import { StringListEditor } from "@/components/admin/string-list-editor";
import { SaveBar, useSaveSection } from "@/components/admin/save-bar";
import type { AboutContent } from "@/lib/content-types";

export function AboutEditor({ initial }: { initial: AboutContent }) {
  const { data, setData, save, state, errorMessage } = useSaveSection("about", initial);

  return (
    <div>
      <SaveBar
        title="About Page"
        description="The property story, sustainability commitments, staff, and awards."
        state={state}
        errorMessage={errorMessage}
        onSave={save}
      />

      <div className="max-w-3xl space-y-10">
        <section>
          <h2 className="mb-3 font-display text-lg">Story</h2>
          <Label htmlFor="storyHeading">Heading</Label>
          <Input
            id="storyHeading"
            value={data.storyHeading}
            onChange={(e) => setData({ ...data, storyHeading: e.target.value })}
          />
          <div className="mt-4">
            <Label>Paragraphs</Label>
            <StringListEditor
              items={data.storyParagraphs}
              onChange={(items) => setData({ ...data, storyParagraphs: items })}
              multiline
              addLabel="Add paragraph"
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg">Sustainability</h2>
          <ArrayEditor
            items={data.sustainability}
            onChange={(items) => setData({ ...data, sustainability: items as AboutContent["sustainability"] })}
            titleKey="title"
            addLabel="Add item"
            emptyItem={{ icon: "Leaf", title: "New Commitment", desc: "" }}
            fields={[
              { key: "icon", label: "Icon", type: "icon" },
              { key: "title", label: "Title", type: "text" },
              { key: "desc", label: "Description", type: "textarea" },
            ]}
          />
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg">Staff</h2>
          <ArrayEditor
            items={data.staff}
            onChange={(items) => setData({ ...data, staff: items as AboutContent["staff"] })}
            titleKey="name"
            addLabel="Add staff member"
            emptyItem={{ name: "New Staff Member", role: "", image: "" }}
            fields={[
              { key: "name", label: "Name", type: "text" },
              { key: "role", label: "Role", type: "text" },
              { key: "image", label: "Photo", type: "image" },
            ]}
          />
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg">Awards & press</h2>
          <ArrayEditor
            items={data.awards}
            onChange={(items) => setData({ ...data, awards: items as AboutContent["awards"] })}
            titleKey="title"
            addLabel="Add award"
            emptyItem={{ year: new Date().getFullYear().toString(), title: "New Award" }}
            fields={[
              { key: "title", label: "Title", type: "text" },
              { key: "year", label: "Year", type: "text" },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
