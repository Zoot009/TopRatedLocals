// The JSON escape for "<" (backslash, u003c): data can never close the script tag, and it still parses as "<".
const LT = String.fromCharCode(92) + "u003c";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, LT),
      }}
    />
  );
}
