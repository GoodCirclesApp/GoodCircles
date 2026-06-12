// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Canonical host is the bare domain (www 301s to it — see public/_redirects).
export default defineConfig({
  site: 'https://goodcircles.org',
  trailingSlash: 'ignore',
  integrations: [
    react(),
    sitemap({
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
