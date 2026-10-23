import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Digits, Kicker, Section, Standings } from "@/components/cards";
import { CategoryIcon } from "@/components/category-icon";
import { Faq, type FaqItem } from "@/components/faq";
import { areaView, GoogleMap } from "@/components/google-map";
import { JsonLd } from "@/components/json-ld";
import { type Business, businessPath, getAreaListings, getCityListings, getCoverPhotos, getOtherCities, type Listing, listingPath, opensOnSunday } from "@/lib/data";
import { joinList, plural } from "@/lib/format";
import { absoluteUrl, pageMeta, SITE_NAME } from "@/lib/site";
import { pill } from "@/lib/utils";

const placeName = (l: Listing) => (l.area ? `${l.area.name}, ${l.city.name}` : l.city.name);

export function listingMeta(l: Listing) {
  const n = l.businesses.length;
  return pageMeta({
    title: `Top ${n} ${l.category.lower} in ${placeName(l)}`,
    description: `${n} top-rated ${l.category.lower} in ${placeName(l)}, ordered by rating and review count. Includes ${joinList(
      l.businesses.slice(0, 3).map((b) => b.name),
    )}, with opening hours, phone numbers and maps.`,
    path: listingPath(l),
  });
}

// "Top X in City" and "Top X in Area, City" share this layout: a scoreboard header, then the league table.
export async function ListingView({ listing: l }: { listing: Listing }) {
  const { city, category, area, businesses } = l;
  const place = placeName(l);
  const heading = `Top ${category.lower} in ${place}`;
  const parentPath = listingPath({ city, category });

  const [cityListings, areas, otherCities, cityAreas, covers] = await Promise.all([
    getCityListings(city),
    getAreaListings(city, category),
    getOtherCities(category, city),
    area ? getAreaListings(city) : Promise.resolve([]),
    getCoverPhotos(),
  ]);
  const parentCount = cityListings.find((x) => x.category.id === category.id)?.count ?? businesses.length;
  const related = cityListings
    .filter((x) => x.category.id !== category.id)
    .sort((a, b) => Number(b.category.group === category.group) - Number(a.category.group === category.group))
    .slice(0, 10);
  const sameArea = cityAreas.filter((x) => x.area.slug === area?.slug && x.category.id !== category.id);
  const mapArea = areaView(businesses.flatMap((b) => (b.geo ? [b.geo] : [])));
  const photo = covers.categories.get(category.id);
  const reviews = businesses.reduce((n, b) => n + b.reviewCount, 0);
  const stats = [
    { label: "Places", value: businesses.length },
    { label: "Reviews counted", value: reviews },
    ...(areas.length > 0 && !area ? [{ label: "Neighbourhoods", value: areas.length }] : []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      <Breadcrumbs
        items={[
          { name: city.name, href: `/${city.slug}` },
          { name: category.name, href: parentPath },
          ...(area ? [{ name: area.name, href: listingPath(l) }] : []),
        ]}
      />

      <header className="mt-5 overflow-hidden rounded-md bg-graphite bg-stripes text-white">
        <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1fr_20rem] lg:items-center">
          <div className="min-w-0">
            <Kicker>League table</Kicker>
            <h1 className="mt-3 text-4xl text-balance italic sm:text-5xl">{heading}</h1>
            <p className="mt-3 max-w-xl text-white/80">
              Ordered by star rating and how many reviews back it up, the same way for everyone.{" "}
              <Link href="/about#rankings" className="font-semibold text-primary underline-offset-4 hover:underline">
                How the table works
              </Link>
            </p>
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
          </div>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- scraped hosts are unknown, so next/image can't allowlist them
            <img src={photo} alt="" referrerPolicy="no-referrer" className="hidden aspect-4/3 w-full rounded-sm object-cover ring-2 ring-white/10 lg:block" />
          ) : (
            <span aria-hidden className="hidden aspect-4/3 items-center justify-center rounded-sm bg-graphite-2 text-primary lg:flex">
              <CategoryIcon name={category.icon} className="size-20" />
            </span>
          )}
        </div>
        <div aria-hidden className="stripe-bar h-1.5" />
      </header>

      {areas.length > 0 && (
        <nav aria-label="Neighbourhoods" className="-mx-4 mt-6 overflow-x-auto px-4 pb-2">
          <ul className="flex gap-2 whitespace-nowrap">
            <li>
              <Link href={parentPath} aria-current={!area ? "page" : undefined} className={pill(!area)}>
                Everywhere · {parentCount}
              </Link>
            </li>
            {areas.map((a) => (
              <li key={a.area.slug}>
                <Link href={listingPath(a)} aria-current={a.area.slug === area?.slug ? "page" : undefined} className={pill(a.area.slug === area?.slug)}>
                  {a.area.name} · {a.count}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {mapArea && <GoogleMap area={mapArea} title={`Map of ${place}`} className="mt-6 h-64 rounded-md shadow-soft sm:h-80" />}

      <div className="mt-8">
        <Standings businesses={businesses} detail />
      </div>

      <div className="mt-20 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <Section title="Good to know" kicker={`${category.name} in ${place}`} id="faq">
          <Faq items={listingFaqs(l)} />
        </Section>
        <div className="space-y-10">
          {sameArea.length > 0 && <Chips title={`Also in ${area!.name}`} links={sameArea.map((x) => ({ href: listingPath(x), label: `${x.category.name} · ${x.count}` }))} />}
          {related.length > 0 && <Chips title={`Other leagues in ${city.name}`} links={related.map((x) => ({ href: listingPath(x), label: x.category.name }))} />}
          {otherCities.length > 0 && (
            <Chips title={`${category.name} in other cities`} links={otherCities.map((x) => ({ href: listingPath(x), label: x.city.name }))} />
          )}
        </div>
      </div>

      <JsonLd
        data={{
          "@type": "ItemList",
          name: heading,
          numberOfItems: businesses.length,
          itemListElement: businesses.map((b, i) => ({ "@type": "ListItem", position: i + 1, name: b.name, url: absoluteUrl(businessPath(b)) })),
        }}
      />
    </div>
  );
}

function Chips({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <section>
      <h2 className="border-b-2 border-graphite pb-2 text-xl italic">{title}</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className={pill()}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Answers written from the list itself, so each page's FAQ is its own.
function listingFaqs(l: Listing): FaqItem[] {
  const cat = l.category.lower;
  const place = placeName(l);
  const list = l.businesses;
  const rated = (b: Business) =>
    b.rating === null ? b.name : `${b.name} (${b.rating.toFixed(1)}★, ${plural(b.reviewCount, "review", "reviews")})`;
  const top = list.filter((b) => b.rating !== null).slice(0, 3);
  const areas = [...new Set(list.flatMap((b) => (b.area ? [b.area.name] : [])))];
  const withHours = list.filter((b) => b.hours.length);
  const sunday = withHours.filter(opensOnSunday);
  const sundayHours = (b: Business) => b.hours.find(([d]) => d === "sunday")![1];
  const mostReviewed = [...list].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 3).filter((b) => b.reviewCount);
  const online = list.filter((b) => b.serviceOptions.online_appointments);

  const faqs: (FaqItem | false)[] = [
    top.length > 0 && {
      q: `Which ${cat} in ${place} top the table?`,
      a: `Weighing each rating by its number of reviews, the top spots go to ${joinList(top.map(rated))}.`,
    },
    {
      q: `How many ${cat} does ${SITE_NAME} rank in ${place}?`,
      a: `There are ${plural(list.length, l.category.singularLower, cat)} in this table${
        !l.area && areas.length > 1 ? `, spread over ${areas.length} neighbourhoods such as ${joinList(areas.slice(0, 3))}` : ""
      }.`,
    },
    withHours.length > 0 && {
      q: `Can I find ${cat} in ${place} open on a Sunday?`,
      a: sunday.length
        ? `Yes: ${sunday.length} of the ${withHours.length} with listed hours open on Sundays, for example ${joinList(
            sunday.slice(0, 3).map((b) => `${b.name} (${sundayHours(b)})`),
          )}. Hours can change, so a quick call first is a good idea.`
        : `None of the ${withHours.length} places with listed hours open on Sundays. Hours do change, so it's worth calling.`,
    },
    mostReviewed.length > 0 && {
      q: `Which ${cat} in ${place} have the most reviews?`,
      a: `${joinList(mostReviewed.map((b) => `${b.name} (${plural(b.reviewCount, "review", "reviews")})`))}.`,
    },
    online.length > 0 && {
      q: `Can I book ${cat} in ${place} online?`,
      a: `Yes, ${plural(online.length, `${l.category.singularLower} takes`, `${cat} take`)} online bookings, including ${joinList(online.slice(0, 3).map((b) => b.name))}.`,
    },
  ];
  return faqs.filter((f): f is FaqItem => !!f);
}
