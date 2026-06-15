// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { CITIES, STATE, isCityIndexable } from './src/data/cities';
import { COUNTIES, COUNTY_ENGINE_ENABLED, isCountyIndexable } from './src/data/counties';

const SITE = 'https://goodcircles.org';

// Thin-content guardrail: city pages are noindex until they have >=6 real
// seeded entries (CityPages.md) — keep noindex pages out of the sitemap too.
const EXCLUDED_CITY_URLS = new Set(
  CITIES.filter((c) => !isCityIndexable(c)).map(
    (c) => `${SITE}/shop-local/${STATE.slug}/${c.slug}/`
  )
);

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
      filter: (page) => !EXCLUDED_CITY_URLS.has(page) && !EXCLUDED_COUNTY_URLS.has(page),
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
