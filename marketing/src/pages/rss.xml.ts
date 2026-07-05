// RSS feed for the /learn guides and the /resources/answers library
// (SEO Sprint 2026-07-05, Task 5a). Referenced from the site head via
// <link rel="alternate" type="application/rss+xml"> in layouts/Base.astro.
// Runs at build time (static output), so reading public/ with node:fs is safe.
import rss, { type RSSFeedItem } from '@astrojs/rss';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_LEARN } from '../data/learn-all';
import { SITE_URL, SITE_NAME, ORG_DESCRIPTION } from '../data/site';

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export async function GET() {
  // /learn guides come straight from the content data.
  const learnItems: RSSFeedItem[] = ALL_LEARN.map((article) => {
    const ld = article.articleJsonLd as { dateModified?: string; datePublished?: string };
    const date = ld.dateModified ?? ld.datePublished;
    return {
      title: article.title,
      description: article.description,
      link: `/learn/${article.slug}/`,
      ...(date ? { pubDate: new Date(date) } : {}),
    };
  });

  // /resources/answers pages are a static bundle in public/ — read each page's
  // title + meta description. The hub index and the /ask intake page are not
  // articles, so they're skipped.
  const answersDir = fileURLToPath(new URL('../../public/resources/answers/', import.meta.url));
  const answerItems: RSSFeedItem[] = [];
  for (const name of readdirSync(answersDir)) {
    if (name === 'ask') continue;
    const dir = join(answersDir, name);
    if (!statSync(dir).isDirectory()) continue;
    const html = readFileSync(join(dir, 'index.html'), 'utf8');
    const title = decodeEntities((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] ?? '');
    const description = decodeEntities(
      (html.match(/name="description" content="([^"]*)"/) || [])[1] ?? ''
    );
    if (!title) continue;
    const date = (html.match(/"dateModified":"([^"]+)"/) ||
      html.match(/"datePublished":"([^"]+)"/) ||
      [])[1];
    answerItems.push({
      title,
      description,
      link: `/resources/answers/${name}/`,
      ...(date ? { pubDate: new Date(date) } : {}),
    });
  }

  return rss({
    title: `${SITE_NAME} — Learn & Nonprofit Answers`,
    description: `Guides and answers from ${SITE_NAME}: shopping local, passive fundraising, AmazonSmile alternatives, and practical nonprofit questions. ${ORG_DESCRIPTION}`,
    site: SITE_URL,
    items: [...learnItems, ...answerItems],
    customData: '<language>en-us</language>',
  });
}
