// GENERATED from Desktop/Claude deliverables/SEO&GEO/city-pages/*.html (the canonical
// design + copy for the programmatic city system). Edit there or here deliberately.
// businesses[] entries are ILLUSTRATIVE placeholders — pages stay noindex until a city
// has >=6 real seeded entries (see isCityIndexable below + CityPages.md guardrails).
export interface CityNonprofit { icon: string; name: string; blurb: string }
export interface CityBusiness { name: string; cat: string }
export interface CityFaq { q: string; a: string }
export interface City {
  slug: string;
  name: string;
  title: string;
  description: string;
  badge: string;
  h1: string;
  answerHtml: string;
  introHtml: string;
  nonprofits: CityNonprofit[];
  businesses: CityBusiness[];
  nearby: { slug: string; name: string }[];
  faqs: CityFaq[];
  region: string;
  /** count of REAL seeded directory entries (merchants + nonprofits from live data). Illustrative tiles do not count. */
  realSeededEntries?: number;
  /** Optional extra "community impact" section (rendered via set:html) — e.g. Jackson's recirculation section. */
  communityImpactHtml?: string;
}

export const STATE = { name: 'Mississippi', slug: 'mississippi', st: 'MS' } as const;

// SEO Sprint 2026-07-05: Mississippi is the launch state — all MS city pages are
// indexable (the old >=6-real-entries guardrail had the whole launch market
// noindexed while coming-soon states were indexed). The guardrail now applies to
// the NON-MS coming-soon pages instead (see shop-local/[state]/*). Keep
// realSeededEntries — it still drives when illustrative tiles get replaced with
// real listings + LocalBusiness schema.
export function isCityIndexable(_city: City): boolean {
  return true;
}

export const CITIES: City[] = [
  {
    "slug": "biloxi",
    "name": "Biloxi",
    "title": "Shop Local in Biloxi, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Biloxi, save ~10%, and fund a Biloxi-area nonprofit you choose — at no extra cost. South Mississippi (Coast). Join Good Circles free.",
    "badge": "Mississippi Gulf Coast · Coming 2026",
    "h1": "Shop local in Biloxi — and fund a Biloxi nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Biloxi, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Biloxi-area nonprofit you choose</b> — at no extra cost. Good Circles is coming to the Mississippi Gulf Coast — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Biloxi: the lighthouse, the seafood docks, and the small businesses that hold the Coast together. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Downtown"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Point Cadet"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Woolmarket"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Downtown"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Point Cadet"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Woolmarket"
      }
    ],
    "nearby": [
      {
        "slug": "gulfport",
        "name": "Gulfport"
      },
      {
        "slug": "ocean-springs",
        "name": "Ocean Springs"
      },
      {
        "slug": "pascagoula",
        "name": "Pascagoula"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Biloxi, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Biloxi (South Mississippi (Coast)). Add your name now to be first in and to bring it to Biloxi sooner."
      },
      {
        "q": "How do I support local Biloxi businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Biloxi nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Biloxi nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Biloxi area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "South Mississippi"
  },
  {
    "slug": "brandon",
    "name": "Brandon",
    "title": "Shop Local in Brandon, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Brandon, save ~10%, and fund a Brandon-area nonprofit you choose — at no extra cost. Central Mississippi. Join Good Circles free.",
    "badge": "Jackson Metro · Launching September 2026",
    "h1": "Shop local in Brandon — and fund a Brandon nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Brandon, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Brandon-area nonprofit you choose</b> — at no extra cost. Good Circles launches across the Jackson metro in September 2026. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Brandon: downtown Brandon, the amphitheater, and the shops around the Reservoir. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Downtown"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Crossgates"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Reservoir"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Downtown"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Crossgates"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Reservoir"
      }
    ],
    "nearby": [
      {
        "slug": "jackson",
        "name": "Jackson"
      },
      {
        "slug": "pearl",
        "name": "Pearl"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Brandon, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Brandon (Central Mississippi). Add your name now to be first in and to bring it to Brandon sooner."
      },
      {
        "q": "How do I support local Brandon businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Brandon nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Brandon nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Brandon area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "Central Mississippi"
  },
  {
    "slug": "clinton",
    "name": "Clinton",
    "title": "Shop Local in Clinton, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Clinton, save ~10%, and fund a Clinton-area nonprofit you choose — at no extra cost. Central Mississippi. Join Good Circles free.",
    "badge": "Jackson Metro · Launching September 2026",
    "h1": "Shop local in Clinton — and fund a Clinton nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Clinton, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Clinton-area nonprofit you choose</b> — at no extra cost. Good Circles launches across the Jackson metro in September 2026. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Clinton: Olde Towne Clinton, the brick streets near Mississippi College, and the family spots along the Natchez Trace. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Olde Towne"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Springridge"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Downtown"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Olde Towne"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Springridge"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Downtown"
      }
    ],
    "nearby": [
      {
        "slug": "jackson",
        "name": "Jackson"
      },
      {
        "slug": "madison",
        "name": "Madison"
      },
      {
        "slug": "ridgeland",
        "name": "Ridgeland"
      },
      {
        "slug": "vicksburg",
        "name": "Vicksburg"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Clinton, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Clinton (Central Mississippi). Add your name now to be first in and to bring it to Clinton sooner."
      },
      {
        "q": "How do I support local Clinton businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Clinton nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Clinton nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Clinton area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "Central Mississippi"
  },
  {
    "slug": "columbus",
    "name": "Columbus",
    "title": "Shop Local in Columbus, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Columbus, save ~10%, and fund a Columbus-area nonprofit you choose — at no extra cost. North Mississippi (Golden Triangle). Join Good Circles free.",
    "badge": "North Mississippi · Coming 2026",
    "h1": "Shop local in Columbus — and fund a Columbus nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Columbus, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Columbus-area nonprofit you choose</b> — at no extra cost. Good Circles is coming to the Golden Triangle — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Columbus: the antebellum homes, the riverfront, and a historic downtown full of family-owned shops. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Downtown"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Main St"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Leigh Mall"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Downtown"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Main St"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Leigh Mall"
      }
    ],
    "nearby": [
      {
        "slug": "starkville",
        "name": "Starkville"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Columbus, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Columbus (North Mississippi (Golden Triangle)). Add your name now to be first in and to bring it to Columbus sooner."
      },
      {
        "q": "How do I support local Columbus businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Columbus nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Columbus nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Columbus area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "North Mississippi"
  },
  {
    "slug": "greenville",
    "name": "Greenville",
    "title": "Shop Local in Greenville, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Greenville, save ~10%, and fund a Greenville-area nonprofit you choose — at no extra cost. Mississippi Delta. Join Good Circles free.",
    "badge": "Mississippi Delta · Coming 2026",
    "h1": "Shop local in Greenville — and fund a Greenville nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Greenville, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Greenville-area nonprofit you choose</b> — at no extra cost. Good Circles is coming to the Delta — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Greenville: the heart of the Delta, its blues heritage, and the local businesses along the river. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Downtown"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Washington Ave"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Lake Ferguson"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Downtown"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Washington Ave"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Lake Ferguson"
      }
    ],
    "nearby": [],
    "faqs": [
      {
        "q": "Is Good Circles available in Greenville, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Greenville (Mississippi Delta). Add your name now to be first in and to bring it to Greenville sooner."
      },
      {
        "q": "How do I support local Greenville businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Greenville nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Greenville nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Greenville area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "Mississippi Delta"
  },
  {
    "slug": "gulfport",
    "name": "Gulfport",
    "title": "Shop Local in Gulfport, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Gulfport, save ~10%, and fund a Gulfport-area nonprofit you choose — at no extra cost. South Mississippi (Coast). Join Good Circles free.",
    "badge": "Mississippi Gulf Coast · Coming 2026",
    "h1": "Shop local in Gulfport — and fund a Gulfport nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Gulfport, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Gulfport-area nonprofit you choose</b> — at no extra cost. Good Circles is coming to the Mississippi Gulf Coast — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Gulfport: the beachfront, downtown Gulfport, and the local seafood spots that define the Coast. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Downtown"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Orange Grove"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Beachfront"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Downtown"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Orange Grove"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Beachfront"
      }
    ],
    "nearby": [
      {
        "slug": "biloxi",
        "name": "Biloxi"
      },
      {
        "slug": "pascagoula",
        "name": "Pascagoula"
      },
      {
        "slug": "ocean-springs",
        "name": "Ocean Springs"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Gulfport, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Gulfport (South Mississippi (Coast)). Add your name now to be first in and to bring it to Gulfport sooner."
      },
      {
        "q": "How do I support local Gulfport businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Gulfport nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Gulfport nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Gulfport area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "South Mississippi"
  },
  {
    "slug": "hattiesburg",
    "name": "Hattiesburg",
    "title": "Shop Local in Hattiesburg, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Hattiesburg, save ~10%, and fund a Hattiesburg-area nonprofit you choose — at no extra cost. South Mississippi (Pine Belt). Join Good Circles free.",
    "badge": "South Mississippi · Coming 2026",
    "h1": "Shop local in Hattiesburg — and fund a Hattiesburg nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Hattiesburg, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Hattiesburg-area nonprofit you choose</b> — at no extra cost. Good Circles is coming to the Pine Belt — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Hattiesburg: the Hub City, the historic downtown district, and the energy around the University of Southern Mississippi. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Downtown"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Midtown"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Oak Grove"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Downtown"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Midtown"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Oak Grove"
      }
    ],
    "nearby": [],
    "faqs": [
      {
        "q": "Is Good Circles available in Hattiesburg, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Hattiesburg (South Mississippi (Pine Belt)). Add your name now to be first in and to bring it to Hattiesburg sooner."
      },
      {
        "q": "How do I support local Hattiesburg businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Hattiesburg nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Hattiesburg nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Hattiesburg area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "South Mississippi"
  },
  {
    "slug": "horn-lake",
    "name": "Horn Lake",
    "title": "Shop Local in Horn Lake, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Horn Lake, save ~10%, and fund a Horn Lake-area nonprofit you choose — at no extra cost. North Mississippi (DeSoto). Join Good Circles free.",
    "badge": "North Mississippi · Coming 2026",
    "h1": "Shop local in Horn Lake — and fund a Horn Lake nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Horn Lake, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Horn Lake-area nonprofit you choose</b> — at no extra cost. Good Circles is coming to DeSoto County — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Horn Lake: the DeSoto County crossroads and the family businesses that serve it. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Downtown"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Goodman Rd"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Tulane Rd"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Downtown"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Goodman Rd"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Tulane Rd"
      }
    ],
    "nearby": [
      {
        "slug": "southaven",
        "name": "Southaven"
      },
      {
        "slug": "olive-branch",
        "name": "Olive Branch"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Horn Lake, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Horn Lake (North Mississippi (DeSoto)). Add your name now to be first in and to bring it to Horn Lake sooner."
      },
      {
        "q": "How do I support local Horn Lake businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Horn Lake nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Horn Lake nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Horn Lake area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "North Mississippi"
  },
  {
    "slug": "jackson",
    "name": "Jackson",
    "title": "Shop Local in Jackson, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Jackson, save ~10%, and fund a Jackson-area nonprofit you choose — at no extra cost. Central Mississippi. Join Good Circles free.",
    "badge": "Launch Metro · September 2026",
    "h1": "Shop local in Jackson — and fund a Jackson nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Jackson, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Jackson-area nonprofit you choose</b> — at no extra cost. Jackson is the September 2026 launch metro — early access is already underway in Meridian &amp; Lauderdale County. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Jackson: the capital city, where Fondren's shops and galleries, Belhaven's cafés, and Midtown's makers give Jackson its character. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "communityImpactHtml": "<h2 id=\"community-impact\" class=\"text-3xl font-black text-slate-900 mb-4\" style=\"letter-spacing:-0.02em\">Community impact shopping in Jackson</h2><p class=\"text-slate-600 leading-relaxed mb-4\" style=\"font-family:'Fira Sans',sans-serif\"><b>Community impact shopping</b> means directing spending you already do so more of it benefits the place you live — and in Jackson the numbers are striking. Survey research popularized by <a href=\"https://ilsr.org/articles/key-studies-why-local-matters/\" target=\"_blank\" rel=\"noopener\" class=\"font-bold underline\" style=\"color:#7851A9\">Civic Economics and the Institute for Local Self-Reliance</a> finds that roughly <b>$53 of every $100</b> spent at an independent local business recirculates in the community — local payroll, local suppliers, local giving — versus about <b>$14 of every $100</b> spent at a national chain. Every redirected dollar nearly quadruples its local work.</p><p class=\"text-slate-600 leading-relaxed\" style=\"font-family:'Fira Sans',sans-serif\">Mississippi's shop-local movement is how that math becomes real: choosing Fondren's diners and bookstores over another big-box run — and, when Good Circles opens the Jackson metro in September 2026, letting every local purchase automatically fund a Jackson nonprofit you elect. Start with our verified <a href=\"/learn/best-local-businesses-jackson-ms/\" class=\"font-bold underline\" style=\"color:#7851A9\">guide to Jackson's best local businesses</a>, and see <a href=\"/learn/the-economic-impact-of-shopping-local/\" class=\"font-bold underline\" style=\"color:#7851A9\">the economic impact of shopping local</a> for the full evidence.</p>",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "Mississippi Food Network",
        "blurb": "Fights hunger across central Mississippi."
      },
      {
        "icon": "🏠",
        "name": "Habitat for Humanity · MS Capital Area",
        "blurb": "Builds affordable homes in the Jackson area."
      },
      {
        "icon": "⭐",
        "name": "Boys & Girls Clubs of Central MS",
        "blurb": "After-school programs for Jackson kids."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Fondren"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Belhaven"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Midtown"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Downtown"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Ridgeland"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Pearl"
      }
    ],
    "nearby": [
      {
        "slug": "clinton",
        "name": "Clinton"
      },
      {
        "slug": "madison",
        "name": "Madison"
      },
      {
        "slug": "ridgeland",
        "name": "Ridgeland"
      },
      {
        "slug": "brandon",
        "name": "Brandon"
      },
      {
        "slug": "pearl",
        "name": "Pearl"
      },
      {
        "slug": "vicksburg",
        "name": "Vicksburg"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Jackson, MS?",
        "a": "Jackson is the September 2026 launch metro, and early access is already underway in Meridian and Lauderdale County. Join free now as a Founding Neighbor and pick the Jackson-area nonprofit your purchases will support."
      },
      {
        "q": "How do I support local Jackson businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Jackson nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Jackson nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Jackson area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "Central Mississippi"
  },
  {
    "slug": "madison",
    "name": "Madison",
    "title": "Shop Local in Madison, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Madison, save ~10%, and fund a Madison-area nonprofit you choose — at no extra cost. Central Mississippi. Join Good Circles free.",
    "badge": "Jackson Metro · Launching September 2026",
    "h1": "Shop local in Madison — and fund a Madison nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Madison, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Madison-area nonprofit you choose</b> — at no extra cost. Good Circles launches across the Jackson metro in September 2026. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Madison: the shops of the Township and the local restaurants that make Madison feel like home. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · The Township"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Madison Station"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Gluckstadt"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · The Township"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Madison Station"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Gluckstadt"
      }
    ],
    "nearby": [
      {
        "slug": "jackson",
        "name": "Jackson"
      },
      {
        "slug": "ridgeland",
        "name": "Ridgeland"
      },
      {
        "slug": "clinton",
        "name": "Clinton"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Madison, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Madison (Central Mississippi). Add your name now to be first in and to bring it to Madison sooner."
      },
      {
        "q": "How do I support local Madison businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Madison nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Madison nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Madison area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "Central Mississippi"
  },
  {
    "slug": "meridian",
    "name": "Meridian",
    "title": "Shop Local in Meridian, MS — Early Access Is Underway · Good Circles",
    "description": "Early access is underway in Meridian & Lauderdale County — the founding community. Shop local, save ~10%, and fund a Meridian-area nonprofit you choose. Join free.",
    "badge": "Early access — Founding City · Meridian & Lauderdale County",
    "h1": "Shop local in Meridian — early access is underway",
    "answerHtml": "<b>Early access is underway in Meridian &amp; Lauderdale County</b> — the founding community for Good Circles. Shop local businesses in Meridian, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Meridian-area nonprofit you choose</b> — at no extra cost. Good Circles launches on schedule in September 2026 in the Jackson metro, but Meridian is first. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Meridian: the Queen City, the restored Threefoot building, the MAX museum, and a downtown on the rise. As the founding early-access community, Meridian &amp; Lauderdale County are where Good Circles begins. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Downtown"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Northeast"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Bonita"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Downtown"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Northeast"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Bonita"
      }
    ],
    "nearby": [],
    "faqs": [
      {
        "q": "Is Good Circles available in Meridian now?",
        "a": "Yes — early access is underway in Meridian and Lauderdale County, the founding community, ahead of the September 2026 launch in the Jackson metro. Join the waitlist now to take part in early access and be among the first neighbors, businesses, and nonprofits in."
      },
      {
        "q": "How do I support local Meridian businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Meridian nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Meridian nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Meridian area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "East Mississippi"
  },
  {
    "slug": "ocean-springs",
    "name": "Ocean Springs",
    "title": "Shop Local in Ocean Springs, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Ocean Springs, save ~10%, and fund an Ocean Springs-area nonprofit you choose — at no extra cost. South Mississippi (Coast). Join Good Circles free.",
    "badge": "Mississippi Gulf Coast · Coming 2026",
    "h1": "Shop local in Ocean Springs — and fund an Ocean Springs nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Ocean Springs, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Ocean Springs-area nonprofit you choose</b> — at no extra cost. Good Circles is coming to the Mississippi Gulf Coast — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Ocean Springs: the arts town on Government Street, Walter Anderson country, and a downtown full of independents. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Government St"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Downtown"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · East Beach"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Government St"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Downtown"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · East Beach"
      }
    ],
    "nearby": [
      {
        "slug": "biloxi",
        "name": "Biloxi"
      },
      {
        "slug": "gulfport",
        "name": "Gulfport"
      },
      {
        "slug": "pascagoula",
        "name": "Pascagoula"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Ocean Springs, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Ocean Springs (South Mississippi (Coast)). Add your name now to be first in and to bring it to Ocean Springs sooner."
      },
      {
        "q": "How do I support local Ocean Springs businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Ocean Springs nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Ocean Springs nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Ocean Springs area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "South Mississippi"
  },
  {
    "slug": "olive-branch",
    "name": "Olive Branch",
    "title": "Shop Local in Olive Branch, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Olive Branch, save ~10%, and fund an Olive Branch-area nonprofit you choose — at no extra cost. North Mississippi (DeSoto). Join Good Circles free.",
    "badge": "North Mississippi · Coming 2026",
    "h1": "Shop local in Olive Branch — and fund an Olive Branch nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Olive Branch, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Olive Branch-area nonprofit you choose</b> — at no extra cost. Good Circles is coming to DeSoto County — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Olive Branch: one of the fastest-growing towns in the state and its booming local main street. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Old Towne"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Downtown"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Goodman Rd"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Old Towne"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Downtown"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Goodman Rd"
      }
    ],
    "nearby": [
      {
        "slug": "southaven",
        "name": "Southaven"
      },
      {
        "slug": "horn-lake",
        "name": "Horn Lake"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Olive Branch, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Olive Branch (North Mississippi (DeSoto)). Add your name now to be first in and to bring it to Olive Branch sooner."
      },
      {
        "q": "How do I support local Olive Branch businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Olive Branch nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Olive Branch nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Olive Branch area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "North Mississippi"
  },
  {
    "slug": "oxford",
    "name": "Oxford",
    "title": "Shop Local in Oxford, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Oxford, save ~10%, and fund an Oxford-area nonprofit you choose — at no extra cost. North Mississippi. Join Good Circles free.",
    "badge": "North Mississippi · Coming 2026",
    "h1": "Shop local in Oxford — and fund an Oxford nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Oxford, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Oxford-area nonprofit you choose</b> — at no extra cost. Good Circles is coming to north Mississippi — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Oxford: the Square, the literary heart of the state, and the local shops in the shadow of Ole Miss. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · The Square"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Jackson Ave"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · North Lamar"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · The Square"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Jackson Ave"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · North Lamar"
      }
    ],
    "nearby": [
      {
        "slug": "tupelo",
        "name": "Tupelo"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Oxford, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Oxford (North Mississippi). Add your name now to be first in and to bring it to Oxford sooner."
      },
      {
        "q": "How do I support local Oxford businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Oxford nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Oxford nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Oxford area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "North Mississippi"
  },
  {
    "slug": "pascagoula",
    "name": "Pascagoula",
    "title": "Shop Local in Pascagoula, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Pascagoula, save ~10%, and fund a Pascagoula-area nonprofit you choose — at no extra cost. South Mississippi (Coast). Join Good Circles free.",
    "badge": "Mississippi Gulf Coast · Coming 2026",
    "h1": "Shop local in Pascagoula — and fund a Pascagoula nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Pascagoula, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Pascagoula-area nonprofit you choose</b> — at no extra cost. Good Circles is coming to the Mississippi Gulf Coast — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Pascagoula: the shipbuilding city on the Gulf and the local shops along the waterfront. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Downtown"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Beach Blvd"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Market St"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Downtown"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Beach Blvd"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Market St"
      }
    ],
    "nearby": [
      {
        "slug": "ocean-springs",
        "name": "Ocean Springs"
      },
      {
        "slug": "biloxi",
        "name": "Biloxi"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Pascagoula, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Pascagoula (South Mississippi (Coast)). Add your name now to be first in and to bring it to Pascagoula sooner."
      },
      {
        "q": "How do I support local Pascagoula businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Pascagoula nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Pascagoula nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Pascagoula area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "South Mississippi"
  },
  {
    "slug": "pearl",
    "name": "Pearl",
    "title": "Shop Local in Pearl, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Pearl, save ~10%, and fund a Pearl-area nonprofit you choose — at no extra cost. Central Mississippi. Join Good Circles free.",
    "badge": "Jackson Metro · Launching September 2026",
    "h1": "Shop local in Pearl — and fund a Pearl nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Pearl, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Pearl-area nonprofit you choose</b> — at no extra cost. Good Circles launches across the Jackson metro in September 2026. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Pearl: the shops near Trustmark Park and the local spots along Highway 80. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Downtown"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Old Brandon Rd"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Pearl"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Downtown"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Old Brandon Rd"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Pearl"
      }
    ],
    "nearby": [
      {
        "slug": "jackson",
        "name": "Jackson"
      },
      {
        "slug": "brandon",
        "name": "Brandon"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Pearl, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Pearl (Central Mississippi). Add your name now to be first in and to bring it to Pearl sooner."
      },
      {
        "q": "How do I support local Pearl businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Pearl nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Pearl nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Pearl area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "Central Mississippi"
  },
  {
    "slug": "ridgeland",
    "name": "Ridgeland",
    "title": "Shop Local in Ridgeland, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Ridgeland, save ~10%, and fund a Ridgeland-area nonprofit you choose — at no extra cost. Central Mississippi. Join Good Circles free.",
    "badge": "Jackson Metro · Launching September 2026",
    "h1": "Shop local in Ridgeland — and fund a Ridgeland nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Ridgeland, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Ridgeland-area nonprofit you choose</b> — at no extra cost. Good Circles launches across the Jackson metro in September 2026. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Ridgeland: Renaissance at Colony Park, the Ridgeland craft scene, and the trails along the Natchez Trace. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Renaissance"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Township"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Old Agency"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Renaissance"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Township"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Old Agency"
      }
    ],
    "nearby": [
      {
        "slug": "jackson",
        "name": "Jackson"
      },
      {
        "slug": "madison",
        "name": "Madison"
      },
      {
        "slug": "clinton",
        "name": "Clinton"
      },
      {
        "slug": "brandon",
        "name": "Brandon"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Ridgeland, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Ridgeland (Central Mississippi). Add your name now to be first in and to bring it to Ridgeland sooner."
      },
      {
        "q": "How do I support local Ridgeland businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Ridgeland nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Ridgeland nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Ridgeland area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "Central Mississippi"
  },
  {
    "slug": "southaven",
    "name": "Southaven",
    "title": "Shop Local in Southaven, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Southaven, save ~10%, and fund a Southaven-area nonprofit you choose — at no extra cost. North Mississippi (DeSoto). Join Good Circles free.",
    "badge": "North Mississippi · Coming 2026",
    "h1": "Shop local in Southaven — and fund a Southaven nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Southaven, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Southaven-area nonprofit you choose</b> — at no extra cost. Good Circles is coming to DeSoto County — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Southaven: Mississippi's gateway to Memphis, Snowden Grove, and a fast-growing local business scene. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Silo Square"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Downtown"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Stateline"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Silo Square"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Downtown"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Stateline"
      }
    ],
    "nearby": [
      {
        "slug": "olive-branch",
        "name": "Olive Branch"
      },
      {
        "slug": "horn-lake",
        "name": "Horn Lake"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Southaven, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Southaven (North Mississippi (DeSoto)). Add your name now to be first in and to bring it to Southaven sooner."
      },
      {
        "q": "How do I support local Southaven businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Southaven nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Southaven nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Southaven area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "North Mississippi"
  },
  {
    "slug": "starkville",
    "name": "Starkville",
    "title": "Shop Local in Starkville, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Starkville, save ~10%, and fund a Starkville-area nonprofit you choose — at no extra cost. North Mississippi (Golden Triangle). Join Good Circles free.",
    "badge": "North Mississippi · Coming 2026",
    "h1": "Shop local in Starkville — and fund a Starkville nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Starkville, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Starkville-area nonprofit you choose</b> — at no extra cost. Good Circles is coming to the Golden Triangle — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Starkville: the Cotton District, game-day energy at Mississippi State, and a downtown of local makers. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Cotton District"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Downtown"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Main St"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Cotton District"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Downtown"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Main St"
      }
    ],
    "nearby": [
      {
        "slug": "columbus",
        "name": "Columbus"
      },
      {
        "slug": "tupelo",
        "name": "Tupelo"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Starkville, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Starkville (North Mississippi (Golden Triangle)). Add your name now to be first in and to bring it to Starkville sooner."
      },
      {
        "q": "How do I support local Starkville businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Starkville nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Starkville nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Starkville area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "North Mississippi"
  },
  {
    "slug": "tupelo",
    "name": "Tupelo",
    "title": "Shop Local in Tupelo, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Tupelo, save ~10%, and fund a Tupelo-area nonprofit you choose — at no extra cost. North Mississippi. Join Good Circles free.",
    "badge": "North Mississippi · Coming 2026",
    "h1": "Shop local in Tupelo — and fund a Tupelo nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Tupelo, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Tupelo-area nonprofit you choose</b> — at no extra cost. Good Circles is coming to north Mississippi — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Tupelo: the birthplace of Elvis, a proud furniture-making tradition, and a lively downtown of independents. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Downtown"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Fairpark"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · West Main"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Downtown"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Fairpark"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · West Main"
      }
    ],
    "nearby": [
      {
        "slug": "oxford",
        "name": "Oxford"
      },
      {
        "slug": "columbus",
        "name": "Columbus"
      },
      {
        "slug": "starkville",
        "name": "Starkville"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Tupelo, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Tupelo (North Mississippi). Add your name now to be first in and to bring it to Tupelo sooner."
      },
      {
        "q": "How do I support local Tupelo businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Tupelo nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Tupelo nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Tupelo area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "North Mississippi"
  },
  {
    "slug": "vicksburg",
    "name": "Vicksburg",
    "title": "Shop Local in Vicksburg, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Vicksburg, save ~10%, and fund a Vicksburg-area nonprofit you choose — at no extra cost. West-Central Mississippi (River). Join Good Circles free.",
    "badge": "River Region · Coming 2026",
    "h1": "Shop local in Vicksburg — and fund a Vicksburg nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Vicksburg, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Vicksburg-area nonprofit you choose</b> — at no extra cost. Good Circles is coming to the river region — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Vicksburg: the river city, the National Military Park, and a historic downtown of independent shops. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Downtown"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Washington St"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Halls Ferry"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Downtown"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Washington St"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Halls Ferry"
      }
    ],
    "nearby": [
      {
        "slug": "jackson",
        "name": "Jackson"
      },
      {
        "slug": "clinton",
        "name": "Clinton"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Vicksburg, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Vicksburg (West-Central Mississippi (River)). Add your name now to be first in and to bring it to Vicksburg sooner."
      },
      {
        "q": "How do I support local Vicksburg businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Vicksburg nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Vicksburg nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Vicksburg area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "West-Central Mississippi"
  },
  {
    "slug": "flowood",
    "name": "Flowood",
    "title": "Shop Local in Flowood, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Flowood, save ~10%, and fund a Flowood-area nonprofit you choose — at no extra cost. Central Mississippi. Join Good Circles free.",
    "badge": "Jackson Metro · Launching September 2026",
    "h1": "Shop local in Flowood — and fund a Flowood nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Flowood, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Flowood-area nonprofit you choose</b> — at no extra cost. Early access is underway in Meridian &amp; Lauderdale County, and the September 2026 launch starts in the Jackson metro — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Flowood: the Lakeland Drive shops and restaurants, Dogwood's retail, and one of the metro's busiest medical corridors. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Lakeland Dr"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Dogwood"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Flowood Dr"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Lakeland Dr"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Dogwood"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Flowood Dr"
      }
    ],
    "nearby": [
      {
        "slug": "pearl",
        "name": "Pearl"
      },
      {
        "slug": "ridgeland",
        "name": "Ridgeland"
      },
      {
        "slug": "brandon",
        "name": "Brandon"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Flowood, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Flowood (Central Mississippi). Add your name now to be first in and to bring it to Flowood sooner."
      },
      {
        "q": "How do I support local Flowood businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Flowood nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Flowood nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Flowood area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "Central Mississippi"
  },
  {
    "slug": "byram",
    "name": "Byram",
    "title": "Shop Local in Byram, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Byram, save ~10%, and fund a Byram-area nonprofit you choose — at no extra cost. Central Mississippi. Join Good Circles free.",
    "badge": "Jackson Metro · Launching September 2026",
    "h1": "Shop local in Byram — and fund a Byram nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Byram, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Byram-area nonprofit you choose</b> — at no extra cost. Early access is underway in Meridian &amp; Lauderdale County, and the September 2026 launch starts in the Jackson metro — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Byram: the old Swinging Bridge over the Pearl River and the businesses along Siwell Road and Terry Road. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Siwell Rd"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Terry Rd"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Downtown"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Siwell Rd"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Terry Rd"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Downtown"
      }
    ],
    "nearby": [
      {
        "slug": "jackson",
        "name": "Jackson"
      },
      {
        "slug": "terry",
        "name": "Terry"
      },
      {
        "slug": "richland",
        "name": "Richland"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Byram, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Byram (Central Mississippi). Add your name now to be first in and to bring it to Byram sooner."
      },
      {
        "q": "How do I support local Byram businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Byram nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Byram nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Byram area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "Central Mississippi"
  },
  {
    "slug": "canton",
    "name": "Canton",
    "title": "Shop Local in Canton, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Canton, save ~10%, and fund a Canton-area nonprofit you choose — at no extra cost. Central Mississippi. Join Good Circles free.",
    "badge": "Madison County · Launching September 2026",
    "h1": "Shop local in Canton — and fund a Canton nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Canton, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Canton-area nonprofit you choose</b> — at no extra cost. Early access is underway in Meridian &amp; Lauderdale County, and the September 2026 launch starts in the Jackson metro — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Canton: the historic Courthouse Square, the famous twice-a-year Canton Flea Market, and the Christmas 'City of Lights'. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Courthouse Square"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Peace St"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Hwy 51"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Courthouse Square"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Peace St"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Hwy 51"
      }
    ],
    "nearby": [
      {
        "slug": "gluckstadt",
        "name": "Gluckstadt"
      },
      {
        "slug": "madison",
        "name": "Madison"
      },
      {
        "slug": "flora",
        "name": "Flora"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Canton, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Canton (Central Mississippi). Add your name now to be first in and to bring it to Canton sooner."
      },
      {
        "q": "How do I support local Canton businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Canton nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Canton nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Canton area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "Central Mississippi"
  },
  {
    "slug": "richland",
    "name": "Richland",
    "title": "Shop Local in Richland, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Richland, save ~10%, and fund a Richland-area nonprofit you choose — at no extra cost. Central Mississippi. Join Good Circles free.",
    "badge": "Jackson Metro · Launching September 2026",
    "h1": "Shop local in Richland — and fund a Richland nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Richland, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Richland-area nonprofit you choose</b> — at no extra cost. Early access is underway in Meridian &amp; Lauderdale County, and the September 2026 launch starts in the Jackson metro — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Richland: the businesses along the Highway 49 corridor and Old Brandon Road. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Hwy 49"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Old Brandon Rd"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Downtown"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Hwy 49"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Old Brandon Rd"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Downtown"
      }
    ],
    "nearby": [
      {
        "slug": "pearl",
        "name": "Pearl"
      },
      {
        "slug": "florence",
        "name": "Florence"
      },
      {
        "slug": "byram",
        "name": "Byram"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Richland, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Richland (Central Mississippi). Add your name now to be first in and to bring it to Richland sooner."
      },
      {
        "q": "How do I support local Richland businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Richland nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Richland nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Richland area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "Central Mississippi"
  },
  {
    "slug": "gluckstadt",
    "name": "Gluckstadt",
    "title": "Shop Local in Gluckstadt, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Gluckstadt, save ~10%, and fund a Gluckstadt-area nonprofit you choose — at no extra cost. Central Mississippi. Join Good Circles free.",
    "badge": "Mississippi's Newest City · Launching September 2026",
    "h1": "Shop local in Gluckstadt — and fund a Gluckstadt nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Gluckstadt, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Gluckstadt-area nonprofit you choose</b> — at no extra cost. Early access is underway in Meridian &amp; Lauderdale County, and the September 2026 launch starts in the Jackson metro — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Gluckstadt: Mississippi's newest city — incorporated in 2021 — with its German roots, the annual GermanFest, and the fast-growing Gluckstadt Road corridor. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Gluckstadt Rd"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Hwy 51"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Calhoun Station"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Gluckstadt Rd"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Hwy 51"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Calhoun Station"
      }
    ],
    "nearby": [
      {
        "slug": "madison",
        "name": "Madison"
      },
      {
        "slug": "canton",
        "name": "Canton"
      },
      {
        "slug": "flora",
        "name": "Flora"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Gluckstadt, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Gluckstadt (Central Mississippi). Add your name now to be first in and to bring it to Gluckstadt sooner."
      },
      {
        "q": "How do I support local Gluckstadt businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Gluckstadt nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Gluckstadt nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Gluckstadt area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "Central Mississippi"
  },
  {
    "slug": "florence",
    "name": "Florence",
    "title": "Shop Local in Florence, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Florence, save ~10%, and fund a Florence-area nonprofit you choose — at no extra cost. Central Mississippi. Join Good Circles free.",
    "badge": "Rankin County · Launching September 2026",
    "h1": "Shop local in Florence — and fund a Florence nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Florence, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Florence-area nonprofit you choose</b> — at no extra cost. Early access is underway in Meridian &amp; Lauderdale County, and the September 2026 launch starts in the Jackson metro — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Florence: the shops along Highway 49 South and its small-town Main Street. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Hwy 49"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Main St"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Downtown"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Hwy 49"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Main St"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Downtown"
      }
    ],
    "nearby": [
      {
        "slug": "richland",
        "name": "Richland"
      },
      {
        "slug": "pearl",
        "name": "Pearl"
      },
      {
        "slug": "magee",
        "name": "Magee"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Florence, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Florence (Central Mississippi). Add your name now to be first in and to bring it to Florence sooner."
      },
      {
        "q": "How do I support local Florence businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Florence nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Florence nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Florence area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "Central Mississippi"
  },
  {
    "slug": "raymond",
    "name": "Raymond",
    "title": "Shop Local in Raymond, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Raymond, save ~10%, and fund a Raymond-area nonprofit you choose — at no extra cost. Central Mississippi. Join Good Circles free.",
    "badge": "Hinds County · Launching September 2026",
    "h1": "Shop local in Raymond — and fund a Raymond nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Raymond, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Raymond-area nonprofit you choose</b> — at no extra cost. Early access is underway in Meridian &amp; Lauderdale County, and the September 2026 launch starts in the Jackson metro — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Raymond: the historic 1859 courthouse, the Battle of Raymond heritage, and Hinds Community College's main campus. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Courthouse Square"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Main St"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Campus area"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Courthouse Square"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Main St"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Campus area"
      }
    ],
    "nearby": [
      {
        "slug": "clinton",
        "name": "Clinton"
      },
      {
        "slug": "byram",
        "name": "Byram"
      },
      {
        "slug": "terry",
        "name": "Terry"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Raymond, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Raymond (Central Mississippi). Add your name now to be first in and to bring it to Raymond sooner."
      },
      {
        "q": "How do I support local Raymond businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Raymond nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Raymond nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Raymond area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "Central Mississippi"
  },
  {
    "slug": "terry",
    "name": "Terry",
    "title": "Shop Local in Terry, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Terry, save ~10%, and fund a Terry-area nonprofit you choose — at no extra cost. Central Mississippi. Join Good Circles free.",
    "badge": "Hinds County · Launching September 2026",
    "h1": "Shop local in Terry — and fund a Terry nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Terry, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Terry-area nonprofit you choose</b> — at no extra cost. Early access is underway in Meridian &amp; Lauderdale County, and the September 2026 launch starts in the Jackson metro — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Terry: its historic railroad-town Main Street just south of Jackson. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Main St"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Downtown"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · I-55 corridor"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Main St"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Downtown"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · I-55 corridor"
      }
    ],
    "nearby": [
      {
        "slug": "byram",
        "name": "Byram"
      },
      {
        "slug": "raymond",
        "name": "Raymond"
      },
      {
        "slug": "crystal-springs",
        "name": "Crystal Springs"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Terry, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Terry (Central Mississippi). Add your name now to be first in and to bring it to Terry sooner."
      },
      {
        "q": "How do I support local Terry businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Terry nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Terry nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Terry area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "Central Mississippi"
  },
  {
    "slug": "flora",
    "name": "Flora",
    "title": "Shop Local in Flora, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Flora, save ~10%, and fund a Flora-area nonprofit you choose — at no extra cost. Central Mississippi. Join Good Circles free.",
    "badge": "Madison County · Launching September 2026",
    "h1": "Shop local in Flora — and fund a Flora nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Flora, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Flora-area nonprofit you choose</b> — at no extra cost. Early access is underway in Meridian &amp; Lauderdale County, and the September 2026 launch starts in the Jackson metro — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Flora: the Mississippi Petrified Forest and a compact, walkable Main Street. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Main St"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Downtown"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Hwy 49"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Main St"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Downtown"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Hwy 49"
      }
    ],
    "nearby": [
      {
        "slug": "gluckstadt",
        "name": "Gluckstadt"
      },
      {
        "slug": "madison",
        "name": "Madison"
      },
      {
        "slug": "canton",
        "name": "Canton"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Flora, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Flora (Central Mississippi). Add your name now to be first in and to bring it to Flora sooner."
      },
      {
        "q": "How do I support local Flora businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Flora nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Flora nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Flora area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "Central Mississippi"
  },
  {
    "slug": "pelahatchie",
    "name": "Pelahatchie",
    "title": "Shop Local in Pelahatchie, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Pelahatchie, save ~10%, and fund a Pelahatchie-area nonprofit you choose — at no extra cost. Central Mississippi. Join Good Circles free.",
    "badge": "Rankin County · Launching September 2026",
    "h1": "Shop local in Pelahatchie — and fund a Pelahatchie nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Pelahatchie, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Pelahatchie-area nonprofit you choose</b> — at no extra cost. Early access is underway in Meridian &amp; Lauderdale County, and the September 2026 launch starts in the Jackson metro — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Pelahatchie: the annual Muscadine Jubilee and its small-town Main Street. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Main St"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Hwy 80"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Downtown"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Main St"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Hwy 80"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Downtown"
      }
    ],
    "nearby": [
      {
        "slug": "brandon",
        "name": "Brandon"
      },
      {
        "slug": "pearl",
        "name": "Pearl"
      },
      {
        "slug": "florence",
        "name": "Florence"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Pelahatchie, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Pelahatchie (Central Mississippi). Add your name now to be first in and to bring it to Pelahatchie sooner."
      },
      {
        "q": "How do I support local Pelahatchie businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Pelahatchie nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Pelahatchie nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Pelahatchie area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "Central Mississippi"
  },
  {
    "slug": "yazoo-city",
    "name": "Yazoo City",
    "title": "Shop Local in Yazoo City, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Yazoo City, save ~10%, and fund a Yazoo City-area nonprofit you choose — at no extra cost. Central Mississippi. Join Good Circles free.",
    "badge": "Gateway to the Delta · Launching September 2026",
    "h1": "Shop local in Yazoo City — and fund a Yazoo City nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Yazoo City, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Yazoo City-area nonprofit you choose</b> — at no extra cost. Early access is underway in Meridian &amp; Lauderdale County, and the September 2026 launch starts in the Jackson metro — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Yazoo City: the famously colorful Main Street storefronts and the hometown Willie Morris wrote about. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Main St"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Broadway"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Downtown"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Main St"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Broadway"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Downtown"
      }
    ],
    "nearby": [
      {
        "slug": "flora",
        "name": "Flora"
      },
      {
        "slug": "canton",
        "name": "Canton"
      },
      {
        "slug": "jackson",
        "name": "Jackson"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Yazoo City, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Yazoo City (Central Mississippi). Add your name now to be first in and to bring it to Yazoo City sooner."
      },
      {
        "q": "How do I support local Yazoo City businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Yazoo City nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Yazoo City nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Yazoo City area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "Central Mississippi"
  },
  {
    "slug": "crystal-springs",
    "name": "Crystal Springs",
    "title": "Shop Local in Crystal Springs, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Crystal Springs, save ~10%, and fund a Crystal Springs-area nonprofit you choose — at no extra cost. Central Mississippi. Join Good Circles free.",
    "badge": "Copiah County · Launching September 2026",
    "h1": "Shop local in Crystal Springs — and fund a Crystal Springs nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Crystal Springs, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Crystal Springs-area nonprofit you choose</b> — at no extra cost. Early access is underway in Meridian &amp; Lauderdale County, and the September 2026 launch starts in the Jackson metro — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Crystal Springs: its 'Tomatopolis of the World' tomato-growing heritage and the annual Tomato Festival downtown. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Downtown"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Hwy 51"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Main St"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Downtown"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Hwy 51"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Main St"
      }
    ],
    "nearby": [
      {
        "slug": "hazlehurst",
        "name": "Hazlehurst"
      },
      {
        "slug": "terry",
        "name": "Terry"
      },
      {
        "slug": "byram",
        "name": "Byram"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Crystal Springs, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Crystal Springs (Central Mississippi). Add your name now to be first in and to bring it to Crystal Springs sooner."
      },
      {
        "q": "How do I support local Crystal Springs businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Crystal Springs nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Crystal Springs nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Crystal Springs area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "Central Mississippi"
  },
  {
    "slug": "hazlehurst",
    "name": "Hazlehurst",
    "title": "Shop Local in Hazlehurst, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Hazlehurst, save ~10%, and fund a Hazlehurst-area nonprofit you choose — at no extra cost. Central Mississippi. Join Good Circles free.",
    "badge": "Copiah County · Launching September 2026",
    "h1": "Shop local in Hazlehurst — and fund a Hazlehurst nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Hazlehurst, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Hazlehurst-area nonprofit you choose</b> — at no extra cost. Early access is underway in Meridian &amp; Lauderdale County, and the September 2026 launch starts in the Jackson metro — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Hazlehurst: the county-seat square in the town where bluesman Robert Johnson was born. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Downtown"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Hwy 51"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Courthouse Sq"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Downtown"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Hwy 51"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Courthouse Sq"
      }
    ],
    "nearby": [
      {
        "slug": "crystal-springs",
        "name": "Crystal Springs"
      },
      {
        "slug": "terry",
        "name": "Terry"
      },
      {
        "slug": "magee",
        "name": "Magee"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Hazlehurst, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Hazlehurst (Central Mississippi). Add your name now to be first in and to bring it to Hazlehurst sooner."
      },
      {
        "q": "How do I support local Hazlehurst businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Hazlehurst nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Hazlehurst nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Hazlehurst area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "Central Mississippi"
  },
  {
    "slug": "magee",
    "name": "Magee",
    "title": "Shop Local in Magee, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Magee, save ~10%, and fund a Magee-area nonprofit you choose — at no extra cost. Central Mississippi. Join Good Circles free.",
    "badge": "Simpson County · Launching September 2026",
    "h1": "Shop local in Magee — and fund a Magee nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Magee, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Magee-area nonprofit you choose</b> — at no extra cost. Early access is underway in Meridian &amp; Lauderdale County, and the September 2026 launch starts in the Jackson metro — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Magee: the Main Street shops along the Highway 49 corridor in Simpson County. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Main St"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Hwy 49"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Downtown"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Main St"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Hwy 49"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Downtown"
      }
    ],
    "nearby": [
      {
        "slug": "mendenhall",
        "name": "Mendenhall"
      },
      {
        "slug": "florence",
        "name": "Florence"
      },
      {
        "slug": "richland",
        "name": "Richland"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Magee, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Magee (Central Mississippi). Add your name now to be first in and to bring it to Magee sooner."
      },
      {
        "q": "How do I support local Magee businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Magee nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Magee nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Magee area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "Central Mississippi"
  },
  {
    "slug": "mendenhall",
    "name": "Mendenhall",
    "title": "Shop Local in Mendenhall, MS — Support Local Businesses & Give Back · Good Circles",
    "description": "Shop local in Mendenhall, save ~10%, and fund a Mendenhall-area nonprofit you choose — at no extra cost. Central Mississippi. Join Good Circles free.",
    "badge": "Simpson County · Launching September 2026",
    "h1": "Shop local in Mendenhall — and fund a Mendenhall nonprofit",
    "answerHtml": "Good Circles lets you shop local businesses in Mendenhall, MS, <b>save about 10%</b>, and send a share of every purchase to a <b>Mendenhall-area nonprofit you choose</b> — at no extra cost. Early access is underway in Meridian &amp; Lauderdale County, and the September 2026 launch starts in the Jackson metro — add your name and you'll be first in. Join free.",
    "introHtml": "Good Circles keeps your spending — and your giving — in Mendenhall: the courthouse square in the heart of Simpson County. Most of every dollar spent at a national chain leaves the moment it's spent. Good Circles changes the rails so it stays right here.",
    "nonprofits": [
      {
        "icon": "🍎",
        "name": "A local food bank",
        "blurb": "Fights hunger in the community."
      },
      {
        "icon": "🎓",
        "name": "A school foundation",
        "blurb": "Funds classrooms and students."
      },
      {
        "icon": "🐾",
        "name": "An animal rescue",
        "blurb": "Cares for pets in need."
      }
    ],
    "businesses": [
      {
        "name": "Local Coffee Roaster",
        "cat": "Café · Courthouse Sq"
      },
      {
        "name": "Family Restaurant",
        "cat": "Restaurant · Downtown"
      },
      {
        "name": "Independent Boutique",
        "cat": "Retail · Main St"
      },
      {
        "name": "Neighborhood Hardware",
        "cat": "Home & trades · Courthouse Sq"
      },
      {
        "name": "Local Bakery",
        "cat": "Food · Downtown"
      },
      {
        "name": "Auto & Tire Shop",
        "cat": "Services · Main St"
      }
    ],
    "nearby": [
      {
        "slug": "magee",
        "name": "Magee"
      },
      {
        "slug": "florence",
        "name": "Florence"
      },
      {
        "slug": "pelahatchie",
        "name": "Pelahatchie"
      }
    ],
    "faqs": [
      {
        "q": "Is Good Circles available in Mendenhall, MS?",
        "a": "Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson metro — expanding to Mendenhall (Central Mississippi). Add your name now to be first in and to bring it to Mendenhall sooner."
      },
      {
        "q": "How do I support local Mendenhall businesses and give to charity at the same time?",
        "a": "Shop local through Good Circles: you save about 10%, the business keeps 89% of its profit, and 10% of that profit funds the Mendenhall nonprofit you chose — automatically, at no extra cost."
      },
      {
        "q": "Which Mendenhall nonprofits can I support?",
        "a": "Any IRS-verified 501(c)(3) in the Mendenhall area you love — from local food banks to schools to animal rescues."
      }
    ],
    "region": "Central Mississippi"
  }
];
