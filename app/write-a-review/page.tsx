import Link from "next/link";
import { BusinessPicker, firstParam, SelectedBusiness } from "@/components/business-picker";
import { Kicker } from "@/components/cards";
import { ActionForm, StarPicker, TextArea, TextField } from "@/components/forms";
import { submitReview } from "@/lib/actions";
import { businessPath, getBusiness } from "@/lib/data";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Write a review",
  description: "Tell others about a local place you've been to.",
  path: "/write-a-review",
  noindex: true,
});

const PATH = "/write-a-review";

export default async function WriteReviewPage({ searchParams }: PageProps<"/write-a-review">) {
  const sp = await searchParams;
  const business = (await getBusiness(firstParam(sp.biz)))?.business;

  return (
    <div className="mx-auto max-w-2xl px-4 pt-12">
      <div className="text-center">
        <Kicker>{business ? "Step 2 of 2" : "Step 1 of 2"}</Kicker>
        <h1 className="mt-3 text-5xl italic sm:text-6xl">{business ? "Give your verdict" : "Which business did you visit?"}</h1>
        {business && (
          <p className="mt-3 text-muted-foreground">
            Honest and specific helps most. Our{" "}
            <Link href="/about#guidelines" className="font-bold text-primary-ink hover:underline">
              fair play rules
            </Link>{" "}
            are short.
          </p>
        )}
      </div>
      {business ? (
        <>
          <div className="mt-8">
            <SelectedBusiness business={business} path={PATH} />
          </div>
          <div className="mt-6">
            <ActionForm action={submitReview} submitLabel="Publish my review" done={{ href: businessPath(business), label: `Back to ${business.name}` }}>
              <input type="hidden" name="biz" value={business.slug} />
              <StarPicker />
              <TextArea name="text" label="Your review" minLength={50} maxLength={5000} rows={6} placeholder="What did you go for? How was it? Would you go back?" />
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField name="name" label="Your name" autoComplete="name" hint="We show your first name and initial" />
                <TextField name="email" label="Email" type="email" autoComplete="email" hint="Private, never shown" />
              </div>
            </ActionForm>
          </div>
        </>
      ) : (
        <div className="mt-8">
          <BusinessPicker q={firstParam(sp.q)} path={PATH} cta="Review" />
        </div>
      )}
    </div>
  );
}
