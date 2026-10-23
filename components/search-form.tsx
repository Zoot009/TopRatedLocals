import { MapPin, Search } from "lucide-react";
import Form from "next/form";
import { cn } from "@/lib/utils";

// GET form to /search; next/form makes it a client-side navigation. A white panel that sits on graphite or grey.
export function SearchForm({ q = "", loc = "", big = false }: { q?: string; loc?: string; big?: boolean }) {
  const field = cn("flex min-w-0 items-center gap-2 rounded-sm border-2 border-transparent bg-tint px-4 focus-within:border-primary-ink sm:flex-1", big ? "h-14" : "h-12");
  const input = "w-full min-w-0 bg-transparent font-semibold outline-none placeholder:font-normal placeholder:text-muted-foreground";
  return (
    <Form action="/search" role="search" className="flex w-full flex-col gap-2 rounded-md bg-card p-2 text-foreground shadow-soft sm:flex-row">
      <label className={field}>
        <Search aria-hidden className="size-4 shrink-0 text-primary-ink" />
        <span className="sr-only">What are you looking for?</span>
        <input name="q" defaultValue={q} placeholder="Dentists, pizza, plumbers…" className={input} />
      </label>
      <label className={field}>
        <MapPin aria-hidden className="size-4 shrink-0 text-primary-ink" />
        <span className="sr-only">Where?</span>
        <input name="loc" defaultValue={loc} placeholder="City or neighbourhood" className={input} />
      </label>
      <button
        type="submit"
        className={cn(
          "shrink-0 rounded-sm bg-primary font-display font-bold tracking-wide text-primary-foreground uppercase hover:bg-primary-dark",
          big ? "h-14 px-8 text-lg" : "h-12 px-6",
        )}
      >
        See the table
      </button>
    </Form>
  );
}
