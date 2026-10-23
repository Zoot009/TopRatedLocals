import Link from "next/link";
import { Logo } from "@/components/site-header";
import { getCategories, getCities } from "@/lib/data";
import { SITE_NAME } from "@/lib/site";
import { categoryHref } from "@/lib/utils";

export async function SiteFooter() {
  const [cities, categories] = await Promise.all([getCities(), getCategories()]);
  const columns = [
    {
      title: "Explore",
      links: [
        { href: "/categories", label: "Every league" },
        { href: "/cities", label: "Every city" },
        { href: "/search", label: "Search the table" },
      ],
    },
    { title: "Cities", links: cities.slice(0, 6).map((c) => ({ href: `/${c.slug}`, label: c.name })) },
    {
      title: "Top leagues",
      links: [...categories]
        .sort((a, b) => b.total - a.total)
        .slice(0, 6)
        .map((c) => ({ href: categoryHref(c.name), label: c.name })),
    },
    {
      title: "Businesses",
      links: [
        { href: "/for-businesses", label: "Why join" },
        { href: "/claim", label: "Claim your page" },
        { href: "/add-a-business", label: "Add a business" },
      ],
    },
    {
      title: SITE_NAME,
      links: [
        { href: "/about", label: "About us" },
        { href: "/about#rankings", label: "How the table works" },
        { href: "/about#guidelines", label: "Fair play rules" },
        { href: "/about#contact", label: "Contact" },
      ],
    },
  ];

  return (
    <footer className="mt-24 bg-graphite text-white">
      <div aria-hidden className="stripe-bar h-1.5" />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(5,1fr)]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-white/70">
              The standings for local business: ranked by rating and review count, free for everyone.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-display font-bold tracking-wider text-primary uppercase">{col.title}</p>
              <ul className="mt-3 space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-white/75 hover:text-primary">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 border-t border-white/10 pt-6 text-xs text-white/60">
          © {new Date().getFullYear()} {SITE_NAME}. We never sell ads or positions in the table. Ratings come from customers, and
          each business runs its own service.
        </p>
      </div>
    </footer>
  );
}
