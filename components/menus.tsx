"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { categoryHref, cn } from "@/lib/utils";

export type MenuGroup = { name: string; slug: string; icon: string; categories: { slug: string; name: string }[] };
type NavLink = { href: string; label: string };

// Closes on Escape or a click outside `ref` while open.
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && close();
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open, close]);
  return ref;
}

// "Leagues" button with every category group in one big panel.
export function ExploreMenu({ groups }: { groups: MenuGroup[] }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="explore-panel"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-sm px-3 py-2 font-display text-lg font-bold tracking-wide text-white/85 uppercase hover:text-primary aria-expanded:bg-graphite-2 aria-expanded:text-primary"
      >
        Leagues <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div
          id="explore-panel"
          className="absolute top-full left-0 z-50 mt-2 grid w-[44rem] grid-cols-3 gap-x-6 gap-y-5 rounded-md border-t-4 border-primary bg-popover p-6 text-popover-foreground shadow-2xl"
        >
          {groups.slice(0, 9).map((g) => (
            <div key={g.slug}>
              <Link href={`/categories#${g.slug}`} onClick={() => setOpen(false)} className="flex items-center gap-2 font-display text-lg leading-tight font-bold uppercase hover:text-primary-ink">
                <CategoryIcon name={g.icon} className="size-4 text-primary-ink" /> {g.name}
              </Link>
              <ul className="mt-1.5 space-y-0.5 text-sm">
                {g.categories.slice(0, 4).map((c) => (
                  <li key={c.slug}>
                    <Link href={categoryHref(c.name)} onClick={() => setOpen(false)} className="block py-0.5 text-muted-foreground hover:text-primary-ink">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <Link
            href="/categories"
            onClick={() => setOpen(false)}
            className="col-span-3 rounded-sm bg-graphite py-2.5 text-center font-display font-bold tracking-wide text-white uppercase hover:bg-graphite-2 hover:text-primary"
          >
            See every league
          </Link>
        </div>
      )}
    </div>
  );
}

// Small screens: a full-width sheet under the header with the main links, cities and leagues.
export function MobileMenu({ links, cities, groups }: { links: NavLink[]; cities: NavLink[]; groups: MenuGroup[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(!open)}
        className="flex size-10 items-center justify-center rounded-sm bg-graphite-2 text-primary"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      <div id="mobile-menu" hidden={!open} className="fixed inset-x-0 top-17 bottom-0 z-50 overflow-y-auto border-t bg-popover p-4 text-popover-foreground">
        <ul className="divide-y rounded-md border font-display text-lg font-bold tracking-wide uppercase">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={close} className="block px-4 py-3 hover:bg-tint">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 font-display text-sm font-bold tracking-wider text-primary-ink uppercase">Cities</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {cities.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={close} className="block rounded-sm border px-3 py-1.5 text-sm font-semibold hover:border-graphite">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 font-display text-sm font-bold tracking-wider text-primary-ink uppercase">Leagues</p>
        <ul className="mt-2 grid grid-cols-2 gap-1">
          {groups.map((g) => (
            <li key={g.slug}>
              <Link href={`/categories#${g.slug}`} onClick={close} className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm font-semibold hover:bg-tint">
                <CategoryIcon name={g.icon} className="size-4 shrink-0 text-primary-ink" /> {g.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
