// Fetch nabarfinder.com's live public feed and write a dated snapshot:
// the JSON exactly as published, flat CSVs, a city index, and a summary.
// No dependencies. An absent field means "unknown / not published" — it is
// left as an empty cell, never written as 0 or "".
import { writeFileSync, mkdirSync } from 'node:fs';

const FEED = 'https://nabarfinder.com/api/v1/venues.json';
const res = await fetch(FEED, { headers: { 'user-agent': 'nabarfinder-data-snapshot' } });
if (!res.ok) throw new Error(`feed ${res.status}`);
const feed = await res.json();
if (feed.schemaVersion !== 1 || !Array.isArray(feed.venues)) throw new Error('unexpected feed shape');

mkdirSync('snapshot', { recursive: true });
writeFileSync('snapshot/venues.json', JSON.stringify(feed, null, 2) + '\n');

// CSV: every cell quoted; undefined/null -> empty cell; arrays joined with "|".
const q = (v) => (v === undefined || v === null ? '' : `"${String(v).replace(/"/g, '""')}"`);
const list = (a) => (Array.isArray(a) && a.length ? a.join('|') : undefined);
const csv = (cols, rows) => [cols.join(','), ...rows.map((r) => r.map(q).join(','))].join('\n') + '\n';

// One row per venue. Long prose (longDescription, pressQuote) stays in the
// JSON; the CSV keeps the structured fields plus the provenance columns.
const venueCols = [
  'slug', 'name', 'citySlug', 'cityName', 'state', 'country', 'neighborhood', 'venueType',
  'naProgramStrength', 'address', 'lat', 'lng', 'website', 'phone', 'email', 'instagramHandle',
  'hours', 'description', 'brandSlugs', 'signatureDrinks', 'naMenuItems', 'lastVerifiedAt',
  'drinksVerifiedAt', 'verificationSource', 'submittedBy', 'pressQuoteSource',
  'pressQuoteSourceLabel', 'heroImage', 'url',
];
const venueRows = feed.venues.map((v) => [
  v.slug, v.name, v.citySlug, v.cityName, v.state, v.country, v.neighborhood, v.venueType,
  v.naProgramStrength, v.address, v.lat, v.lng, v.website, v.phone, v.email, v.instagramHandle,
  v.hours, v.description, list(v.brandSlugs), list(v.signatureDrinks),
  list((v.naMenuItems ?? []).map((m) => m.name)), v.lastVerifiedAt,
  v.drinksVerifiedAt, v.verificationSource, v.submittedBy, v.pressQuoteSource,
  v.pressQuoteSourceLabel, v.heroImage, v.url,
]);
writeFileSync('snapshot/venues.csv', csv(venueCols, venueRows));

// One row per verified NA menu item (venues without a verified menu have no rows).
const itemCols = [
  'venueSlug', 'venueName', 'citySlug', 'country', 'name', 'description', 'price', 'category',
  'drinkSlug', 'brandSlugs', 'onTap', 'drinksVerifiedAt', 'venueUrl',
];
const itemRows = [];
for (const v of feed.venues) {
  for (const m of v.naMenuItems ?? []) {
    itemRows.push([
      v.slug, v.name, v.citySlug, v.country, m.name, m.description, m.price, m.category,
      m.drinkSlug, list(m.brandSlugs), m.onTap, v.drinksVerifiedAt ?? v.lastVerifiedAt, v.url,
    ]);
  }
}
writeFileSync('snapshot/menu-items.csv', csv(itemCols, itemRows));

// City index: the feed's own city list (with venue counts), most venues first.
const cities = [...feed.cities].sort((a, b) => b.venueCount - a.venueCount || a.slug.localeCompare(b.slug));
writeFileSync('snapshot/cities.json', JSON.stringify(cities, null, 2) + '\n');

const n = (pred) => feed.venues.filter(pred).length;
const countries = new Set(feed.venues.map((v) => v.country));
const stats = {
  taken: new Date().toISOString().slice(0, 10),
  feedGenerated: feed.generatedAt,
  venues: feed.venues.length,
  cities: cities.length,
  countries: countries.size,
  withCoordinates: n((v) => typeof v.lat === 'number' && typeof v.lng === 'number'),
  withVerifiedMenu: n((v) => v.naMenuItems?.length),
  menuItems: itemRows.length,
  withPressQuote: n((v) => v.pressQuote),
  ownerConfirmed: n((v) => v.verificationSource === 'owner_confirmed'),
  communitySubmitted: n((v) => v.submittedBy),
};
writeFileSync(
  'snapshot/SNAPSHOT.md',
  `# Snapshot

- Taken: ${stats.taken}
- Feed generated: ${stats.feedGenerated}
- Venues: ${stats.venues}
- Cities: ${stats.cities} (${stats.countries} countries)
- Venues with coordinates: ${stats.withCoordinates}
- Venues with a verified NA menu: ${stats.withVerifiedMenu} (${stats.menuItems} menu items)
- Venues with a cited press quote: ${stats.withPressQuote}
- Venues whose details were confirmed by their own team: ${stats.ownerConfirmed}
- Venues first spotted by a community submitter: ${stats.communitySubmitted}

Source: ${FEED}
`,
);
console.log(
  `snapshot: ${stats.venues} venues, ${stats.cities} cities, ${stats.menuItems} menu items on ${stats.withVerifiedMenu} venues, ${stats.ownerConfirmed} owner-confirmed`,
);
