// Data-file-driven comparison for the AmazonSmile-alternative hub, so the table is
// one-file updatable. The two DIFFERENTIATOR columns (does the shopper also save?
// is it local-first?) are the sourced core of the comparison — per DonorDock/
// ShopRaise/Givebacks roundups, the AmazonSmile-style alternatives donate a small
// percentage but none give the shopper a discount and none are local-first.
//
// Per-competitor GIVING RATES vary by retailer/brand and are not consistently
// published; where a precise, current figure isn't verified, `rateVerified: false`
// and the UI shows the honest "varies / confirm" treatment. Do NOT invent rates —
// fill real ones in and flip rateVerified to true (tracked in TODO.md).
export interface AsAlternative {
  name: string;
  url?: string;
  /** How much reaches the nonprofit. */
  givingRate: string;
  rateVerified: boolean;
  /** Does the SHOPPER also save money (a discount), not just the nonprofit? */
  shopperSaves: boolean;
  /** Is it local-first (funds nearby nonprofits by shopping nearby businesses)? */
  localFirst: boolean;
  /** One-line model description. */
  model: string;
  isGoodCircles?: boolean;
}

export const AS_ALTERNATIVES: AsAlternative[] = [
  {
    name: 'Good Circles',
    url: 'https://goodcircles.org',
    givingRate: '10% of the merchant’s profit (~$4 per $100 spent)',
    rateVerified: true,
    shopperSaves: true,
    localFirst: true,
    model: 'Shop local businesses, save ~10%, and a nonprofit you choose gets 10% of the merchant’s profit — at no extra cost to you.',
    isGoodCircles: true,
  },
  {
    name: 'ShopRaise',
    url: 'https://shopraise.com',
    givingRate: 'A percentage of each purchase (varies by retailer)',
    rateVerified: false,
    shopperSaves: false,
    localFirst: false,
    model: 'A shopping app/browser tool that passes a share of your online purchases at partner retailers to a nonprofit.',
  },
  {
    name: 'Givebacks',
    url: 'https://givebacks.com',
    givingRate: 'A percentage of partner-retailer purchases (varies)',
    rateVerified: false,
    shopperSaves: false,
    localFirst: false,
    model: 'A nonprofit fundraising platform with a shopping-rewards program across national retailers.',
  },
  {
    name: 'iGive',
    url: 'https://www.igive.com',
    givingRate: 'Typically a small percentage per purchase (varies)',
    rateVerified: false,
    shopperSaves: false,
    localFirst: false,
    model: 'A long-running online shopping mall that donates a portion of purchases at member stores.',
  },
  {
    name: 'RaiseRight',
    url: 'https://www.raiseright.com',
    givingRate: 'A rebate on gift cards you buy (varies by brand)',
    rateVerified: false,
    shopperSaves: false,
    localFirst: false,
    model: 'A gift-card fundraising program: you buy brand gift cards and a percentage funds your organization.',
  },
  {
    name: 'eBay for Charity',
    url: 'https://charity.ebay.com',
    givingRate: 'A share of a sale the seller chooses to donate',
    rateVerified: true,
    shopperSaves: false,
    localFirst: false,
    model: 'A feature of eBay where sellers donate a portion of a sale to a chosen charity.',
  },
];
