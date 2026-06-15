// DORMANT county engine — see docs/seo/county-expansion-plan.md.
//
// SAFETY: COUNTY_ENGINE_ENABLED is `false`, so getStaticPaths() emits ZERO pages
// and the live site is unchanged (no new crawlable/indexable pages, no sitemap
// entries, no SEO/indexing/ranking impact). This file stages the engine so that
// — once the validated U.S. Census dataset is in AND the existing pages are
// indexing healthily — turning it on is a flag flip + data drop.
//
// TWO-LEVEL SAFETY when eventually enabled:
//   1. COUNTY_ENGINE_ENABLED gates whether county pages are generated at all.
//   2. isCountyIndexable() gates whether a generated page may be indexed — it
//      requires a deliberate per-county `realSeededEntries` value, so indexing is
//      released in WAVES (set per county/state), never all at once. Pages ship
//      noindex + sitemap-excluded until then.

export const COUNTY_ENGINE_ENABLED = false;

// A county may flip to index only when it has this many real seeded entries
// (towns/merchants/nonprofits confirmed from data) — set deliberately per wave.
export const COUNTY_INDEX_THRESHOLD = 3;

export interface County {
  slug: string; // e.g. 'hinds'
  name: string; // proper local name incl. type, e.g. 'Hinds County' / 'Orleans Parish'
  state: string; // 'Mississippi'
  stateSlug: string; // 'mississippi'
  st: string; // 'MS'
  seat: string; // county seat town
  region: string;
  towns: string[]; // REAL towns/cities in the county (from verified data — never invented)
  /** Real seeded entries; only a deliberately-set value >= threshold makes a county indexable. */
  realSeededEntries?: number;
}

export function isCountyIndexable(c: County): boolean {
  return (c.realSeededEntries ?? 0) >= COUNTY_INDEX_THRESHOLD;
}

// ----------------------------------------------------------------------------
// VALIDATION SAMPLE ONLY — a handful of Mississippi counties that contain our
// existing city pages, used to verify the template renders + passes the SEO gate.
// NOT a substitute for the full validated 3,143-county Census dataset, which must
// replace this before COUNTY_ENGINE_ENABLED is set true. All entries here ship
// noindex (no realSeededEntries) so even if enabled they cannot be indexed.
// ----------------------------------------------------------------------------
export const COUNTIES: County[] = [
  { slug: 'hinds', name: 'Hinds County', state: 'Mississippi', stateSlug: 'mississippi', st: 'MS', seat: 'Jackson', region: 'Central Mississippi', towns: ['Jackson', 'Clinton', 'Byram', 'Raymond', 'Terry', 'Edwards', 'Bolton', 'Utica'] },
  { slug: 'rankin', name: 'Rankin County', state: 'Mississippi', stateSlug: 'mississippi', st: 'MS', seat: 'Brandon', region: 'Central Mississippi', towns: ['Brandon', 'Pearl', 'Flowood', 'Richland', 'Florence', 'Pelahatchie'] },
  { slug: 'madison', name: 'Madison County', state: 'Mississippi', stateSlug: 'mississippi', st: 'MS', seat: 'Canton', region: 'Central Mississippi', towns: ['Madison', 'Ridgeland', 'Canton', 'Flora', 'Gluckstadt'] },
  { slug: 'harrison', name: 'Harrison County', state: 'Mississippi', stateSlug: 'mississippi', st: 'MS', seat: 'Gulfport', region: 'South Mississippi (Gulf Coast)', towns: ['Gulfport', 'Biloxi', 'Long Beach', 'Pass Christian', "D'Iberville"] },
  { slug: 'desoto', name: 'DeSoto County', state: 'Mississippi', stateSlug: 'mississippi', st: 'MS', seat: 'Hernando', region: 'North Mississippi (DeSoto/Memphis metro)', towns: ['Southaven', 'Olive Branch', 'Horn Lake', 'Hernando', 'Walls'] },
  { slug: 'forrest', name: 'Forrest County', state: 'Mississippi', stateSlug: 'mississippi', st: 'MS', seat: 'Hattiesburg', region: 'South Mississippi (Pine Belt)', towns: ['Hattiesburg', 'Petal'] },
];

/** Slugify a town name to match an existing city-page slug. */
export function townSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
