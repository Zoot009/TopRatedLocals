# TopRatedLocals

The standings for local business: a free directory (Next.js 16, App Router, Tailwind) that ranks local businesses like a
league table, by star rating and by how many reviews back it up. Same data, pages and rules as its sister sites, with its
own brand, design and wording. Listings come from the scraper's Postgres database through a read-only login.

## Setup

```bash
cp .env.example .env   # set SITE_URL, WEB_DATABASE_URL and REVALIDATE_SECRET
npm install
npm run dev            # http://localhost:3000
```

Remote databases need their CA certificate for verified TLS, saved in `certs/` (see LocalPro's README).

| Command | What it does |
|---|---|
| `npm run build` | Production build |
| `npm start` | Serve the build |
| `npm test` | Unit tests for data cleaning, category names, search queries, hours and map framing |
| `npm run lint` | ESLint |

## What's shared with the sister sites

The data layer and rules are copies: `lib/data.ts`, `lib/db.ts`, `lib/actions.ts`, `lib/hours.ts`.
Publishing rules, ranking (`businesses.score`), caching, sitemap and forms work the same way. Fix a bug in
one site's `lib/` and copy the change to the others.

## What's different

Everything visible, built around a sports league table and scoreboard:

- Colours: a white and cool-grey page with graphite scoreboard bands and an electric cyan accent (tokens in `:root` of
  `app/globals.css`). Cyan always carries graphite text. Gold, silver and bronze tint only the rank 1–3 shirt badges.
- Fonts: Barlow Condensed for headings, labels, ranks and scoreboard digits; Barlow for body text. Numbers are tabular.
- Motifs: standings tables (Pos, business, reviews as "P", rating, points), a top-3 podium, scoreboard digit counters,
  shirt-number rank badges, diagonal stripe bands and slanted section labels. Categories are "leagues", cities are
  "conferences".
- The home page explains the points formula with the real constants from `lib/data.ts`.

There are no stock photos. City and category tiles use `getCoverPhotos()` (the best-scored business photo there), and
fall back to striped graphite tiles. Name, contact email and the featured cities live in `lib/site.ts`.
