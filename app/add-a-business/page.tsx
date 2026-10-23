import { Check } from "lucide-react";
import Link from "next/link";
import { Kicker } from "@/components/cards";
import { ActionForm, SelectField, TextArea, TextField } from "@/components/forms";
import { submitBusiness } from "@/lib/actions";
import { getCities, getGroups } from "@/lib/data";
import { pageMeta, SITE_NAME } from "@/lib/site";

export const metadata = pageMeta({
  title: "Add a place",
  description: `Add a local place to ${SITE_NAME} for free. Owners, staff and regulars are all welcome to suggest one.`,
  path: "/add-a-business",
  noindex: true,
});

const perks = ["Free, with nothing to upgrade", "A link to your website", "Ranked on reviews, never on money", "Replies to reviews once claimed"];

export default async function AddBusinessPage() {
  const [groups, cities] = await Promise.all([getGroups(), getCities()]);
  return (
    <div className="mx-auto max-w-3xl px-4 pt-12">
      <div className="text-center">
        <Kicker>Free entry</Kicker>
        <h1 className="mt-3 text-5xl italic sm:text-6xl">Add a business</h1>
        <p className="mt-3 text-muted-foreground">
          Know somewhere that belongs in the table? Tell us. Already listed?{" "}
          <Link href="/claim" className="font-bold text-primary-ink hover:underline">
            Claim it instead
          </Link>
          .
        </p>
      </div>
      <ul className="mt-6 flex flex-wrap justify-center gap-2">
        {perks.map((p) => (
          <li key={p} className="inline-flex items-center gap-1.5 rounded-sm border bg-card px-3 py-1.5 text-sm font-semibold">
            <Check className="size-4 text-primary-ink" /> {p}
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <ActionForm action={submitBusiness} submitLabel="Add this business" done={{ href: "/", label: "Back home" }}>
          <TextField name="businessName" label="Name of the business" maxLength={120} />
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField name="category" label="What kind of business?">
              {groups.map((g) => (
                <optgroup key={g.slug} label={g.name}>
                  {g.categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.singular}
                    </option>
                  ))}
                </optgroup>
              ))}
            </SelectField>
            <TextField name="city" label="City" maxLength={120} autoComplete="off" list="city-options" placeholder="Start typing…" />
            <datalist id="city-options">
              {cities.map((c) => (
                <option key={c.id} value={c.label} />
              ))}
            </datalist>
          </div>
          <TextField name="address" label="Street address" maxLength={300} hint="Include the neighbourhood and postcode" autoComplete="street-address" />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="phone" label="Phone" type="tel" optional />
            <TextField name="website" label="Website" type="url" optional placeholder="https://" />
          </div>
          <TextArea name="description" label="In a sentence or two" optional maxLength={750} rows={3} placeholder="What do they do?" />
          <fieldset className="space-y-5 rounded-sm bg-tint p-5">
            <legend className="sr-only">About you</legend>
            <p className="font-display text-xl font-bold uppercase italic">And you are…</p>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField name="name" label="Your name" autoComplete="name" />
              <TextField name="email" label="Your email" type="email" autoComplete="email" hint="Only to ask about this business" />
            </div>
            <SelectField name="relationship" label="Your connection to it">
              <option value="owner">I own it</option>
              <option value="employee">I work there</option>
              <option value="customer">I&apos;m a regular</option>
            </SelectField>
          </fieldset>
        </ActionForm>
      </div>
    </div>
  );
}
