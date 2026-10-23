import { Ban, Globe, MessageCircleReply, PencilLine, Scale, Search, Trophy } from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import { Kicker, SampleCard, Section } from "@/components/cards";
import { Faq } from "@/components/faq";
import { pageMeta, SITE_NAME } from "@/lib/site";

export const metadata = pageMeta({
  title: "For businesses: your free page",
  description: `Claim or add your business on ${SITE_NAME} for free. Keep your details right, answer reviews and link to your website. Nothing to pay, no paid rankings.`,
  path: "/for-businesses",
});

const perks = [
  { icon: Trophy, title: "Free entry", text: "No plans, no upsells, no trial that ends. Every business gets everything." },
  { icon: Scale, title: "A fair position", text: "The table is set by ratings and review counts only. Nobody can buy their way up." },
  { icon: Globe, title: "Your website, linked", text: "Your page sends people straight to your own site." },
  { icon: PencilLine, title: "Always up to date", text: "Change your phone number, hours or address whenever you need to." },
  { icon: MessageCircleReply, title: "Reply to reviews", text: "Thank people for kind words and answer complaints in public." },
  { icon: Ban, title: "No rival ads", text: "We don't sell ads, so nobody else's offer shows up on your page." },
];

const faqs = [
  { q: "Is it actually free?", a: `Yes. ${SITE_NAME} has no paid plans, sponsored spots or ads. Claiming and editing your page costs nothing.` },
  { q: "Can I pay to move up the table?", a: "No. Positions come from ratings weighted by how many people left one. There's nothing to buy." },
  { q: "How quickly do you check claims?", a: "Usually within two working days. We may email you or call the number on your page." },
  { q: "Can you delete a bad review?", a: "Only if it breaks our review rules, for example if it's fake or abusive. You can always reply publicly." },
  { q: "We're not listed. What now?", a: "Use Add a business. Owners, staff and regulars can all suggest one." },
];

export default function ForBusinessesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      <section aria-labelledby="fb-h" className="overflow-hidden rounded-md bg-graphite bg-stripes text-white">
        <div className="grid items-center gap-10 px-6 py-12 sm:px-12 sm:py-16 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <Kicker>{SITE_NAME} for business</Kicker>
            <h1 id="fb-h" className="mt-4 text-5xl text-balance italic sm:text-6xl">
              Join the league. <span className="text-primary">Free entry.</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-white/80">Your business may already be in the table. Claim it to keep your details right, reply to reviews and send people to your website.</p>
            <Form action="/claim" className="mt-8 flex max-w-xl gap-2 rounded-md bg-card p-2 shadow-soft">
              <label htmlFor="claim-q" className="sr-only">
                Your business name
              </label>
              <input
                id="claim-q"
                name="q"
                placeholder="Search your business name"
                className="w-full min-w-0 rounded-sm border-2 border-transparent bg-tint px-4 font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground focus:border-primary-ink"
              />
              <button
                type="submit"
                className="flex shrink-0 items-center gap-2 rounded-sm bg-primary px-5 py-3 font-display font-bold tracking-wide text-primary-foreground uppercase hover:bg-primary-dark"
              >
                <Search className="size-4" /> Find it
              </button>
            </Form>
            <p className="mt-4 text-sm text-white/75">
              Not in the table yet?{" "}
              <Link href="/add-a-business" className="font-bold text-primary underline-offset-4 hover:underline">
                Add your business
              </Link>
            </p>
          </div>
          <SampleCard className="mx-auto w-full max-w-sm" />
        </div>
        <div aria-hidden className="stripe-bar h-1.5" />
      </section>

      <div className="space-y-20 pt-16">
        <Section title="What you get" kicker="All included" id="perks">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {perks.map((p) => (
              <li key={p.title} className="rounded-md border border-t-4 border-t-primary bg-card p-6 shadow-soft">
                <span className="flex size-11 items-center justify-center rounded-sm bg-graphite text-primary">
                  <p.icon className="size-5" />
                </span>
                <p className="mt-4 font-display text-2xl leading-tight font-bold uppercase italic">{p.title}</p>
                <p className="mt-1.5 text-muted-foreground">{p.text}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Three steps to kick-off" kicker="Claiming" id="steps">
          <ol className="grid gap-3 md:grid-cols-3">
            {["Find your business above", "We check it's really yours", "Keep it fresh and reply to reviews"].map((t, i) => (
              <li key={t} className="flex items-center gap-4 rounded-md bg-graphite p-4 text-white">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-primary font-display text-2xl font-extrabold text-primary-foreground italic">
                  {i + 1}
                </span>
                <span className="font-display text-lg leading-tight font-bold uppercase">{t}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Questions owners ask" kicker="FAQ" id="faq" className="max-w-3xl">
          <Faq items={faqs} />
        </Section>
      </div>
    </div>
  );
}
