import { Mail } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Kicker, ScoringCard } from "@/components/cards";
import { MIN_AREA_PAGE, MIN_CATEGORY_PAGE, PRIOR_RATING, PRIOR_REVIEWS } from "@/lib/data";
import { CONTACT_EMAIL, pageMeta, SITE_NAME } from "@/lib/site";

export const metadata = pageMeta({
  title: "Our story, how we rank and our review rules",
  description: `Why ${SITE_NAME} exists, exactly how places are ranked, the rules every review follows, and how to reach us.`,
  path: "/about",
});

const rules = [
  ["Been there yourself", "Write about places you've actually used, and about what happened to you."],
  ["Stay on topic", "The service, the price, the people. Leave out unrelated arguments."],
  ["Be kind, even when it went wrong", "No threats, insults, harassment or hate."],
  ["Keep it private", "No phone numbers, home addresses or full names of staff or other customers."],
  ["No reviewing yourself", "Owners and staff can't review their own place, or a rival's."],
  ["Nothing in return", "No reviews for discounts, gifts or money, and businesses mustn't offer them."],
];

const h2 = "scroll-mt-24 border-b-2 border-graphite pb-2 text-3xl italic sm:text-4xl";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-6">
      <Breadcrumbs items={[{ name: "About us", href: "/about" }]} />
      <Kicker className="mt-8">The rulebook</Kicker>
      <h1 className="mt-3 text-5xl italic sm:text-6xl">The standings for local business</h1>
      <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
        {SITE_NAME} ranks local businesses the way a league ranks teams: in the open, by the same rules for everyone. Look up a
        café, a dentist or a plumber by city and neighbourhood, see where they sit in the table, and contact them directly. No
        ads, no sponsored spots, no paid plans.
      </p>

      <section className="mt-14 space-y-5 leading-relaxed">
        <h2 id="rankings" className={h2}>
          How the table works
        </h2>
        <p>
          Star ratings on their own reward places with hardly any reviews: two 5-star ratings would beat hundreds of 4.7s. So
          every business starts as if it had {PRIOR_REVIEWS} ratings of {PRIOR_RATING} stars, and its real reviews move it from
          there. The more people who rate a place, the more their rating counts. That number is its points (Pts) in the table.
        </p>
        <ScoringCard />
        <p>
          A business with no reviews yet stays on the {PRIOR_RATING}-star starting mark. Level on points, the one with more
          reviews goes higher. Money never comes into it.
        </p>
        <p>
          A city gets a league table once it has at least {MIN_CATEGORY_PAGE} businesses of one kind, and a neighbourhood gets its
          own once it has {MIN_AREA_PAGE}.
        </p>
      </section>

      <section className="mt-14 space-y-5 leading-relaxed">
        <h2 id="guidelines" className={h2}>
          Fair play: review rules
        </h2>
        <p>Reviews only help if they&apos;re honest, so each one is checked against these before it goes live.</p>
        <ol className="grid gap-3 sm:grid-cols-2">
          {rules.map(([title, text], i) => (
            <li key={title} className="flex gap-4 rounded-md border bg-card p-4 shadow-soft">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-graphite font-display text-xl font-extrabold text-primary italic">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="block font-display text-lg leading-tight font-bold uppercase">{title}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{text}</span>
              </span>
            </li>
          ))}
        </ol>
        <p>We take down reviews that break these rules, but not reviews that are simply unhappy, and nobody can pay us to remove one.</p>
      </section>

      <section className="mt-14 space-y-4 rounded-md bg-graphite bg-stripes p-6 leading-relaxed text-white sm:p-8">
        <h2 id="contact" className="scroll-mt-24 text-3xl italic sm:text-4xl">
          Contact
        </h2>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-3 font-display font-bold tracking-wide text-primary-foreground hover:bg-primary-dark"
        >
          <Mail className="size-4" /> {CONTACT_EMAIL}
        </a>
        <ul className="space-y-1 text-white/80">
          <li>
            Run a business?{" "}
            <Link href="/for-businesses" className="font-bold text-primary underline-offset-4 hover:underline">
              Claim your free page
            </Link>
          </li>
          <li>Found a mistake? Tap &ldquo;Fix info&rdquo; on any business page.</li>
          <li>
            Know somewhere we&apos;re missing?{" "}
            <Link href="/add-a-business" className="font-bold text-primary underline-offset-4 hover:underline">
              Add it
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
