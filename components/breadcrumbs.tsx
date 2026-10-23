import { House } from "lucide-react";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl } from "@/lib/site";

type Crumb = { name: string; href: string };

// Visible trail plus BreadcrumbList structured data. "Home" is added automatically.
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ name: "Home", href: "/" }, ...items];
  return (
    <nav aria-label="Breadcrumb" className="font-display text-sm font-semibold tracking-wide uppercase">
      <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
        {all.map((c, i) => (
          <li key={c.href} className="flex min-w-0 items-center gap-1">
            {i > 0 && (
              <span aria-hidden className="text-primary-ink">
                /
              </span>
            )}
            {i === all.length - 1 ? (
              <span aria-current="page" className="truncate rounded-sm bg-graphite px-2 py-0.5 text-white">
                {c.name}
              </span>
            ) : (
              <Link href={c.href} className="flex items-center gap-1 px-1 py-0.5 hover:text-primary-ink">
                {i === 0 && <House aria-hidden className="size-3.5" />}
                {c.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
      <JsonLd
        data={{
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.href) })),
        }}
      />
    </nav>
  );
}
