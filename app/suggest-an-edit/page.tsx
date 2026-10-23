import { BusinessPicker, firstParam, SelectedBusiness } from "@/components/business-picker";
import { Kicker } from "@/components/cards";
import { ActionForm, SelectField, TextArea, TextField } from "@/components/forms";
import { submitEdit } from "@/lib/actions";
import { businessPath, getBusiness } from "@/lib/data";
import { EDIT_ISSUES, pageMeta } from "@/lib/site";

export const metadata = pageMeta({
  title: "Fix a listing",
  description: "Let us know when a page is out of date.",
  path: "/suggest-an-edit",
  noindex: true,
});

const PATH = "/suggest-an-edit";

export default async function SuggestEditPage({ searchParams }: PageProps<"/suggest-an-edit">) {
  const sp = await searchParams;
  const business = (await getBusiness(firstParam(sp.biz)))?.business;

  return (
    <div className="mx-auto max-w-2xl px-4 pt-12">
      <div className="text-center">
        <Kicker>Fix a listing</Kicker>
        <h1 className="mt-3 text-5xl italic sm:text-6xl">Spotted a mistake?</h1>
        <p className="mt-3 text-muted-foreground">Thanks for keeping the table accurate. We check every suggestion.</p>
      </div>
      {business ? (
        <>
          <div className="mt-8">
            <SelectedBusiness business={business} path={PATH} />
          </div>
          <div className="mt-6">
            <ActionForm action={submitEdit} submitLabel="Send the fix" done={{ href: businessPath(business), label: `Back to ${business.name}` }}>
              <input type="hidden" name="biz" value={business.slug} />
              <SelectField name="issue" label="What's wrong?">
                {Object.entries(EDIT_ISSUES).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </SelectField>
              <TextArea name="details" label="What should it say?" minLength={10} maxLength={2000} rows={4} placeholder="The right phone number, hours or address" />
              <TextField name="email" label="Your email" type="email" optional autoComplete="email" hint="Only if you'd like to hear back" />
            </ActionForm>
          </div>
        </>
      ) : (
        <div className="mt-8">
          <BusinessPicker q={firstParam(sp.q)} path={PATH} cta="Fix this" />
        </div>
      )}
    </div>
  );
}
