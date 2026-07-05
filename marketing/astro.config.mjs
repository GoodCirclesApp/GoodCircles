// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CITIES, STATE, isCityIndexable } from './src/data/cities';
import { COUNTIES, COUNTY_ENGINE_ENABLED, isCountyIndexable } from './src/data/counties';
import { NATIONAL_CITIES, NATIONAL_STATES } from './src/data/national-cities';

const SITE = 'https://goodcircles.org';

// The /resources/ hub is a static bundle in public/, so Astro doesn't auto-add it to
// the sitemap. Walk public/resources for every index.html and emit its pretty URL, so
// each resource page is in the sitemap (the SEO gate requires indexable pages to be).
function collectResourceUrls() {
  const base = fileURLToPath(new URL('./public/resources/', import.meta.url));
  if (!existsSync(base)) return [];
  const urls = [];
  const walk = (dir, urlPath) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p, `${urlPath}${name}/`);
      else if (name === 'index.html') urls.push(`${SITE}${urlPath}`);
    }
  };
  walk(base, '/resources/');
  return urls;
}
const RESOURCE_URLS = collectResourceUrls();

// SEO Sprint 2026-07-05: all Mississippi city pages are indexable (launch state;
// isCityIndexable returns true, so this set is empty — kept for the day the
// guardrail is ever re-scoped). The noindex guardrail now covers the NON-MS
// coming-soon pages instead: every /shop-local/[state]/ hub and city page ships
// noindex,follow, so they must stay out of the sitemap (SEO gate consistency).
const EXCLUDED_CITY_URLS = new Set(
  CITIES.filter((c) => !isCityIndexable(c)).map(
    (c) => `${SITE}/shop-local/${STATE.slug}/${c.slug}/`
  )
);

const EXCLUDED_NATIONAL_URLS = new Set([
  ...NATIONAL_STATES.map((s) => `${SITE}/shop-local/${s.slug}/`),
  ...NATIONAL_CITIES.map((c) => `${SITE}/shop-local/${c.stateSlug}/${c.slug}/`),
]);

// Same guardrail for the county engine (no-op while COUNTY_ENGINE_ENABLED=false,
// since no county pages are generated): keep noindex counties out of the sitemap.
const EXCLUDED_COUNTY_URLS = new Set(
  COUNTY_ENGINE_ENABLED
    ? COUNTIES.filter((c) => !isCountyIndexable(c)).map(
        (c) => `${SITE}/shop-local/${c.stateSlug}/county/${c.slug}/`
      )
    : []
);

// Canonical host is the bare domain (www 301s to it — see public/_redirects).
export default defineConfig({
  site: SITE,
  trailingSlash: 'ignore',
  integrations: [
    react(),
    sitemap({
      customPages: RESOURCE_URLS,
      filter: (page) =>
        !EXCLUDED_CITY_URLS.has(page) &&
        !EXCLUDED_COUNTY_URLS.has(page) &&
        !EXCLUDED_NATIONAL_URLS.has(page),
      // Legal pages don't need crawl priority; everything else defaults.
      serialize(item) {
        if (/\/(privacy|terms|cookies)\/?$/.test(item.url)) {
          item.priority = 0.3;
        }
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
