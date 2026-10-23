import { ArrowRight, Search } from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import { RatingPill } from "@/components/rating";
import { Thumb } from "@/components/thumb";
import { type Business, businessPath, pickBusinesses } from "@/lib/data";
import { inputClass } from "@/lib/utils";

// First step of the review, claim and edit flows: find the place by name and city.
export async function BusinessPicker({ q, path, cta }: { q: string; path: string; cta: string }) {
  const results = await pickBusinesses(q);

  return (
    <div>
      <Form action={path} role="search" className="flex gap-2 rounded-md bg-graphite p-2 shadow-soft">
        <label htmlFor="picker-q" className="sr-only">
          Business name and city
        </label>
        <input id="picker-q" name="q" defaultValue={q} placeholder="Business name and city, e.g. Blue Bottle Tokyo" className={inputClass} />
        <button
          type="submit"
          className="flex shrink-0 items-center gap-2 rounded-sm bg-primary px-5 font-display font-bold tracking-wide text-primary-foreground uppercase hover:bg-primary-dark"
        >
          <Search className="size-4" /> <span className="max-sm:sr-only">Find it</span>
        </button>
      </Form>

      {q && (
        <div className="mt-6">
          {results.length ? (
            <ul className="divide-y overflow-hidden rounded-md border bg-card shadow-soft">
              {results.map((b) => (
                <li key={b.id}>
                  <Link href={`${path}?biz=${encodeURIComponent(b.slug)}`} className="group flex items-center gap-4 p-3 pr-5 hover:bg-primary/10">
                    <Thumb name={b.name} src={b.thumbnail} className="size-14 rounded-sm text-sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-lg leading-tight font-bold">{b.name}</span>
                      <span className="block truncate text-sm text-muted-foreground">{b.address}</span>
                    </span>
                    <span className="hidden items-center gap-1 font-display font-bold tracking-wide text-primary-ink uppercase sm:flex">
                      {cta} <ArrowRight className="size-4" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-md border border-dashed bg-card p-6 text-center text-muted-foreground">
              No match for &ldquo;{q}&rdquo;. Try fewer words, or{" "}
              <Link href="/add-a-business" className="font-bold text-primary-ink hover:underline">
                add the business
              </Link>
              .
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// The chosen business above a form, with a way back to the finder.
export function SelectedBusiness({ business: b, path }: { business: Business; path: string }) {
  return (
    <div className="flex items-center gap-4 rounded-md border-l-4 border-primary bg-card p-3 pr-4 shadow-soft">
      <Thumb name={b.name} src={b.thumbnail} className="size-16 rounded-sm" />
      <div className="min-w-0 flex-1">
        <Link href={businessPath(b)} className="block truncate font-display text-xl leading-tight font-bold hover:text-primary-ink">
          {b.name}
        </Link>
        <RatingPill rating={b.rating} count={b.reviewCount} className="mt-1" />
      </div>
      <Link href={path} className="shrink-0 rounded-sm border px-3 py-2 font-display text-sm font-bold tracking-wide uppercase hover:border-graphite">
        Change
      </Link>
    </div>
  );
}

export const firstParam = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : (v ?? "")).trim().slice(0, 120);
