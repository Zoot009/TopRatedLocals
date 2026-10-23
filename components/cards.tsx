import { ArrowRight, Clock, Globe, MapPin, Phone, Quote, Store } from "lucide-react";
import Link from "next/link";
import { CategoryIcon } from "@/components/category-icon";
import { OpenStatus } from "@/components/open-status";
import { Thumb } from "@/components/thumb";
import { type Business, businessPath, type Category, type City, PRIOR_RATING, PRIOR_REVIEWS, SEARCH_FEATURES } from "@/lib/data";
import { formatCount, plural } from "@/lib/format";
import { cn } from "@/lib/utils";

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

// Slanted cyan label: the only place the skew motif is used. The text is skewed back upright.
export function Kicker({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("inline-block -skew-x-12 bg-primary px-2.5 py-0.5", className)}>
      <span className="inline-block skew-x-12 font-display text-sm font-bold tracking-wider text-primary-foreground uppercase">{children}</span>
    </p>
  );
}

// Section with a sports-page header: kicker, title and a heavy graphite rule.
export function Section({
  title,
  kicker,
  id,
  action,
  children,
  className,
}: {
  title: string;
  kicker?: string;
  id?: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section aria-labelledby={id} className={className}>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-graphite pb-3">
        <div>
          {kicker && <Kicker>{kicker}</Kicker>}
          <h2 id={id} className="mt-2 text-3xl italic sm:text-4xl">
            {title}
          </h2>
        </div>
        {action && (
          <Link href={action.href} className="inline-flex items-center gap-1 font-display font-bold tracking-wide text-primary-ink uppercase hover:text-foreground">
            {action.label} <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

const MEDALS = ["fill-gold", "fill-silver", "fill-bronze"];

// League position as a shirt number: medal-tinted shirts for the top three, graphite for everyone else.
export function RankBadge({ rank, className }: { rank: number; className?: string }) {
  const medal = MEDALS[rank - 1];
  return (
    <span className={cn("relative flex shrink-0 items-center justify-center", className)}>
      <svg aria-hidden viewBox="0 0 40 40" className={cn("absolute inset-0 size-full", medal ?? "fill-graphite")}>
        <path d="M13 3 4 8 1 17l7.5 2.5L9 16v21h22V16l.5 3.5L39 17l-3-9-9-5c-1.5 3-4 4.5-7 4.5S14.5 6 13 3Z" />
      </svg>
      <span
        className={cn(
          "relative mt-[18%] font-display leading-none font-extrabold italic",
          medal ? "text-graphite" : "text-white",
          rank > 999 ? "text-[0.5em]" : rank > 99 && "text-[0.65em]",
        )}
      >
        <span className="sr-only">Position </span>
        {rank || "–"}
      </span>
    </span>
  );
}

// A count as scoreboard cells, one per digit (for graphite bands). Screen readers get the plain number once.
export function Digits({ value, className }: { value: number; className?: string }) {
  const text = formatCount(value);
  return (
    <span className={cn("inline-flex items-end gap-[0.08em] font-display leading-none font-bold", className)}>
      <span className="sr-only">{text}</span>
      {[...text].map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} aria-hidden className="digit-cell rounded-[0.12em] px-[0.14em] py-[0.1em] text-primary">
            {ch}
          </span>
        ) : (
          <span key={i} aria-hidden className="text-white/40">
            {ch}
          </span>
        ),
      )}
    </span>
  );
}

// Columns: position | business | reviews ("played") | rating | points. Small screens keep position, business and rating.
const columns = "grid grid-cols-[2.5rem_minmax(0,1fr)_3rem] gap-x-3 sm:grid-cols-[3rem_minmax(0,1fr)_4.5rem_4rem_4.5rem]";

const highlights = (b: Business) =>
  Object.entries(SEARCH_FEATURES)
    .filter(([key, f]) => key !== "website" && f.test(b))
    .map(([, f]) => f.label);

// The league table used for every ranked list. `ranks` overrides 1, 2, 3… (search pages, nearby picks);
// `detail` adds open status, a review line, highlights and a call button.
export function Standings({ businesses, ranks, detail = false }: { businesses: Business[]; ranks?: number[]; detail?: boolean }) {
  return (
    <div>
      <div className="overflow-hidden rounded-md border bg-card shadow-soft">
        <div aria-hidden className={cn(columns, "bg-graphite px-3 py-2 font-display text-xs font-bold tracking-wider text-white/70 uppercase sm:px-4")}>
          <span className="text-center">Pos</span>
          <span>Business</span>
          <span className="hidden text-right sm:block">P</span>
          <span className="text-right">Rtg</span>
          <span className="hidden text-right sm:block">Pts</span>
        </div>
        <ol>
          {businesses.map((b, i) => (
            <li key={b.id} className={cn(columns, "relative items-center border-t px-3 py-3 transition-colors first:border-t-0 even:bg-tint/60 hover:bg-primary/10 sm:px-4")}>
              <RankBadge rank={ranks?.[i] ?? i + 1} className="size-10 text-lg" />
              <div className="flex min-w-0 items-center gap-3">
                <Thumb name={b.name} src={b.thumbnail} className={cn("rounded-sm text-sm", detail ? "size-14 sm:size-20 sm:text-xl" : "size-12")} />
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-lg leading-tight">
                    <Link href={businessPath(b)} className="after:absolute after:inset-0 hover:text-primary-ink">
                      {b.name}
                    </Link>
                  </h3>
                  <p className="truncate text-sm text-muted-foreground">
                    {[b.type, b.area?.name ?? b.city.name].filter(Boolean).join(" · ")}
                    <span className="sm:hidden"> · {plural(b.reviewCount, "review", "reviews")}</span>
                  </p>
                  {detail && (
                    <>
                      <div className="text-sm">
                        <OpenStatus hours={b.hours} />
                      </div>
                      {b.quote && <p className="mt-1 hidden truncate text-sm text-muted-foreground italic md:block">&ldquo;{b.quote}&rdquo;</p>}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {highlights(b)
                          .slice(0, 2)
                          .map((h) => (
                            <span key={h} className="hidden rounded-sm border px-2 py-0.5 text-xs font-semibold text-muted-foreground sm:inline">
                              {h}
                            </span>
                          ))}
                        {b.phone && (
                          <a
                            href={telHref(b.phone)}
                            className="relative z-10 inline-flex items-center gap-1 rounded-sm bg-primary px-2.5 py-1 font-display text-xs font-bold tracking-wide text-primary-foreground uppercase hover:bg-primary-dark"
                          >
                            <Phone className="size-3" /> Call
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <p className="hidden text-right text-sm sm:block">
                <span className="sr-only">Reviews: </span>
                {formatCount(b.reviewCount)}
              </p>
              <p className="text-right font-display text-xl font-bold">
                <span className="sr-only">Rating: </span>
                {b.rating !== null ? b.rating.toFixed(1) : "–"}
              </p>
              <p className="hidden text-right font-display text-lg font-bold text-primary-ink sm:block">
                <span className="sr-only">Points: </span>
                {b.score.toFixed(2)}
              </p>
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        <span className="max-sm:hidden">P: reviews counted · </span>Rtg: average stars<span className="max-sm:hidden"> · Pts: rating weighed by reviews</span> ·{" "}
        <Link href="/about#rankings" className="font-semibold text-primary-ink hover:underline">
          How the table works
        </Link>
      </p>
    </div>
  );
}

const PODIUM = [
  { order: "order-2", step: "h-20 sm:h-28" },
  { order: "order-1", step: "h-14 sm:h-20" },
  { order: "order-3", step: "h-9 sm:h-14" },
];

// The top three on a podium. Listed 1, 2, 3 for screen readers; shown second, first, third.
export function Podium({ businesses }: { businesses: Business[] }) {
  return (
    <ol className="flex items-end justify-center gap-2 sm:gap-3">
      {businesses.slice(0, 3).map((b, i) => (
        <li key={b.id} className={cn("w-1/3 min-w-0", PODIUM[i].order)}>
          <Link href={businessPath(b)} className="group block">
            <div className="relative">
              <Thumb name={b.name} src={b.thumbnail} className={cn("aspect-square w-full rounded-sm text-3xl", i === 0 && "ring-2 ring-primary")} />
              <RankBadge rank={i + 1} className="absolute -bottom-5 left-1/2 size-12 -translate-x-1/2 text-xl" />
            </div>
            <span className="mt-7 block truncate text-center font-display text-base leading-tight font-bold group-hover:text-primary sm:text-lg">{b.name}</span>
          </Link>
          <p className="mt-0.5 truncate text-center text-xs text-white/70 sm:text-sm">
            {b.rating !== null ? `★ ${b.rating.toFixed(1)}` : "New entry"}
            <span className="max-sm:hidden"> · {plural(b.reviewCount, "review", "reviews")}</span>
          </p>
          <div
            aria-hidden
            className={cn("mt-3 flex justify-center rounded-t-sm border-t-4 border-primary bg-graphite-2 pt-1 font-display text-3xl font-extrabold text-white/25 italic sm:text-4xl", PODIUM[i].step)}
          >
            {i + 1}
          </div>
        </li>
      ))}
    </ol>
  );
}

// A category as a league: the cover photo of its best business, or a striped graphite tile with its icon.
export function LeagueTile({ category, count, href, photo }: { category: Category; count: number; href: string; photo?: string }) {
  return (
    <Link
      href={href}
      className="group relative isolate flex aspect-4/3 flex-col justify-end overflow-hidden rounded-md border-b-4 border-graphite bg-graphite bg-stripes p-3.5 text-white hover:border-primary"
    >
      {photo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- scraped hosts are unknown, so next/image can't allowlist them */}
          <img src={photo} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 -z-10 size-full object-cover transition duration-500 group-hover:scale-105" />
          <span aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-graphite via-graphite/45 to-graphite/0" />
        </>
      ) : (
        <CategoryIcon name={category.icon} className="absolute top-4 right-4 size-16 text-white/10" />
      )}
      <span className="absolute top-3 left-3 flex size-8 items-center justify-center rounded-sm bg-primary text-primary-foreground">
        <CategoryIcon name={category.icon} className="size-4" />
      </span>
      <span className="font-display text-xl leading-tight font-bold uppercase">{category.name}</span>
      <span className="text-sm text-white/80">{plural(count, "place", "places")}</span>
    </Link>
  );
}

// A city as a conference card: cover photo (or its three-letter code), country tag, places and leagues.
export function CityCard({ city, photo }: { city: City; photo?: string }) {
  return (
    <Link href={`/${city.slug}`} className="group block overflow-hidden rounded-md border bg-card shadow-soft hover:border-graphite">
      <span className="relative block aspect-video overflow-hidden bg-graphite bg-stripes">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- scraped hosts are unknown, so next/image can't allowlist them
          <img src={photo} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <span aria-hidden className="flex size-full items-center justify-center font-display text-6xl font-extrabold text-white/15 uppercase italic">
            {city.name.slice(0, 3)}
          </span>
        )}
        <span className="absolute bottom-0 left-0 bg-graphite px-2.5 py-1 font-display text-xs font-bold tracking-wider text-primary uppercase">{city.country}</span>
      </span>
      <span className="flex items-end justify-between gap-3 p-3.5">
        <span className="min-w-0">
          <span className="block truncate font-display text-xl leading-tight font-bold uppercase group-hover:text-primary-ink">{city.name}</span>
          <span className="text-sm text-muted-foreground">{plural(city.categoryCount, "league", "leagues")}</span>
        </span>
        <span className="shrink-0 text-right font-display leading-none">
          <span className="block text-2xl font-bold italic">{formatCount(city.listed)}</span>
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">places</span>
        </span>
      </span>
    </Link>
  );
}

// Fan quotes: one line from a customer review per business, on a full-width graphite band.
export function QuotesBand({ businesses, title, id }: { businesses: Business[]; title: string; id: string }) {
  return (
    <section aria-labelledby={id} className="bg-graphite bg-stripes py-16 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <Kicker>From the stands</Kicker>
        <h2 id={id} className="mt-2 text-3xl italic sm:text-4xl">
          {title}
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((b) => (
            <li key={b.id}>
              <figure className="flex h-full flex-col rounded-md border border-white/10 bg-graphite-2 p-5">
                <Quote aria-hidden className="size-7 fill-primary stroke-none" />
                <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed">&ldquo;{b.quote}&rdquo;</blockquote>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
                  <Thumb name={b.name} src={b.thumbnail} className="size-10 rounded-sm text-xs" />
                  <Link href={businessPath(b)} className="min-w-0">
                    <span className="block truncate font-display text-lg leading-tight font-bold hover:text-primary">{b.name}</span>
                    <span className="block truncate text-xs text-white/70">
                      {b.city.name}
                      {b.rating !== null && ` · ★ ${b.rating.toFixed(1)}`}
                    </span>
                  </Link>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// Same formula as businesses.score in the database (lib/data.ts).
const points = (rating: number, count: number) => (PRIOR_RATING * PRIOR_REVIEWS + rating * count) / (PRIOR_REVIEWS + count);

const EXAMPLES = [
  { label: "Example A", rating: 4.7, count: 300 },
  { label: "Example B", rating: 5, count: 2 },
];

// The points formula on a scoreboard, with two worked examples in table order.
export function ScoringCard() {
  return (
    <div className="rounded-md bg-graphite bg-stripes p-5 text-white sm:p-7">
      <p className="font-display text-sm font-bold tracking-wider text-primary uppercase">The points formula</p>
      <p className="mt-3 font-display text-2xl leading-snug font-bold sm:text-3xl">
        Pts = ({PRIOR_REVIEWS} × {PRIOR_RATING} + rating × reviews) ÷ ({PRIOR_REVIEWS} + reviews)
      </p>
      <table className="mt-6 w-full text-left text-sm">
        <caption className="sr-only">Two worked examples</caption>
        <thead className="font-display text-xs tracking-wider text-white/60 uppercase">
          <tr>
            <th scope="col" className="py-2 font-bold">
              Pos
            </th>
            <th scope="col" className="font-bold">
              Business
            </th>
            <th scope="col" className="text-right font-bold">
              P
            </th>
            <th scope="col" className="text-right font-bold">
              Rtg
            </th>
            <th scope="col" className="text-right font-bold">
              Pts
            </th>
          </tr>
        </thead>
        <tbody>
          {EXAMPLES.map((e, i) => (
            <tr key={e.label} className="border-t border-white/10">
              <td className="py-2.5 font-display text-lg font-bold italic">{i + 1}</td>
              <td>{e.label}</td>
              <td className="text-right">{e.count}</td>
              <td className="text-right">{e.rating.toFixed(1)}</td>
              <td className="text-right font-display text-lg font-bold text-primary">{points(e.rating, e.count).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-white/70">Two perfect scores can&apos;t beat three hundred very good ones.</p>
    </div>
  );
}

const sampleRows = [
  { icon: Globe, text: "yourbusiness.com" },
  { icon: Phone, text: "Your phone number" },
  { icon: MapPin, text: "Your street address" },
  { icon: Clock, text: "Your opening hours" },
];

// What a listing looks like, with placeholders only: no invented business, rating or numbers.
export function SampleCard({ className }: { className?: string }) {
  return (
    <figure className={cn("overflow-hidden rounded-md bg-card text-foreground shadow-2xl", className)}>
      <div className="flex items-center justify-between bg-graphite px-4 py-2 font-display text-xs font-bold tracking-wider text-white/70 uppercase">
        <span>Player card</span>
        <span className="text-primary">Sample</span>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-sm bg-tint text-primary-ink">
            <Store className="size-7" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-2xl leading-none font-bold uppercase italic">Your business</p>
            <p className="mt-1 text-sm text-muted-foreground">Your category · Your city</p>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-3 divide-x rounded-sm border text-center">
          {["Pos", "Rtg", "Reviews"].map((label) => (
            <div key={label} className="py-2">
              <dt className="font-display text-xs font-bold tracking-wider text-muted-foreground uppercase">{label}</dt>
              <dd className="font-display text-2xl font-bold">–</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-4 space-y-2 text-sm">
          {sampleRows.map((r) => (
            <li key={r.text} className="flex items-center gap-2.5 rounded-sm bg-tint px-3 py-2">
              <r.icon aria-hidden className="size-4 text-primary-ink" /> {r.text}
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="sr-only">Example of a free listing, with placeholders for your details</figcaption>
    </figure>
  );
}

// Owner call to action on a cyan band (graphite text), with the sample listing beside it.
export function JoinLeague() {
  return (
    <section
      aria-labelledby="join-h"
      className="grid items-center gap-10 overflow-hidden rounded-md bg-primary bg-stripes px-6 py-12 text-primary-foreground [--stripe:oklch(0.24_0.01_250/0.07)] sm:px-12 md:grid-cols-[1.15fr_1fr]"
    >
      <div>
        <p className="font-display text-sm font-bold tracking-wider uppercase">For business owners</p>
        <h2 id="join-h" className="mt-2 text-4xl italic sm:text-5xl">
          Join the league. Free entry.
        </h2>
        <p className="mt-4 max-w-md">
          Your business may already be in the table. Claim your page to keep your hours, phone number and website right, and to
          reply to reviews. No fees, no ads, and nobody can buy a higher position.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/for-businesses" className="rounded-sm bg-graphite px-6 py-3 font-display font-bold tracking-wide text-white uppercase hover:bg-graphite-2">
            Claim your page
          </Link>
          <Link href="/add-a-business" className="rounded-sm border-2 border-graphite px-6 py-3 font-display font-bold tracking-wide uppercase hover:bg-graphite hover:text-white">
            Add a business
          </Link>
        </div>
      </div>
      <SampleCard />
    </section>
  );
}
