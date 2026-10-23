import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { env } from "@/lib/env";
import { SITE_NAME } from "@/lib/site";
import "./globals.css";

// Barlow Condensed for headings, scoreboard numbers and labels; Barlow for everything else.
const barlow = Barlow({ variable: "--font-barlow", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  style: ["normal", "italic"],
});

// Pages render on first visit and are cached for a day, then refreshed in the background.
export const revalidate = 86400;

// No canonical here: every page sets its own (lib/site.ts pageMeta), so none can inherit the homepage's.
export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  title: { default: `${SITE_NAME}: the standings for local business`, template: `%s · ${SITE_NAME}` },
  description:
    "Local businesses ranked like a league table: by star rating and by how many reviews back it up. Free to use, free to join, and nobody pays for position.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
