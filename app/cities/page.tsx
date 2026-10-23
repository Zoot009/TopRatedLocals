import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CityCard, Kicker } from "@/components/cards";
import { getCities, getCoverPhotos } from "@/lib/data";
import { formatCount } from "@/lib/format";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Every city",
  description: "Pick a city to see its top-rated restaurants, dentists, plumbers, salons and more, ranked by real reviews.",
  path: "/cities",
});

export default async function CitiesPage() {
  const [cities, covers] = await Promise.all([getCities(), getCoverPhotos()]);
  const byCountry = [...Map.groupBy(cities, (c) => c.country)].sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      <Breadcrumbs items={[{ name: "Every city", href: "/cities" }]} />
      <Kicker className="mt-8">Conferences</Kicker>
      <h1 className="mt-3 text-5xl italic sm:text-6xl">Every city in the competition</h1>
      <p className="mt-3 text-muted-foreground">
        {formatCount(cities.length)} cities in {formatCount(byCountry.length)} countries, each with its own league tables.
      </p>

      {cities.length > 0 && (
        <section aria-labelledby="popular-h" className="mt-10">
          <h2 id="popular-h" className="border-b-2 border-graphite pb-2 text-2xl italic">
            Biggest cities
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cities.slice(0, 12).map((c) => (
              <li key={c.slug}>
                <CityCard city={c} photo={covers.cities.get(c.id)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {byCountry.map(([country, list]) => (
          <section key={country} aria-label={country} className="overflow-hidden rounded-md border bg-card shadow-soft">
            <h2 className="flex items-center justify-between bg-graphite px-4 py-2.5 text-lg text-white italic">
              {country}
              <span className="font-display text-sm font-bold tracking-wider text-primary not-italic">{list.length}</span>
            </h2>
            <ul className="divide-y">
              {list
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((c) => (
                  <li key={c.slug}>
                    <Link href={`/${c.slug}`} className="flex items-center justify-between gap-3 px-4 py-2 text-sm font-semibold hover:bg-primary/10 hover:text-primary-ink">
                      <span className="truncate">{c.state && c.state !== country && c.state !== c.name ? `${c.name}, ${c.state}` : c.name}</span>
                      <span className="shrink-0 font-display text-base font-bold">{formatCount(c.listed)}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
