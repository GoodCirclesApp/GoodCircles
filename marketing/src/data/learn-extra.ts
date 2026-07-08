// Additional /learn answer pages, authored as structured content and compiled
// into the LearnArticle shape so the FAQ schema is generated from the SAME
// strings as the visible <h4>s (guaranteed verbatim match) and the body
// renders in the shared .gc-learn scope. Accuracy contract upheld throughout.
import type { LearnArticle } from './learn';
import { SITE_URL } from './site';

const PUBLISHED = '2026-06-12';
const DATELINE = 'Updated June 12, 2026 · Good Circles';

interface Section {
  h2: string;
  html: string; // inner HTML for the section body
}
interface Cta {
  h3: string;
  p: string;
  label: string;
  href: string;
}
interface Faq {
  q: string; // plain text — used verbatim for both <h4> and schema name
  a: string; // plain text answer
}
interface LearnDef {
  slug: string;
  title: string;
  description: string;
  h1: string;
  cardTitle: string;
  blurb: string;
  answer: string; // HTML, the answer-first block
  sections: Section[];
  cta: Cta;
  faqs: Faq[];
  related: { label: string; href: string }[];
}

function build(def: LearnDef): LearnArticle {
  const url = `${SITE_URL}/learn/${def.slug}/`;
  const articleHtml =
    `<div class="answer">${def.answer}</div>` +
    def.sections.map((s) => `<h2>${s.h2}</h2>${s.html}`).join('') +
    `<div class="ctabox"><h3>${def.cta.h3}</h3><p>${def.cta.p}</p>` +
    `<a class="btn btn-gold" href="${def.cta.href}">${def.cta.label}</a></div>` +
    `<h2>FAQ</h2>` +
    def.faqs.map((f) => `<div class="faq"><h4>${f.q}</h4><p>${f.a}</p></div>`).join('') +
    `<div class="related"><b>Related:</b><br>` +
    def.related.map((r) => `<a href="${r.href}">${r.label}</a>`).join('') +
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

// Shared related-link targets (all resolve to built pages).
const R = {
  amazon: { label: 'AmazonSmile alternative', href: '/amazonsmile-alternative/' },
  how: { label: 'How it works', href: '/how-it-works/' },
  shoppers: { label: 'For shoppers', href: '/shoppers/' },
  nonprofits: { label: 'For nonprofits', href: '/for-nonprofits/' },
  business: { label: 'For business', href: '/for-business/' },
  restaurants: { label: 'For restaurants', href: '/for-business/for-restaurants/' },
  compare: { label: 'Compare alternatives', href: '/compare/best-amazonsmile-alternatives/' },
  causes: { label: 'Browse causes', href: '/causes/' },
  shopLocal: { label: 'Shop local by city', href: '/shop-local/' },
  schools: { label: 'Fundraising for schools', href: '/for-nonprofits/for-schools/' },
  churches: { label: 'Fundraising for churches', href: '/for-nonprofits/for-churches/' },
  teams: { label: 'Fundraising for sports teams', href: '/for-nonprofits/for-sports-teams/' },
  learn: { label: 'Learn', href: '/learn/' },
};

const DEFS: LearnDef[] = [
  {
    slug: 'is-amazonsmile-coming-back',
    title: 'Is AmazonSmile Coming Back? (2026 Update)',
    description:
      'Is AmazonSmile coming back? No — Amazon ended it in February 2023 with no plans to return. Here’s the status and the best alternatives in 2026.',
    h1: 'Is AmazonSmile coming back?',
    cardTitle: 'Is AmazonSmile Coming Back? (2026 Update)',
    blurb: 'Amazon ended AmazonSmile in 2023 with no plans to bring it back. Here’s the status — and where shoppers and nonprofits went next.',
    answer:
      'No. Amazon shut down AmazonSmile in <b>February 2023</b> and has given no indication it will return. The program is permanently closed, and shoppers and nonprofits have moved to independent alternatives — including local-first options like Good Circles that actually save you money while you give.',
    sections: [
      {
        h2: 'Why it ended and why it isn’t returning',
        html: '<p>Amazon closed AmazonSmile during a broad round of cost-cutting in early 2023, saying donations had become too spread out to have meaningful per-charity impact. Amazon has not announced any plan to revive it, and there is no official replacement from Amazon. For practical purposes, it is gone for good.</p>',
      },
      {
        h2: 'What nonprofits and shoppers do now',
        html: '<p>The habit of giving while you shop did not disappear — the tool did. Independent platforms filled the gap. Some route a percentage of national-retailer purchases to a nonprofit; others, like <a href="/amazonsmile-alternative/">Good Circles</a>, are local-first and let you save about 10% on local purchases while a share of every sale funds a nonprofit you choose.</p>',
      },
      {
        h2: 'The better replacement',
        html: '<p>AmazonSmile gave 0.5% from Amazon purchases. Good Circles changes the math: you shop local, come out about 10% ahead, and 10% of the merchant’s profit funds your cause — at no extra cost. <a href="/compare/best-amazonsmile-alternatives/">Compare the alternatives »</a></p>',
      },
    ],
    cta: {
      h3: 'Looking for the AmazonSmile replacement?',
      p: 'Good Circles lets you shop local, save ~10%, and fund a nonprofit you choose.',
      label: 'See the AmazonSmile alternative',
      href: '/amazonsmile-alternative/',
    },
    faqs: [
      { q: 'Is AmazonSmile coming back in 2026?', a: 'No. AmazonSmile ended in February 2023 and Amazon has given no indication it will return. The program is permanently closed.' },
      { q: 'What is the best replacement for AmazonSmile?', a: 'It depends what you want. Good Circles is the only option that lets you shop local, save about 10%, and fund a nonprofit you choose. ShopRaise and iGive are strong for donations on national-retailer purchases.' },
    ],
    related: [R.amazon, R.compare, R.how],
  },
  {
    slug: 'how-does-good-circles-make-money',
    title: 'How Does Good Circles Make Money?',
    description:
      'Good Circles is free for shoppers and nonprofits. It’s funded by a 1% fee local businesses pay on profit — here’s exactly how the model works.',
    h1: 'How does Good Circles make money?',
    cardTitle: 'How Does Good Circles Make Money?',
    blurb: 'Free for shoppers and nonprofits — so how is Good Circles funded? A plain-English look at the 1% model.',
    answer:
      'Good Circles is free for shoppers and nonprofits. It’s funded by a <b>1% fee local businesses pay on profit</b> (not on the sale) — a fraction of the 15–30% big platforms take. On external "bridge" items where no local merchant carries something, about half of any affiliate commission funds a shared nonprofit pool.',
    sections: [
      {
        h2: 'The 1% fee on profit',
        html: '<p>When you buy from a local business through Good Circles, the merchant keeps 89% of their profit, 10% funds the nonprofit you chose, and Good Circles keeps a 1% fee — calculated on profit, not the full sale price. That fee is how the platform runs. If a merchant doesn’t sell, they pay nothing.</p>',
      },
      {
        h2: 'Bridge items and the shared fund',
        html: '<p>When no local merchant carries something yet, you may see a clearly labeled external option (like Amazon). Those items don’t carry the 10% shopper discount, and about half of any affiliate commission earned goes to a shared nonprofit pool through a donor-advised fund. <a href="/how-it-works/">See the full breakdown »</a></p>',
      },
      {
        h2: 'Why the model is honest by design',
        html: '<p>Because Good Circles earns a small fee on profit rather than a big cut of every sale, its incentives line up with local businesses instead of against them. Shoppers save, nonprofits get funded, and merchants keep far more than they would on a 15–30% platform.</p>',
      },
    ],
    cta: {
      h3: 'See exactly where every dollar goes',
      p: 'Good Circles publishes the full math on a local purchase — no mystery fees.',
      label: 'How it works',
      href: '/how-it-works/',
    },
    faqs: [
      { q: 'Is Good Circles free for shoppers and nonprofits?', a: 'Yes. There’s no cost to join for shoppers or nonprofits, and shoppers actually save about 10% on local purchases. Good Circles is funded by a 1% fee local businesses pay on profit.' },
      { q: 'How much does Good Circles charge businesses?', a: 'Just 1% of profit per sale — no setup, monthly, or listing fees. If a business doesn’t sell, it doesn’t pay.' },
    ],
    related: [R.how, R.business, R.amazon],
  },
  {
    slug: 'shop-local-vs-shopping-on-amazon',
    title: 'Shopping Local vs Amazon: What’s the Difference?',
    description:
      'Shopping local vs Amazon: where your money goes, what stays in your community, and how to get Amazon-like convenience while keeping dollars local.',
    h1: 'Shopping local vs Amazon: what’s the difference?',
    cardTitle: 'Shopping Local vs Amazon',
    blurb: 'Where your dollar actually goes when you buy local versus on Amazon — and how to get convenience without sending the money away.',
    answer:
      'When you buy on Amazon, most of your dollar leaves your community immediately. When you buy from a local business, a much larger share stays — supporting local jobs, taxes, and causes. Good Circles adds local-first convenience: you shop local online, <b>save about 10%</b>, and fund a nonprofit you choose.',
    sections: [
      {
        h2: 'Where the money goes',
        html: '<p>National platforms are built to move dollars out of local economies and up to shareholders. Independent businesses recirculate far more of each dollar locally — paying local staff, local suppliers, and local taxes. The difference compounds across a whole community over a year.</p>',
      },
      {
        h2: 'Convenience without the cost',
        html: '<p>The usual trade-off is convenience versus keeping it local. Good Circles is designed to remove that trade-off: a local-first marketplace where prices already run about 10% lower and a share of every sale funds a cause you pick — so the easy choice is also the local one. <a href="/shoppers/">See how it works for shoppers »</a></p>',
      },
      {
        h2: 'When there’s no local option',
        html: '<p>If no local merchant carries what you need, Good Circles still shows a clearly labeled external option so you’re never stuck — and about half of any commission on those items funds a shared nonprofit pool. <a href="/how-it-works/">More on the model »</a></p>',
      },
    ],
    cta: {
      h3: 'Shop local without giving up convenience',
      p: 'Save about 10% and fund a cause you choose — same stuff, different math.',
      label: 'For shoppers',
      href: '/shoppers/',
    },
    faqs: [
      { q: 'Is shopping local better than shopping on Amazon?', a: 'For your community, yes — far more of each dollar stays local when you buy from independent businesses. Good Circles adds local-first convenience plus about 10% savings and funding for a cause you choose.' },
      { q: 'Can I shop local online and still save money?', a: 'Yes. With Good Circles, local prices already run about 10% lower at checkout, and a share of every sale funds a nonprofit you pick — at no extra cost.' },
    ],
    related: [R.shoppers, R.amazon, R.shopLocal],
  },
  {
    slug: 'how-to-fundraise-for-a-school-without-selling',
    title: 'How to Fundraise for a School Without Selling Anything',
    description:
      'Tired of wrapping paper and cookie dough? Here’s how to fundraise for a school with no selling — recurring, no-cost ways families can support your school.',
    h1: 'How to fundraise for a school without selling anything',
    cardTitle: 'Fundraise for a School Without Selling',
    blurb: 'Retire the catalog drive. How schools raise money with no products to push and no order forms.',
    answer:
      'You can fund a school without selling anything by tapping spending families already do. With Good Circles, families shop local, <b>save about 10%</b>, and 10% of the merchant’s profit goes to your school automatically — recurring, every month, with no products to push and no order forms.',
    sections: [
      {
        h2: 'Why no-sell fundraising works better',
        html: '<p>Traditional school fundraisers ask families to buy things they don’t want so a sliver reaches the school. No-sell fundraising flips that: it captures a share of purchases families would make anyway, so participation is effortless and the funding recurs without a campaign.</p>',
      },
      {
        h2: 'How it works with Good Circles',
        html: '<p>Sign up your school or PTA free with your 501(c)(3) details, families select your school as their cause, and 10% of the merchant’s profit on every local purchase they make is routed to you each month. <a href="/for-nonprofits/for-schools/">See school fundraising »</a></p>',
      },
      {
        h2: 'What it can add up to',
        html: '<p>At about $72 per participating family per year, a school with 500 families can raise roughly $36,000 a year — recurring and unrestricted, with no events to staff. Families also save about 10%, so they come out ahead too.</p>',
      },
    ],
    cta: {
      h3: 'Start a school fundraiser that runs itself',
      p: 'No selling, no order forms — recurring funding from spending families already do.',
      label: 'Fundraising for schools',
      href: '/for-nonprofits/for-schools/',
    },
    faqs: [
      { q: 'How can a school fundraise without selling products?', a: 'Use a no-cost program like Good Circles: families shop local the way they already do, and a share of every purchase is routed to your school automatically — no products, no order forms.' },
      { q: 'Is no-sell school fundraising really free?', a: 'Yes. Good Circles is free for schools and families to join, there’s no fee on what your school receives, and families save about 10% on local purchases.' },
    ],
    related: [R.schools, R.nonprofits, R.how],
  },
  {
    slug: 'how-to-fundraise-for-a-church',
    title: 'How to Fundraise for a Church (No Events Required)',
    description:
      'How to fundraise for a church without another bake sale or special offering — recurring, no-cost ways your congregation can fund ministry by shopping local.',
    h1: 'How to fundraise for a church without events',
    cardTitle: 'How to Fundraise for a Church',
    blurb: 'Fund ministry without another bake sale or ask — recurring support from spending members already do.',
    answer:
      'You can fund a church without events or extra asks by capturing spending members already do. With Good Circles, members shop local, <b>save about 10%</b>, and 10% of the merchant’s profit goes to your church automatically each month — supporting ministry, missions, and outreach with no event to plan.',
    sections: [
      {
        h2: 'Funding without another ask',
        html: '<p>Bake sales and special offerings take real volunteer energy and ask members to give again. A no-cost shopping program funds ministry from purchases members already make, so support recurs quietly in the background without another appeal from the pulpit.</p>',
      },
      {
        h2: 'How it works',
        html: '<p>Sign up your church free with its tax-exempt details, members select your church as their cause, and a share of every local purchase they make is routed to you monthly. <a href="/for-nonprofits/for-churches/">See church fundraising »</a></p>',
      },
      {
        h2: 'A few other low-effort ideas',
        html: '<p>Pair it with simple recurring-giving tools, a shared online wish list for specific needs, and inviting local businesses in the congregation to join as merchants. The goal is steady, low-friction support rather than one big push.</p>',
      },
    ],
    cta: {
      h3: 'Support your ministry, no asks required',
      p: 'Recurring funding from spending members already do — free to join.',
      label: 'Fundraising for churches',
      href: '/for-nonprofits/for-churches/',
    },
    faqs: [
      { q: 'How can a church raise money without events?', a: 'Use a no-cost program like Good Circles: members shop local the way they already do, and a share of every purchase is routed to your church automatically each month — no events, no asks.' },
      { q: 'Does a church need 501(c)(3) status to join?', a: 'Most churches qualify as 501(c)(3) organizations automatically. If your church has an EIN and tax-exempt status, it can sign up free and start receiving recurring support.' },
    ],
    related: [R.churches, R.nonprofits, R.how],
  },
  {
    slug: 'how-to-fundraise-for-a-sports-team',
    title: 'How to Fundraise for a Sports Team (Without the Car Wash)',
    description:
      'How to fundraise for a youth sports team without car washes or selling — recurring, no-cost ways families can fund uniforms, travel, and gear.',
    h1: 'How to fundraise for a sports team without the car wash',
    cardTitle: 'How to Fundraise for a Sports Team',
    blurb: 'Fund uniforms, travel, and gear without selling or staffing a car wash.',
    answer:
      'You can fund a youth sports team without car washes or selling by capturing spending families already do. With Good Circles, team families shop local, <b>save about 10%</b>, and 10% of the merchant’s profit goes to your team automatically each month — funding uniforms, travel, and gear with no products to push.',
    sections: [
      {
        h2: 'Retire the car wash',
        html: '<p>Uniforms, tournament fees, and travel add up fast, and the usual fundraisers ask families to sell things or give up a Saturday. A no-cost shopping program funds the team from purchases families already make, so the money comes in without the hustle.</p>',
      },
      {
        h2: 'How it works',
        html: '<p>Sign up your team or booster club free with your 501(c)(3) details, families select your team as their cause, and a share of every local purchase they make is routed to you monthly. <a href="/for-nonprofits/for-sports-teams/">See team fundraising »</a></p>',
      },
      {
        h2: 'What the money can cover',
        html: '<p>The funding is recurring and unrestricted — useful for uniforms, equipment, travel, facilities, or tournament fees. Families also save about 10% on local purchases, so they come out ahead.</p>',
      },
    ],
    cta: {
      h3: 'Fund the season without the hustle',
      p: 'Recurring funding from spending families already do — free to join.',
      label: 'Fundraising for sports teams',
      href: '/for-nonprofits/for-sports-teams/',
    },
    faqs: [
      { q: 'How can a sports team fundraise without selling?', a: 'Use a no-cost program like Good Circles: families shop local the way they already do, and a share of every purchase is routed to your team automatically — no car washes, no products.' },
      { q: 'What can sports team fundraising money be used for?', a: 'Whatever the team needs — uniforms, equipment, travel, tournament fees, or facilities. With Good Circles the funding is recurring and unrestricted.' },
    ],
    related: [R.teams, R.nonprofits, R.how],
  },
  {
    slug: 'what-is-a-marketplace-facilitator',
    title: 'What Is a Marketplace Facilitator?',
    description:
      'A marketplace facilitator collects and remits sales tax on behalf of its sellers. Here’s what that means for local businesses selling on a marketplace.',
    h1: 'What is a marketplace facilitator?',
    cardTitle: 'What Is a Marketplace Facilitator?',
    blurb: 'The sales-tax term every online seller should understand — explained simply, and why it helps local merchants.',
    answer:
      'A marketplace facilitator is a platform that collects and remits sales tax on behalf of the businesses that sell through it. Instead of each merchant tracking and filing tax for marketplace sales, the platform handles it. Good Circles acts as the marketplace facilitator for its merchants’ sales.',
    sections: [
      {
        h2: 'Why it exists',
        html: '<p>Most U.S. states have marketplace-facilitator laws requiring the platform — not the individual seller — to collect and remit sales tax on sales made through it. The aim is simpler compliance and consistent tax collection across many small sellers.</p>',
      },
      {
        h2: 'What it means for a local business',
        html: '<p>For a small merchant, it removes a real burden: you don’t have to calculate, collect, or file sales tax on your marketplace orders — the platform does it for you. That’s one less piece of overhead to manage. <a href="/for-business/">See how Good Circles works for business »</a></p>',
      },
      {
        h2: 'How Good Circles handles it',
        html: '<p>Good Circles collects and remits sales tax on your Good Circles sales as the marketplace facilitator, so you can focus on running your business. Combined with a 1% fee on profit, it’s built to take work off local merchants, not pile it on.</p>',
      },
    ],
    cta: {
      h3: 'Sell local without the tax headache',
      p: 'Good Circles collects and remits sales tax on your sales as the marketplace facilitator.',
      label: 'For business',
      href: '/for-business/',
    },
    faqs: [
      { q: 'What does a marketplace facilitator do?', a: 'It collects and remits sales tax on behalf of the businesses selling through the platform, so individual sellers don’t have to handle tax on their marketplace orders.' },
      { q: 'Does Good Circles handle sales tax for merchants?', a: 'Yes. Good Circles acts as the marketplace facilitator and collects and remits sales tax on your Good Circles sales for you.' },
    ],
    related: [R.business, R.restaurants, R.how],
  },
  {
    slug: 'how-do-online-marketplaces-work',
    title: 'How Do Online Marketplaces Work?',
    description:
      'How do online marketplaces work, how do they make money, and what makes a community marketplace different? A plain-English explainer.',
    h1: 'How do online marketplaces work?',
    cardTitle: 'How Do Online Marketplaces Work?',
    blurb: 'The mechanics behind Amazon, Etsy, and the rest — and how a community marketplace flips the model.',
    answer:
      'An online marketplace connects many sellers with many buyers on one platform, handling discovery, checkout, and payments, and taking a cut of each sale. Most charge 15–30%. A community marketplace like Good Circles keeps the structure but charges a 1% fee on profit and routes value back to the local economy.',
    sections: [
      {
        h2: 'The basic mechanics',
        html: '<p>A marketplace provides the storefront, search, payments, and trust layer so individual sellers don’t each have to build their own. In exchange, it takes a commission on each sale. The bigger the platform’s leverage, the larger the cut it can charge.</p>',
      },
      {
        h2: 'How marketplaces make money',
        html: '<p>Most marketplaces earn a percentage of every transaction — commonly 15–30% — plus listing or payment fees. That’s efficient for the platform but expensive for small sellers operating on thin margins. <a href="/learn/how-does-good-circles-make-money/">See how Good Circles is funded »</a></p>',
      },
      {
        h2: 'What a community marketplace changes',
        html: '<p>A community marketplace keeps the convenience but realigns the economics: merchants keep 89% of profit on a 1% fee, shoppers save about 10%, and a share of every sale funds a local nonprofit. <a href="/learn/what-is-a-community-marketplace/">More on community marketplaces »</a></p>',
      },
    ],
    cta: {
      h3: 'A marketplace built for local',
      p: 'Same convenience, different economics — see how the money moves.',
      label: 'How it works',
      href: '/how-it-works/',
    },
    faqs: [
      { q: 'How do online marketplaces make money?', a: 'Most take a commission on every sale — commonly 15–30% — plus listing or payment fees. Good Circles instead charges a 1% fee on profit.' },
      { q: 'What makes a community marketplace different?', a: 'A community marketplace keeps the convenience of an online marketplace but routes value locally: merchants keep 89% of profit, shoppers save about 10%, and a share of every sale funds a local nonprofit.' },
    ],
    related: [R.how, R.business, R.amazon],
  },
  {
    slug: 'the-economic-impact-of-shopping-local',
    title: 'The Economic Impact of Shopping Local',
    description:
      'Why shopping local matters for your community’s economy — how more of each dollar recirculates locally, and an easy way to keep even more of it home.',
    h1: 'The economic impact of shopping local',
    cardTitle: 'The Economic Impact of Shopping Local',
    blurb: 'How much of your dollar stays in the community when you buy local — and a simple way to keep more of it home.',
    answer:
      'When you buy from independent local businesses, a larger share of each dollar recirculates in your community — through local wages, local suppliers, and local taxes — than when you buy from a national chain. Good Circles is built to keep even more of it local, while saving you about 10%.',
    sections: [
      {
        h2: 'The local multiplier',
        html: '<p>Studies of local spending generally find that independent businesses recirculate more of each dollar within their community than national chains do, because they’re more likely to use local suppliers, services, and staff. Shift some spending local and that effect compounds across a whole town over a year.</p>',
      },
      {
        h2: 'Where chain dollars go',
        html: '<p>At a national chain or big app, most of your dollar leaves the moment you pay — heading to distant suppliers, corporate overhead, and shareholders. Little of it loops back into the place you live.</p>',
      },
      {
        h2: 'Keeping more of it home',
        html: '<p>Good Circles is designed to maximize what stays local: you save about 10%, the local business keeps 89% of its profit, and 10% of that profit funds a local nonprofit. <a href="/learn/why-shopping-local-matters/">Why shopping local matters »</a></p>',
      },
    ],
    cta: {
      h3: 'Keep more of every dollar in your community',
      p: 'Shop local, save about 10%, and fund a local cause — automatically.',
      label: 'For shoppers',
      href: '/shoppers/',
    },
    faqs: [
      { q: 'Why does shopping local help the economy?', a: 'Independent local businesses tend to recirculate more of each dollar in the community — through local wages, suppliers, and taxes — so shifting spending local strengthens the local economy.' },
      { q: 'How does Good Circles keep more money local?', a: 'You save about 10%, the local business keeps 89% of its profit on a 1% fee, and 10% of that profit funds a local nonprofit you choose — so more of every dollar stays in your community.' },
    ],
    related: [R.shoppers, R.shopLocal, R.how],
  },
  {
    slug: 'how-to-support-local-restaurants',
    title: 'How to Support Local Restaurants',
    description:
      'Practical ways to support local restaurants — and how to help them keep more of every order instead of losing 15–30% to delivery apps.',
    h1: 'How to support local restaurants',
    cardTitle: 'How to Support Local Restaurants',
    blurb: 'Beyond just eating out — how to order so your favorite local kitchen actually keeps the money.',
    answer:
      'The best way to support local restaurants is to order in ways that let them keep more of each sale. Ordering direct or through a low-fee marketplace beats the delivery apps, which commonly take 15–30% per order. Good Circles charges restaurants a 1% fee on profit while customers save about 10%.',
    sections: [
      {
        h2: 'Order so the restaurant keeps more',
        html: '<p>A 30% commission on a thin-margin order can erase a restaurant’s profit on that ticket. Ordering directly from the restaurant, picking up instead of using a third-party courier, or using a low-fee marketplace all leave more money with the people who cooked your food.</p>',
      },
      {
        h2: 'Other ways to help',
        html: '<p>Buy gift cards, leave reviews, tip well, and tell friends. Consistent, direct support is what keeps a neighborhood kitchen open — more than an occasional splurge through a high-fee app.</p>',
      },
      {
        h2: 'A low-fee option that gives back',
        html: '<p>Good Circles is a local marketplace where restaurants pay a 1% fee on profit instead of 15–30%, and customers save about 10% and fund a local cause. <a href="/for-business/for-restaurants/">See it for restaurants »</a></p>',
      },
    ],
    cta: {
      h3: 'Help local restaurants keep what they earn',
      p: 'A 1% fee on profit instead of the delivery apps’ 15–30%.',
      label: 'For restaurants',
      href: '/for-business/for-restaurants/',
    },
    faqs: [
      { q: 'What is the best way to support a local restaurant?', a: 'Order in ways that let them keep more of each sale — directly, by pickup, or through a low-fee marketplace — rather than through delivery apps that commonly take 15–30% per order.' },
      { q: 'Do delivery apps hurt local restaurants?', a: 'High per-order commissions, commonly 15–30%, can erase a restaurant’s profit on thin-margin orders. Lower-fee options like Good Circles (1% of profit) leave far more with the restaurant.' },
    ],
    related: [R.restaurants, R.business, R.shoppers],
  },
  {
    slug: 'alternatives-to-doordash-for-restaurants',
    title: 'Alternatives to DoorDash for Restaurants',
    description:
      'Looking for alternatives to DoorDash and the delivery apps? Here are lower-fee ways for restaurants to sell online and keep more of every order.',
    h1: 'Alternatives to DoorDash for restaurants',
    cardTitle: 'Alternatives to DoorDash for Restaurants',
    blurb: 'Lower-fee ways for restaurants to sell online without handing over 15–30% of every order.',
    answer:
      'Alternatives to DoorDash for restaurants include direct online ordering, commission-free or low-fee ordering platforms, and local marketplaces. The goal is to avoid the 15–30% per-order commissions the big apps charge. Good Circles charges restaurants a 1% fee on profit while customers save about 10%.',
    sections: [
      {
        h2: 'Direct and commission-free ordering',
        html: '<p>Setting up direct online ordering on your own site — or using a flat-fee or commission-free ordering tool — keeps the most money in house. It takes a little setup, but it removes the per-order cut entirely on those sales.</p>',
      },
      {
        h2: 'Low-fee local marketplaces',
        html: '<p>A local marketplace gives you discovery and checkout without the big-app commission. Good Circles charges a 1% fee on profit instead of 15–30%, collects and remits sales tax for you, and brings customers who save about 10% and fund a local cause. <a href="/for-business/for-restaurants/">See it for restaurants »</a></p>',
      },
      {
        h2: 'How to choose',
        html: '<p>Weigh the per-order fee, payout speed, and whether the platform handles tax. For thin-margin orders, the commission rate is usually the single biggest factor in what you actually take home.</p>',
      },
    ],
    cta: {
      h3: 'Keep more of every order',
      p: 'A 1% fee on profit, sales tax handled, customers who save and give.',
      label: 'For restaurants',
      href: '/for-business/for-restaurants/',
    },
    faqs: [
      { q: 'What are the alternatives to DoorDash for restaurants?', a: 'Direct online ordering, commission-free or low-fee ordering tools, and local marketplaces. Each avoids the 15–30% per-order commission the big delivery apps charge.' },
      { q: 'How much does Good Circles charge restaurants?', a: 'A 1% fee on profit per sale — no setup, monthly, or per-order commission. Good Circles also collects and remits sales tax on your sales for you.' },
    ],
    related: [R.restaurants, R.business, R.how],
  },
  {
    slug: 'how-much-do-delivery-apps-charge-restaurants',
    title: 'How Much Do Delivery Apps Charge Restaurants?',
    description:
      'How much do delivery apps charge restaurants? Commissions commonly run 15–30% per order. Here’s what that means for margins and lower-fee options.',
    h1: 'How much do delivery apps charge restaurants?',
    cardTitle: 'How Much Do Delivery Apps Charge Restaurants?',
    blurb: 'The real cost of the delivery apps to a local kitchen — and why the commission rate is what matters most.',
    answer:
      'Delivery apps commonly charge restaurants <b>15–30% per order</b> in commissions, plus additional fees. On thin-margin orders, that can erase the restaurant’s profit. Lower-fee options exist: Good Circles charges restaurants a 1% fee on profit while customers still save about 10%.',
    sections: [
      {
        h2: 'What the fees look like',
        html: '<p>Third-party delivery commissions are commonly reported in the 15–30% range per order, and that’s before extra service or marketing fees. Because restaurant margins are often in the single digits, a large commission can turn a sale into a loss.</p>',
      },
      {
        h2: 'Why it matters so much',
        html: '<p>For a kitchen, the commission rate is usually the single biggest driver of what it actually takes home from an online order. Cutting that rate does more for the bottom line than almost any other change.</p>',
      },
      {
        h2: 'A lower-fee path',
        html: '<p>Good Circles charges a 1% fee on profit instead of a big cut of the sale, handles sales tax as the marketplace facilitator, and brings customers who save about 10% and fund a local cause. <a href="/for-business/for-restaurants/">See it for restaurants »</a></p>',
      },
    ],
    cta: {
      h3: 'Pay 1% of profit, not 30% of the sale',
      p: 'Keep far more of every order — and turn customers into community funders.',
      label: 'For restaurants',
      href: '/for-business/for-restaurants/',
    },
    faqs: [
      { q: 'How much commission do delivery apps take from restaurants?', a: 'Commissions commonly run 15–30% per order, plus additional fees — which on thin-margin orders can erase the restaurant’s profit.' },
      { q: 'Is there a cheaper alternative for restaurants?', a: 'Yes. Good Circles charges restaurants a 1% fee on profit instead of 15–30% of the sale, and handles sales tax for them.' },
    ],
    related: [R.restaurants, R.business, R.compare],
  },
  {
    slug: 'how-to-choose-a-nonprofit-to-support',
    title: 'How to Choose a Nonprofit to Support',
    description:
      'How to choose a nonprofit to support — practical questions to ask, how to verify a charity, and an easy way to fund the one you pick every time you shop.',
    h1: 'How to choose a nonprofit to support',
    cardTitle: 'How to Choose a Nonprofit to Support',
    blurb: 'Simple questions to pick a cause with confidence — and a way to fund it without spending extra.',
    answer:
      'To choose a nonprofit to support, start with the cause you care about, confirm the organization is a verified 501(c)(3), and check that it’s transparent about its work. With Good Circles you can then fund the nonprofit you pick automatically — a share of every local purchase, at no extra cost.',
    sections: [
      {
        h2: 'Start with the cause, then the organization',
        html: '<p>Pick the issue that matters most to you — hunger, education, animal rescue, your local school — then find a reputable organization working on it. Local groups are often easy to verify and easy to see results from. <a href="/causes/">Browse causes »</a></p>',
      },
      {
        h2: 'Verify and vet',
        html: '<p>Confirm the organization is an IRS-verified 501(c)(3), look for clear information about its programs and impact, and prefer groups that are transparent about how money is used. Good Circles only allows verified 501(c)(3)s to receive funding.</p>',
      },
      {
        h2: 'Fund it without spending extra',
        html: '<p>Once you’ve chosen, you don’t need to write a big check. With Good Circles, a share of every local purchase you make funds your nonprofit automatically — and you save about 10%. <a href="/how-it-works/">See how it works »</a></p>',
      },
    ],
    cta: {
      h3: 'Fund the cause you choose, automatically',
      p: 'Pick any verified 501(c)(3) and a share of every local purchase funds it.',
      label: 'Browse causes',
      href: '/causes/',
    },
    faqs: [
      { q: 'How do I choose a nonprofit to support?', a: 'Start with the cause you care about, confirm the organization is a verified 501(c)(3), and prefer groups that are transparent about their programs and impact.' },
      { q: 'Can I fund a nonprofit without donating money directly?', a: 'Yes. With Good Circles, a share of every local purchase you make funds the nonprofit you choose automatically — and you save about 10%, at no extra cost.' },
    ],
    related: [R.causes, R.shoppers, R.how, { label: 'How to choose a LOCAL nonprofit', href: '/learn/how-to-choose-a-local-nonprofit/' }],
  },
  {
    slug: 'how-to-support-nonprofits-for-free',
    title: 'How to Support Nonprofits for Free',
    description:
      'How to support nonprofits for free — practical ways to help causes you care about without donating money, including funding them every time you shop.',
    h1: 'How to support nonprofits for free',
    cardTitle: 'How to Support Nonprofits for Free',
    blurb: 'Help the causes you care about without opening your wallet — including funding them when you shop.',
    answer:
      'You can support nonprofits for free by volunteering, sharing their work, donating goods, and — newer — funding them through everyday shopping. With Good Circles, a share of every local purchase funds the nonprofit you choose at no extra cost, and you save about 10%.',
    sections: [
      {
        h2: 'Time, voice, and goods',
        html: '<p>Volunteering, amplifying a nonprofit’s message, and donating usable goods all help meaningfully without costing you money. For many small organizations, consistent volunteers and word-of-mouth are as valuable as cash.</p>',
      },
      {
        h2: 'Fund them by shopping',
        html: '<p>The newest no-cost option is to route a share of spending you already do. With Good Circles you pick a nonprofit once, and 10% of the merchant’s profit on every local purchase you make funds it — automatically, while you save about 10%. <a href="/shoppers/">See it for shoppers »</a></p>',
      },
      {
        h2: 'Why it adds up',
        html: '<p>A few dollars per purchase sounds small, but across a whole community it can mean tens of thousands a year for local causes — with no one spending more than they already would.</p>',
      },
    ],
    cta: {
      h3: 'Support a cause without spending extra',
      p: 'Fund the nonprofit you choose every time you shop local — and save about 10%.',
      label: 'For shoppers',
      href: '/shoppers/',
    },
    faqs: [
      { q: 'Can I support a nonprofit without donating money?', a: 'Yes — volunteer, share their work, donate goods, or fund them through everyday shopping. With Good Circles, a share of every local purchase funds the nonprofit you choose at no extra cost.' },
      { q: 'How does funding a nonprofit by shopping work?', a: 'You pick a nonprofit once in Good Circles, and 10% of the merchant’s profit on every local purchase you make is routed to it automatically — while you save about 10%.' },
    ],
    related: [R.shoppers, R.nonprofits, R.causes],
  },
  {
    slug: 'what-does-shop-small-mean',
    title: 'What Does "Shop Small" Mean?',
    description:
      'What does "shop small" mean, where did it come from, and how can you shop small year-round? A quick explainer plus an easy way to do it online.',
    h1: 'What does "shop small" mean?',
    cardTitle: 'What Does "Shop Small" Mean?',
    blurb: 'The phrase behind Small Business Saturday — what it means, and how to do it all year, online.',
    answer:
      '"Shop small" means choosing small, independent, locally owned businesses over large national chains. It rose to prominence with Small Business Saturday. The idea is to keep more of your spending in your community. Good Circles makes it easy year-round — shop small online, save about 10%, and fund a local cause.',
    sections: [
      {
        h2: 'Where it comes from',
        html: '<p>"Shop small" was popularized by Small Business Saturday, held the weekend after Thanksgiving to encourage people to support local independent businesses. The phrase has since become shorthand for choosing local over chain all year.</p>',
      },
      {
        h2: 'Why it matters',
        html: '<p>Small, independent businesses recirculate more of each dollar locally and give a community its character. Shopping small keeps neighborhoods vibrant and local jobs intact. <a href="/learn/the-economic-impact-of-shopping-local/">See the economic impact »</a></p>',
      },
      {
        h2: 'How to shop small year-round',
        html: '<p>You don’t have to wait for one Saturday. Good Circles is a local-first marketplace where you can shop small online, save about 10%, and fund a local nonprofit with every purchase. <a href="/shop-local/">Shop local by city »</a></p>',
      },
    ],
    cta: {
      h3: 'Shop small, all year',
      p: 'A local-first marketplace where shopping small also saves you about 10%.',
      label: 'Shop local by city',
      href: '/shop-local/',
    },
    faqs: [
      { q: 'What does it mean to shop small?', a: 'It means choosing small, independent, locally owned businesses over large national chains, to keep more of your spending in your community.' },
      { q: 'How can I shop small online?', a: 'Use a local-first marketplace like Good Circles: you shop independent local businesses online, save about 10%, and a share of every purchase funds a local nonprofit.' },
    ],
    related: [R.shopLocal, R.shoppers, R.how],
  },
  {
    slug: 'how-to-start-a-fundraiser-for-your-nonprofit',
    title: 'How to Start a Fundraiser for Your Nonprofit',
    description:
      'How to start a fundraiser for your nonprofit — a simple step-by-step, plus a no-cost, recurring option that funds you every time supporters shop.',
    h1: 'How to start a fundraiser for your nonprofit',
    cardTitle: 'How to Start a Fundraiser for Your Nonprofit',
    blurb: 'A simple step-by-step — and a recurring option that earns money with no event to run.',
    answer:
      'To start a fundraiser for your nonprofit: set a clear goal, choose a fundraising method, tell a compelling story, make giving easy, and thank supporters. For ongoing revenue with no event, add a no-cost shopping fundraiser like Good Circles, where supporters fund you every time they shop local.',
    sections: [
      {
        h2: 'The basic steps',
        html: '<p>Set a specific, time-bound goal; pick a method that fits your supporters; tell a concrete story about the impact a gift makes; remove friction from giving; and thank donors promptly. Clarity and ease drive most of a campaign’s results.</p>',
      },
      {
        h2: 'Add a recurring, no-cost stream',
        html: '<p>Events and appeals are spiky. A no-cost shopping fundraiser adds steady, recurring revenue: supporters pick your nonprofit once, and a share of every local purchase they make funds you each month. <a href="/for-nonprofits/">See passive fundraising »</a></p>',
      },
      {
        h2: 'Why recurring matters',
        html: '<p>Predictable monthly income is far easier to plan around than one-off pushes. At about $72 per supporter per year, 500 supporters can mean roughly $36,000 a year — with no campaign to run. <a href="/learn/what-is-passive-fundraising/">What is passive fundraising? »</a></p>',
      },
    ],
    cta: {
      h3: 'Add a fundraiser that runs itself',
      p: 'Recurring, no-cost funding every time your supporters shop local.',
      label: 'For nonprofits',
      href: '/for-nonprofits/',
    },
    faqs: [
      { q: 'How do I start a fundraiser for my nonprofit?', a: 'Set a clear goal, choose a method, tell a compelling impact story, make giving easy, and thank supporters. Add a recurring no-cost option like a shopping fundraiser for steady income.' },
      { q: 'What is the easiest fundraiser to run?', a: 'A no-cost shopping fundraiser is among the easiest: supporters pick your nonprofit once, and a share of every local purchase they make funds you automatically — no event to organize.' },
    ],
    related: [R.nonprofits, R.amazon, R.how],
  },
  {
    slug: 'cash-back-vs-giving-back',
    title: 'Cash Back vs Giving Back: Can You Do Both?',
    description:
      'Cash back vs giving back — what’s the difference, and is there a way to do both at once? How Good Circles lets you save and fund a cause on the same purchase.',
    h1: 'Cash back vs giving back: can you do both?',
    cardTitle: 'Cash Back vs Giving Back',
    blurb: 'Most programs make you pick one. Here’s how to save money and fund a cause on the same purchase.',
    answer:
      'Cash-back programs put money back in your pocket; give-back programs send a share to charity. Most make you choose one. Good Circles does both at once: you <b>save about 10%</b> on local purchases <em>and</em> a share of every sale funds a nonprofit you choose — at no extra cost.',
    sections: [
      {
        h2: 'The usual trade-off',
        html: '<p>Cash-back apps reward you but don’t help a cause. Give-back programs help a cause but don’t lower your price — you’re donating a slice of the purchase. Historically you picked one or the other.</p>',
      },
      {
        h2: 'Save and give on the same purchase',
        html: '<p>Good Circles removes the trade-off. Because it restructures a local sale rather than skimming a national one, you come out about 10% ahead and a nonprofit you choose gets 10% of the merchant’s profit. <a href="/learn/save-money-and-give-to-charity/">Save money and give to charity »</a></p>',
      },
      {
        h2: 'Why it’s possible',
        html: '<p>The giving comes from the merchant’s profit, not your wallet, and the merchant still keeps far more than they would on a 15–30% platform. Everyone in the transaction comes out ahead. <a href="/how-it-works/">See the math »</a></p>',
      },
    ],
    cta: {
      h3: 'Save and give — on the same purchase',
      p: 'About 10% off local purchases, and a local cause funded, at no extra cost.',
      label: 'For shoppers',
      href: '/shoppers/',
    },
    faqs: [
      { q: 'What is the difference between cash back and giving back?', a: 'Cash back returns money to you; giving back sends a share of your purchase to charity. Most programs offer one or the other.' },
      { q: 'Can I save money and give to charity at the same time?', a: 'Yes, with Good Circles. You save about 10% on local purchases and a share of every sale funds a nonprofit you choose — the giving comes from the merchant’s profit, not your pocket.' },
    ],
    related: [R.shoppers, R.amazon, R.how],
  },
  {
    slug: 'how-to-find-local-businesses-near-you',
    title: 'How to Find Local Businesses Near You',
    description:
      'How to find local businesses near you and shop them online — practical tips, plus a local-first marketplace that saves you about 10% and funds a cause.',
    h1: 'How to find local businesses near you',
    cardTitle: 'How to Find Local Businesses Near You',
    blurb: 'Ways to discover the independents around you — and shop them online without sending money away.',
    answer:
      'To find local businesses near you, use local directories, maps, chamber and "shop local" listings, and word of mouth. To shop them online and keep money local, use a local-first marketplace like Good Circles — where you save about 10% and fund a local nonprofit with every purchase.',
    sections: [
      {
        h2: 'Where to look',
        html: '<p>Start with map searches, local business directories, your chamber of commerce, neighborhood groups, and "shop local" guides. Farmers markets and local events are great for discovering makers and small shops you won’t find on a big platform.</p>',
      },
      {
        h2: 'Shop them online',
        html: '<p>Discovery is only half of it — buying local online is what keeps money home. Good Circles brings local businesses onto one local-first marketplace so you can find and support them in one place. <a href="/shop-local/">Shop local by city »</a></p>',
      },
      {
        h2: 'Get more for doing it',
        html: '<p>On Good Circles, choosing local also saves you about 10% and funds a nonprofit you pick — so the local option is also the rewarding one. <a href="/shoppers/">See it for shoppers »</a></p>',
      },
    ],
    cta: {
      h3: 'Find and shop local in one place',
      p: 'A local-first marketplace that saves you about 10% and funds a local cause.',
      label: 'Shop local by city',
      href: '/shop-local/',
    },
    faqs: [
      { q: 'How do I find local businesses near me?', a: 'Use map searches, local directories, your chamber of commerce, neighborhood groups, and "shop local" guides — and discover makers at farmers markets and local events.' },
      { q: 'How can I shop local businesses online?', a: 'Use a local-first marketplace like Good Circles, which brings local businesses onto one platform where you save about 10% and fund a local nonprofit with every purchase.' },
    ],
    related: [R.shopLocal, R.shoppers, R.how],
  },
  {
    slug: 'ways-to-give-back-to-your-community',
    title: 'Ways to Give Back to Your Community',
    description:
      'Practical ways to give back to your community — from volunteering to shopping local — including a no-cost way to fund a local cause every time you shop.',
    h1: 'Ways to give back to your community',
    cardTitle: 'Ways to Give Back to Your Community',
    blurb: 'From volunteering to spending — practical ways to strengthen the place you live, including some that cost nothing.',
    answer:
      'You can give back to your community by volunteering, donating, supporting local businesses, and mentoring. A newer, no-cost way is to fund a local cause through everyday shopping — with Good Circles, a share of every local purchase funds a nonprofit you choose, and you save about 10%.',
    sections: [
      {
        h2: 'Give time and skills',
        html: '<p>Volunteering, mentoring, serving on a board, or lending a professional skill are some of the highest-impact ways to give back — and they cost nothing but time. Local nonprofits almost always need reliable hands more than anything.</p>',
      },
      {
        h2: 'Spend in ways that help',
        html: '<p>Where you spend is a form of giving back. Choosing local independents keeps dollars and jobs in the community. Good Circles takes it further: a share of every local purchase funds a nonprofit you choose. <a href="/causes/">Browse causes »</a></p>',
      },
      {
        h2: 'Make it effortless',
        html: '<p>The easiest giving is the kind that fits your routine. With Good Circles you pick a cause once and fund it automatically every time you shop — while saving about 10%. <a href="/how-it-works/">See how it works »</a></p>',
      },
    ],
    cta: {
      h3: 'Give back just by shopping local',
      p: 'Fund a local cause every time you shop — and save about 10%.',
      label: 'Browse causes',
      href: '/causes/',
    },
    faqs: [
      { q: 'What are some ways to give back to my community?', a: 'Volunteer, mentor, donate, and support local businesses. A newer no-cost option is to fund a local cause through everyday shopping with a program like Good Circles.' },
      { q: 'How can I give back without spending extra money?', a: 'Volunteer your time, or use Good Circles — a share of every local purchase you already make funds a nonprofit you choose, at no extra cost, while you save about 10%.' },
    ],
    related: [R.causes, R.shoppers, R.nonprofits],
  },
  {
    slug: 'best-passive-fundraising-ideas-for-nonprofits',
    title: 'Best Passive Fundraising Ideas for Nonprofits',
    description:
      'The best passive fundraising ideas for nonprofits — low-effort, recurring revenue streams, including a no-cost shopping fundraiser that runs itself.',
    h1: 'Best passive fundraising ideas for nonprofits',
    cardTitle: 'Best Passive Fundraising Ideas for Nonprofits',
    blurb: 'Low-effort, recurring revenue streams for small nonprofits — ranked for effort versus payoff.',
    answer:
      'The best passive fundraising ideas for nonprofits are low-effort, recurring streams: recurring-giving programs, shopping fundraisers, employer matching, and legacy gifts. A standout is a no-cost shopping fundraiser like Good Circles, where supporters fund you every time they shop local — automatically, every month.',
    sections: [
      {
        h2: 'Recurring giving',
        html: '<p>Monthly-donor programs turn one-time gifts into predictable income. They take some setup, but a small base of recurring donors can stabilize a budget more than any single event.</p>',
      },
      {
        h2: 'Shopping fundraisers',
        html: '<p>A shopping fundraiser earns money from spending supporters already do — no products to sell. With Good Circles, supporters pick your nonprofit once and 10% of the merchant’s profit on their local purchases funds you each month. <a href="/for-nonprofits/">See passive fundraising »</a></p>',
      },
      {
        h2: 'Matching gifts and legacy giving',
        html: '<p>Employer gift-matching doubles donations at no cost to the donor, and planned or legacy giving builds long-term support. Both are low-effort once you make supporters aware of them. <a href="/learn/how-small-nonprofits-raise-money-without-grants/">More ways to raise money »</a></p>',
      },
    ],
    cta: {
      h3: 'Add the fundraiser that runs itself',
      p: 'Recurring, no-cost funding every time your supporters shop local.',
      label: 'For nonprofits',
      href: '/for-nonprofits/',
    },
    faqs: [
      { q: 'What is the best passive fundraising idea for a nonprofit?', a: 'A no-cost shopping fundraiser is among the best: supporters pick your nonprofit once and a share of every local purchase they make funds you automatically each month, with no event to run.' },
      { q: 'Does passive fundraising actually work?', a: 'Yes, in aggregate. At about $72 per supporter per year, a few hundred engaged supporters can generate tens of thousands of dollars annually — recurring, with little ongoing effort.' },
    ],
    related: [R.nonprofits, R.amazon, R.schools],
  },
];

export const EXTRA_LEARN: LearnArticle[] = DEFS.map(build);
