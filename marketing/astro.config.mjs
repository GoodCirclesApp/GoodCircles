// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { CITIES, STATE, isCityIndexable } from './src/data/cities';

const SITE = 'https://goodcircles.org';

// Thin-content guardrail: city pages are noindex until they have >=6 real
// seeded entries (CityPages.md) — keep noindex pages out of the sitemap too.
const EXCLUDED_CITY_URLS = new Set(
  CITIES.filter((c) => !isCityIndexable(c)).map(
    (c) => `${SITE}/shop-local/${STATE.slug}/${c.slug}/`
  )
);

// Canonical host is the bare domain (www 301s to it — see public/_redirects).
export default defineConfig({
  site: SITE,
  trailingSlash: 'ignore',
  integrations: [
    react(),
    sitemap({
      filter: (page) => !EXCLUDED_CITY_URLS.has(page),
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
