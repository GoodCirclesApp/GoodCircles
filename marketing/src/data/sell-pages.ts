// Per-competitor content for the data-driven /sell/[competitor] route.
// One entry per competitor that fits the percentage-fee model (the win /
// depends / redistribution tiers in sell-competitors.ts). DoorDash, Etsy, and
// Groupon are hand-built static pages and are intentionally NOT in this map
// (a dynamic route + a static file at the same path would collide).
//
// Lead-generation platforms (Thumbtack, Angi) and subscription/booking
// platforms (Upwork, Vagaro, StyleSeat, Booksy) need a different calculator
// model (cost-per-lead × close-rate, or subscription + new-client fees) — they
// are a separate follow-up, not part of this percentage-fee batch.

export interface SellPageFaq {
  q: string;
  a: string;
}
export interface SellPage {
  key: string; // must match a COMPETITORS key in sell-competitors.ts
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  answerHtml: string;
  example: { price: number; cogs: number; mkt: number }; // worked example + competitor ad-spend %
  compCustomerPays: string; // what the customer pays on the competitor
  intro: { h2: string; p1: string; p2Html: string };
  faqs: SellPageFaq[];
}

export const SELL_PAGES: SellPage[] = [
  {
    key: "ubereats",
    title: "Uber Eats Fee Alternative for Restaurants (2026) · Good Circles",
    description:
      "Uber Eats charges 20-30% commission per order. Good Circles takes a 1% fee on profit, customers save ~10%, and every order funds a local nonprofit. The 2026 comparison.",
    eyebrow: "Switch from the delivery apps",
    h1: "Uber Eats takes 20-30% per order. Good Circles takes 1% of profit.",
    answerHtml:
      "Uber Eats charges <strong>20-30%</strong> of every Marketplace order (the Lite tier rose to 20% in 2026) and marks your menu up to the customer on top of it. Good Circles charges a <strong>1% fee on profit</strong>, so you keep about <strong>89% of your profit</strong> while your customer <strong>saves ~10%</strong> and a local nonprofit gets funded. No ad spend, no merchant card cost. Free to join.",
    example: { price: 100, cogs: 30, mkt: 0 },
    compCustomerPays: "$100+ (markup + fees)",
    intro: {
      h2: "A fifth to a third of every order, gone",
      p1: "Uber Eats positions its commission as the cost of reach, but on a thin-margin restaurant ticket, handing over 20-30% can turn a profitable order into a break-even one - and the customer pays a marked-up menu plus delivery and service fees, so the person ordering loses too.",
      p2Html:
        "Good Circles is the opposite arrangement: the platform takes 1% of profit, your customer saves about 10%, and a local nonprofit your customer chose gets funded with every order. Same kitchen, different rails - and the value stays in your community. See the full field on <a href=\"/sell/marketplace-fees-comparison/\" class=\"font-bold underline\" style=\"color:#7851A9\">the full marketplace comparison &raquo;</a>",
    },
    faqs: [
      { q: "How much does Good Circles cost compared to Uber Eats?", a: "Uber Eats charges 20-30% of each Marketplace order by plan (Lite 20% / Plus 25% / Premium 30%). Good Circles charges a 1% fee on profit - no ad spend, no merchant card cost, and no monthly or listing fees. If you don't sell, you don't pay." },
      { q: "Will I keep more than on Uber Eats?", a: "Yes, clearly. On a $100 order with $30 of food cost you keep about $53 pre-tax (around $40 after tax) on Good Circles, versus roughly $70-$80 in revenue minus the commission on Uber Eats - and your customer saves ~10% while a local nonprofit gets funded, neither of which happens on Uber Eats." },
      { q: "Do my customers pay more on Uber Eats?", a: "Usually yes - the delivery apps commonly mark up menu prices and add delivery and service fees, so your customer pays a premium. On Good Circles your customer saves about 10%, so switching is better for the person ordering too." },
    ],
  },
  {
    key: "grubhub",
    title: "Grubhub Fee Alternative for Restaurants (2026) · Good Circles",
    description:
      "Grubhub's marketing, delivery, and processing fees add up to roughly 15-30% per order. Good Circles takes a 1% fee on profit while customers save ~10% and fund a local nonprofit.",
    eyebrow: "Switch from the delivery apps",
    h1: "Grubhub's fees stack to ~15-30%. Good Circles takes 1% of profit.",
    answerHtml:
      "Grubhub bundles a marketing commission (5-20%), a delivery fee (~10%), and processing into roughly <strong>15-30%</strong> of every order. Good Circles charges a <strong>1% fee on profit</strong>, so you keep about <strong>89% of your profit</strong> while your customer <strong>saves ~10%</strong> and a local nonprofit gets funded. No ad spend, no merchant card cost. Free to join.",
    example: { price: 100, cogs: 30, mkt: 0 },
    compCustomerPays: "$100+ (markup + fees)",
    intro: {
      h2: "Three fees in a trench coat",
      p1: "Grubhub doesn't publish simple tier percentages - its take is a marketing commission plus a delivery fee plus processing, which together commonly land in the 15-30% range. The higher you want to rank, the more marketing commission you pay, so visibility is something you rent over and over.",
      p2Html:
        "Good Circles doesn't sell you back your own visibility. The platform takes 1% of profit, your customer saves about 10%, and a local nonprofit gets funded - and your customers come from local supporters, not paid placement. See <a href=\"/sell/marketplace-fees-comparison/\" class=\"font-bold underline\" style=\"color:#7851A9\">the full marketplace comparison &raquo;</a>",
    },
    faqs: [
      { q: "What does Grubhub actually charge restaurants?", a: "Grubhub's published components are a marketing commission (5-20%) plus a delivery fee (around 10%) plus payment processing, which commonly total 15-30% of an order. Good Circles charges a 1% fee on profit, with no ad spend and no merchant card cost." },
      { q: "Will I keep more than on Grubhub?", a: "In nearly every case, yes. On a $100 order with $30 of food cost you keep about $53 pre-tax (around $40 after tax) on Good Circles, and your customer saves ~10% while a local nonprofit gets funded - none of which is true on Grubhub." },
      { q: "Can I leave Grubhub and still reach customers?", a: "Yes. On Good Circles your customers come through local nonprofits and their supporters, so reach isn't something you keep paying a marketing commission for. It's free to join, with a 1% fee on profit only when you sell." },
    ],
  },
  {
    key: "amazon",
    title: "Amazon Seller Fee Alternative (2026) · Good Circles",
    description:
      "Amazon's ~15% referral fee plus ad spend and FBA eats your margin. Good Circles takes a 1% fee on profit, customers save ~10%, and every sale funds a local nonprofit.",
    eyebrow: "Switch from Amazon",
    h1: "Amazon takes ~15% plus ad costs. Good Circles takes 1% of profit.",
    answerHtml:
      "Amazon's referral fee is <strong>~15%</strong> in most categories, and most sellers also pay for ads to get seen, plus FBA fees if Amazon ships. Good Circles charges a <strong>1% fee on profit</strong>, so you keep about <strong>89% of your profit</strong> while your customer <strong>saves ~10%</strong> and a local nonprofit gets funded. No ad spend, no merchant card cost. Free to join.",
    example: { price: 100, cogs: 60, mkt: 10 },
    compCustomerPays: "$100.00",
    intro: {
      h2: "The referral fee is just the entry ticket",
      p1: "Amazon's ~15% referral fee is only the start: to actually be found you bid for ads (PPC averages around 10% of sales for many sellers), and if you use FBA there are fulfillment and storage fees on top. You're a SKU in someone else's catalog, competing on price against the platform itself.",
      p2Html:
        "Good Circles flips it. The platform takes 1% of profit, you keep your customer relationship, your customer saves about 10%, and a local nonprofit gets funded. On a typical-margin product you keep more in your own pocket after tax - and dramatically more total local value. High-margin, low-cost products are the one case where Amazon can edge ahead on raw cash, so <strong>run your real numbers in the calculator below.</strong>",
    },
    faqs: [
      { q: "How do Good Circles' fees compare to Amazon's?", a: "Amazon charges a referral fee of about 15% in most categories (5-45% by category), a $39.99/month Professional plan, optional FBA fees, and most sellers also pay for ads. Good Circles charges a 1% fee on profit, with no ad spend and no merchant card cost." },
      { q: "Will I actually keep more selling on Good Circles?", a: "On thin-to-typical margins, yes - on a $100 product with $60 cost you keep about $20 after tax on Good Circles versus about $11 after Amazon's fee and ~10% ad spend, plus your customer saves ~10% and a nonprofit is funded. On very high-margin, low-cost products Amazon can edge ahead on raw cash, so use the calculator with your real numbers." },
      { q: "Do I lose reach by leaving Amazon?", a: "You trade Amazon's pay-to-be-seen catalog for a local community channel: your customers come through nonprofits and their supporters, and you own the relationship. Good Circles is local-first and launching in the Jackson, Mississippi metro in September 2026." },
    ],
  },
  {
    key: "ebay",
    title: "eBay Seller Fee Alternative (2026) · Good Circles",
    description:
      "eBay's ~13% final value fee plus per-order and optional ad fees add up. Good Circles takes a 1% fee on profit, customers save ~10%, and every sale funds a local nonprofit.",
    eyebrow: "Switch from eBay",
    h1: "eBay's fees add up. Good Circles takes 1% of profit.",
    answerHtml:
      "eBay's final value fee is about <strong>13.25%</strong> in most categories, plus a per-order fee and an optional 1-20% for Promoted Listings to get seen. Good Circles charges a <strong>1% fee on profit</strong>, so you keep about <strong>89% of your profit</strong> while your customer <strong>saves ~10%</strong> and a local nonprofit gets funded. No ad spend, no merchant card cost.",
    example: { price: 100, cogs: 60, mkt: 5 },
    compCustomerPays: "$100.00",
    intro: {
      h2: "13% before you've paid to be found",
      p1: "eBay's ~13.25% final value fee plus the $0.40 per order is the baseline, and rising in the rankings means buying Promoted Listings on top. International sales add another 1.65%. It's a real cost stack for a marketplace where you're competing largely on price.",
      p2Html:
        "Good Circles takes 1% of profit, your customer saves about 10%, and a local nonprofit gets funded - and you're not bidding for visibility. On a typical-margin item you come out ahead after tax, and far ahead on total local value. <strong>Check your own numbers in the calculator below.</strong>",
    },
    faqs: [
      { q: "How do Good Circles' fees compare to eBay's?", a: "eBay charges a final value fee of about 13.25% in most categories plus $0.40 per order, an optional 1-20% for Promoted Listings, and 1.65% on international sales. Good Circles charges a 1% fee on profit, with no ad spend and no merchant card cost." },
      { q: "Will I keep more on Good Circles than eBay?", a: "On most margins, yes - your take-home after tax is a little higher and your total local value (your profit plus customer savings plus community funding) is much higher. On very high-margin items it can be close, so run your real numbers in the calculator." },
      { q: "Can I sell on both eBay and Good Circles?", a: "Yes. Many sellers keep eBay for national reach and use Good Circles to sell to their local community at better economics, with customer savings and nonprofit funding built in." },
    ],
  },
  {
    key: "poshmark",
    title: "Poshmark Fee Alternative for Sellers (2026) · Good Circles",
    description:
      "Poshmark takes 20% on every sale of $15 or more. Good Circles takes a 1% fee on profit, customers save ~10%, and every sale funds a local nonprofit.",
    eyebrow: "Switch from Poshmark",
    h1: "Poshmark takes 20%. Good Circles takes 1% of profit.",
    answerHtml:
      "Poshmark keeps a flat <strong>20%</strong> of every sale of $15 or more. Good Circles charges a <strong>1% fee on profit</strong>, so you keep about <strong>89% of your profit</strong> while your customer <strong>saves ~10%</strong> and a local nonprofit gets funded. No ad spend, no merchant card cost. Free to join.",
    example: { price: 100, cogs: 60, mkt: 0 },
    compCustomerPays: "$100.00",
    intro: {
      h2: "A flat fifth of every sale",
      p1: "Poshmark's 20% is simple, but it's a fifth of your sale price - not your profit - gone on every item over $15. For sellers with real cost in their inventory, that's a serious bite out of a thin resale margin.",
      p2Html:
        "Good Circles charges 1% of profit instead of 20% of the sale, your customer saves about 10%, and a local nonprofit gets funded. You keep meaningfully more per sale and create far more local value. See <a href=\"/sell/marketplace-fees-comparison/\" class=\"font-bold underline\" style=\"color:#7851A9\">the full comparison &raquo;</a>",
    },
    faqs: [
      { q: "How much lower are Good Circles' fees than Poshmark's?", a: "Poshmark keeps 20% of any sale of $15 or more (a flat $2.95 under $15). Good Circles charges 1% of profit - so on a $100 sale Poshmark keeps $20 while Good Circles' fee is pennies on your profit, with no ad spend and no merchant card cost." },
      { q: "Will I keep more selling on Good Circles?", a: "Yes, clearly, for most resale margins - because 20% of your sale price is far more than 1% of your profit. On top of keeping more, your customer saves ~10% and a local nonprofit is funded on every sale." },
      { q: "Is Good Circles only for new items?", a: "No - Good Circles is a local community marketplace for goods and services, new or resale. You're selling to neighbors who shop local and fund a cause, rather than a national resale feed." },
    ],
  },
  {
    key: "mercari",
    title: "Mercari Fee Alternative for Sellers (2026) · Good Circles",
    description:
      "Mercari's 10% selling fee is low, so the real difference is where the money goes. On Good Circles your fees become customer savings and local nonprofit funding.",
    eyebrow: "Selling on Mercari?",
    h1: "Mercari's fees are low. The question is where they go.",
    answerHtml:
      "Mercari's <strong>10%</strong> selling fee is genuinely low, so this isn't a 'you'll earn far more per sale' pitch. On Good Circles the comparable margin doesn't vanish to a platform - it becomes a <strong>~10% saving for your customer</strong> and <strong>funding for a local nonprofit</strong>, the platform takes <strong>1% of profit</strong>, and there's no ad spend or merchant card cost.",
    example: { price: 100, cogs: 60, mkt: 0 },
    compCustomerPays: "$100.00",
    intro: {
      h2: "The honest version",
      p1: "We won't pretend Mercari is expensive - its 10% selling fee is one of the lowest in resale. On base fees your take-home per sale is similar to Good Circles, sometimes slightly higher on Mercari, because the ~10% you give your customer is real.",
      p2Html:
        "But on Good Circles that value isn't lost - it goes to your customer (a saving that brings them back) and a local nonprofit, instead of to the platform, and it lowers your taxable income. You also create far more total local value per sale. <strong>Run your own numbers in the calculator below.</strong>",
    },
    faqs: [
      { q: "Are Mercari's fees lower than Good Circles'?", a: "Mercari's 10% selling fee is low - on a per-sale cash basis it can leave you slightly more than Good Circles, because the ~10% you give your customer on Good Circles is real. We're not going to pretend otherwise; the difference is where that value goes." },
      { q: "So why sell on Good Circles?", a: "Because the equivalent margin becomes a saving for your customer (who is local and comes back) and funding for a local nonprofit, instead of a platform's revenue - and it's deductible, lowering your taxable income. You create much more total local value per sale." },
      { q: "Can I use both?", a: "Yes - keep Mercari for national resale reach and use Good Circles to sell locally with customer savings and community funding built in. Good Circles is free to join with a 1% fee on profit." },
    ],
  },
  {
    key: "walmart",
    title: "Walmart Marketplace Fee Alternative (2026) · Good Circles",
    description:
      "Walmart Marketplace's referral fees are competitive, so the real difference is where the money goes. On Good Circles your fees become customer savings and local nonprofit funding.",
    eyebrow: "Selling on Walmart Marketplace?",
    h1: "Walmart's fees are competitive. The difference is where they go.",
    answerHtml:
      "Walmart Marketplace's referral fee (most goods <strong>6-15%</strong>) is competitive, so this is an honest comparison, not a 'you'll earn far more' pitch. On Good Circles the comparable margin becomes a <strong>~10% saving for your customer</strong> and <strong>funding for a local nonprofit</strong> instead of platform revenue, the platform takes <strong>1% of profit</strong>, and there's no ad spend or merchant card cost.",
    example: { price: 100, cogs: 60, mkt: 0 },
    compCustomerPays: "$100.00",
    intro: {
      h2: "The honest version",
      p1: "Walmart Marketplace is a low-fee channel - most goods sit in a 6-15% referral fee with no monthly or listing cost. On base fees your per-sale cash can land slightly above Good Circles, because the ~10% you give your customer is real.",
      p2Html:
        "The difference is destination: on Walmart the fee is the platform's revenue; on Good Circles the equivalent value goes to your customer (a saving that brings them back) and a local nonprofit, and it lowers your taxable income. You create far more total local value per sale. <strong>Compare your own numbers in the calculator below.</strong>",
    },
    faqs: [
      { q: "Are Walmart Marketplace's fees lower than Good Circles'?", a: "Walmart's referral fee runs about 6-15% for most goods with no monthly or listing fee - low enough that on a per-sale cash basis it can leave you slightly more than Good Circles. The honest difference is where the money goes." },
      { q: "Then why use Good Circles?", a: "Because the equivalent margin becomes a ~10% saving for your local customer and deductible funding for a local nonprofit, instead of platform revenue - so you create far more total local value, and lower your taxable income, on every sale." },
      { q: "Is Good Circles a national marketplace like Walmart?", a: "No - Good Circles is local-first. Early access is underway in Meridian and Lauderdale County, the September 2026 launch starts in the Jackson, Mississippi metro, and it expands by request. It's built to keep spending and impact in your own community." },
    ],
  },
  {
    key: "fiverr",
    title: "Fiverr Fee Alternative for Freelancers (2026) · Good Circles",
    description:
      "Fiverr takes a flat 20% from sellers. Good Circles takes a 1% fee on profit, customers save ~10%, and every sale funds a local nonprofit.",
    eyebrow: "Switch from Fiverr",
    h1: "Fiverr takes 20% from sellers. Good Circles takes 1% of profit.",
    answerHtml:
      "Fiverr keeps a flat <strong>20%</strong> of what you earn on every order. Good Circles charges a <strong>1% fee on profit</strong>, so you keep about <strong>89% of your profit</strong> while your customer <strong>saves ~10%</strong> and a local nonprofit gets funded. No ad spend, no merchant card cost. Free to join.",
    example: { price: 100, cogs: 15, mkt: 0 },
    compCustomerPays: "$100.00",
    intro: {
      h2: "A fifth of everything you earn",
      p1: "Fiverr's flat 20% comes off the top of every order, including tips, and you compete in a race-to-the-bottom marketplace where buyers expect rock-bottom prices. For a service with low hard cost, that 20% is almost entirely your margin.",
      p2Html:
        "Good Circles charges 1% of profit instead of 20% of your earnings, your customer saves about 10%, and a local nonprofit gets funded - and you're serving your own community, not bidding against the world. <strong>Run your own numbers in the calculator below.</strong>",
    },
    faqs: [
      { q: "How much lower are Good Circles' fees than Fiverr's?", a: "Fiverr keeps a flat 20% of your earnings (plus a buyer-side service fee). Good Circles charges 1% of profit - so on a $100 service Fiverr keeps $20 while Good Circles' fee is pennies on your profit, with no ad spend and no merchant card cost." },
      { q: "Will I keep more on Good Circles?", a: "For most services, yes - 20% of your earnings is far more than 1% of your profit, even after you pass ~10% in savings to your customer. On a $100 service with $15 of cost you keep about $50 after tax on Good Circles, plus your customer saves ~10% and a nonprofit is funded." },
      { q: "Is Good Circles for service providers, not just products?", a: "Both. Good Circles is a local marketplace for goods and services - tradespeople, creatives, and service providers can all sell to their local community with customer savings and nonprofit funding built in." },
    ],
  },
  {
    key: "upwork",
    title: "Upwork Fee Alternative for Freelancers (2026) · Good Circles",
    description:
      "Upwork takes ~10-13% from freelancers and adds a client-side fee. Good Circles' fees are comparable, but it brings you LOCAL clients, your customer saves ~10%, and every sale funds a local nonprofit.",
    eyebrow: "Selling on Upwork?",
    h1: "Upwork's fees are lower now. The question is which clients you want.",
    answerHtml:
      "Upwork's freelancer fee dropped to a variable ~10-13% in 2025, so this is an honest comparison, not a 'you'll earn far more' pitch. On Good Circles your per-job cash is comparable, but your client is <strong>local</strong> (not a global low-bid race), your customer <strong>saves ~10%</strong> instead of paying Upwork's client-side markup, a local nonprofit is funded, and the platform takes <strong>1% of profit</strong>. No ad spend, no merchant card cost.",
    example: { price: 100, cogs: 15, mkt: 0 },
    compCustomerPays: "$100.00 + client fee",
    intro: {
      h2: "The honest version",
      p1: "We won't pretend Upwork is expensive anymore - since 2025 the freelancer fee is a variable 0-15% (reported blended ~10-13%), lower than Fiverr's flat 20%. On a high-margin service, that fee plus the ~10% Good Circles passes to your customer means your per-job cash can be a little higher on Upwork.",
      p2Html:
        "The difference is the clients and the model: Upwork is a global low-bid marketplace where the client also pays a markup, while Good Circles brings you LOCAL clients who save ~10% (no client-side fee), funds a local nonprofit, and lowers your taxable income through the co-venture. You create far more total local value per job. <strong>Run your real numbers in the calculator below.</strong>",
    },
    faqs: [
      { q: "How much does Upwork take from freelancers?", a: "Since May 2025 Upwork's freelancer service fee is variable (0-15% per contract), with a reported blended rate around 10-13%. Clients also pay a marketplace fee (~5% on the Basic plan) plus a one-time contract-initiation fee. Good Circles charges a 1% fee on profit, with no ad spend and no merchant card cost." },
      { q: "Will I keep more on Good Circles than Upwork?", a: "On a high-margin service it can be close, and Upwork's lower fee may leave slightly more per job on raw cash - because Good Circles passes ~10% to your customer. The difference is that on Good Circles your client is local and saves money (instead of paying Upwork's client markup), a local nonprofit is funded, and you create far more total local value. Run your numbers in the calculator." },
      { q: "Can I use both Upwork and Good Circles?", a: "Yes. Keep Upwork for global, remote contracts and use Good Circles to win and serve local clients at better economics - with customer savings, community funding, and no global price race. Good Circles is free to join with a 1% fee on profit." },
    ],
  },
];
