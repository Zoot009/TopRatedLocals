import { Plus } from "lucide-react";

export type FaqItem = { q: string; a: string };

// Native <details> as rows of one bordered panel; the plus turns into a cross when open.
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y overflow-hidden rounded-md border bg-card shadow-soft">
      {items.map((f) => (
        <details key={f.q} className="group px-5 open:bg-tint/60">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold">
            {f.q}
            <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground transition-transform group-open:rotate-45">
              <Plus className="size-4" />
            </span>
          </summary>
          <p className="pb-5 leading-relaxed text-muted-foreground">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
