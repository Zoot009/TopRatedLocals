import { ArrowRight, SearchX } from "lucide-react";
import Link from "next/link";
import { firstParam } from "@/components/business-picker";
import { Digits, Standings } from "@/components/cards";
import { areaView, GoogleMap } from "@/components/google-map";
import { SearchForm } from "@/components/search-form";
import {
  type Category,
  findCategory,
  getCategories,
  getCategoryCities,
  getCities,
  getCityListings,
  listingPath,
  SEARCH_COUNT_CAP,
  SEARCH_FEATURES,
  SEARCH_PAGE_SIZE,
  type SearchFeature,
  type SearchParams,
  searchBusinesses,
  type Sort,
  SORTS,
} from "@/lib/data";
import { formatCount } from "@/lib/format";
import { pageMeta } from "@/lib/site";
import { categoryHref, cn, pill } from "@/lib/utils";

const RATINGS = [4, 4.5];

type Raw = Awaited<PageProps<"/search">["searchParams"]>;

function parse(sp: Raw): SearchParams & { page: number } {
  const sort = firstParam(sp.sort);
  return {
    q: firstParam(sp.q),
    loc: firstParam(sp.loc),
    sort: Object.hasOwn(SORTS, sort) ? (sort as Sort) : "best",
    rating: RATINGS.includes(Number(firstParam(sp.rating))) ? Number(firstParam(sp.rating)) : 0,
    price: firstParam(sp.price),
    features: firstParam(sp.features)
      .split(",")
      .filter((f): f is SearchFeature => Object.hasOwn(SEARCH_FEATURES, f)),
    page: Math.max(1, Math.floor(Number(firstParam(sp.page))) || 1),
  };
}

// A /search URL from the current params plus changes, leaving out defaults.
function hrefFor(s: SearchParams, changes: Partial<SearchParams & { page: number }>) {
  const next = { ...s, page: 1, ...changes };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.loc) params.set("loc", next.loc);
  if (next.sort !== "best") params.set("sort", next.sort);
  if (next.rating) params.set("rating", String(next.rating));
  if (next.price) params.set("price", next.price);
  if (next.features.length) params.set("features", next.features.join(","));
  if (next.page > 1) params.set("page", String(next.page));
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

export async function generateMetadata({ searchParams }: PageProps<"/search">) {
  const { q, loc } = parse(await searchParams);
  return pageMeta({
    title: q || loc ? `${q || "Places"}${loc ? ` in ${loc}` : ""}` : "Search places",
    description: "Search local places by what they do and where they are.",
    path: "/search",
    noindex: true,
  });
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const s = parse(await searchParams);
  const page = Math.min(s.page, Math.ceil(SEARCH_COUNT_CAP / SEARCH_PAGE_SIZE));
  const category = await findCategory(s.q);
  const [{ results, total, prices }, shortcut, cityLists] = await Promise.all([
    searchBusinesses(s, page, category),
    findListing(category, s.loc),
    category && !s.loc ? getCategoryCities(category) : Promise.resolve([]),
  ]);
  const pages = Math.max(1, Math.ceil(Math.min(total, SEARCH_COUNT_CAP) / SEARCH_PAGE_SIZE));
  const offset = (page - 1) * SEARCH_PAGE_SIZE;
  const mapArea = areaView(results.flatMap((b) => (b.geo ? [b.geo] : []))); // none when results span cities
  const filtered = s.rating || s.price || s.features.length;
  const what = category?.name ?? (s.q || "Places");

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      <section aria-labelledby="search-h" className="overflow-hidden rounded-md bg-graphite bg-stripes text-white">
        <div className="p-5 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <h1 id="search-h" className="min-w-0 text-4xl wrap-break-word italic sm:text-5xl">
              {s.q || s.loc ? `${what}${s.loc ? ` in ${s.loc}` : ""}` : "All places"}
            </h1>
            <p className="flex items-end gap-2">
              <Digits value={Math.min(total, SEARCH_COUNT_CAP)} className="text-3xl" />
              <span className="font-display font-bold tracking-wider text-white/70 uppercase">
                {total > SEARCH_COUNT_CAP && "+ "}
                {total === 1 ? "place" : "places"}
              </span>
            </p>
          </div>
          <div className="mt-6">
            <SearchForm q={s.q} loc={s.loc} />
          </div>
        </div>
        <div aria-hidden className="stripe-bar h-1.5" />
      </section>

      <div aria-label="Filters" role="group" className="mt-6">
        {/* Sort as scoreboard tabs; each one is a link, so the result stays shareable. */}
        <div className="-mx-4 overflow-x-auto px-4">
          <ul className="flex min-w-max border-b-2 border-graphite">
            {(Object.keys(SORTS) as Sort[]).map((key) => (
              <li key={key}>
                <Link
                  href={hrefFor(s, { sort: key })}
                  aria-current={s.sort === key ? "true" : undefined}
                  className={cn(
                    "-mb-0.5 block border-b-4 px-4 py-2.5 font-display font-bold tracking-wide whitespace-nowrap uppercase",
                    s.sort === key ? "border-primary bg-graphite text-white" : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {SORTS[key]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="-mx-4 mt-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 whitespace-nowrap">
          <span className="w-14 shrink-0 font-display text-xs font-bold tracking-wider text-muted-foreground uppercase">Filter</span>
          {RATINGS.map((r) => (
            <Link key={r} href={hrefFor(s, { rating: s.rating === r ? 0 : r })} aria-current={s.rating === r ? "true" : undefined} className={pill(s.rating === r)}>
              ★ {r}+
            </Link>
          ))}
          {prices.map((p) => (
            <Link key={p} href={hrefFor(s, { price: s.price === p ? "" : p })} aria-current={s.price === p ? "true" : undefined} className={pill(s.price === p)}>
              {p}
            </Link>
          ))}
          {(Object.keys(SEARCH_FEATURES) as SearchFeature[]).map((f) => {
            const on = s.features.includes(f);
            return (
              <Link key={f} href={hrefFor(s, { features: on ? s.features.filter((x) => x !== f) : [...s.features, f] })} aria-current={on ? "true" : undefined} className={pill(on)}>
                {SEARCH_FEATURES[f].label}
              </Link>
            );
          })}
          {filtered ? (
            <Link href={hrefFor(s, { rating: 0, price: "", features: [] })} className="px-3 py-2 font-display text-sm font-bold tracking-wide text-primary-ink uppercase hover:underline">
              Clear
            </Link>
          ) : null}
        </div>
      </div>

      {cityLists.length > 0 && (
        <nav aria-label={`${category!.name} by city`} className="mt-6 rounded-md border bg-card p-5 shadow-soft">
          <p className="font-display text-lg font-bold uppercase italic">Pick a city to see its {category!.lower} table</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {cityLists.map((l) => (
              <li key={l.city.slug}>
                <Link href={listingPath(l)} className={pill()}>
                  {l.city.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/cities" className="inline-flex px-3 py-2 font-display text-sm font-bold tracking-wide text-primary-ink uppercase hover:underline">
                All cities
              </Link>
            </li>
          </ul>
        </nav>
      )}

      {shortcut && (
        <Link
          href={listingPath(shortcut)}
          className="mt-6 flex items-center justify-between gap-3 rounded-sm bg-primary px-6 py-4 font-display text-lg font-bold tracking-wide text-primary-foreground uppercase hover:bg-primary-dark"
        >
          Open the {shortcut.category.lower} table for {shortcut.city.name}
          <ArrowRight className="size-5 shrink-0" />
        </Link>
      )}

      {mapArea && <GoogleMap area={mapArea} title="Map of the area" className="mt-6 hidden h-56 rounded-md shadow-soft md:block" />}

      {results.length ? (
        <>
          <div className="mt-8">
            <Standings businesses={results} ranks={results.map((_, i) => offset + i + 1)} detail />
          </div>
          {pages > 1 && <Pagination page={page} pageCount={pages} href={(p) => hrefFor(s, { page: p })} />}
        </>
      ) : (
        <EmptyState clearHref={filtered ? hrefFor(s, { rating: 0, price: "", features: [] }) : null} />
      )}
    </div>
  );
}

// First, last and the neighbours of the current page; gaps become "…".
function Pagination({ page, pageCount, href }: { page: number; pageCount: number; href: (p: number) => string }) {
  const pages = [...new Set([1, page - 1, page, page + 1, pageCount])].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  return (
    <nav aria-label="Pages" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link href={href(page - 1)} className={pill()}>
          ← Back
        </Link>
      )}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && p - pages[i - 1] > 1 && <span className="text-muted-foreground">…</span>}
          <Link href={href(p)} aria-current={p === page ? "page" : undefined} className={cn(pill(p === page), "size-10 justify-center px-0")}>
            {p}
          </Link>
        </span>
      ))}
      {page < pageCount && (
        <Link href={href(page + 1)} className={pill()}>
          Next →
        </Link>
      )}
    </nav>
  );
}

async function EmptyState({ clearHref }: { clearHref: string | null }) {
  const [categories, cities] = await Promise.all([getCategories(), getCities()]);
  const popular = [...categories].sort((a, b) => b.total - a.total).slice(0, 6);
  return (
    <div className="mt-10 rounded-md border border-dashed bg-card px-6 py-14 text-center">
      <span className="mx-auto flex size-20 items-center justify-center rounded-sm bg-graphite text-primary">
        <SearchX className="size-9" />
      </span>
      <h2 className="mt-5 text-4xl italic">Nothing on the board</h2>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">Try a broader word like &ldquo;dentist&rdquo;, check the spelling, or search the whole city.</p>
      {clearHref && (
        <Link
          href={clearHref}
          className="mt-6 inline-block rounded-sm bg-primary px-6 py-3 font-display font-bold tracking-wide text-primary-foreground uppercase hover:bg-primary-dark"
        >
          Clear the filters
        </Link>
      )}
      <ul className="mt-8 flex flex-wrap justify-center gap-2">
        {popular.map((c) => (
          <li key={c.slug}>
            <Link href={categoryHref(c.name)} className={pill()}>
              {c.name}
            </Link>
          </li>
        ))}
        <li>
          <Link href="/cities" className={pill(true)}>
            {formatCount(cities.length)} cities
          </Link>
        </li>
      </ul>
    </div>
  );
}

// "dentist" in "Tokyo" names a list we publish: offer it straight away.
async function findListing(category: Category | undefined, loc: string) {
  const want = loc.trim().toLowerCase();
  if (!category || !want) return undefined;
  const city = (await getCities()).find((c) => [c.name, c.label, c.slug].some((n) => n.toLowerCase() === want));
  return city && (await getCityListings(city)).find((l) => l.category.id === category.id);
}
