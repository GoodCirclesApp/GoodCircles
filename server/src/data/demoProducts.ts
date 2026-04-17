/**
 * Good Circles — Demo Marketplace Products
 * 
 * All demo products in one file for easy management.
 * When going live with real merchants, delete this file
 * and remove the import from seed-beta.ts.
 * 
 * 55 products across 5 merchants and 10+ categories.
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

export const DEMO_PRODUCTS: DemoProduct[] = [
  // ═══════════════════════════════════════════════════
  // THE HARVEST TABLE (merchantIdx: 0) — Dining
  // ═══════════════════════════════════════════════════
  { merchantIdx: 0, name: 'Farm-to-Table Dinner for Two', desc: 'A seasonal 3-course meal featuring locally sourced ingredients.', price: 85, cogs: 35, type: 'SERVICE', category: 'Dining' },
  { merchantIdx: 0, name: 'Weekend Brunch Special', desc: 'All-you-can-eat brunch buffet with fresh pastries and local eggs.', price: 32, cogs: 12, type: 'SERVICE', category: 'Dining' },
  { merchantIdx: 0, name: 'Artisan Meal Prep Box (5 meals)', desc: 'Weekly meal prep delivery with chef-prepared healthy meals.', price: 75, cogs: 30, type: 'PRODUCT', category: 'Dining' },
  { merchantIdx: 0, name: 'Private Chef Experience', desc: '3-hour in-home cooking experience for up to 8 guests.', price: 350, cogs: 120, type: 'SERVICE', category: 'Dining' },
  { merchantIdx: 0, name: 'Sunday Farm Breakfast', desc: 'Farm-fresh eggs, handmade biscuits, local sausage, and seasonal fruit. Feeds 2.', price: 28, cogs: 12, type: 'SERVICE', category: 'Dining' },
  { merchantIdx: 0, name: 'Seasonal Soup & Sandwich Combo', desc: 'Chef\'s daily soup with artisan grilled sandwich and house salad.', price: 16, cogs: 6, type: 'SERVICE', category: 'Dining' },
  { merchantIdx: 0, name: 'Holiday Catering Package (20 guests)', desc: 'Full holiday spread: roasted turkey, sides, desserts, and beverages.', price: 450, cogs: 180, type: 'SERVICE', category: 'Dining' },
  { merchantIdx: 0, name: 'Cooking Class: Southern Comfort', desc: '2-hour hands-on class learning classic Southern dishes. Includes meal.', price: 65, cogs: 25, type: 'SERVICE', category: 'Dining' },
  { merchantIdx: 0, name: 'Weekly Salad Bowl Subscription', desc: '5 fresh chef-prepared salad bowls delivered Monday. Rotates weekly.', price: 42, cogs: 18, type: 'PRODUCT', category: 'Dining' },
  { merchantIdx: 0, name: 'House-Made Hot Sauce Collection', desc: '3 bottles: Mild Peach, Smoky Chipotle, and Ghost Pepper. Gift-boxed.', price: 24, cogs: 9, type: 'PRODUCT', category: 'Dining' },
  { merchantIdx: 0, name: 'Date Night Dinner Experience', desc: '4-course candlelit dinner for 2 with wine pairings. Reservation required.', price: 120, cogs: 48, type: 'SERVICE', category: 'Dining' },

  // ═══════════════════════════════════════════════════
  // FIX-IT LOCAL PLUMBING (merchantIdx: 1) — Home Services
  // ═══════════════════════════════════════════════════
  { merchantIdx: 1, name: 'Emergency Plumbing Call', desc: 'Same-day emergency plumbing service within metro area.', price: 175, cogs: 80, type: 'SERVICE', category: 'Home Services' },
  { merchantIdx: 1, name: 'Routine Drain Cleaning', desc: 'Professional drain clearing with camera inspection.', price: 120, cogs: 45, type: 'SERVICE', category: 'Home Services' },
  { merchantIdx: 1, name: 'Water Heater Installation', desc: 'Full water heater replacement including disposal of old unit.', price: 850, cogs: 500, type: 'SERVICE', category: 'Home Services' },
  { merchantIdx: 1, name: 'Home Plumbing Inspection', desc: 'Comprehensive 45-minute inspection of all water systems.', price: 95, cogs: 30, type: 'SERVICE', category: 'Home Services' },
  { merchantIdx: 1, name: 'Bathroom Remodel Consultation', desc: 'In-home 1-hour design consultation with cost estimate for full bath remodel.', price: 150, cogs: 40, type: 'SERVICE', category: 'Home Services' },
  { merchantIdx: 1, name: 'Faucet Replacement (Standard)', desc: 'Replace any standard kitchen or bathroom faucet. Parts included.', price: 185, cogs: 90, type: 'SERVICE', category: 'Home Services' },
  { merchantIdx: 1, name: 'Sump Pump Installation', desc: 'Full sump pump install with battery backup. Protect your basement.', price: 650, cogs: 350, type: 'SERVICE', category: 'Home Services' },
  { merchantIdx: 1, name: 'Pipe Winterization Package', desc: 'Insulate and protect exposed pipes before winter. Includes inspection.', price: 225, cogs: 80, type: 'SERVICE', category: 'Home Services' },
  { merchantIdx: 1, name: 'Garbage Disposal Replacement', desc: 'Remove old unit and install new InSinkErator. Includes unit and labor.', price: 295, cogs: 160, type: 'SERVICE', category: 'Home Services' },
  { merchantIdx: 1, name: 'Annual Plumbing Maintenance Plan', desc: '2 visits per year: full inspection, drain cleaning, water heater flush.', price: 199, cogs: 60, type: 'SERVICE', category: 'Home Services' },

  // ═══════════════════════════════════════════════════
  // JUSTICE PARTNERS LEGAL (merchantIdx: 2) — Professional Services
  // ═══════════════════════════════════════════════════
  { merchantIdx: 2, name: 'Initial Legal Consultation', desc: '1-hour legal consultation for personal or business matters.', price: 200, cogs: 60, type: 'SERVICE', category: 'Professional Services' },
  { merchantIdx: 2, name: 'Small Business Formation Package', desc: 'LLC formation including operating agreement and EIN filing.', price: 750, cogs: 200, type: 'SERVICE', category: 'Professional Services' },
  { merchantIdx: 2, name: 'Contract Review', desc: 'Attorney review of a business contract up to 15 pages.', price: 350, cogs: 100, type: 'SERVICE', category: 'Professional Services' },
  { merchantIdx: 2, name: 'Estate Planning Basics', desc: 'Simple will and healthcare directive preparation.', price: 500, cogs: 150, type: 'SERVICE', category: 'Professional Services' },
  { merchantIdx: 2, name: 'Trademark Registration Package', desc: 'Federal trademark search, application filing, and office action response.', price: 899, cogs: 250, type: 'SERVICE', category: 'Professional Services' },
  { merchantIdx: 2, name: 'Lease Agreement Review', desc: 'Attorney review of residential or commercial lease. Markup and summary.', price: 275, cogs: 80, type: 'SERVICE', category: 'Professional Services' },
  { merchantIdx: 2, name: 'Nonprofit 501(c)(3) Filing', desc: 'Complete IRS Form 1023-EZ preparation and filing for tax-exempt status.', price: 600, cogs: 150, type: 'SERVICE', category: 'Professional Services' },
  { merchantIdx: 2, name: 'Employment Contract Drafting', desc: 'Custom employment agreement for small businesses. Includes 1 revision.', price: 450, cogs: 120, type: 'SERVICE', category: 'Professional Services' },
  { merchantIdx: 2, name: 'Power of Attorney Package', desc: 'Durable and healthcare POA documents. Notarization included.', price: 325, cogs: 80, type: 'SERVICE', category: 'Professional Services' },
  { merchantIdx: 2, name: 'Business Compliance Audit', desc: '2-hour review of your small business legal compliance. Written report.', price: 400, cogs: 100, type: 'SERVICE', category: 'Professional Services' },

  // ═══════════════════════════════════════════════════
  // FARM FRESH COLLECTIVE (merchantIdx: 3) — Groceries & More
  // ═══════════════════════════════════════════════════
  { merchantIdx: 3, name: 'Organic Produce Box (Weekly)', desc: 'Seasonal selection of locally grown organic vegetables and fruits.', price: 45, cogs: 25, type: 'PRODUCT', category: 'Groceries' },
  { merchantIdx: 3, name: 'Artisan Bread Basket', desc: 'Assortment of 4 fresh-baked sourdough and whole grain loaves.', price: 18, cogs: 8, type: 'PRODUCT', category: 'Groceries' },
  { merchantIdx: 3, name: 'Local Honey Collection', desc: 'Three 12oz jars of raw unfiltered honey from local apiaries.', price: 36, cogs: 15, type: 'PRODUCT', category: 'Groceries' },
  { merchantIdx: 3, name: 'Free-Range Egg Subscription (Monthly)', desc: '4 dozen eggs per month from pasture-raised hens.', price: 28, cogs: 14, type: 'PRODUCT', category: 'Groceries' },
  { merchantIdx: 3, name: 'Pantry Staples Kit', desc: 'Olive oil, rice, beans, spices — all locally sourced.', price: 55, cogs: 30, type: 'PRODUCT', category: 'Groceries' },
  { merchantIdx: 3, name: 'Backyard Herb Garden Kit', desc: 'Starter kit with 6 herb plants, organic soil, and ceramic pots.', price: 38, cogs: 18, type: 'PRODUCT', category: 'Home & Garden' },
  { merchantIdx: 3, name: 'Grass-Fed Beef Box (10 lbs)', desc: 'Assorted cuts: steaks, ground beef, and roasts. Locally raised.', price: 89, cogs: 55, type: 'PRODUCT', category: 'Groceries' },
  { merchantIdx: 3, name: 'Seasonal Jam Sampler', desc: '4 jars of small-batch preserves: peach, blueberry, fig, and pepper jelly.', price: 32, cogs: 14, type: 'PRODUCT', category: 'Groceries' },
  { merchantIdx: 3, name: 'Farm Fresh Gift Basket', desc: 'Curated basket with honey, cheese, crackers, jam, and dried fruit.', price: 65, cogs: 30, type: 'PRODUCT', category: 'Gifts' },
  { merchantIdx: 3, name: 'Sourdough Starter Kit', desc: 'Live sourdough starter with instruction booklet and branded jar.', price: 22, cogs: 8, type: 'PRODUCT', category: 'Groceries' },
  { merchantIdx: 3, name: 'CSA Full Share (Monthly)', desc: 'Community Supported Agriculture: weekly produce box for 4 weeks.', price: 120, cogs: 65, type: 'PRODUCT', category: 'Groceries' },
  { merchantIdx: 3, name: 'Farm Tour & Tasting Experience', desc: '90-minute guided tour with fresh tastings. Great for families.', price: 25, cogs: 8, type: 'SERVICE', category: 'Activities' },
  { merchantIdx: 3, name: 'Raw Goat Milk Soap (6-pack)', desc: 'Handmade soap with lavender, oatmeal, and honey varieties.', price: 28, cogs: 10, type: 'PRODUCT', category: 'Health & Wellness' },

  // ═══════════════════════════════════════════════════
  // TUTORZONE ACADEMY (merchantIdx: 4) — Education
  // ═══════════════════════════════════════════════════
  { merchantIdx: 4, name: 'Math Tutoring Session (1hr)', desc: 'One-on-one math tutoring for grades 6-12. Online or in-person.', price: 60, cogs: 20, type: 'SERVICE', category: 'Education' },
  { merchantIdx: 4, name: 'SAT Prep Bootcamp (4 weeks)', desc: '12-session SAT preparation course with practice tests.', price: 499, cogs: 150, type: 'SERVICE', category: 'Education' },
  { merchantIdx: 4, name: 'Coding for Kids Workshop', desc: '8-week intro to coding for ages 8-14. Scratch and Python basics.', price: 250, cogs: 80, type: 'SERVICE', category: 'Education' },
  { merchantIdx: 4, name: 'College Application Review', desc: 'Expert review of up to 3 college application essays.', price: 150, cogs: 40, type: 'SERVICE', category: 'Education' },
  { merchantIdx: 4, name: 'Reading Comprehension Program (8 wks)', desc: 'Structured reading improvement for grades 3-8. Two sessions per week.', price: 320, cogs: 100, type: 'SERVICE', category: 'Education' },
  { merchantIdx: 4, name: 'ACT Prep Course (6 weeks)', desc: '18-session ACT prep with 3 full practice tests and score analysis.', price: 449, cogs: 140, type: 'SERVICE', category: 'Education' },
  { merchantIdx: 4, name: 'Spanish for Beginners (10 sessions)', desc: 'Conversational Spanish for adults. Small group, fun approach.', price: 275, cogs: 90, type: 'SERVICE', category: 'Education' },
  { merchantIdx: 4, name: 'Science Fair Project Mentorship', desc: '4 sessions guiding your student from hypothesis to presentation.', price: 180, cogs: 50, type: 'SERVICE', category: 'Education' },
  { merchantIdx: 4, name: 'Study Skills Bootcamp (1 day)', desc: 'All-day workshop covering time management, note-taking, and test strategies.', price: 95, cogs: 30, type: 'SERVICE', category: 'Education' },
  { merchantIdx: 4, name: 'Adult Computer Literacy (4 sessions)', desc: 'Email, internet basics, Word, and online safety for seniors.', price: 120, cogs: 35, type: 'SERVICE', category: 'Education' },
  { merchantIdx: 4, name: 'Summer STEM Camp (1 week)', desc: 'Ages 10-14: robotics, coding, and 3D printing. 9am-3pm daily.', price: 350, cogs: 120, type: 'SERVICE', category: 'Education' },
];

// All product names — used by the admin toggle to identify demo products
export const DEMO_PRODUCT_NAMES = DEMO_PRODUCTS.map(p => p.name);
