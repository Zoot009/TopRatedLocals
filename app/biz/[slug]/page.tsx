import { Check, ExternalLink, Globe, MapPin, Navigation, PencilLine, Phone, Star, X } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { RankBadge, Section, Standings, telHref } from "@/components/cards";
import { GoogleMap } from "@/components/google-map";
import { HoursTable } from "@/components/hours-table";
import { JsonLd } from "@/components/json-ld";
import { OpenStatus } from "@/components/open-status";
import { Stars } from "@/components/rating";
import { ShareButton } from "@/components/share-button";
import { Thumb } from "@/components/thumb";
import { type Business, businessPath, getAreaListings, getBusiness, getListing, getNearby, listingPath } from "@/lib/data";
import { formatCount, humanise, plural } from "@/lib/format";
import { absoluteUrl, pageMeta } from "@/lib/site";
import { cn, pill } from "@/lib/utils";

// ~205,000 places: none at build, each rendered on its first visit and cached (see app/layout.tsx).
export const generateStaticParams = () => [];

const decode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

async function load(params: PageProps<"/biz/[slug]">["params"]) {
  return (await getBusiness(decode((await params).slug))) ?? notFound();
}

const placeOf = (b: Business) => (b.area ? `${b.area.name}, ${b.city.name}` : b.city.name);

export async function generateMetadata({ params }: PageProps<"/biz/[slug]">) {
  const { business: b, categories } = await load(params);
  const kind = b.type ?? categories[0].singular;
  const rating = b.rating !== null && b.reviewCount ? ` Rated ${b.rating.toFixed(1)} by ${plural(b.reviewCount, "customer", "customers")}.` : "";
  return pageMeta({
    title: `${b.name}, ${placeOf(b)}`,
    description: `${kind} in ${placeOf(b)}.${rating} Opening hours, phone number, map and directions for ${b.name}.`,
    path: businessPath(b),
  });
}

const directionsUrl = (b: Business) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${b.name}, ${b.address}`)}`;
const action =
  "flex items-center gap-2 rounded-sm border border-white/15 bg-graphite-2 px-4 py-2.5 font-display font-bold tracking-wide uppercase hover:border-primary hover:text-primary";

export default async function BusinessPage({ params }: PageProps<"/biz/[slug]">) {
  const { business: b, categories } = await load(params);
  const category = categories[0];
  // The full city table for its main category gives the league position.
  const [more, areaListings, league] = await Promise.all([
    getNearby(b, category, 3),
    getAreaListings(b.city, category),
    getListing(b.city.slug, category.slug),
  ]);
  const areaListing = b.area && areaListings.find((l) => l.area.slug === b.area!.slug);
  const moreIn = b.area && more.filter((x) => x.area?.slug === b.area!.slug).length >= 2 ? b.area.name : b.city.name;
  const positionOf = (x: Business) => (league?.businesses.findIndex((y) => y.id === x.id) ?? -1) + 1;
  const rank = positionOf(b);

  const amenities = [
    ...(Object.keys(b.serviceOptions).length
      ? [{ group: "Service options", items: Object.entries(b.serviceOptions).map(([k, v]) => ({ label: humanise(k), available: v })) }]
      : []),
    ...[...Map.groupBy(b.extensions, (e) => e.group)].map(([group, es]) => ({
      group: humanise(group),
      items: [...new Set(es.flatMap((e) => e.items))].map((label) => ({ label, available: true })),
    })),
  ];
  const site = b.website ? new URL(b.website).hostname.replace(/^www\./, "") : null;
  const sections = [
    (b.description || b.quote || b.types.length > 0) && { id: "about", label: "About" },
    { id: "visit", label: "Hours & map" },
    amenities.length > 0 && { id: "amenities", label: "Good to know" },
    { id: "ratings", label: "Ratings" },
  ].filter((s): s is { id: string; label: string } => !!s);
  const stats = [
    rank > 0 && { label: "Position", value: `#${rank}`, note: `of ${formatCount(league!.businesses.length)}` },
    { label: "Rating", value: b.rating !== null ? b.rating.toFixed(1) : "–", note: "out of 5" },
    { label: "Reviews", value: formatCount(b.reviewCount), note: "counted" },
    { label: "Points", value: b.score.toFixed(2), note: "ranking score" },
  ].filter((s): s is { label: string; value: string; note: string } => !!s);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      <Breadcrumbs
        items={[
          { name: b.city.name, href: `/${b.city.slug}` },
          { name: category.name, href: listingPath({ city: b.city, category }) },
          ...(areaListing ? [{ name: areaListing.area.name, href: listingPath(areaListing) }] : []),
          { name: b.name, href: businessPath(b) },
        ]}
      />

      {/* Player card: photo and shirt number, who they are, the stats line and every way to reach them. */}
      <section aria-labelledby="biz-h" className="mt-5 overflow-hidden rounded-md bg-graphite bg-stripes text-white">
        <div className="grid gap-8 p-5 sm:p-8 md:grid-cols-[16rem_1fr] lg:grid-cols-[20rem_1fr]">
          <div className="relative self-start">
            <Thumb name={b.name} src={b.thumbnail} className="aspect-square w-full rounded-sm text-6xl ring-2 ring-white/10" />
            {rank > 0 && <RankBadge rank={rank} className="absolute -right-3 -bottom-4 size-20 text-3xl" />}
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm font-bold tracking-wider text-primary uppercase">
              {category.singular} · {placeOf(b)}
            </p>
            <h1 id="biz-h" className="mt-1 text-4xl wrap-break-word italic sm:text-5xl">
              {b.name}
            </h1>
            <p className="mt-3 flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={listingPath({ city: b.city, category: c })}
                  className="rounded-sm bg-primary px-2.5 py-1 font-display text-sm font-bold tracking-wide text-primary-foreground uppercase hover:bg-primary-dark"
                >
                  {c.singular}
                </Link>
              ))}
              {b.price && <span className="rounded-sm border border-white/25 px-2.5 py-1 font-display text-sm font-bold">{b.price}</span>}
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-sm text-white/75">
              <MapPin className="size-4 shrink-0" /> {b.address}
            </p>
            <OpenStatus hours={b.hours} onDark className="mt-1 text-sm" />

            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-white/10 bg-white/10 sm:auto-cols-fr sm:grid-flow-col sm:grid-cols-none">
              {stats.map((s) => (
                <div key={s.label} className="bg-graphite-2 px-4 py-3 max-sm:last:odd:col-span-2">
                  <dt className="font-display text-xs font-bold tracking-wider text-white/60 uppercase">{s.label}</dt>
                  <dd className="font-display text-3xl font-bold text-primary italic">{s.value}</dd>
                  <dd className="text-xs text-white/60">{s.note}</dd>
                </div>
              ))}
            </dl>
            {rank > 0 && (
              <p className="mt-2 text-sm text-white/70">
                In the{" "}
                <Link href={listingPath({ city: b.city, category })} className="font-semibold text-primary hover:underline">
                  {category.lower} table for {b.city.name}
                </Link>
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {b.phone && (
                <a
                  href={telHref(b.phone)}
                  className="flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 font-display font-bold tracking-wide text-primary-foreground uppercase hover:bg-primary-dark"
                >
                  <Phone className="size-4" /> {b.phone}
                </a>
              )}
              {b.website && site && (
                // A normal, followed link on purpose: linking to the business is the point of a listing.
                <a href={b.website} target="_blank" rel="noopener" className={cn(action, "max-w-full min-w-0")}>
                  <Globe className="size-4 shrink-0" /> <span className="truncate normal-case">{site}</span> <ExternalLink className="size-3.5 shrink-0" />
                </a>
              )}
              <a href={directionsUrl(b)} target="_blank" rel="noopener" className={action}>
                <Navigation className="size-4" /> Directions
              </a>
            </div>
          </div>
        </div>
        <div aria-hidden className="stripe-bar h-1.5" />
      </section>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-6">
          <nav aria-label="On this page" className="sticky top-20 z-10 -mx-1 flex gap-2 overflow-x-auto bg-background/90 px-1 py-1 backdrop-blur">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className={pill()}>
                {s.label}
              </a>
            ))}
          </nav>

          {(b.description || b.quote || b.types.length > 0) && (
            <Card id="about" title={`About ${b.name}`}>
              {b.description && <p className="leading-relaxed">{b.description}</p>}
              {b.quote && <p className="mt-4 border-l-4 border-primary bg-tint px-4 py-3 italic">&ldquo;{b.quote}&rdquo;</p>}
              {b.types.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="What they do">
                  {b.types.map((t) => (
                    <li key={t} className="rounded-sm border px-2.5 py-1 text-sm font-semibold">
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          <Card id="visit" title="Hours & map">
            <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
              <div>
                <GoogleMap place={`${b.name}, ${b.address}`} title={`Map showing ${b.name}`} className="h-64 rounded-md" />
                <p className="mt-3 flex gap-2 text-sm">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary-ink" /> {b.address}
                </p>
              </div>
              <div>
                {b.hours.length > 0 ? (
                  <HoursTable hours={b.hours} />
                ) : (
                  <p className="rounded-md border border-dashed p-5 text-sm text-muted-foreground">
                    No opening hours yet.{" "}
                    <Link href={`/suggest-an-edit?biz=${encodeURIComponent(b.slug)}`} className="font-bold text-primary-ink hover:underline">
                      Know them? Add them
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </Card>

          {amenities.length > 0 && (
            <Card id="amenities" title="Good to know">
              <div className="space-y-5">
                {amenities.map((g) => (
                  <div key={g.group}>
                    <h3 className="text-sm tracking-wider text-muted-foreground uppercase">{g.group}</h3>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {g.items.map((item) => (
                        <li
                          key={item.label}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-sm font-semibold",
                            item.available ? "bg-emerald-50 text-emerald-800" : "bg-muted text-muted-foreground line-through",
                          )}
                        >
                          {item.available ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                          {!item.available && <span className="sr-only">No </span>}
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card id="ratings" title="Ratings">
            <div className="flex flex-col items-center gap-6 rounded-md bg-tint p-6 text-center sm:flex-row sm:text-left">
              <div className="shrink-0">
                <p className="font-display text-7xl leading-none font-bold italic">{b.rating !== null ? b.rating.toFixed(1) : "–"}</p>
                {b.rating !== null && (
                  <p className="mt-2">
                    <Stars value={b.rating} />
                  </p>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                <p>
                  {b.reviewCount
                    ? `${plural(b.reviewCount, "customer has", "customers have")} rated ${b.name}.`
                    : `Nobody has rated ${b.name} yet.`}{" "}
                  The table weighs the rating by how many people gave one.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Link
                    href={`/write-a-review?biz=${encodeURIComponent(b.slug)}`}
                    className="rounded-sm bg-primary px-5 py-2.5 font-display font-bold tracking-wide text-primary-foreground uppercase hover:bg-primary-dark"
                  >
                    Add your review
                  </Link>
                  {b.mapsUrl && b.reviewCount > 0 && (
                    <a
                      href={b.mapsUrl}
                      target="_blank"
                      rel="nofollow noopener"
                      className="inline-flex items-center gap-1.5 rounded-sm border bg-card px-5 py-2.5 font-display font-bold tracking-wide text-foreground uppercase hover:border-graphite"
                    >
                      Read reviews on Google <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-md border bg-card p-5 shadow-soft">
            <p className="font-display text-xl font-bold uppercase italic">Been there?</p>
            <p className="mt-1 text-sm text-muted-foreground">Your review counts towards the table.</p>
            <Link
              href={`/write-a-review?biz=${encodeURIComponent(b.slug)}`}
              className="mt-4 flex items-center justify-center gap-2 rounded-sm bg-primary py-3 font-display font-bold tracking-wide text-primary-foreground uppercase hover:bg-primary-dark"
            >
              <Star className="size-4" /> Write a review
            </Link>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <ShareButton title={b.name} className="flex items-center justify-center gap-2 rounded-sm border py-2.5 text-sm font-bold hover:border-graphite" />
              <Link
                href={`/suggest-an-edit?biz=${encodeURIComponent(b.slug)}`}
                className="flex items-center justify-center gap-2 rounded-sm border py-2.5 text-sm font-bold hover:border-graphite"
              >
                <PencilLine className="size-4" /> Fix info
              </Link>
            </div>
          </div>
          <div className="rounded-md bg-graphite bg-stripes p-5 text-white">
            <p className="font-display text-xl font-bold uppercase italic">Is this your business?</p>
            <p className="mt-1 text-sm text-white/75">Claim it for free to keep your details right and reply to reviews.</p>
            <Link
              href={`/claim?biz=${encodeURIComponent(b.slug)}`}
              className="mt-4 block rounded-sm bg-primary py-2.5 text-center font-display font-bold tracking-wide text-primary-foreground uppercase hover:bg-primary-dark"
            >
              Claim this page
            </Link>
          </div>
        </aside>
      </div>

      {more.length > 0 && (
        <Section title={`More ${category.lower} in ${moreIn}`} kicker="Same league" id="more" className="mt-20">
          <Standings businesses={more} ranks={more.map(positionOf)} />
        </Section>
      )}

      <JsonLd
        data={{
          "@type": category.schemaType,
          "@id": `${absoluteUrl(businessPath(b))}#place`,
          name: b.name,
          url: absoluteUrl(businessPath(b)),
          ...(b.website && { sameAs: [b.website] }),
          ...(b.description && { description: b.description }),
          ...(b.phone && { telephone: b.phone }),
          ...(b.thumbnail && { image: b.thumbnail }),
          ...(b.price && { priceRange: b.price }),
          address: {
            "@type": "PostalAddress",
            streetAddress: b.address,
            addressLocality: b.city.name,
            ...(b.city.state && b.city.state !== b.city.country && { addressRegion: b.city.state }),
            addressCountry: b.city.countryCode.toUpperCase(),
          },
          ...(b.geo && { geo: { "@type": "GeoCoordinates", latitude: b.geo.lat, longitude: b.geo.lng } }),
        }}
      />
    </div>
  );
}

function Card({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-36 rounded-md border bg-card p-6 shadow-soft sm:p-8">
      <h2 id={`${id}-h`} className="border-b-2 border-graphite pb-2 text-2xl italic">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
