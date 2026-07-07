"use client";

import { Input, Label, Textarea } from "@/components/ui/input";
import { ArrayEditor } from "@/components/admin/array-editor";
import { ImageUploadField } from "@/components/admin/image-upload";
import { SaveBar, useSaveSection } from "@/components/admin/save-bar";
import type { DiningContent } from "@/lib/content-types";

export function DiningEditor({ initial }: { initial: DiningContent }) {
  const { data, setData, save, state, errorMessage } = useSaveSection("dining", initial);

  return (
    <div>
      <SaveBar
        title="Dining"
        description="Venues, the sample tasting menu, and the executive chef bio."
        state={state}
        errorMessage={errorMessage}
        onSave={save}
      />

      <div className="max-w-3xl space-y-10">
        <section>
          <h2 className="mb-3 font-display text-lg">Venues</h2>
          <ArrayEditor
            items={data.venues}
            onChange={(items) => setData({ ...data, venues: items as DiningContent["venues"] })}
            titleKey="name"
            addLabel="Add venue"
            emptyItem={{ name: "New Venue", tagline: "", hours: "", description: "", image: "" }}
            fields={[
              { key: "name", label: "Name", type: "text" },
              { key: "tagline", label: "Tagline", type: "text" },
              { key: "hours", label: "Hours", type: "text" },
              { key: "image", label: "Photo", type: "image" },
              { key: "description", label: "Description", type: "textarea" },
            ]}
          />
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg">Sample tasting menu</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="menuTitle">Menu title</Label>
              <Input
                id="menuTitle"
                value={data.menu.title}
                onChange={(e) => setData({ ...data, menu: { ...data.menu, title: e.target.value } })}
              />
            </div>
            <div>
              <Label htmlFor="menuPrice">Price per guest (USD)</Label>
              <Input
                id="menuPrice"
                type="number"
                value={data.menu.price}
                onChange={(e) => setData({ ...data, menu: { ...data.menu, price: Number(e.target.value) } })}
              />
            </div>
          </div>
          <div className="mt-4">
            <ArrayEditor
              items={data.menu.courses}
              onChange={(items) => setData({ ...data, menu: { ...data.menu, courses: items as DiningContent["menu"]["courses"] } })}
              titleKey="course"
              addLabel="Add course"
              emptyItem={{ course: "Course", item: "" }}
              fields={[
                { key: "course", label: "Course name", type: "text" },
                { key: "item", label: "Dish", type: "text" },
              ]}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg">Executive chef</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="chefName">Name</Label>
              <Input
                id="chefName"
                value={data.chef.name}
                onChange={(e) => setData({ ...data, chef: { ...data.chef, name: e.target.value } })}
              />
            </div>
            <div>
              <Label htmlFor="chefTitle">Title</Label>
              <Input
                id="chefTitle"
                value={data.chef.title}
                onChange={(e) => setData({ ...data, chef: { ...data.chef, title: e.target.value } })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="chefImage">Photo</Label>
              <ImageUploadField
                id="chefImage"
                value={data.chef.image}
                onChange={(url) => setData({ ...data, chef: { ...data.chef, image: url } })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="chefBio">Bio</Label>
              <Textarea
                id="chefBio"
                rows={3}
                value={data.chef.bio}
                onChange={(e) => setData({ ...data, chef: { ...data.chef, bio: e.target.value } })}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
