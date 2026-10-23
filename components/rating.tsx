import { Star } from "lucide-react";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";

const row = (className: string) =>
  [1, 2, 3, 4, 5].map((i) => <Star key={i} className={cn("shrink-0 fill-current stroke-none", className)} />);

// Five stars filled to the exact value, in the dark cyan that reads on white.
export function Stars({ value, className = "size-5" }: { value: number; className?: string }) {
  const width = `${(Math.min(5, Math.max(0, value)) / 5) * 100}%`;
  return (
    <span aria-hidden className="relative inline-flex shrink-0 text-muted-foreground/25">
      {row(className)}
      <span className="absolute inset-y-0 left-0 flex overflow-hidden text-primary-ink" style={{ width }}>
        {row(className)}
      </span>
    </span>
  );
}

// "★ 4.8 | 1,203 reviews": the rating in a small scoreboard chip.
export function RatingPill({ rating, count, className }: { rating: number | null; count: number; className?: string }) {
  if (rating === null) {
    return (
      <span className={cn("inline-flex rounded-sm border px-2 py-0.5 font-display text-xs font-bold tracking-wide text-muted-foreground uppercase", className)}>
        New entry
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm", className)}>
      <span className="inline-flex items-center gap-1 rounded-sm bg-graphite px-1.5 py-0.5 font-display font-bold text-white">
        <Star aria-hidden className="size-3.5 fill-primary stroke-none" />
        {rating.toFixed(1)}
      </span>
      {count > 0 && <span className="text-muted-foreground">{formatCount(count)} reviews</span>}
    </span>
  );
}
