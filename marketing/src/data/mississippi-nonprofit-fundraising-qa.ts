// Content for the /mississippi-nonprofit-fundraising Q&A page. 40 questions small
// and Mississippi nonprofits ask about fundraising, plus a Good Circles section.
// Same structure/conventions as the other Q&A data files.
//
// Sector benchmarks (retention rates, cost-per-dollar, overhead) are given as
// COMMONLY CITED ranges and clearly hedged, never as invented precision. Good
// Circles is one recurring stream among many, described honestly. Links point
// generously into the free /resources hub and must resolve at build time.

export interface QA {
  q: string;
  a: string; // HTML
}
export interface QACategory {
  id: string;
  title: string;
  blurb: string;
  items: QA[];
}

const forNp = '<a href="/for-nonprofits">Good Circles for nonprofits</a>';
const hub = '<a href="/resources">free nonprofit resource hub</a>';
const ms = '<a href="/resources/states/mississippi/">Mississippi nonprofit playbook</a>';
const passive = '<a href="/resources/passive-funding/passive-fundraising-explained/">passive fundraising</a>';
const mix = '<a href="/resources/fundraising/the-funding-mix/">the funding mix</a>';
const retention = '<a href="/resources/donor-development/donor-retention-and-stewardship/">donor retention and stewardship</a>';
const major = '<a href="/resources/fundraising/major-gifts/">major gifts</a>';
const story = '<a href="/resources/marketing/nonprofit-storytelling/">nonprofit storytelling</a>';
const budgeting = '<a href="/resources/operations/nonprofit-budgeting/">nonprofit budgeting</a>';
const board = '<a href="/resources/governance-compliance/nonprofit-board-governance/">board governance</a>';
const calc = '<a href="/resources/tools/passive-funding-calculator/">passive funding calculator</a>';

export const MS_FUNDRAISING_QA: QACategory[] = [
  {
    id: "planning",
    title: "Planning, budgets, and goals",
    blurb: "Setting realistic targets and deciding what to spend.",
    items: [
      {
        q: "What's a realistic fundraising goal for a small nonprofit?",
        a: `Base the goal on evidence, not hope. Start from last year's results, your number of active donors and their average gift, and the capacity of your board and staff, then set a target that is a modest, defensible step up. A common mistake is anchoring to the budget you wish you had rather than to what your current base can give. Build the goal from the bottom up by source, using the approach in our guide to ${mix}, so each dollar has a plan behind it.`,
      },
      {
        q: "What's the best fundraising strategy for small nonprofits?",
        a: `Concentrate on a few things you can do consistently rather than spreading thin. For most small organizations that means retaining the donors you already have, growing recurring monthly gifts, cultivating a handful of major donors, and adding one or two earned or partnership streams that do not depend on a grant cycle. Depth beats breadth at small scale. Our overview of ${mix} explains how to balance these so no single source becomes a point of failure.`,
      },
      {
        q: "How do I create a nonprofit fundraising plan?",
        a: `A workable plan names your revenue goal, breaks it down by source, assigns each piece an owner and a timeline, and defines how you will measure progress. Keep it to a page or two so it actually gets used. Tie it to your broader goals using our guide to <a href="/resources/operations/strategic-planning/">strategic planning</a>, and revisit it quarterly rather than filing it away. A plan you review is worth far more than a polished one you do not.`,
      },
      {
        q: "What should a nonprofit fundraising budget include?",
        a: `Account for both the costs and the expected return of each activity: staff or contractor time, software, payment processing, event expenses, printing and postage, and any acquisition spend, set against the revenue each is meant to produce. Budget conservatively on income and fully on costs. Our guide to ${budgeting} covers the line items and how to plan them, so you can see which activities actually earn their keep.`,
      },
      {
        q: "How much revenue should nonprofits spend on fundraising?",
        a: `Rules of thumb exist, and watchdogs have historically suggested keeping fundraising costs under roughly a third of contributions, but rigid overhead ratios are an increasingly criticized way to judge a nonprofit. What matters more is whether a given activity returns more than it costs and builds long-term donor relationships. Spend what produces durable results, track it honestly, and be ready to explain it, rather than starving the function to hit an arbitrary ratio.`,
      },
      {
        q: "How much should I budget for nonprofit fundraising software?",
        a: `You can start at little or no cost. Many small organizations begin with free or low-cost tools for donor records and email, then add paid features as the donor base and revenue grow. Match the tool to your actual scale rather than buying for the organization you imagine; the most common waste is paying for capabilities you will not use for years. See our guide to the <a href="/resources/operations/nonprofit-tech-stack/">nonprofit tech stack</a> for sensible starting points.`,
      },
      {
        q: "What's the ROI of nonprofit fundraising software?",
        a: `Good software pays off mainly by improving donor retention and staff efficiency, not by raising money on its own. A reliable record of who gives, when, and why lets you steward donors well and stop losing them, which is where the real return lives. Judge a tool by whether it helps you keep donors and save time, and avoid features whose cost you cannot connect to one of those outcomes. Retention is the lever; see ${retention}.`,
      },
    ],
  },
  {
    id: "staffing",
    title: "Staffing, hiring, and help",
    blurb: "Whether to hire, what it costs, and how to grow a fundraising team.",
    items: [
      {
        q: "How do I know if my nonprofit needs professional fundraising help?",
        a: `Consider help when demand consistently outruns your capacity, when you have a growing donor base you cannot properly steward, or when you are leaving major-gift or grant revenue on the table for lack of expertise. If the constraint is simply that no one has time to follow up with donors, a part-time hire or a consultant may unlock more than new tactics will. Diagnose the bottleneck first, then decide whether it calls for a person, a tool, or a process.`,
      },
      {
        q: "How much does it cost to hire a nonprofit fundraiser?",
        a: `Compensation varies widely by region, experience, and the size of the organization, so treat any single figure with caution and benchmark locally. Small organizations often start with a part-time or contract development role before committing to a full-time salary, which lowers the risk while you confirm the position pays for itself. Whatever the arrangement, set compensation through disinterested board review and tie expectations to measurable results.`,
      },
      {
        q: "Should my nonprofit hire a fundraiser or use software?",
        a: `They solve different problems, so it is rarely either-or. Software organizes information and automates routine work; a fundraiser builds relationships and makes asks that software cannot. A very small organization may get further by adding a capable person with simple tools than by buying advanced software no one has time to use. Decide based on your real bottleneck, and remember that a tool without someone to act on it rarely raises money.`,
      },
      {
        q: "What should I look for in a nonprofit fundraising consultant?",
        a: `Look for relevant experience with organizations of your size and cause, references you can actually check, a clear and ethical fee structure, and a focus on building your capacity rather than creating dependence. Be cautious of anyone promising guaranteed results or proposing commission-based pay on gifts, which the sector's ethical standards discourage. The best consultants leave you stronger and more self-sufficient than they found you.`,
      },
      {
        q: "Should my nonprofit hire multiple fundraisers or one?",
        a: `Start with one strong generalist and add specialists only when the revenue and the workload justify it. A single capable development person can cover the essentials at small scale; splitting the role too early spreads salaries thinner than the donor base can support. Grow the team in step with the donor base and the dollars it reliably produces, not ahead of them.`,
      },
      {
        q: "What does a digital fundraising manager actually do?",
        a: `A digital fundraising manager runs the online side of giving: email and social campaigns, the donation experience on your website, recurring-gift programs, and the data behind them. The role blends marketing, light technical work, and donor stewardship, with success measured in dollars raised and donors retained, not clicks alone. At a small organization these duties often sit with one generalist rather than a dedicated hire.`,
      },
      {
        q: "How do I transition from volunteer to paid nonprofit staff?",
        a: `Build demonstrable skills and results as a volunteer, make your interest in a paid role known, and watch for openings as the organization grows. Document what you have contributed in concrete terms, since that record is your strongest case. Be aware that funding a new paid position is itself a fundraising decision for the organization, so showing how the role would pay for itself strengthens the argument.`,
      },
      {
        q: "What training does a nonprofit fundraiser need?",
        a: `The core skills are donor communication, relationship building, basic data and budgeting, and a sound grasp of fundraising ethics and compliance. Formal credentials such as the CFRE exist and can help, but practical experience and a strong ethical foundation matter more day to day. Much of what a new fundraiser needs can be learned from free, well-sourced material; our ${hub} covers the fundamentals at no cost.`,
      },
      {
        q: "How do I recruit and retain nonprofit staff?",
        a: `Compete on mission, growth, and culture, since you usually cannot win on salary alone, and then pay as fairly as your budget allows. Clear roles, real professional development, and recognition do much of the retention work. Turnover is expensive and disrupts donor relationships, so treat keeping good people as a fundraising priority, not just an HR one.`,
      },
      {
        q: "What's the difference between fundraising and development?",
        a: `Fundraising usually refers to the act of raising money, while development is the broader, longer-term work of building relationships and a sustainable base of support, of which fundraising is one part. In practice the terms overlap and many organizations use them interchangeably. The useful distinction is mindset: development thinking treats each gift as the start of a relationship rather than the end of a transaction, which is what drives ${retention}.`,
      },
    ],
  },
  {
    id: "donors",
    title: "Donors: retention, major gifts, and communication",
    blurb: "Keeping donors, growing the biggest relationships, and treating supporters well.",
    items: [
      {
        q: "What's a good donor retention rate for nonprofits?",
        a: `Benchmarks commonly cited in the sector put overall donor retention in the range of about 40 to 45 percent, with first-time-donor retention much lower, often around 20 to 25 percent, and repeat-donor retention considerably higher. The practical takeaway is that keeping donors is harder and more valuable than acquiring them, and that small improvements in retention compound. Treat your own trend over time as the real measure; see ${retention}.`,
      },
      {
        q: "How often should nonprofits communicate with donors?",
        a: `Often enough to maintain a relationship, but weighted heavily toward gratitude and impact rather than asks. A workable rhythm for many small organizations is regular updates and thank-yous with a smaller number of direct appeals across the year, adjusted to what your donors actually want. Quality and relevance matter more than a fixed number; a well-timed, specific update beats frequent generic mail.`,
      },
      {
        q: "How do successful nonprofits build major donor programs?",
        a: `They identify supporters with both the capacity and the inclination to give more, then invest in genuine relationships through personal attention, clear impact, and specific, well-timed asks. Major-gift fundraising is patient relationship work, not a mass campaign, and it often produces a large share of revenue from a small number of donors. Our guide to ${major} walks through identifying, cultivating, and stewarding these relationships.`,
      },
      {
        q: "What's the best way to ask for large donations?",
        a: `Ask in person where you can, after you have built the relationship and understood what the donor cares about, with a specific amount tied to a specific outcome. Make the case about the impact the gift will have, not your organization's need, and then be quiet and listen. The ask is one moment in a longer relationship; preparation and follow-through around it matter as much as the request itself. See ${major}.`,
      },
      {
        q: "What should nonprofits know about donor privacy?",
        a: `Handle donor data carefully and lawfully: collect only what you need, secure it, honor requests not to share or to be removed, and be transparent about how you use it. Respect privacy preferences even where the law does not strictly require it, because trust is the foundation of donor relationships. Build sensible data practices into your operations and your <a href="/resources/governance-compliance/annual-compliance-checklist/">compliance routine</a> rather than treating privacy as an afterthought.`,
      },
      {
        q: "How can nonprofits use surveys to improve fundraising?",
        a: `Short, focused surveys reveal why donors give, what they want to hear about, and how they prefer to be contacted, which lets you steward them better and lose fewer of them. Keep surveys brief, act visibly on what you learn, and close the loop by telling donors what changed. The goal is sharper relationships, not data for its own sake, so ask only what you will use.`,
      },
    ],
  },
  {
    id: "channels",
    title: "Channels and tactics",
    blurb: "Email, text, social, storytelling, timing, and the tools behind them.",
    items: [
      {
        q: "Can email marketing really work for nonprofit fundraising?",
        a: `Yes. Email remains one of the most cost-effective channels for small nonprofits because you own the audience and the cost is low. It works best for stewardship and recurring appeals to people who already know you, rather than as a tool for acquiring strangers. Segment your list, lead with impact, and keep most messages about gratitude and results; our guide to <a href="/resources/marketing/nonprofit-email-marketing/">email marketing</a> covers the essentials.`,
      },
      {
        q: "How can my nonprofit use SMS for fundraising?",
        a: `Text messaging can drive urgent, time-sensitive response and works well for reminders, event-day appeals, and recurring-gift prompts, but only with explicit consent and a light touch, since it is the most intrusive channel. Keep messages short, infrequent, and clearly valuable, and always honor opt-outs. Used sparingly alongside email, it can lift response; overused, it drives donors away.`,
      },
      {
        q: "Can nonprofits use social media for fundraising?",
        a: `Social media is strong for awareness, storytelling, and reaching new audiences, and weaker as a direct donation channel on its own. Treat it as the top of the funnel that moves people toward your email list and your website, where most giving actually happens. Focus on a platform or two where your supporters already are rather than trying to be everywhere; see <a href="/resources/marketing/nonprofit-social-media/">social media for nonprofits</a> and the free <a href="/resources/marketing/google-ad-grant-guide/">Google Ad Grant</a>.`,
      },
      {
        q: "How can nonprofits use storytelling in fundraising?",
        a: `Stories move people in a way that statistics cannot, so center one real person or moment, show the change a gift makes, and let the donor see their role in it. Keep it concrete, honest, and short, and always secure permission and protect dignity. Pair the story with a clear ask and a specific outcome. Our guide to ${story} shows how to find and tell these stories well.`,
      },
      {
        q: "What's the best time of year for nonprofit fundraising?",
        a: `The end of the calendar year, especially the final weeks of December, is the strongest giving period for most organizations, and spring is a common secondary push. That said, the best time is whenever you have a compelling, specific reason to ask and the stewardship to back it up. Plan campaigns around the calendar's natural peaks, but do not let a date substitute for a reason to give.`,
      },
      {
        q: "What technology do successful nonprofits use?",
        a: `Most run on a small, well-chosen stack: a donor database or CRM, an email tool, a reliable online donation page, and basic accounting, integrated so data does not have to be re-entered. The winning approach is fewer tools used well rather than many used poorly. Start with the essentials, make sure they talk to each other, and add only what solves a real problem; see the <a href="/resources/operations/nonprofit-tech-stack/">nonprofit tech stack</a> and <a href="/resources/donor-development/choosing-a-nonprofit-crm/">choosing a CRM</a>.`,
      },
    ],
  },
  {
    id: "measuring",
    title: "Measuring and improving",
    blurb: "Tracking results, understanding efficiency, and getting better.",
    items: [
      {
        q: "How do I track nonprofit fundraising success?",
        a: `Track a short list of measures that reflect health, not just totals: dollars raised by source, donor retention, average gift, number of recurring donors, and cost to raise a dollar. Watching these over time tells you what is working and what to fix. Avoid vanity metrics that feel good but do not connect to revenue or relationships; our guide to <a href="/resources/program-design/how-to-measure-outcomes/">measuring outcomes</a> helps separate the two.`,
      },
      {
        q: "How do I evaluate nonprofit fundraising performance?",
        a: `Judge each activity on both return and durability: how much it raised against what it cost, and whether it built relationships you can rely on again. A campaign that nets a little but recruits loyal monthly donors can outperform one that nets more from one-time gifts. Review performance on a regular cadence and reallocate toward what compounds, using ${retention} as a key lens.`,
      },
      {
        q: "What's the average cost per dollar raised for nonprofits?",
        a: `A frequently cited overall benchmark is roughly 20 cents to raise a dollar, but the real figure varies enormously by method. Major gifts and recurring giving are usually very efficient, events tend to be expensive, and acquiring brand-new donors can cost more than the first gift returns, paying off only through retention. Use the benchmark as a rough reference, then measure your own programs individually rather than judging everything by one number.`,
      },
      {
        q: "How can nonprofits improve their fundraising results?",
        a: `The highest-return improvements are usually unglamorous: keep more of the donors you already have, convert one-time givers to monthly, thank people promptly and specifically, and ask with a clear, concrete purpose. Fix retention before chasing new acquisition, since a leaky bucket undermines everything poured into it. Small, consistent gains in stewardship compound faster than any single new tactic.`,
      },
      {
        q: "What nonprofit fundraising mistakes should I avoid?",
        a: `The common ones are neglecting current donors while chasing new ones, asking without first building a relationship, making appeals about the organization's needs rather than the donor's impact, failing to thank promptly, and spreading effort across too many tactics. Each is fixable. The unifying lesson is to treat fundraising as relationship work measured over years, not a series of transactions measured by a single campaign.`,
      },
      {
        q: "Why do nonprofits struggle with fundraising?",
        a: `Most struggle from a mix of thin capacity, weak donor retention, over-reliance on a single source such as one grant, and boards that are not engaged in raising money. The pattern is structural more often than it is a lack of effort. The way out is to diversify the funding base, invest in keeping donors, and build durable streams that do not depend on any one source; see ${mix} and ${passive}.`,
      },
      {
        q: "How can small nonprofits compete for donations?",
        a: `Small organizations win on proximity and trust, not budget. You can show donors exactly where their money goes, respond personally, and demonstrate impact in their own community in ways large organizations cannot. Lean into that closeness, keep your costs visible, and make giving easy. A clear local connection is a genuine competitive advantage, especially against distant national appeals.`,
      },
    ],
  },
  {
    id: "compliance-trust",
    title: "Compliance, board, and trust in Mississippi",
    blurb: "Staying compliant, building a board that gives, and earning community trust.",
    items: [
      {
        q: "What compliance issues do nonprofits face?",
        a: `Core obligations include filing the annual Form 990 with the IRS, registering to solicit charitable donations where required, meeting state corporate and reporting requirements, and following rules on donor privacy and any commercial fundraising arrangements. In Mississippi, that includes state-specific filings; our ${ms} and <a href="/resources/states/mississippi/charitable-registration/">Mississippi charitable registration</a> guide lay out the specifics. Build these into an <a href="/resources/governance-compliance/annual-compliance-checklist/">annual compliance checklist</a>, and confirm your situation with a professional, since this is general information rather than legal advice.`,
      },
      {
        q: "How do I build a nonprofit board that fundraises?",
        a: `Recruit board members with the expectation of fundraising stated clearly up front, give them defined and achievable roles such as making introductions, thanking donors, or hosting small gatherings, and make sure each gives personally at a level meaningful to them. Many boards underperform simply because no one ever asked them to participate. Train and support them, and treat fundraising as a shared board responsibility; see ${board}.`,
      },
      {
        q: "How can my nonprofit build community trust?",
        a: `Trust is built through transparency, consistency, and visible local impact. Show where the money goes, report results plainly, do what you said you would, and be present in the community you serve. For a Mississippi organization, that local presence is a real advantage, since donors can see the work firsthand. Honest reporting through <a href="/resources/program-design/impact-reporting/">impact reporting</a> and reliable follow-through do more for credibility than any campaign.`,
      },
      {
        q: "What does music licensing cost nonprofits?",
        a: `Nonprofits are generally not exempt from music licensing, so playing or performing copyrighted music at events typically requires licenses from the performing-rights organizations such as ASCAP, BMI, and SESAC, with fees that vary by event size and use. Some narrow exemptions exist, but assuming you are covered because you are a charity is a common and risky mistake. Budget for licensing when you plan events, and confirm requirements with the relevant organizations.`,
      },
    ],
  },
  {
    id: "good-circles",
    title: "Mississippi fundraising with Good Circles",
    blurb: "A recurring, low-effort funding stream built for community-rooted nonprofits, and an honest read on fit.",
    items: [
      {
        q: "What fundraising options work for a small Mississippi nonprofit with no budget?",
        a: `Several effective options cost little or nothing: keeping and upgrading current donors, growing monthly recurring gifts, applying for the free Google Ad Grant, and adding a passive stream that earns as supporters go about their normal spending. The point is to build durable revenue without an upfront budget. Good Circles is one such option, free for nonprofits, where supporters fund your organization simply by shopping at participating local businesses. Estimate the potential with our ${calc}.`,
      },
      {
        q: "What is passive fundraising, and how does Good Circles do it?",
        a: `Passive fundraising lets supporters give through activities they already do, rather than by writing a separate check. With Good Circles, when someone shops at a participating local business, ten percent of the merchant's profit on that sale funds a nonprofit the shopper chooses, and the shopper also saves about ten percent. For your organization it is recurring revenue that requires no campaign and no grant cycle. Our guide to ${passive} explains the model, and ${forNp} shows how to take part.`,
      },
      {
        q: "Does my nonprofit pay anything to use Good Circles?",
        a: `No. Good Circles is free for nonprofits, with no fee on the distributions you receive. You are not buying software or paying a commission; supporters fund your organization by shopping at participating local businesses, and the contributions flow to you. The full picture is on ${forNp}.`,
      },
      {
        q: "How much can a nonprofit realistically raise through Good Circles?",
        a: `It depends on how many of your supporters shop at participating local businesses and how much they spend, so it is a stream that grows with participation rather than a windfall. A handful of engaged supporters produces modest, steady income; a broad, active local base produces more. Treat it as one reliable leg of a diversified funding base, not a replacement for grants or major gifts. Use the ${calc} to model your own numbers, and see how it fits within ${mix}.`,
      },
      {
        q: "Is Good Circles a fit for my nonprofit?",
        a: `It fits best when your supporters live in and shop in the communities where participating businesses operate, since it funds you through everyday local purchases. A national organization whose supporters have no local shopping connection to those businesses will see less benefit, and it is fair to say so plainly. For community-rooted Mississippi nonprofits, it adds a recurring, low-effort stream alongside the fundraising you already do. Weigh it as part of ${mix}.`,
      },
      {
        q: "When does Good Circles launch in Mississippi?",
        a: `Early access is underway in Meridian and Lauderdale County, and Good Circles launches on schedule in September 2026 in the Jackson, Mississippi metro, with the founding cohort open now. The first 50 Mississippi nonprofits to join become founding nonprofits, and the first 200 local businesses become Founding Merchants. Joining early lets your supporters direct their everyday local spending to your organization from the start. See ${forNp} to claim a spot.`,
      },
      {
        q: "Where can I find free Mississippi nonprofit guides?",
        a: `Good Circles publishes a large, free library for nonprofits covering starting and structuring, governance and compliance, grants, fundraising, marketing, donor development, and operations, with no login required. Mississippi-specific guidance, including incorporation and charitable registration, lives in the ${ms}. Start at the ${hub} and use the interactive tools, including the ${calc}, to plan your fundraising.`,
      },
    ],
  },
];
