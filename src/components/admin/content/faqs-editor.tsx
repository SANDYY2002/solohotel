"use client";

import { ArrayEditor } from "@/components/admin/array-editor";
import { SaveBar, useSaveSection } from "@/components/admin/save-bar";
import type { Faq } from "@/lib/content-types";

export function FaqsEditor({ initial }: { initial: Faq[] }) {
  const { data, setData, save, state, errorMessage } = useSaveSection("faqs", initial);

  return (
    <div>
      <SaveBar
        title="FAQs"
        description="Frequently asked questions shown on the homepage."
        state={state}
        errorMessage={errorMessage}
        onSave={save}
      />

      <div className="max-w-3xl">
        <ArrayEditor
          items={data}
          onChange={(items) => setData(items as Faq[])}
          titleKey="q"
          addLabel="Add question"
          emptyItem={{ q: "New question?", a: "" }}
          fields={[
            { key: "q", label: "Question", type: "text" },
            { key: "a", label: "Answer", type: "textarea" },
          ]}
        />
      </div>
    </div>
  );
}
