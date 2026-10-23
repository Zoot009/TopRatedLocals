import { cn } from "@/lib/utils";

// Full class names so Tailwind sees them. Cool kit colours that sit beside graphite and cyan.
const tones = [
  "bg-cyan-100 text-cyan-900",
  "bg-sky-100 text-sky-900",
  "bg-slate-200 text-slate-800",
  "bg-teal-100 text-teal-900",
  "bg-zinc-200 text-zinc-800",
  "bg-blue-100 text-blue-900",
  "bg-emerald-100 text-emerald-900",
  "bg-stone-200 text-stone-800",
] as const;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^[a-z0-9]/i.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

// Same name, same colour, on every page.
const toneFor =(name: string) => tones[[...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % tones.length];

// A business photo, or a coloured tile with its initials. `src` is already http(s)-only (lib/data.ts).
export function Thumb({ name, src, className }: { name: string; src?: string | null; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- scraped hosts are unknown, so next/image can't allowlist them
    return <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" className={cn("shrink-0 object-cover", className)} />;
  }
  return (
    <div
      aria-hidden
      className={cn("flex shrink-0 items-center justify-center font-display font-extrabold italic ring-1 ring-black/5 ring-inset", toneFor(name), className)}
    >
      {initials(name)}
    </div>
  );
}
