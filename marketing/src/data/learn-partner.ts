// Partnership /learn content (Good Circles × No More 9 to 5 Club). Authored as
// structured content and compiled into the LearnArticle shape so it renders in
// the existing /learn route + .gc-learn scope. Each article: answer-first,
// Article JSON-LD with a partner `mentions`, FAQPage schema (verbatim), 3+
// internal Good Circles links, and 1+ affiliate-tagged NM9t5 CTA built via the
// env-driven helper with rel="sponsored". All NM9t5 facts are from the verified
// research in _research/nm9t5/ — nothing invented.
import type { LearnArticle } from './learn';
import { SITE_URL, NM9T5_URL } from './site';
import { nm9t5Link, nm9t5TrialLink, AFFILIATE_REL } from '../lib/affiliates';

const PUBLISHED = '2026-06-13';
const DATELINE = 'Updated June 13, 2026 · Good Circles';

// Affiliate CTA button (sponsored, tracked).
function aff(label: string, path: string, campaign: string, content: string): string {
  const href = nm9t5Link(path, { medium: 'cta', campaign, content });
  return `<a class="btn btn-gold" href="${href}" rel="${AFFILIATE_REL}" data-affiliate="nm9t5" target="_blank">${label}</a>`;
}
// 30-day trial conversion CTA (sponsored, tracked).
function trial(label: string, campaign: string, content: string): string {
  const href = nm9t5TrialLink({ medium: 'cta', campaign, content });
  return `<a class="btn btn-gold" href="${href}" rel="${AFFILIATE_REL}" data-affiliate="nm9t5" target="_blank">${label}</a>`;
}
// Good Circles CTA button (internal).
function gc(label: string, href: string): string {
  return `<a class="btn" style="background:#7851A9;color:#fff" href="${href}">${label}</a>`;
}

interface Section { h2: string; html: string; }
interface Faq { q: string; a: string; }
interface PartnerDef {
  slug: string;
  title: string;
  description: string;
  h1: string;
  cardTitle: string;
  blurb: string;
  answer: string;
  sections: Section[];
  faqs: Faq[];
  related: { label: string; href: string }[];
}

function build(def: PartnerDef): LearnArticle {
  const url = `${SITE_URL}/learn/${def.slug}/`;
  const articleHtml =
    `<div class="answer">${def.answer}</div>` +
    def.sections.map((s) => `<h2>${s.h2}</h2>${s.html}`).join('') +
    `<h2>FAQ</h2>` +
    def.faqs.map((f) => `<div class="faq"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('') +
    `<div class="related"><b>Related:</b><br>` +
    def.related.map((r) => `<a href="${r.href}">${r.label}</a>`).join('') +
    `<a href="${nm9t5Link('/', { medium: 'related', campaign: def.slug, content: 'related' })}" rel="${AFFILIATE_REL}" data-affiliate="nm9t5" target="_blank">No More 9 to 5 Club</a>` +
    `</div>`;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: def.h1,
    description: def.description,
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    author: { '@type': 'Organization', name: 'Good Circles' },
    publisher: {
      '@type': 'Organization',
      name: 'Good Circles',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/og.png` },
    },
    mainEntityOfPage: url,
    mentions: {
      '@type': 'Organization',
      name: 'The No More 9 to 5 Club',
      url: NM9T5_URL,
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: def.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return {
    slug: def.slug,
    title: def.title,
    description: def.description,
    h1: def.h1,
    dateline: DATELINE,
    cardTitle: def.cardTitle,
    blurb: def.blurb,
    articleJsonLd,
    faqJsonLd,
    articleHtml,
  };
}

const DEFS: PartnerDef[] = [
  // ---------- CORNERSTONE HUB ----------
  {
    slug: 'start-a-local-business',
    title: 'From Idea to Local Sales: The Full Path for Community-Rooted Founders',
    description:
      'A step-by-step path from "I want out of the 9-to-5" to selling locally and keeping 89% of your profit — with the training and the marketplace that fit each stage.',
    h1: 'From idea to local sales: the full path for community-rooted founders',
    cardTitle: 'Start a Local Business: The Full Path',
    blurb:
      'The complete journey from idea to local sales — which skills to build first, when to launch, and how to keep 89% of your profit once you do.',
    answer:
      'Starting a community-rooted business follows a clear path: decide to leave the 9-to-5, build skills and pick an offer, find your first customers, launch on a marketplace that keeps your margins, sell locally, and scale. This guide maps each stage — and points you to the right help for it, from <b>No More 9 to 5 Club</b> training to a <b>Good Circles</b> marketplace that lets you keep 89% of your profit.',
    sections: [
      {
        h2: 'Stage 1 — You want out of the 9-to-5',
        html:
          `<p>Most local businesses start with a feeling: you want control over how you spend your time, not just a bigger paycheck. That instinct is the right one — but acting on it well means preparing, not just quitting. The cleanest first step is to get an honest read on where you actually are and what the next move should be.</p>` +
          `<p>This is exactly what the No More 9 to 5 Club's free Roadmap to Success survey is for — five minutes, no credit card, just clarity on your stage and your next step. ${aff('Get a free, no-pressure roadmap', '/', 'start-a-local-business', 'stage1')}</p>`,
      },
      {
        h2: 'Stage 2 — You decide to start a business',
        html:
          `<p>Deciding is its own milestone. The risk here is jumping straight to a logo and a website before you know what you're selling and to whom. A better sequence: pick a problem you can solve for people near you, validate that a few of them will actually pay, then build from there.</p>` +
          `<p>If you're at the very beginning, structured guidance shortens this stage dramatically. The Club's "Escape the System" track is built for people who haven't started yet — frameworks, side hustles, and the mindset to move. ${aff('See the Aspiring Entrepreneur path', '/ascend-the-ladder', 'start-a-local-business', 'stage2')}</p>`,
      },
      {
        h2: 'Stage 3 — Build skills, pick an offer, find first customers',
        html:
          `<p>This is the stage where most people stall, because it's where real work happens: choosing a focused offer, pricing it, and getting your first paying customers. Skills compound here — sales, simple operations, and the discipline to ship consistently matter more than any single tactic.</p>` +
          `<p>Coaching and a builder community pay for themselves at this stage by keeping you accountable and unstuck. The Club's Basic and Professional memberships add weekly coaching, courses, and masterminds — and you can try it with a 30-day trial. ${trial('Start a 30-day trial', 'start-a-local-business', 'stage3')}</p>`,
      },
      {
        h2: 'Stage 4 — Join the Good Circles Founding Circle',
        html:
          `<p>Once you have an offer and your first customers, where you sell decides how much you keep. National platforms and delivery apps commonly take 15–30% of every sale. Good Circles is built the opposite way: a 1% fee on profit, so you keep <b>89% of your profit</b> — and your customers save about 10% and fund a local nonprofit when they buy from you.</p>` +
          `<p>The first 200 Mississippi businesses become permanent Founding Merchants ahead of the September 2026 launch. ${gc('Become a Founding Merchant (free)', '/for-business')}</p>`,
      },
      {
        h2: 'Stage 5 — Sell locally and earn repeat customers',
        html:
          `<p>Local selling rewards relationships. On Good Circles, every sale gives a customer two reasons to come back: they save money, and a share funds a cause they chose. That's a loyalty loop national platforms can't copy. Your job at this stage is consistency — show up, deliver, and let the savings-and-giving math keep customers returning.</p>` +
          `<p>See exactly how the money moves on a local sale, including a worked $100 example, on <a href="/how-it-works">how it works</a>.</p>`,
      },
      {
        h2: 'Stage 6 — Scale to multiple locations or product lines',
        html:
          `<p>Scaling is a different skill set: systems, delegation, and strategy rather than hustle. This is where advanced mentorship earns its keep — the Club's "Scale" level is built for established owners adding locations, products, or a team.</p>` +
          `<p>${aff('Explore the Scale track for established owners', '/ascend-the-ladder', 'start-a-local-business', 'stage6')}</p>`,
      },
      {
        h2: 'How the two fit together',
        html:
          `<p>The simplest way to think about it: <b>No More 9 to 5 trains the entrepreneur; Good Circles gives that entrepreneur a marketplace that keeps 89% of their profit.</b> One builds the operator, the other gives them a place to sell that's actually on their side. If you're earlier in the journey, start with the roadmap; if you're ready to sell locally, claim a Founding Merchant spot.</p>` +
          `<p>${gc('Claim your Founding Merchant spot', '/for-business')}</p>`,
      },
    ],
    faqs: [
      { q: 'What is the first step to starting a local business?', a: 'Get clear on your stage and your next move before spending on logos or websites. A free tool like the No More 9 to 5 Club Roadmap survey, or simply validating that a few local customers will pay, is a better first step than building infrastructure.' },
      { q: 'How much does it cost to sell on Good Circles?', a: 'A 1% fee on profit per sale — no setup, monthly, or listing fees. If you do not sell, you do not pay. You keep about 89% of your profit, versus the 15–30% national platforms commonly take.' },
      { q: 'Do I need business training before I start selling?', a: 'Not strictly, but training shortens the hardest stages — picking an offer, pricing, and getting first customers. Programs like the No More 9 to 5 Club provide coaching and community for those stages; Good Circles is where you then sell and keep your margin.' },
      { q: 'When does Good Circles launch?', a: 'Good Circles launches in September 2026 in the Jackson, Mississippi metro, then expands to the cities that request it most. The first 200 businesses become permanent Founding Merchants.' },
    ],
    related: [
      { label: 'For local business', href: '/for-business' },
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Get ready to launch', href: '/for-business/get-ready-to-launch' },
    ],
  },

  // ---------- AUDIENCE: VETERANS ----------
  {
    slug: 'veterans-starting-a-local-business',
    title: 'Veterans Starting a Local Business: Skills, Support & a Marketplace That Keeps 89%',
    description:
      'A practical guide for veterans and military spouses starting a local business — where to get training and mentorship, and how to sell locally while keeping 89% of your profit.',
    h1: 'Veterans starting a local business: skills, support, and a marketplace that keeps 89%',
    cardTitle: 'Veterans Starting a Local Business',
    blurb:
      'Training, mentorship, and a marketplace built for margins — a practical path for veterans and military spouses going into local business.',
    answer:
      'Veterans and military spouses bring discipline, leadership, and grit to entrepreneurship — what they need is stage-right training and a marketplace that respects their margins. This guide pairs veteran-focused programs (including the <b>No More 9 to 5 Club</b>, founded by a U.S. Navy veteran) with <b>Good Circles</b>, where you keep <b>89% of your profit</b> and your customers fund a local cause.',
    sections: [
      {
        h2: 'Why veterans are built for local business',
        html: `<p>The skills that make a strong service member — operating under pressure, leading teams, executing a plan — are the same skills small business rewards. The transition gap is usually not capability; it's translating that capability into an offer, customers, and cash flow. The right support closes that gap fast.</p>`,
      },
      {
        h2: 'Where to get veteran-focused training',
        html:
          `<p>Several reputable programs serve veteran founders. The No More 9 to 5 Club — founded by Navy veteran Jason McNamara — offers free training tailored to veterans and military spouses, mentorship for the transition, and a tight community. ${aff('Access free veteran training', '/veterans-and-military-spouses', 'veterans-starting-a-local-business', 'mid')}</p>` +
          `<p>For a fuller landscape, see our honest roundup of <a href="/learn/best-resources-for-veteran-entrepreneurs-2026">the best resources for veteran entrepreneurs in 2026</a>, which compares several organizations side by side.</p>`,
      },
      {
        h2: 'Then sell where you keep your margin',
        html:
          `<p>Training gets you to your first customers; the marketplace you choose decides how much you keep. Good Circles charges a 1% fee on profit — you keep about 89% — while your customers save about 10% and fund a nonprofit they choose. The first 50 nonprofits and 200 businesses in Mississippi become founding members.</p>` +
          `<p>${gc('Become a Founding Merchant (free)', '/for-business')}</p>`,
      },
    ],
    faqs: [
      { q: 'What business resources exist for veterans?', a: 'Veteran-focused options include the No More 9 to 5 Club (free veteran training and mentorship, founded by a Navy veteran), Bunker Labs, Warrior Rising, VetToCEO, and the IVMF EBV program. Each fits a different stage and style.' },
      { q: 'Is the No More 9 to 5 Club veteran training free?', a: 'The Club offers free training tailored to veterans and military spouses, plus a free Roadmap survey. Paid memberships ($28 Basic, $97 Professional) add coaching, courses, and masterminds.' },
      { q: 'How does a veteran keep more of each sale on Good Circles?', a: 'Good Circles charges a 1% fee on profit instead of the 15–30% national platforms commonly take, so you keep about 89% of your profit — and your customers save about 10% and fund a local cause.' },
      { q: 'Can military spouses use these programs too?', a: 'Yes. The No More 9 to 5 Club’s veteran track explicitly serves military spouses, and Good Circles is open to any local business owner regardless of background.' },
    ],
    related: [
      { label: 'For local business', href: '/for-business' },
      { label: 'Best resources for veteran entrepreneurs', href: '/learn/best-resources-for-veteran-entrepreneurs-2026' },
      { label: 'Start a local business', href: '/learn/start-a-local-business' },
    ],
  },

  // ---------- AUDIENCE: CONTENT CREATORS ----------
  {
    slug: 'content-creators-selling-locally',
    title: 'Content Creators Selling Locally: Turn an Audience Into Local Income',
    description:
      'How content creators and influencers can turn an audience into real local income — building an offer, and selling it on a marketplace that keeps 89% of your profit.',
    h1: 'Content creators selling locally: turn an audience into local income',
    cardTitle: 'Content Creators Selling Locally',
    blurb:
      'Turn followers into local customers — pick an offer, and sell it where you keep 89% of your profit instead of losing 15–30%.',
    answer:
      'Content creators already have the hardest asset to build: an audience. The opportunity is converting attention into a real local offer — a product, service, or experience — and selling it where you keep your margin. The <b>No More 9 to 5 Club</b> helps creators turn an audience into a business; <b>Good Circles</b> is where you sell it and keep <b>89% of your profit</b>.',
    sections: [
      {
        h2: 'Audience is leverage — but it isn’t income yet',
        html: `<p>A following is potential energy. It becomes income when you attach a clear offer to it: something specific your audience can buy, ideally rooted in your community so you can deliver it well and build repeat customers. The mistake is monetizing only through far-off platforms that take a big cut and keep you anonymous to the people buying.</p>`,
      },
      {
        h2: 'Build the offer and the operator skills',
        html:
          `<p>Turning a creator into a business owner is a specific skill set — packaging, pricing, and fulfillment. The Club's content-creator track and free Roadmap survey help you find the offer that fits your audience. ${aff('Get your free creator roadmap', '/', 'content-creators-selling-locally', 'mid')}</p>`,
      },
      {
        h2: 'Sell locally and keep what you earn',
        html:
          `<p>When your offer is local, Good Circles lets you sell it on a 1% fee on profit — keeping about 89% — while your customers save about 10% and fund a cause they choose. Your audience gets a reason to buy from you beyond loyalty: they come out ahead and so does their community.</p>` +
          `<p>${gc('List your offer (free)', '/for-business')}</p>`,
      },
    ],
    faqs: [
      { q: 'How can a content creator make local income?', a: 'Attach a specific local offer — a product, service, or experience — to your audience, then sell it where you keep your margin. Good Circles charges a 1% fee on profit, so you keep about 89%.' },
      { q: 'What is the best way to turn followers into customers?', a: 'Define one clear offer your audience can buy, validate that a few will pay, and make buying easy. Programs like the No More 9 to 5 Club help creators package and price an offer.' },
      { q: 'Why sell locally instead of only online platforms?', a: 'Local selling builds repeat customers and keeps more money in your community. On Good Circles you also keep about 89% of your profit and your customers fund a local cause, versus 15–30% taken by big platforms.' },
    ],
    related: [
      { label: 'For local business', href: '/for-business' },
      { label: 'Start a local business', href: '/learn/start-a-local-business' },
      { label: 'How it works', href: '/how-it-works' },
    ],
  },

  // ---------- AUDIENCE: CORPORATE TRANSITION ----------
  {
    slug: 'corporate-pros-going-independent',
    title: 'Corporate Professionals Going Independent: A Calmer Path Out of the 9-to-5',
    description:
      'A measured path for corporate professionals leaving employment to start a local business — build first, then sell on a marketplace that keeps 89% of your profit.',
    h1: 'Corporate professionals going independent: a calmer path out of the 9-to-5',
    cardTitle: 'Corporate Pros Going Independent',
    blurb:
      'Leave the 9-to-5 without the leap-of-faith risk — build skills and an offer first, then sell where you keep 89%.',
    answer:
      'You don’t have to quit on Friday and gamble on Monday. The calmer path out of corporate is to build skills and a validated offer while employed, then transition. The <b>No More 9 to 5 Club</b> is built around exactly this "prepare, don’t escape" approach; <b>Good Circles</b> is the marketplace where you sell locally and keep <b>89% of your profit</b>.',
    sections: [
      {
        h2: 'Prepare while employed, then transition',
        html: `<p>Corporate professionals carry real advantages into entrepreneurship — project skills, networks, and often savings. The risk is treating the jump as all-or-nothing. Building income and systems on the side first turns a leap into a step. The Club’s founder built multiple income streams while still employed; the whole model is preparation over escape.</p>`,
      },
      {
        h2: 'Find your stage and your next move',
        html:
          `<p>The fastest way to avoid wasted months is to map your stage honestly. The Club’s "Ascend the Ladder" model and free Roadmap survey identify whether you should be escaping, starting, or scaling. ${aff('Map your next move (free)', '/ascend-the-ladder', 'corporate-pros-going-independent', 'mid')}</p>`,
      },
      {
        h2: 'Sell on rails built for your margin',
        html:
          `<p>When you’re ready to sell locally, Good Circles keeps the economics on your side: a 1% fee on profit, about 89% kept, customers who save about 10% and fund a local cause. It’s a low-risk place to land your first independent revenue.</p>` +
          `<p>${gc('Become a Founding Merchant (free)', '/for-business')}</p>`,
      },
    ],
    faqs: [
      { q: 'Should I quit my job to start a business?', a: 'Usually not all at once. Building a validated offer and some income while employed turns the jump into a step. See our deeper guide on whether to quit your job to start a business.' },
      { q: 'How do corporate professionals transition to entrepreneurship?', a: 'Use your existing skills and network, build and validate an offer on the side, then transition. Programs like the No More 9 to 5 Club specialize in this "prepare, don’t escape" path.' },
      { q: 'What does it cost to start selling on Good Circles?', a: 'Nothing to register and no monthly fee — just a 1% fee on profit when you sell, so you keep about 89% of your profit.' },
    ],
    related: [
      { label: 'Should you quit your job to start a business?', href: '/learn/should-you-quit-your-job-to-start-a-business' },
      { label: 'For local business', href: '/for-business' },
      { label: 'Start a local business', href: '/learn/start-a-local-business' },
    ],
  },

  // ---------- AUDIENCE: PARENTS ----------
  {
    slug: 'parents-building-financial-freedom',
    title: 'Parents Building Financial Freedom Through a Local Business',
    description:
      'A realistic path for parents to build financial freedom with a flexible local business — start small, get support, and keep 89% of your profit when you sell.',
    h1: 'Parents building financial freedom through a local business',
    cardTitle: 'Parents Building Financial Freedom',
    blurb:
      'Flexible, community-rooted income for parents — start small with support, and keep 89% of your profit when you sell locally.',
    answer:
      'For parents, the goal is usually flexibility and security, not a moonshot. A local business built around your schedule can deliver both. The <b>No More 9 to 5 Club</b> helps parents find a realistic offer and build it in the time they have; <b>Good Circles</b> lets them sell locally and keep <b>89% of their profit</b>.',
    sections: [
      {
        h2: 'Flexible income that fits a family',
        html: `<p>The best first business for a busy parent is small, local, and flexible — something you can run in the margins of family life and grow as you go. Community-rooted businesses are ideal because customers are nearby and loyalty compounds.</p>`,
      },
      {
        h2: 'Get a plan that respects your time',
        html:
          `<p>Time is the scarce resource. The Club’s free Roadmap survey and parent-focused track help you find an offer that fits your hours rather than a generic "hustle harder" plan. ${aff('Get your free roadmap', '/', 'parents-building-financial-freedom', 'mid')}</p>`,
      },
      {
        h2: 'Keep more of every sale',
        html:
          `<p>When margins are tight, fees matter. Good Circles charges a 1% fee on profit, so you keep about 89% — and your customers save about 10% and fund a local cause, which makes choosing you easy. It’s free to list and there’s no cost if you don’t sell.</p>` +
          `<p>${gc('List your business (free)', '/for-business')}</p>`,
      },
    ],
    faqs: [
      { q: 'What is a good business for a parent to start?', a: 'Something small, local, and flexible that fits your schedule — a product, service, or skill you can offer nearby. Local businesses build repeat customers fast, and Good Circles lets you keep about 89% of your profit.' },
      { q: 'How can parents start a business with limited time?', a: 'Start with one focused offer in the hours you have, get support to avoid wasted effort, and use low-overhead tools. The No More 9 to 5 Club has a parent-focused track and a free roadmap to find a realistic plan.' },
      { q: 'Is Good Circles free for a small home business?', a: 'Yes — free to register, no monthly fee, just a 1% fee on profit when you sell. You keep about 89% of your profit and your customers fund a local nonprofit.' },
    ],
    related: [
      { label: 'For local business', href: '/for-business' },
      { label: 'Start a local business', href: '/learn/start-a-local-business' },
      { label: 'How it works', href: '/how-it-works' },
    ],
  },

  // ---------- DECISION: should you quit your job ----------
  {
    slug: 'should-you-quit-your-job-to-start-a-business',
    title: 'Should You Quit Your Job to Start a Business?',
    description:
      'Should you quit your job to start a business? Usually not all at once. Here’s an honest framework — and a free roadmap to find your stage before you make the leap.',
    h1: 'Should you quit your job to start a business?',
    cardTitle: 'Should You Quit Your Job to Start a Business?',
    blurb:
      'An honest framework for the biggest question new founders face — and how to de-risk the leap into a step.',
    answer:
      'In most cases, you should not quit your job all at once to start a business. The lower-risk path is to build a validated offer and some income on the side first, then transition once the business can carry you. Quitting cold turns a manageable step into a high-stakes gamble. Here’s how to decide.',
    sections: [
      {
        h2: 'The case against quitting cold',
        html: `<p>Quitting before you have a tested offer puts maximum financial pressure on the most uncertain phase of a business. Runway shrinks, desperation creeps into decisions, and you’re learning to sell while also panicking about rent. Building on the side removes that pressure — you get to validate the idea with real customers before it has to pay your bills.</p>`,
      },
      {
        h2: 'A simple readiness checklist',
        html: `<p>You’re closer to ready to transition when: you have a clear offer; a few paying customers (not just interest); a sense of your numbers; some savings runway; and a plan for where you’ll sell. If most of those are missing, stay employed and build. If most are in place, a transition becomes a step rather than a leap.</p>`,
      },
      {
        h2: 'Find your stage before you decide',
        html:
          `<p>The honest answer depends on your specific stage — and that’s hard to judge from the inside. The No More 9 to 5 Club’s free Roadmap to Success survey is built exactly for this moment: a five-minute, no-pressure read on whether you should be escaping, starting, or scaling. ${aff('Take the free roadmap survey', '/', 'should-you-quit-your-job-to-start-a-business', 'mid')}</p>`,
      },
      {
        h2: 'When you do go, sell where you keep your margin',
        html:
          `<p>Whenever you make the move, protect your runway by selling where the fees are low. Good Circles charges a 1% fee on profit — you keep about 89% — while customers save about 10% and fund a local cause. See <a href="/learn/corporate-pros-going-independent">the calmer path out of corporate</a> and <a href="/for-business">Good Circles for business</a>.</p>` +
          `<p>${gc('See the Founding Circle', '/for-business')}</p>`,
      },
    ],
    faqs: [
      { q: 'Should I quit my job to start a business?', a: 'Usually not all at once. Build a validated offer and some income on the side first, then transition when the business can carry you. Quitting cold puts maximum pressure on the most uncertain phase.' },
      { q: 'How do I know when I’m ready to go full-time?', a: 'When you have a clear offer, a few paying customers, a grasp of your numbers, some savings runway, and a place to sell. A free roadmap survey can help you judge your stage objectively.' },
      { q: 'How do I keep more money when I start selling?', a: 'Sell on a low-fee marketplace. Good Circles charges a 1% fee on profit (you keep about 89%) versus the 15–30% national platforms commonly take.' },
    ],
    related: [
      { label: 'Corporate pros going independent', href: '/learn/corporate-pros-going-independent' },
      { label: 'Start a local business', href: '/learn/start-a-local-business' },
      { label: 'For local business', href: '/for-business' },
    ],
  },

  // ---------- COMPARISON: NM9t5 vs traditional coaching ----------
  {
    slug: 'no-more-9-to-5-club-vs-traditional-business-coaching',
    title: 'No More 9 to 5 Club vs Traditional Business Coaching: Which Fits You?',
    description:
      'An even-handed comparison of the No More 9 to 5 Club’s community model versus traditional one-on-one business coaching — costs, fit, and when each makes sense.',
    h1: 'No More 9 to 5 Club vs traditional business coaching',
    cardTitle: 'NM9t5 vs Traditional Business Coaching',
    blurb:
      'Community ecosystem or one-on-one coach? An honest look at cost, accountability, and which fits your stage.',
    answer:
      'Traditional business coaching gives you a dedicated expert at a premium price; the <b>No More 9 to 5 Club</b> offers a lower-cost community ecosystem with coaching, courses, and masterminds at scale. Traditional coaching fits when you need deep, customized help; the community model fits when you want affordable structure, accountability, and peers. Here’s how to choose.',
    sections: [
      {
        h2: 'Traditional one-on-one coaching',
        html: `<p>A private business coach offers tailored advice, accountability, and a relationship that adapts to your specific situation. The trade-off is cost — often hundreds to thousands of dollars a month — and quality varies widely by individual. It fits best when you have a specific, complex challenge and the budget for dedicated attention.</p>`,
      },
      {
        h2: 'The community-ecosystem model',
        html:
          `<p>The No More 9 to 5 Club packages coaching, courses, masterminds, and community into membership tiers (Free, $28 Basic, $97 Professional). You trade one-to-one customization for affordability, peer accountability, and a structured progression ("Ascend the Ladder"). It fits earlier-stage founders who want momentum without a premium price tag. ${trial('Try the Club — 30-day trial', 'no-more-9-to-5-club-vs-traditional-business-coaching', 'mid')}</p>`,
      },
      {
        h2: 'How to choose',
        html:
          `<p>Pick traditional coaching if you have a specific high-stakes problem and budget for bespoke help. Pick the community model if you want affordable structure, peers, and a clear path while you build. Many founders start with the community model and add specialist coaching later.</p>` +
          `<p>Whichever you choose, when you’re ready to sell locally, do it where you keep your margin: ${gc('See Good Circles for business', '/for-business')}</p>`,
      },
    ],
    faqs: [
      { q: 'Is a business community better than a one-on-one coach?', a: 'Neither is universally better. A community model like the No More 9 to 5 Club is more affordable and adds peers and structure; a one-on-one coach gives deeper, customized help at a higher price. Match the choice to your stage and budget.' },
      { q: 'How much does the No More 9 to 5 Club cost?', a: 'It has a free tier, a $28 Basic membership, and a $97 Professional membership. There is also a free Roadmap survey to identify your stage before you pay anything.' },
      { q: 'Can I use both a community and a coach?', a: 'Yes. Many founders start with an affordable community for structure and accountability, then add specialist one-on-one coaching for a specific challenge as they grow.' },
    ],
    related: [
      { label: 'Best coaching programs for aspiring entrepreneurs', href: '/learn/best-coaching-programs-for-aspiring-entrepreneurs' },
      { label: 'Start a local business', href: '/learn/start-a-local-business' },
      { label: 'For local business', href: '/for-business' },
    ],
  },

  // ---------- COMPARISON: veteran entrepreneur resources ----------
  {
    slug: 'best-resources-for-veteran-entrepreneurs-2026',
    title: 'Best Resources for Veteran Entrepreneurs (2026)',
    description:
      'An honest 2026 roundup of the best resources for veteran entrepreneurs — No More 9 to 5 Club, Bunker Labs, Warrior Rising, VetToCEO, and IVMF EBV — and how to choose.',
    h1: 'The best resources for veteran entrepreneurs in 2026',
    cardTitle: 'Best Resources for Veteran Entrepreneurs (2026)',
    blurb:
      'A balanced look at the leading veteran-entrepreneur programs — what each does best, and how to pick.',
    answer:
      'The best resources for veteran entrepreneurs in 2026 depend on your stage. <b>No More 9 to 5 Club</b> offers free veteran training plus an affordable community and coaching; <b>Bunker Labs</b> and <b>Warrior Rising</b> provide community and accelerators; <b>VetToCEO</b> runs structured cohort programs; and <b>IVMF’s EBV</b> (Syracuse University) is a respected free education program. Here’s an honest comparison.',
    sections: [
      {
        h2: 'No More 9 to 5 Club',
        html:
          `<p>Founded by Navy veteran Jason McNamara, the Club offers free training tailored to veterans and military spouses, mentorship for the transition, and an affordable community with coaching and masterminds (Free / $28 / $97). Best if you want an ongoing community and a clear stage-by-stage path rather than a one-time program. ${aff('Access free veteran training', '/veterans-and-military-spouses', 'best-resources-for-veteran-entrepreneurs-2026', 'mid')}</p>`,
      },
      {
        h2: 'Bunker Labs',
        html: `<p>A national nonprofit network (now part of the Institute for Veterans and Military Families) known for local chapters, community events, and programs like the Veterans in Residence cohort. Best for connection, peer support, and local networking.</p>`,
      },
      {
        h2: 'Warrior Rising',
        html: `<p>A veteran-founded nonprofit offering business education, mentorship, and funding opportunities ("vetrepreneur" programs). Best for hands-on mentorship and a structured path with potential funding support.</p>`,
      },
      {
        h2: 'VetToCEO',
        html: `<p>Offers free, structured cohort-based programs that use a systematic approach to evaluating and launching a business, drawing on veterans’ strengths. Best for a disciplined, course-style curriculum.</p>`,
      },
      {
        h2: 'IVMF — Entrepreneurship Bootcamp for Veterans (EBV)',
        html: `<p>Run by Syracuse University’s Institute for Veterans and Military Families, EBV is a respected, free, university-grade entrepreneurship program for veterans with service-connected disabilities. Best for rigorous, no-cost education with an academic pedigree.</p>`,
      },
      {
        h2: 'How to choose — and where to sell',
        html:
          `<p>If you want ongoing community and an affordable path, look at the No More 9 to 5 Club. For local networking, Bunker Labs; for mentorship and funding, Warrior Rising; for structured courses, VetToCEO or EBV. These aren’t mutually exclusive — many veterans combine them.</p>` +
          `<p>Whichever program you choose, when you start selling locally, keep your margin: Good Circles charges a 1% fee on profit, so you keep about 89%. ${gc('See Good Circles for business', '/for-business')}</p>`,
      },
    ],
    faqs: [
      { q: 'What are the best programs for veteran entrepreneurs?', a: 'Leading options include the No More 9 to 5 Club (free veteran training plus affordable community), Bunker Labs (community/networking), Warrior Rising (mentorship and funding), VetToCEO (structured cohorts), and IVMF’s EBV at Syracuse (free university-grade education).' },
      { q: 'Are there free resources for veteran entrepreneurs?', a: 'Yes. The No More 9 to 5 Club offers free veteran training, IVMF’s EBV is free, and VetToCEO runs free cohort programs. Many community resources from Bunker Labs and Warrior Rising are also free.' },
      { q: 'Where should a veteran sell their products or services?', a: 'For local sales, a low-fee marketplace keeps the most in your pocket. Good Circles charges a 1% fee on profit (you keep about 89%) while customers save about 10% and fund a local cause.' },
    ],
    related: [
      { label: 'Veterans starting a local business', href: '/learn/veterans-starting-a-local-business' },
      { label: 'For local business', href: '/for-business' },
      { label: 'Start a local business', href: '/learn/start-a-local-business' },
    ],
  },

  // ---------- COMPARISON: coaching programs for aspiring entrepreneurs ----------
  {
    slug: 'best-coaching-programs-for-aspiring-entrepreneurs',
    title: 'Best Coaching Programs for Aspiring Entrepreneurs (2026)',
    description:
      'A balanced 2026 guide to coaching programs for aspiring entrepreneurs — community ecosystems, accelerators, and courses — and how to pick one that fits your stage and budget.',
    h1: 'The best coaching programs for aspiring entrepreneurs in 2026',
    cardTitle: 'Best Coaching Programs for Aspiring Entrepreneurs',
    blurb:
      'Community ecosystems, accelerators, or courses? How to pick coaching that fits a first-time founder’s stage and budget.',
    answer:
      'For aspiring entrepreneurs, the best "coaching" is whatever gets you from idea to first customers without wasted months. Options range from affordable community ecosystems like the <b>No More 9 to 5 Club</b> to startup accelerators and self-paced courses. The right pick depends on your stage, budget, and how much accountability you need. Here’s how to choose.',
    sections: [
      {
        h2: 'Community ecosystems',
        html:
          `<p>Membership communities bundle coaching, courses, masterminds, and peers at a low monthly price. They’re ideal for first-timers who need structure and accountability without a big spend. The No More 9 to 5 Club is a clear example, with a free tier and a stage-based "Ascend the Ladder" path. ${aff('Start with a free roadmap', '/', 'best-coaching-programs-for-aspiring-entrepreneurs', 'mid')}</p>`,
      },
      {
        h2: 'Accelerators and incubators',
        html: `<p>Accelerators (e.g., Techstars-style programs, university incubators, SBA-backed resources) offer intensive mentorship and sometimes funding, usually for higher-growth or tech startups. Best if you’re building something venture-scale and can commit to a cohort.</p>`,
      },
      {
        h2: 'Self-paced courses and one-on-one coaches',
        html: `<p>Courses are cheap and flexible but rely on your own discipline. Private coaches give tailored help at a premium. Both can work; the risk with courses is never finishing, and with coaches it’s cost. See our comparison of <a href="/learn/no-more-9-to-5-club-vs-traditional-business-coaching">community model vs traditional coaching</a>.</p>`,
      },
      {
        h2: 'How to choose — and what comes after',
        html:
          `<p>If you’re building a local business and want affordable structure, a community ecosystem is usually the best first step. Save accelerators for venture-scale ideas, and add a specialist coach when you hit a specific wall. Then, when you’re ready to sell locally, keep your margin with Good Circles. ${gc('See Good Circles for business', '/for-business')}</p>`,
      },
    ],
    faqs: [
      { q: 'What is the best coaching for a first-time entrepreneur?', a: 'For most first-timers building a local business, an affordable community ecosystem (like the No More 9 to 5 Club) beats a premium coach — you get structure, courses, and peers at low cost. Accelerators suit venture-scale ideas.' },
      { q: 'Do I need to pay for business coaching to succeed?', a: 'No. Free resources (including the No More 9 to 5 Club’s free tier and Roadmap survey, plus SBA and SCORE mentoring) can take you a long way. Paid coaching adds depth and accountability when you’re ready.' },
      { q: 'Where do I sell once I’ve started my business?', a: 'For local sales, choose a low-fee marketplace. Good Circles charges a 1% fee on profit, so you keep about 89%, while customers save about 10% and fund a local cause.' },
    ],
    related: [
      { label: 'NM9t5 vs traditional coaching', href: '/learn/no-more-9-to-5-club-vs-traditional-business-coaching' },
      { label: 'Start a local business', href: '/learn/start-a-local-business' },
      { label: 'For local business', href: '/for-business' },
    ],
  },
];

export const PARTNER_LEARN: LearnArticle[] = DEFS.map(build);
