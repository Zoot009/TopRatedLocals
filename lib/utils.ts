export { cn } from "cn"
import { cn } from "cn"

export const inputClass =
  "w-full rounded-sm border-2 border-input bg-card px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary-ink aria-invalid:border-destructive"

// Squared scoreboard tab; `active` lights it up in cyan.
export const pill = (active = false) =>
  cn(
    "inline-flex items-center gap-1.5 rounded-sm border px-3.5 py-2 font-display text-sm font-bold tracking-wide uppercase transition-colors",
    active ? "border-primary bg-primary text-primary-foreground" : "bg-card text-foreground hover:border-graphite",
  )

// Category links in menus and bubbles open search, which covers every city.
export const categoryHref = (name: string) => `/search?q=${encodeURIComponent(name)}`
