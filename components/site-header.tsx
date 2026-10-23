import { Search } from "lucide-react";
import Link from "next/link";
import { ExploreMenu, type MenuGroup, MobileMenu } from "@/components/menus";
import { getCities, getGroups } from "@/lib/data";
import { cn } from "@/lib/utils";

// A cyan badge with a graphite podium and star; app/icon.svg is the same drawing.
function LogoMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" className={className}>
      <rect width="32" height="32" rx="6" className="fill-primary" />
      <path d="M6 16h6v10H6zM13 11h6v15h-6zM20 19h6v7h-6z" className="fill-graphite" />
      <path d="M16 2.9l.88 2.39 2.54.1-1.99 1.57.69 2.45L16 8l-2.12 1.41.69-2.45-1.99-1.57 2.54-.1z" className="fill-graphite" />
    </svg>
  );
}

// Wordmark for graphite surfaces (header and footer).
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex min-w-0 items-center gap-2 font-display text-xl leading-none font-extrabold text-white uppercase italic sm:text-2xl", className)}>
      <LogoMark className="size-9 shrink-0" />
      <span className="truncate">
        TopRated<span className="text-primary">Locals</span>
      </span>
    </Link>
  );
}

const links = [
  { href: "/cities", label: "Cities" },
  { href: "/for-businesses", label: "For business" },
  { href: "/write-a-review", label: "Write a review" },
];

// A full-width graphite scoreboard bar, closed off by a cyan hazard strip.
export async function SiteHeader() {
  const [allGroups, allCities] = await Promise.all([getGroups(), getCities()]);
  const groups: MenuGroup[] = allGroups.map((g) => ({
    name: g.name,
    slug: g.slug,
    icon: g.icon,
    categories: g.categories.filter((c) => c.total > 0).map(({ slug, name }) => ({ slug, name })),
  }));
  const cities = [...allCities.slice(0, 8).map((c) => ({ href: `/${c.slug}`, label: c.name })), { href: "/cities", label: "All cities" }];

  return (
    <header className="sticky top-0 z-40 bg-graphite text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
        <MobileMenu
          links={[{ href: "/search", label: "Search" }, { href: "/categories", label: "All leagues" }, ...links, { href: "/add-a-business", label: "Add a business" }]}
          cities={cities}
          groups={groups}
        />
        <Logo />
        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 lg:flex">
          <ExploreMenu groups={groups} />
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="px-3 py-2 font-display text-lg font-bold tracking-wide whitespace-nowrap text-white/85 uppercase hover:text-primary">
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/search"
          aria-label="Search"
          className="ml-auto flex size-10 shrink-0 items-center justify-center gap-2 rounded-sm bg-graphite-2 font-display font-bold tracking-wide text-white/85 uppercase hover:text-primary md:w-auto md:px-4 lg:w-10 lg:px-0 xl:w-auto xl:px-4"
        >
          <Search className="size-4" /> <span aria-hidden className="hidden md:inline lg:hidden xl:inline">Search</span>
        </Link>
        <Link
          href="/add-a-business"
          className="hidden rounded-sm bg-primary px-4 py-2 font-display text-lg font-bold tracking-wide whitespace-nowrap text-primary-foreground uppercase hover:bg-primary-dark sm:block"
        >
          Add a business
        </Link>
      </div>
      <div aria-hidden className="stripe-bar h-1" />
    </header>
  );
}
