import { HandCoins, Scale, Users } from "lucide-react";
import Link from "next/link";
import { CityCard, Digits, JoinLeague, Kicker, LeagueTile, Podium, QuotesBand, ScoringCard, Section, Standings } from "@/components/cards";
import { SearchForm } from "@/components/search-form";
import { getCategories, getCities, getCoverPhotos, getStats, getTopBusinesses, MIN_CATEGORY_PAGE } from "@/lib/data";
import { formatCount } from "@/lib/format";
import { pageMeta } from "@/lib/site";
import { categoryHref, pill } from "@/lib/utils";

export const metadata = pageMeta({
  title: "The standings for local business",
  description:
    "Restaurants, dentists, salons, plumbers and more, ranked like a league table by star rating and number of reviews. Free to use, and nobody pays for position.",
  path: "/",
});

const rules = [
  { icon: Scale, title: "Rating weighed by reviews", text: "A great rating counts for more when lots of people agree. Two lucky reviews can't top the table." },
  { icon: Users, title: "Ties go to the crowd", text: "Level on points? The business with more reviews goes higher." },
  { icon: HandCoins, title: "No paid positions", text: "There's nothing to buy: no sponsored spots, no ads, no premium plans." },
];

export default async function HomePage() {
  const [stats, categories, cities, top, withQuotes, covers] = await Promise.all([
    getStats(),
    getCategories(),
    getCities(),
    getTopBusinesses({ limit: 10 }),
    getTopBusinesses({ limit: 14, withQuote: true }),
    getCoverPhotos(),
  ]);
  const popular = categories.filter((c) => c.total > 0).sort((a, b) => b.total - a.total);
  const quoted = withQuotes.filter((b) => !top.some((t) => t.id === b.id)).slice(0, 6);
  const counters = [
    { label: "Businesses", value: stats.businesses },
    { label: "Reviews counted", value: stats.reviews },
    { label: "Cities", value: cities.length },
    { label: "Leagues", value: popular.length },
  ];

  return (
    <>
      {/* Hero scoreboard: search, the live podium and the counts. */}
      <section aria-labelledby="hero-h" className="bg-graphite bg-stripes text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-12 pb-10 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:pt-16">
          <div className="lg:pb-16">
            <Kicker>The local league table</Kicker>
            <h1 id="hero-h" className="mt-4 text-5xl leading-[0.95] italic sm:text-7xl">
              The standings for <span className="text-primary">local business</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-white/80">
              Every business ranked like a league table: by its star rating and by how many reviews back it up. Nobody pays for
              position.
            </p>
            <div className="mt-8">
              <SearchForm big />
            </div>
          </div>
          {top.length > 0 && (
            <div>
              <p className="mb-4 text-center font-display text-sm font-bold tracking-wider text-white/60 uppercase">Top three, every city</p>
              <Podium businesses={top} />
            </div>
          )}
        </div>
        <div className="border-t border-white/10 bg-graphite">
          <dl className="mx-auto grid max-w-6xl grid-cols-1 gap-x-6 gap-y-5 px-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
            {counters.map((c) => (
              <div key={c.label} className="flex items-center justify-between gap-4 lg:block">
                <dt className="font-display text-sm font-bold tracking-wider text-white/60 uppercase">{c.label}</dt>
                <dd className="lg:mt-2">
                  <Digits value={c.value} className="text-3xl sm:text-4xl" />
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div aria-hidden className="stripe-bar h-1.5" />
      </section>

      <div className="mx-auto max-w-6xl space-y-24 px-4 pt-16">
        {top.length > 0 && (
          <Section title="Top of the table" kicker="Premier league" id="top" action={{ href: "/search", label: "Full standings" }}>
            <Standings businesses={top} />
          </Section>
        )}

        <Section title="Pick your league" kicker="Leagues" id="leagues" action={{ href: "/categories", label: "All leagues" }}>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {popular.slice(0, 8).map((c) => (
              <li key={c.slug}>
                <LeagueTile category={c} count={c.total} href={categoryHref(c.name)} photo={covers.categories.get(c.id)} />
              </li>
            ))}
          </ul>
          {popular.length > 8 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {popular.slice(8, 26).map((c) => (
                <li key={c.slug}>
                  <Link href={categoryHref(c.name)} className={pill()}>
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/categories" className={pill(true)}>
                  Every league
                </Link>
              </li>
            </ul>
          )}
        </Section>

        <Section title="Choose your city" kicker="Conferences" id="cities" action={{ href: "/cities", label: `All ${formatCount(cities.length)} cities` }}>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cities.slice(0, 8).map((c) => (
              <li key={c.slug}>
                <CityCard city={c} photo={covers.cities.get(c.id)} />
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {quoted.length > 0 && (
        <div className="mt-24">
          <QuotesBand businesses={quoted} title="What the fans are saying" id="quotes" />
        </div>
      )}

      <div className="mx-auto max-w-6xl space-y-24 px-4 pt-24">
        <Section title="How the table is calculated" kicker="The rules" id="how">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div>
              <p className="text-lg leading-relaxed">
                Star ratings alone reward places with hardly any reviews. So every business starts on the same mark and its real
                reviews move it from there: the more people who rate it, the more their rating counts.
              </p>
              <ul className="mt-6 space-y-4">
                {rules.map((r) => (
                  <li key={r.title} className="flex gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-sm bg-graphite text-primary">
                      <r.icon className="size-5" />
                    </span>
                    <span>
                      <span className="block font-display text-xl leading-tight font-bold uppercase">{r.title}</span>
                      <span className="text-muted-foreground">{r.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-muted-foreground">
                A city gets a league table once it has at least {MIN_CATEGORY_PAGE} businesses of that kind.{" "}
                <Link href="/about#rankings" className="font-semibold text-primary-ink hover:underline">
                  The full rulebook
                </Link>
              </p>
            </div>
            <ScoringCard />
          </div>
        </Section>

        <JoinLeague />
      </div>
    </>
  );
}
