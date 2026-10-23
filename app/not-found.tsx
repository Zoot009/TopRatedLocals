import Link from "next/link";
import { Digits } from "@/components/cards";
import { SearchForm } from "@/components/search-form";
import { getCities } from "@/lib/data";
import { pill } from "@/lib/utils";

export default async function NotFound() {
  const cities = (await getCities()).slice(0, 6);
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 pt-16 text-center">
      <div className="rounded-md bg-graphite bg-stripes px-8 py-6">
        <p className="font-display text-xs font-bold tracking-wider text-white/60 uppercase">Error</p>
        <Digits value={404} className="mt-2 text-7xl" />
      </div>
      <h1 className="mt-8 text-5xl italic">Out of bounds</h1>
      <p className="mt-3 text-muted-foreground">This page has moved, or the business isn&apos;t in the table any more. Try a search instead.</p>
      <div className="mt-8 w-full text-left">
        <SearchForm />
      </div>
      <ul className="mt-8 flex flex-wrap justify-center gap-2">
        <li>
          <Link href="/" className={pill(true)}>
            Home
          </Link>
        </li>
        <li>
          <Link href="/categories" className={pill()}>
            Leagues
          </Link>
        </li>
        {cities.map((c) => (
          <li key={c.slug}>
            <Link href={`/${c.slug}`} className={pill()}>
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
