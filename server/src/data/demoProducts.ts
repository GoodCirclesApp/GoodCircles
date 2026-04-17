/**
 * Good Circles — Central Mississippi Demo Data
 * Node: Central Mississippi (Jackson Metro)
 * Coverage: Hinds, Rankin, Madison, Simpson, Copiah counties (~1M consumer node)
 */

export interface DemoProduct {
  merchantIdx: number;
  name: string;
  desc: string;
  price: number;
  cogs: number;
  type: 'PRODUCT' | 'SERVICE';
  category: string;
}

export const DEMO_MERCHANTS = [
  { name: "Walker's Drive-In",         email: 'walkers@demo.goodcircles.ms',    city: 'Jackson',   state: 'MS' },
  { name: 'Cups Coffee & Tea',          email: 'cups@demo.goodcircles.ms',       city: 'Jackson',   state: 'MS' },
  { name: "McDade's Market",            email: 'mcdades@demo.goodcircles.ms',    city: 'Jackson',   state: 'MS' },
  { name: "Patton's Heating & Air",     email: 'pattons@demo.goodcircles.ms',    city: 'Ridgeland', state: 'MS' },
  { name: 'Bravo! Italian Restaurant',  email: 'bravo@demo.goodcircles.ms',      city: 'Ridgeland', state: 'MS' },
  { name: 'Whole Health Pharmacy',      email: 'whpharm@demo.goodcircles.ms',    city: 'Madison',   state: 'MS' },
  { name: "Hal & Mal's",                email: 'halmals@demo.goodcircles.ms',    city: 'Jackson',   state: 'MS' },
  { name: 'Capital City Pest Control',  email: 'ccpest@demo.goodcircles.ms',     city: 'Jackson',   state: 'MS' },
  { name: 'Watkins & Eager PLLC',       email: 'watkinslaw@demo.goodcircles.ms', city: 'Jackson',   state: 'MS' },
  { name: 'Foundation Fitness',         email: 'foundfitness@demo.goodcircles.ms', city: 'Brandon', state: 'MS' },
  { name: 'Capitol City Auto Service',  email: 'ccauto@demo.goodcircles.ms',     city: 'Jackson',   state: 'MS' },
  { name: 'Jackson Baking Company',     email: 'jxbaking@demo.goodcircles.ms',   city: 'Jackson',   state: 'MS' },
];

export const DEMO_NONPROFITS = [
  { name: 'Mississippi Food Network',                      email: 'msfoodnet@demo.goodcircles.ms',   ein: '64-0720764' },
  { name: 'The Stewpot Community Services',                email: 'stewpot@demo.goodcircles.ms',     ein: '64-0388654' },
  { name: 'Boys & Girls Club of Central Mississippi',      email: 'bgccentral@demo.goodcircles.ms',  ein: '64-0327461' },
  { name: 'Habitat for Humanity Mississippi Capital Area', email: 'habitatms@demo.goodcircles.ms',   ein: '64-0719421' },
  { name: 'Big Brothers Big Sisters of Greater Mississippi', email: 'bbbsms@demo.goodcircles.ms',   ein: '64-0384765' },
];

export const DEMO_NEIGHBORS = [
  { firstName: 'Marcus',    lastName: 'Johnson',    email: 'mjohnson@demo.goodcircles.ms',    city: 'Jackson' },
  { firstName: 'Tamara',    lastName: 'Williams',   email: 'twilliams@demo.goodcircles.ms',   city: 'Brandon' },
  { firstName: 'Darius',    lastName: 'Davis',      email: 'ddavis@demo.goodcircles.ms',      city: 'Ridgeland' },
  { firstName: 'LaShonda',  lastName: 'Thomas',     email: 'lthomas@demo.goodcircles.ms',     city: 'Jackson' },
  { firstName: 'Kevin',     lastName: 'Anderson',   email: 'kanderson@demo.goodcircles.ms',   city: 'Pearl' },
  { firstName: 'Brianna',   lastName: 'Jackson',    email: 'bjackson@demo.goodcircles.ms',    city: 'Madison' },
  { firstName: 'Terrence',  lastName: 'White',      email: 'twhite@demo.goodcircles.ms',      city: 'Clinton' },
  { firstName: 'Monique',   lastName: 'Harris',     email: 'mharris@demo.goodcircles.ms',     city: 'Flowood' },
  { firstName: 'Cedric',    lastName: 'Martin',     email: 'cmartin@demo.goodcircles.ms',     city: 'Jackson' },
  { firstName: 'Jasmine',   lastName: 'Thompson',   email: 'jthompson@demo.goodcircles.ms',   city: 'Ridgeland' },
  { firstName: 'DeShawn',   lastName: 'Garcia',     email: 'dgarcia@demo.goodcircles.ms',     city: 'Brandon' },
  { firstName: 'Kendra',    lastName: 'Martinez',   email: 'kmartinez@demo.goodcircles.ms',   city: 'Madison' },
  { firstName: 'Reginald',  lastName: 'Robinson',   email: 'rrobinson@demo.goodcircles.ms',   city: 'Jackson' },
  { firstName: 'Aaliyah',   lastName: 'Clark',      email: 'aclark@demo.goodcircles.ms',      city: 'Pearl' },
  { firstName: 'Darrell',   lastName: 'Lewis',      email: 'dlewis@demo.goodcircles.ms',      city: 'Clinton' },
  { firstName: 'Tiffany',   lastName: 'Lee',        email: 'tlee@demo.goodcircles.ms',        city: 'Ridgeland' },
  { firstName: 'Andre',     lastName: 'Walker',     email: 'awalker@demo.goodcircles.ms',     city: 'Jackson' },
  { firstName: 'Shaniqua',  lastName: 'Hall',       email: 'shall@demo.goodcircles.ms',       city: 'Brandon' },
  { firstName: 'Malik',     lastName: 'Allen',      email: 'mallen@demo.goodcircles.ms',      city: 'Flowood' },
  { firstName: 'Destiny',   lastName: 'Young',      email: 'dyoung@demo.goodcircles.ms',      city: 'Madison' },
  { firstName: 'James',     lastName: 'Hernandez',  email: 'jhernandez@demo.goodcircles.ms',  city: 'Jackson' },
  { firstName: 'Latoya',    lastName: 'King',       email: 'lking@demo.goodcircles.ms',       city: 'Jackson' },
  { firstName: 'Bryant',    lastName: 'Wright',     email: 'bwright@demo.goodcircles.ms',     city: 'Brandon' },
  { firstName: 'Shayla',    lastName: 'Scott',      email: 'sscott@demo.goodcircles.ms',      city: 'Clinton' },
  { firstName: 'Jermaine',  lastName: 'Adams',      email: 'jadams@demo.goodcircles.ms',      city: 'Pearl' },
];

export const DEMO_PRODUCTS: DemoProduct[] = [
  // ═══════════════════════════════════════════════════
  // WALKER'S DRIVE-IN (merchantIdx: 0) — Dining, Jackson
  // ═══════════════════════════════════════════════════
  { merchantIdx: 0, name: "Walker's Classic Burger Plate",     desc: "Double smash burger with hand-cut fries and sweet tea — Jackson's favorite since 1940.", price: 14, cogs: 5,  type: 'SERVICE', category: 'Dining' },
  { merchantIdx: 0, name: "Walker's Catfish Platter",          desc: "Southern fried catfish with coleslaw, hush puppies, and tartar sauce. Served all-day.", price: 16, cogs: 6,  type: 'SERVICE', category: 'Dining' },
  { merchantIdx: 0, name: "Walker's Breakfast Special",        desc: "Two eggs any style, smoked sausage, grits, and biscuits with gravy.", price: 11, cogs: 4,  type: 'SERVICE', category: 'Dining' },
  { merchantIdx: 0, name: "Sunday Soul Food Buffet",           desc: "All-you-can-eat fried chicken, collard greens, mac & cheese, cornbread, and sweet potato pie.", price: 22, cogs: 9,  type: 'SERVICE', category: 'Dining' },
  { merchantIdx: 0, name: "Pecan Pie Slice",                   desc: "House-made Mississippi pecan pie — whole slice with vanilla ice cream.", price: 7,  cogs: 2,  type: 'SERVICE', category: 'Dining' },
  { merchantIdx: 0, name: "Family Meal Box (Feeds 4)",         desc: "Fried chicken, two sides, rolls, and a half-gallon of sweet tea.", price: 48, cogs: 18, type: 'PRODUCT', category: 'Dining' },
  { merchantIdx: 0, name: "Catering: Office Lunch Package",    desc: "Sandwich trays, sides, and drinks for up to 20 people. 24-hour notice.", price: 280, cogs: 110, type: 'SERVICE', category: 'Dining' },

  // ═══════════════════════════════════════════════════
  // CUPS COFFEE & TEA (merchantIdx: 1) — Fondren, Jackson
  // ═══════════════════════════════════════════════════
  { merchantIdx: 1, name: "Cups Signature Latte",              desc: "Double-shot espresso with steamed local dairy or oat milk. Hot or iced.", price: 6,  cogs: 2,  type: 'SERVICE', category: 'Dining' },
  { merchantIdx: 1, name: "Cold Brew (16 oz)",                 desc: "Slow-steeped 18-hour cold brew. Black or with vanilla sweet cream.", price: 5,  cogs: 1,  type: 'SERVICE', category: 'Dining' },
  { merchantIdx: 1, name: "House Baked Pastry",                desc: "Daily rotating selection: croissant, blueberry scone, or cinnamon roll.", price: 4,  cogs: 1,  type: 'PRODUCT', category: 'Dining' },
  { merchantIdx: 1, name: "Fondren Avocado Toast",             desc: "Thick sourdough, smashed avocado, cherry tomatoes, feta, and everything seasoning.", price: 10, cogs: 4,  type: 'SERVICE', category: 'Dining' },
  { merchantIdx: 1, name: "Bags of the Week — Local Roast",    desc: "12 oz bag of the current single-origin or house blend. Ground or whole bean.", price: 17, cogs: 7,  type: 'PRODUCT', category: 'Groceries' },
  { merchantIdx: 1, name: "Office Coffee Catering",            desc: "Gallon airpots (regular + decaf), cups, condiments, and pastry tray for 15.", price: 95, cogs: 38, type: 'SERVICE', category: 'Dining' },

  // ═══════════════════════════════════════════════════
  // McDADE'S MARKET (merchantIdx: 2) — Grocery, Jackson
  // ═══════════════════════════════════════════════════
  { merchantIdx: 2, name: "Weekly Produce Box",                desc: "Seasonal selection of fresh Mississippi-grown vegetables and fruits. Feeds a family of 4.", price: 38, cogs: 20, type: 'PRODUCT', category: 'Groceries' },
  { merchantIdx: 2, name: "Local Grass-Fed Ground Beef (3 lbs)", desc: "Sourced from Simpson County farms. No hormones, no antibiotics.", price: 24, cogs: 14, type: 'PRODUCT', category: 'Groceries' },
  { merchantIdx: 2, name: "Deli Sandwich & Side",              desc: "Made-to-order deli sandwich with chips or fruit and fountain drink.", price: 10, cogs: 4,  type: 'SERVICE', category: 'Dining' },
  { merchantIdx: 2, name: "Southern Pantry Staples Kit",       desc: "Cornmeal, grits, molasses, cane syrup, field peas, and hot sauce. All local brands.", price: 42, cogs: 22, type: 'PRODUCT', category: 'Groceries' },
  { merchantIdx: 2, name: "Free-Range Dozen Eggs",             desc: "From Copiah County pasture-raised hens. Available weekly.", price: 8,  cogs: 4,  type: 'PRODUCT', category: 'Groceries' },
  { merchantIdx: 2, name: "Mississippi Honey (16 oz)",         desc: "Raw, unfiltered wildflower honey from Madison County beekeepers.", price: 14, cogs: 7,  type: 'PRODUCT', category: 'Groceries' },
  { merchantIdx: 2, name: "Family Grocery Bundle",             desc: "Curated $150 grocery staples order — proteins, produce, dairy, and pantry. Weekly pickup.", price: 150, cogs: 90, type: 'PRODUCT', category: 'Groceries' },

  // ═══════════════════════════════════════════════════
  // PATTON'S HEATING & AIR (merchantIdx: 3) — HVAC, Ridgeland
  // ═══════════════════════════════════════════════════
  { merchantIdx: 3, name: "AC Tune-Up & Seasonal Inspection",  desc: "Full 21-point AC inspection, filter replacement, coil cleaning, and refrigerant check.", price: 99,  cogs: 35, type: 'SERVICE', category: 'Home Maintenance' },
  { merchantIdx: 3, name: "Emergency HVAC Service Call",        desc: "Same-day emergency diagnosis. $50 credited toward any repair. Hinds/Rankin/Madison.", price: 175, cogs: 65, type: 'SERVICE', category: 'Home Maintenance' },
  { merchantIdx: 3, name: "New AC Unit Installation (3-ton)",   desc: "Carrier 16-SEER system: equipment, installation, and 1-year parts & labor warranty.", price: 3800, cogs: 2200, type: 'SERVICE', category: 'Home Maintenance' },
  { merchantIdx: 3, name: "Annual HVAC Maintenance Plan",       desc: "Two seasonal tune-ups, priority service, and 15% parts discount for 12 months.", price: 189, cogs: 65, type: 'SERVICE', category: 'Home Maintenance' },
  { merchantIdx: 3, name: "Duct Cleaning Service",              desc: "Full home duct cleaning with antimicrobial treatment. Up to 2,000 sq ft.", price: 325, cogs: 120, type: 'SERVICE', category: 'Home Maintenance' },
  { merchantIdx: 3, name: "Furnace Inspection & Cleaning",      desc: "Gas furnace safety inspection, heat exchanger check, and burner cleaning.", price: 89,  cogs: 30, type: 'SERVICE', category: 'Home Maintenance' },

  // ═══════════════════════════════════════════════════
  // BRAVO! ITALIAN RESTAURANT (merchantIdx: 4) — Ridgeland
  // ═══════════════════════════════════════════════════
  { merchantIdx: 4, name: "Dinner for Two — Three Courses",    desc: "Chef's seasonal appetizers, house pasta or entrée, and tiramisu. Wine pairing available.", price: 95,  cogs: 38, type: 'SERVICE', category: 'Dining' },
  { merchantIdx: 4, name: "Lunch Special: Pasta & Salad",      desc: "Choice of pasta entrée with house salad and bread. Mon–Fri 11am–2pm.", price: 18,  cogs: 7,  type: 'SERVICE', category: 'Dining' },
  { merchantIdx: 4, name: "Private Dining Room (up to 20)",    desc: "2-hour reservation in our private dining room. Minimum $500 F&B spend.", price: 75,  cogs: 20, type: 'SERVICE', category: 'Dining' },
  { merchantIdx: 4, name: "Bravo! Gift Card",                  desc: "Restaurant gift card — never expires. Great for business gifting.", price: 50,  cogs: 50, type: 'PRODUCT', category: 'Gifts' },
  { merchantIdx: 4, name: "Corporate Catering Package",         desc: "Full Italian spread for 25: antipasto, pasta bar, proteins, dessert. Delivery included.", price: 650, cogs: 260, type: 'SERVICE', category: 'Dining' },

  // ═══════════════════════════════════════════════════
  // WHOLE HEALTH PHARMACY (merchantIdx: 5) — Madison
  // ═══════════════════════════════════════════════════
  { merchantIdx: 5, name: "Medication Therapy Management (MTM) Consult", desc: "1-hour pharmacist consultation to review all medications, identify interactions, and optimize your regimen.", price: 85, cogs: 25, type: 'SERVICE', category: 'Health & Pharmacy' },
  { merchantIdx: 5, name: "Compounding Prescription (Custom)",  desc: "Custom compounded medication — pricing varies. Consult required.", price: 75,  cogs: 40, type: 'SERVICE', category: 'Health & Pharmacy' },
  { merchantIdx: 5, name: "Wellness Lab Panel",                 desc: "In-pharmacy blood glucose, cholesterol, A1C, and blood pressure screening. No appointment.", price: 45,  cogs: 18, type: 'SERVICE', category: 'Health & Pharmacy' },
  { merchantIdx: 5, name: "Immunization: Flu Shot",             desc: "Seasonal influenza vaccine. Walk-ins welcome. Most insurances accepted.", price: 40,  cogs: 20, type: 'SERVICE', category: 'Health & Pharmacy' },
  { merchantIdx: 5, name: "Monthly Vitamin & Supplement Box",   desc: "Pharmacist-curated 30-day supplement pack based on your health goals.", price: 55,  cogs: 28, type: 'PRODUCT', category: 'Health & Pharmacy' },
  { merchantIdx: 5, name: "Diabetes Care Kit",                  desc: "Glucose meter, lancets, test strips (50 ct), and alcohol swabs. OTC supply.",  price: 65,  cogs: 42, type: 'PRODUCT', category: 'Health & Pharmacy' },

  // ═══════════════════════════════════════════════════
  // HAL & MAL'S (merchantIdx: 6) — Jackson Music/Dining
  // ═══════════════════════════════════════════════════
  { merchantIdx: 6, name: "Live Music Night — Two Tickets",     desc: "Two general admission tickets to any Friday or Saturday night show.", price: 30,  cogs: 10, type: 'SERVICE', category: 'Entertainment' },
  { merchantIdx: 6, name: "Hal & Mal's Burger & Beer Combo",    desc: "House smash burger with fries and your choice of draft beer or craft soda.", price: 18,  cogs: 7,  type: 'SERVICE', category: 'Dining' },
  { merchantIdx: 6, name: "Private Event Venue (3 hours)",       desc: "Rent the main room for corporate events, birthdays, or private concerts. Bar service included.", price: 450, cogs: 150, type: 'SERVICE', category: 'Entertainment' },
  { merchantIdx: 6, name: "Happy Hour Package for 10",           desc: "Draft beers and appetizers for 10 people. Mon–Fri 4–7pm.", price: 120, cogs: 50, type: 'SERVICE', category: 'Dining' },
  { merchantIdx: 6, name: "Mississippi Music Festival Table",    desc: "Reserved table for 4 at Hal & Mal's Mardi Gras or St. Paddy's events.", price: 80,  cogs: 25, type: 'SERVICE', category: 'Entertainment' },

  // ═══════════════════════════════════════════════════
  // CAPITAL CITY PEST CONTROL (merchantIdx: 7) — Jackson
  // ═══════════════════════════════════════════════════
  { merchantIdx: 7, name: "Quarterly Home Pest Treatment",       desc: "Interior and exterior treatment for ants, roaches, spiders, and general pests. Up to 2,500 sq ft.", price: 119, cogs: 42, type: 'SERVICE', category: 'Home Maintenance' },
  { merchantIdx: 7, name: "Termite Inspection & Bond",           desc: "Full property termite inspection with written report. Annual bond available.", price: 150, cogs: 50, type: 'SERVICE', category: 'Home Maintenance' },
  { merchantIdx: 7, name: "Mosquito Barrier Treatment",          desc: "Yard perimeter spray for mosquitoes. Effective 3–4 weeks. Ideal before outdoor events.", price: 85,  cogs: 30, type: 'SERVICE', category: 'Home Maintenance' },
  { merchantIdx: 7, name: "Rodent Exclusion Service",            desc: "Inspection, sealing entry points, and trap placement. Includes 30-day follow-up.", price: 225, cogs: 80, type: 'SERVICE', category: 'Home Maintenance' },
  { merchantIdx: 7, name: "Annual Pest Control Plan",            desc: "4 quarterly visits with unlimited callback service for 12 months.", price: 399, cogs: 140, type: 'SERVICE', category: 'Home Maintenance' },

  // ═══════════════════════════════════════════════════
  // WATKINS & EAGER PLLC (merchantIdx: 8) — Jackson
  // ═══════════════════════════════════════════════════
  { merchantIdx: 8, name: "Initial Legal Consultation (1 hr)",   desc: "In-person consultation with an attorney. Business, real estate, or personal matters.", price: 250, cogs: 75,  type: 'SERVICE', category: 'Professional Services' },
  { merchantIdx: 8, name: "Business Formation Package",          desc: "Mississippi LLC formation, operating agreement, EIN filing, and registered agent (1 year).", price: 850, cogs: 225, type: 'SERVICE', category: 'Professional Services' },
  { merchantIdx: 8, name: "Real Estate Contract Review",         desc: "Attorney review of purchase, sale, or lease agreement. Up to 20 pages.", price: 375, cogs: 100, type: 'SERVICE', category: 'Professional Services' },
  { merchantIdx: 8, name: "Estate Planning Essentials",          desc: "Will, healthcare directive, and durable power of attorney. Notarization included.", price: 600, cogs: 175, type: 'SERVICE', category: 'Professional Services' },
  { merchantIdx: 8, name: "Employment Contract Drafting",         desc: "Custom employment or independent contractor agreement with one revision.", price: 500, cogs: 140, type: 'SERVICE', category: 'Professional Services' },
  { merchantIdx: 8, name: "Nonprofit 501(c)(3) Preparation",     desc: "Complete IRS Form 1023-EZ filing with supporting documents for tax-exempt status.", price: 750, cogs: 200, type: 'SERVICE', category: 'Professional Services' },

  // ═══════════════════════════════════════════════════
  // FOUNDATION FITNESS (merchantIdx: 9) — Brandon
  // ═══════════════════════════════════════════════════
  { merchantIdx: 9, name: "Monthly Gym Membership",              desc: "Full access: weights, cardio, functional training area, and all group fitness classes.", price: 45,  cogs: 12, type: 'SERVICE', category: 'Fitness' },
  { merchantIdx: 9, name: "Personal Training Session (1 hr)",    desc: "One-on-one session with a certified trainer. Assessment included on first visit.", price: 70,  cogs: 22, type: 'SERVICE', category: 'Fitness' },
  { merchantIdx: 9, name: "10-Class Fitness Pass",               desc: "10 group fitness classes: HIIT, yoga, cycling, or Zumba. Use within 90 days.", price: 120, cogs: 38, type: 'SERVICE', category: 'Fitness' },
  { merchantIdx: 9, name: "6-Week Body Transformation Program",  desc: "Personalized training plan, nutrition guidance, and 12 training sessions.", price: 450, cogs: 140, type: 'SERVICE', category: 'Fitness' },
  { merchantIdx: 9, name: "Nutrition Coaching Session",          desc: "60-minute consult with certified nutritionist. Meal plan included.", price: 85,  cogs: 28, type: 'SERVICE', category: 'Wellness' },

  // ═══════════════════════════════════════════════════
  // CAPITOL CITY AUTO SERVICE (merchantIdx: 10) — Jackson
  // ═══════════════════════════════════════════════════
  { merchantIdx: 10, name: "Full-Synthetic Oil Change",          desc: "5-qt synthetic oil, new filter, multi-point inspection, and tire pressure check.", price: 75,  cogs: 32, type: 'SERVICE', category: 'Transportation' },
  { merchantIdx: 10, name: "Brake Pad Replacement (Axle)",       desc: "Semi-metallic or ceramic pads, resurface rotors if needed. Parts and labor.", price: 225, cogs: 110, type: 'SERVICE', category: 'Transportation' },
  { merchantIdx: 10, name: "AC Recharge & Leak Check",           desc: "Refrigerant recharge, pressure test, and leak detection. Mississippi summer essential.", price: 145, cogs: 55, type: 'SERVICE', category: 'Transportation' },
  { merchantIdx: 10, name: "Mississippi State Vehicle Inspection", desc: "Official MS safety inspection with printed certificate. Most vehicles.", price: 25,  cogs: 8,  type: 'SERVICE', category: 'Transportation' },
  { merchantIdx: 10, name: "Full Detail — Interior & Exterior",  desc: "Hand wash, clay bar, wax, full interior vacuum and shampoo.", price: 175, cogs: 65, type: 'SERVICE', category: 'Transportation' },
  { merchantIdx: 10, name: "Tire Rotation & Balance",            desc: "4-tire rotation, balance, and alignment check.", price: 60,  cogs: 20, type: 'SERVICE', category: 'Transportation' },

  // ═══════════════════════════════════════════════════
  // JACKSON BAKING COMPANY (merchantIdx: 11) — Fondren
  // ═══════════════════════════════════════════════════
  { merchantIdx: 11, name: "Artisan Sourdough Loaf",             desc: "Naturally leavened sourdough baked fresh daily. Whole or sliced.", price: 10, cogs: 3,  type: 'PRODUCT', category: 'Groceries' },
  { merchantIdx: 11, name: "Mississippi Sweet Potato Pound Cake",desc: "Whole pound cake with brown sugar glaze. Serves 8. A Jackson classic.", price: 32, cogs: 11, type: 'PRODUCT', category: 'Dining' },
  { merchantIdx: 11, name: "Half-Dozen Specialty Doughnuts",     desc: "Rotating flavors: lemon blueberry, praline, chocolate espresso, strawberry shortcake.", price: 15, cogs: 5,  type: 'PRODUCT', category: 'Dining' },
  { merchantIdx: 11, name: "Custom Birthday Cake (8-inch)",      desc: "Custom designed 2-layer 8-inch cake. 5-day lead time.", price: 75, cogs: 28, type: 'PRODUCT', category: 'Dining' },
  { merchantIdx: 11, name: "Weekly Bread Subscription",          desc: "Two fresh loaves weekly: sourdough + a seasonal selection. Pickup Friday mornings.", price: 36, cogs: 12, type: 'PRODUCT', category: 'Groceries' },
  { merchantIdx: 11, name: "Corporate Baked Goods Box",          desc: "Assorted cookies, muffins, and mini cakes for 15–20 people.", price: 85, cogs: 32, type: 'PRODUCT', category: 'Dining' },
];

export const DEMO_PRODUCT_NAMES = DEMO_PRODUCTS.map(p => p.name);
