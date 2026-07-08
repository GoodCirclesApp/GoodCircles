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

// File-based /learn guides (standalone .astro pages rather than learn-all data
// entries) — keep in sync when adding new long-form guides.
const FILE_GUIDES: RSSFeedItem[] = [
  {
    title: 'Best Local Businesses to Support in Jackson, MS (2026)',
    description: 'A verified guide to locally-owned Jackson favorites — Fondren diners, Lemuria Books, Bully’s soul food, local coffee and more — organized by category.',
    link: '/learn/best-local-businesses-jackson-ms/',
    pubDate: new Date('2026-07-08'),
  },
  {
    title: 'Passive Nonprofit Funding: Every Honest Option (2026)',
    description: 'What passive nonprofit funding is and every real way to build it: roundup apps, employer matching, shopping portals, search giving, and local-first models.',
    link: '/learn/passive-nonprofit-funding/',
    pubDate: new Date('2026-07-08'),
  },
  {
    title: 'How to Save Money Shopping Local: 7 Real Tactics (2026)',
    description: 'Loyalty programs, seconds and outlets, seasonal buying, co-ops, market timing, repair-over-replace, and automatic savings.',
    link: '/learn/how-to-save-money-shopping-local/',
    pubDate: new Date('2026-07-08'),
  },
  {
    title: 'What Big Platforms Really Cost Local Businesses (2026)',
    description: 'Marketplace fees decoded: what Amazon, Etsy, DoorDash and lead-gen platforms actually take per sale — and what the percentages hide.',
    link: '/learn/what-big-platforms-cost-local-businesses/',
    pubDate: new Date('2026-07-08'),
  },
  {
    title: 'How to Choose a Local Nonprofit to Support (2026 Guide)',
    description: 'A practical framework: verify 501(c)(3) status, read the Form 990, weigh local vs national, and match your support to the need.',
    link: '/learn/how-to-choose-a-local-nonprofit/',
    pubDate: new Date('2026-07-08'),
  },
  {
    title: '15 Passive Fundraising Ideas, Ranked by Effort (2026)',
    description: 'Fifteen passive fundraising ideas ranked by how passive they really are — realistic yield, effort level, and best-fit organization for each.',
    link: '/learn/passive-fundraising-ideas/',
    pubDate: new Date('2026-07-08'),
  },
  {
    title: 'Passive Fundraising for Schools: PTA & Booster Guide (2026)',
    description: 'Why product sales burn out volunteers, the truly passive alternatives ranked, and a realistic worked example for PTAs and booster clubs.',
    link: '/learn/passive-fundraising-for-schools/',
    pubDate: new Date('2026-07-08'),
  },
  {
    title: 'The Benefits of Shopping Local, By the Numbers (2026)',
    description: 'What shopping local does for your wallet, community, and state — with the ~$53-vs-$14 recirculation figure and honest chain trade-offs.',
    link: '/learn/benefits-of-shopping-local/',
    pubDate: new Date('2026-07-08'),
  },
  {
    title: 'Mississippi Farmers Markets: A Verified Guide (2026)',
    description: 'Mississippi farmers markets by region with verified locations, market days, and source links — Jackson, Meridian, the Coast and more.',
    link: '/learn/mississippi-farmers-markets/',
    pubDate: new Date('2026-07-08'),
  },
  {
    title: 'Unique Gifts from Mississippi Small Shops & Artisans (2026)',
    description: 'A verified Mississippi gift guide: Delta pottery, Jackson pralines, letterpress art, legendary independent bookstores, and MS-made goods.',
    link: '/learn/gifts-from-mississippi-small-shops/',
    pubDate: new Date('2026-07-08'),
  },
];

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
    items: [...FILE_GUIDES, ...learnItems, ...answerItems],
    customData: '<language>en-us</language>',
  });
}
