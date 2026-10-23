"use client";

import { useSyncExternalStore } from "react";
import { DAYS } from "@/lib/hours";
import { cn } from "@/lib/utils";

const noop = () => () => {};

// Opening hours as a fixtures table; today's row lights up once the browser knows what day it is.
export function HoursTable({ hours }: { hours: [day: string, hours: string][] }) {
  const today = useSyncExternalStore(noop, () => DAYS[new Date().getDay()], () => null);
  return (
    <div className="overflow-hidden rounded-md border">
      <table className="w-full text-sm">
        <caption className="sr-only">Opening hours</caption>
        <thead className="bg-graphite font-display text-xs tracking-wider text-white/70 uppercase">
          <tr>
            <th scope="col" className="px-4 py-2 text-left font-bold">
              Day
            </th>
            <th scope="col" className="px-4 py-2 text-right font-bold">
              Hours
            </th>
          </tr>
        </thead>
        <tbody>
          {hours.map(([day, time]) => {
            const isToday = day === today;
            return (
              <tr key={day} aria-current={isToday ? "date" : undefined} className={cn("border-t", isToday ? "bg-primary text-primary-foreground" : "even:bg-tint/60")}>
                <th scope="row" className="px-4 py-2.5 text-left font-display font-bold tracking-wide uppercase">
                  {day.slice(0, 3)}
                  <span className="sr-only">{day.slice(3)}</span>
                  {isToday && <span className="ml-2 rounded-sm bg-graphite px-1.5 py-0.5 text-xs text-white">Today</span>}
                </th>
                <td className={cn("px-4 py-2.5 text-right", isToday ? "font-bold" : /closed/i.test(time) && "text-muted-foreground")}>{time}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
