import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Digits, JoinLeague, Kicker, LeagueTile, QuotesBand, Section, Standings } from "@/components/cards";
import { SearchForm } from "@/components/search-form";
import { getAreaListings, getCities, getCity, getCityListings, getCoverPhotos, getTopBusinesses, listingPath } from "@/lib/data";
import { formatCount, joinList } from "@/lib/format";
import { pageMeta } from "@/lib/site";

// Every city is prerendered at build; a city added later renders on its first visit.
export const generateStaticParams = async () => (await getCities()).map((c) => ({ city: c.slug }));

async function load(params: PageProps<"/[city]">["params"]) {
  const city = (await getCity((await params).city)) ?? notFound();
  return { city, listings: await getCityListings(city) };
}

export async function generateMetadata({ params }: PageProps<"/[city]">) {
  const { city, listings } = await load(params);
  return pageMeta({
    title: `Things to do and places to go in ${city.label}`,
    description: `Explore ${formatCount(city.listed)} top-rated places in ${city.name}: ${joinList(
      listings.slice(0, 4).map((l) => l.category.lower),
    )} and more, ranked by real ratings with hours, phone numbers and maps.`,
    path: `/${city.slug}`,
  });
}

export default async function CityPage({ params }: PageProps<"/[city]">) {
  const { city, listings } = await load(params);
  const [areaListings, top, withQuotes, covers] = await Promise.all([
    getAreaListings(city),
    getTopBusinesses({ city, limit: 8 }),
    getTopBusinesses({ city, limit: 14, withQuote: true }),
    getCoverPhotos(),
  ]);
  const quoted = withQuotes.filter((b) => !top.some((t) => t.id === b.id)).slice(0, 6);
  const areas = [...Map.groupBy(areaListings, (l) => l.area.slug).values()].sort(
    (a, b) => b.reduce((n, l) => n + l.count, 0) - a.reduce((n, l) => n + l.count, 0),
  );
  const photo = covers.cities.get(city.id);
  const stats = [
    { label: "Places", value: city.listed },
    { label: "Leagues", value: listings.length },
    ...(areas.length > 0 ? [{ label: "Neighbourhoods", value: areas.length }] : []),
  ];

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <Breadcrumbs items={[{ name: city.name, href: `/${city.slug}` }]} />
        <section aria-labelledby="city-h" className="relative isolate mt-5 overflow-hidden rounded-md bg-graphite bg-stripes text-white">
          {photo && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- scraped hosts are unknown, so next/image can't allowlist them */}
              <img src={photo} alt="" referrerPolicy="no-referrer" className="absolute inset-y-0 right-0 -z-10 hidden h-full w-1/2 object-cover lg:block" />
              <span aria-hidden className="absolute inset-y-0 right-0 -z-10 hidden w-1/2 bg-linear-to-r from-graphite to-graphite/10 lg:block" />
            </>
          )}
          <div className="max-w-2xl p-5 sm:p-8 lg:py-12">
            <Kicker>{city.country} conference</Kicker>
            <h1 id="city-h" className="mt-3 text-5xl italic sm:text-6xl">
              Top-rated in <span className="text-primary">{city.name}</span>
            </h1>
            {city.state && city.state !== city.name && <p className="mt-2 font-display text-lg font-semibold tracking-wide text-white/70 uppercase">{city.state}</p>}
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-xs font-bold tracking-wider text-white/60 uppercase">{s.label}</dt>
                  <dd className="mt-1">
                    <Digits value={s.value} className="text-3xl" />
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-8">
              <SearchForm loc={city.name} />
            </div>
          </div>
          <div aria-hidden className="stripe-bar h-1.5" />
        </section>
      </div>

      <div className="mx-auto max-w-6xl space-y-20 px-4 pt-16">
        <Section title={`Leagues in ${city.name}`} kicker="Pick a table" id="categories">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {listings.map((l) => (
              <li key={l.category.slug}>
                <LeagueTile category={l.category} count={l.count} href={listingPath(l)} photo={covers.categories.get(l.category.id)} />
              </li>
            ))}
          </ul>
        </Section>

        {top.length > 0 && (
          <Section title={`Top of the ${city.name} table`} kicker="Every league" id="top">
            <Standings businesses={top} />
          </Section>
        )}

        {areas.length > 0 && (
          <Section title="Neighbourhoods" kicker="Local divisions" id="areas">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {areas.map((ls) => (
                <li key={ls[0].area.slug} className="overflow-hidden rounded-md border bg-card shadow-soft">
                  <p className="bg-graphite px-4 py-2 font-display text-lg font-bold text-white uppercase italic">{ls[0].area.name}</p>
                  <ul className="divide-y">
                    {ls.map((l) => (
                      <li key={l.category.slug}>
                        <Link href={listingPath(l)} className="flex items-center justify-between gap-3 px-4 py-2 text-sm font-semibold hover:bg-primary/10 hover:text-primary-ink">
                          {l.category.name}
                          <span className="font-display text-base font-bold">{l.count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      {quoted.length > 0 && (
        <div className="mt-20">
          <QuotesBand businesses={quoted} title={`What ${city.name} fans say`} id="quotes" />
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 pt-20">
        <JoinLeague />
      </div>
    </>
  );
}
