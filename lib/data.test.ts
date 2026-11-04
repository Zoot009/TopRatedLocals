import assert from "node:assert/strict";
import { test } from "node:test";
import { type BusinessRow, type City, categoryNames, getBusiness, photoUrl, toBusiness, toTsQuery } from "./data";
import { openStatus, parseHours } from "./hours";

test("category names from the database read naturally", () => {
  assert.deepEqual(categoryNames("hair salon"), { name: "Hair salons", singular: "Hair salon", lower: "hair salons", singularLower: "hair salon" });
  assert.equal(categoryNames("pharmacy").name, "Pharmacies");
  assert.equal(categoryNames("car wash").name, "Car washes");
  assert.equal(categoryNames("car repair").name, "Car repair services");
  assert.equal(categoryNames("ENT doctor").lower, "ENT doctors");
  assert.equal(categoryNames("Certified Translation Services").name, "Certified Translation Services");
  assert.equal(categoryNames("Certified Translation Services").lower, "certified translation services");
});

test("search text becomes a safe prefix tsquery", () => {
  assert.equal(toTsQuery("Dentists", "Bandra West"), "dentist:* & bandra:* & west:*");
  assert.equal(toTsQuery("Restaurants"), "restaurant:*"); // matches the singular in business types
  assert.equal(toTsQuery("pharmacies"), "pharmacy:*");
  assert.equal(toTsQuery("a' | !b & (c)"), "a:* & b:* & c:*"); // tsquery operators never reach Postgres
  assert.equal(toTsQuery("São Paulo"), "são:* & paulo:*");
  assert.equal(toTsQuery("  "), "");
});

const city: City = { id: 1, slug: "mumbai-india", name: "Mumbai", state: "India", countryCode: "in", country: "India", label: "Mumbai, India", listed: 10, categoryCount: 1 };
const row: BusinessRow = {
  id: 1, slug: "a-1", title: "A", city_id: 1, area: "Bandra West", area_slug: "bandra-west", address: "1 Hill Road", phone: " ",
  website: "javascript:alert(1)", rating: 4.5, review_count: 12, score: 4.0, price: "Casual spot for South Indian food",
  primary_type: "Dentist", types: ["Dentist", "Dental clinic"], description: null, user_review: '"Great care."',
  operating_hours: { Sunday: "Closed", monday: "9 am–5 pm" }, service_options: "not an object", extensions: [{ payments: ["Cash"] }],
  latitude: 19, longitude: 72.8, thumbnail: "https://lh3.googleusercontent.com/x", data_cid: "123",
};

test("scraped rows are cleaned: unsafe links, junk prices and bad JSON are dropped", () => {
  const b = toBusiness(row, city);
  assert.equal(b.website, null);
  assert.equal(b.phone, null);
  assert.equal(b.price, null);
  assert.equal(b.description, "Casual spot for South Indian food"); // Google's summary, rescued from the price field
  assert.deepEqual(b.hours, [["monday", "9 am–5 pm"], ["sunday", "Closed"]]);
  assert.deepEqual(b.serviceOptions, {});
  assert.equal(b.quote, "Great care.");
  assert.equal(b.thumbnail, "https://lh3.googleusercontent.com/x");
  assert.equal(b.mapsUrl, "https://www.google.com/maps?cid=123");
  assert.equal(toBusiness({ ...row, price: "₹₹" }, city).price, "₹₹");
});

test("scraped photos are asked for at card size, broken Street View ones dropped", () => {
  assert.equal(photoUrl("https://lh3.googleusercontent.com/p/AF1=w122-h92-k-no"), "https://lh3.googleusercontent.com/p/AF1=w800-h600-k-no");
  assert.equal(photoUrl("https://lh3.googleusercontent.com/p/AF1=w80-h106-k-no"), "https://lh3.googleusercontent.com/p/AF1=w800-h600-k-no");
  assert.equal(photoUrl("https://example.com/shop.jpg"), "https://example.com/shop.jpg");
  assert.equal(photoUrl("https://streetviewpixels-pa.googleapis.com/v1/thumbnail?panoid=x&w=80&h=92"), null);
  assert.equal(photoUrl("javascript:alert(1)"), null);
  assert.equal(photoUrl(null), null);
});

test("opening hours: parsing and open-now", () => {
  assert.deepEqual(parseHours("10 am–2 pm, 5–9 pm"), [[600, 840], [1020, 1260]]);
  assert.deepEqual(parseHours("12–11:30 pm"), [[720, 1410]]);
  assert.deepEqual(parseHours("11–2 pm"), [[660, 840]]);
  assert.deepEqual(parseHours("6:30 AM–12 AM"), [[390, 1440]]);
  assert.deepEqual(parseHours("Closed"), []);
  assert.equal(parseHours("By appointment"), null);
  const week = [["friday", "10 am–2 pm, 5–9 pm"]] as [string, string][];
  // Local time, as the visitor's browser sees it.
  assert.deepEqual(openStatus(week, new Date(2026, 9, 9, 11, 30)), { open: true, detail: "until 2 pm" });
  assert.deepEqual(openStatus(week, new Date(2026, 9, 9, 14, 30)), { open: false, detail: "opens 5 pm" });
  assert.equal(openStatus(week, new Date(2026, 9, 10, 11, 30)), null); // no Saturday hours
});

test("map framing: zoom follows the spread, far-apart results get no map", async () => {
  const { areaView } = await import("../components/google-map");
  assert.deepEqual(areaView([{ lat: 51.5, lng: -0.12 }]), { center: { lat: 51.5, lng: -0.12 }, zoom: 16 });
  assert.equal(areaView([{ lat: 51.5, lng: -0.1 }, { lat: 51.55, lng: -0.15 }])?.zoom, 13);
  assert.equal(areaView([{ lat: 51.5, lng: -0.12 }, { lat: 48.86, lng: 2.35 }]), null); // London and Paris
  assert.equal(areaView([]), null);
});

test("a business in a newly added category reloads the taxonomy once", async () => {
  const categories = [{ id: 1, name: "dentist", slug: "dentist", group_name: null }];
  const lists = [{ city_id: 1, category_id: 1, businesses: 9 }];
  let links = [{ category_id: 1, city_id: 1 }];
  let loads = 0;
  const query = async (text: string) => {
    if (text.includes("from businesses b")) return { rows: [row] };
    if (text.includes("from business_categories")) return { rows: links };
    if (text.includes("from cities")) return { rows: [{ id: 1, name: "Mumbai", state: "India", country_code: "in", slug: "mumbai-india" }] };
    if (text.includes("from city_category_counts")) return { rows: [...lists] }; // a copy, like a real query
    if (text.includes("from categories")) return loads++, { rows: categories };
    throw new Error(`unexpected query: ${text}`);
  };
  (globalThis as unknown as { pools: unknown }).pools = { WEB_DATABASE_URL: { query } };

  assert.deepEqual((await getBusiness("a-1"))?.categories.map((c) => c.slug), ["dentist"]);
  assert.equal(loads, 1);

  // Loaded, but too small to publish in this city: normal, so no reload.
  links = [...links, { category_id: 1, city_id: 2 }];
  assert.deepEqual((await getBusiness("a-1"))?.categories.map((c) => c.slug), ["dentist"]);
  assert.equal(loads, 1);

  categories.push({ id: 2, name: "hair salon", slug: "hair-salon", group_name: null });
  lists.push({ city_id: 1, category_id: 2, businesses: 5 });
  links = [{ category_id: 2, city_id: 1 }];
  assert.deepEqual((await getBusiness("a-1"))?.categories.map((c) => c.slug), ["hair-salon"]);
  assert.equal(loads, 2);
});
