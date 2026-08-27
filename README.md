# NA Bar Finder Venue Dataset

Monthly snapshots of [nabarfinder.com](https://nabarfinder.com)'s public feed:
bars, restaurants, cafes, kava bars and bottle shops with verified non-alcoholic
drink programs across 70 cities in the US, UK, Canada, Australia and Singapore.
Every record is checked by a person and carries **the date it was last checked**.

- `snapshot/venues.json` — the feed exactly as published (`/api/v1/venues.json`)
- `snapshot/venues.csv` — one row per venue, flat columns
- `snapshot/menu-items.csv` — one row per verified NA menu item
- `snapshot/cities.json` — the cities covered, with venue counts
- `snapshot/SNAPSHOT.md` — when it was taken and the headline counts

## What is in a venue record

**An absent field means the detail is unknown or not published. It never means zero,
"none" or "no".** In the CSVs an absent field is an empty cell.

| Field | Meaning |
|---|---|
| `slug` | Stable id, also the last part of the venue's page URL. |
| `name`, `citySlug`, `cityName`, `state`, `country`, `neighborhood` | Where it is. `state` is a US state code or a readable region label; `country` is ISO 3166-1 alpha-2. |
| `venueType` | One of `bar`, `cocktail-bar`, `brewery`, `restaurant`, `wine-bar`, `lounge`, `cafe`, `kava-bar`, `bottle-shop`, `mobile-bottle-shop`, `trailer-bar`. |
| `naProgramStrength` | 1–5, an editorial assessment based on the venue's public menu. 5 = a dedicated non-alcoholic establishment; 3 = meaningful NA options; 1 = minimal. |
| `description`, `longDescription` | Editorial copy. `longDescription` is several paragraphs and is only in the JSON. |
| `address`, `lat`, `lng` | Absent for venues without a fixed location (mobile operators). |
| `website`, `phone`, `email`, `instagramHandle`, `hours` | As published by the venue. `hours` is a single line, e.g. `Mon-Thu 4pm-11pm; Fri-Sat 4pm-2am`. |
| `brandSlugs` | Non-alcoholic brands the venue is known to carry (`|`-separated in CSV). |
| `signatureDrinks` | Named NA drinks from the venue's menu (`|`-separated in CSV). |
| `naMenuItems` | The venue's verified NA menu — name, description, price, category, the canonical drink it is a serve of (`drinkSlug`), brands poured, and `onTap` (true only when verified; absent means unknown, not bottle). Full objects in the JSON and in `menu-items.csv`; names only in `venues.csv`. |
| `lastVerifiedAt` | The date a person last confirmed the venue's details (ISO date). |
| `drinksVerifiedAt` | The date the drink list specifically was last confirmed. Absent = same as `lastVerifiedAt`. |
| `verificationSource` | Who last verified the record. `owner_confirmed` = the venue's own team, through the claim-and-edit flow. Absent = editorial research (the default). |
| `submittedBy` | First name of the community member who first pointed us at the venue, if any. |
| `pressQuote`, `pressQuoteAttribution`, `pressQuoteSource`, `pressQuoteSourceLabel` | A real quote from a named publication about the venue, with the source URL. The quote text is only in the JSON. |
| `heroImage`, `url` | The venue's photo (if any) and its canonical page on nabarfinder.com. |

`snapshot/cities.json` rows carry `slug`, `name`, `state`, `country`, `lat`, `lng`,
`venueCount` and the city page `url`.

The live venue page (`url`) shows every field with the date it was checked, and
links to the venue's own site and to the press source for any quote.

## Licence and citation

[CC BY 4.0](LICENSE). Use it freely; attribute **NA Bar Finder** with a link. Please
quote denominators with numbers ("of the 1,516 venues checked…") — the figures describe
this dataset's coverage, not every venue in a city.

See [CITATION.cff](CITATION.cff). Releases are tagged monthly (`vYYYY.MM`); Zenodo
archives each one and mints a DOI.

**DOI:** pending — the Zenodo archive is being linked; this section will carry the
concept DOI and a ready-to-paste citation once the first archived release exists.

> NA Bar Finder (2026). *NA Bar Finder Venue Dataset* (v2026.08) [Data set]. https://github.com/nabarfinderops/data

## Also available

- Live feed: https://nabarfinder.com/api/v1/venues.json (no key, CORS-enabled, 120 req/min)
- MCP server for AI assistants: https://nabarfinder.com/mcp
- Developer docs and attribution: https://nabarfinder.com/developers/
- City Index (venues per capita, CC BY 4.0): https://nabarfinder.com/best-non-alcoholic-cities/
- Mocktail Price Index (CC BY 4.0): https://nabarfinder.com/non-alcoholic-drink-prices/
