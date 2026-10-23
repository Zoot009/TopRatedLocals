import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Kicker } from "@/components/cards";
import { CategoryIcon } from "@/components/category-icon";
import { getCities, getGroups } from "@/lib/data";
import { formatCount } from "@/lib/format";
import { pageMeta } from "@/lib/site";
import { categoryHref, pill } from "@/lib/utils";

export const metadata = pageMeta({
  title: "Every category",
  description: "Restaurants, health, home services, beauty, shopping, pets and more: every kind of local place we list, in cities worldwide.",
  path: "/categories",
});

export default async function CategoriesPage() {
  const [groups, cities] = await Promise.all([getGroups(), getCities()]);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      <Breadcrumbs items={[{ name: "Every category", href: "/categories" }]} />
      <Kicker className="mt-8">Leagues</Kicker>
      <h1 className="mt-3 text-5xl italic sm:text-6xl">Every league we run</h1>
      <p className="mt-3 text-muted-foreground">
        {formatCount(groups.reduce((n, g) => n + g.categories.length, 0))} categories across {formatCount(cities.length)} cities. Each one
        gets a ranked table in every city with enough businesses.
      </p>
      <nav aria-label="Jump to a group" className="mt-6 flex flex-wrap gap-2">
        {groups.map((g) => (
          <a key={g.slug} href={`#${g.slug}`} className={pill()}>
            <CategoryIcon name={g.icon} className="size-4 text-primary-ink" /> {g.name}
          </a>
        ))}
      </nav>

      <div className="mt-12 space-y-14">
        {groups.map((g) => (
          <section key={g.slug} id={g.slug} aria-labelledby={`${g.slug}-h`} className="scroll-mt-24">
            <h2 id={`${g.slug}-h`} className="flex items-center gap-3 border-b-2 border-graphite pb-3 text-3xl italic">
              <span className="flex size-11 items-center justify-center rounded-sm bg-graphite text-primary">
                <CategoryIcon name={g.icon} className="size-5" />
              </span>
              {g.name}
            </h2>
            <ul className="mt-4 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {g.categories.map((c) => (
                <li key={c.slug} className="border-b">
                  {c.total ? (
                    <Link href={categoryHref(c.name)} className="group flex items-center justify-between gap-3 px-1 py-2.5 hover:bg-primary/10">
                      <span className="truncate font-semibold group-hover:text-primary-ink">{c.name}</span>
                      <span className="shrink-0 font-display text-lg font-bold">{formatCount(c.total)}</span>
                    </Link>
                  ) : (
                    <span className="flex items-center justify-between gap-3 px-1 py-2.5 text-muted-foreground">
                      <span className="truncate">{c.name}</span>
                      <span className="shrink-0 font-display text-xs font-bold tracking-wider uppercase">Coming soon</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
