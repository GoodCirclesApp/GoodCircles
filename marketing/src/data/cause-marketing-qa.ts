// Content for the /cause-marketing Q&A page. 40 questions sourced from real
// business-owner questions about cause marketing, plus a closing set specific to
// Good Circles. Answers are educational first; Good Circles is referenced only
// where it is genuinely relevant. Internal links must resolve at build time.
//
// `a` is HTML (rendered with set:html so links work). The page derives the
// FAQPage JSON-LD answer text by stripping tags, and renders each `q` verbatim
// in a <summary> so the SEO gate's FAQ-in-visible-text rule passes.
//
// ACCURACY CONTRACT: customers save ~10%; 10% of the merchant's net profit funds
// a chosen nonprofit; merchant keeps ~89% of profit on a 1% fee on profit; free
// for nonprofits; the merchant is the donor of record; commercial co-venture.
// Tax language stays "may be deductible, consult your advisor."

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

const sell = '<a href="/sell">Good Circles for sellers</a>';
const compare = '<a href="/sell/marketplace-fees-comparison">marketplace fee comparison</a>';
const how = '<a href="/how-it-works">how it works</a>';
const forBiz = '<a href="/for-business">Good Circles for business</a>';
const forNp = '<a href="/for-nonprofits">Good Circles for nonprofits</a>';

export const CAUSE_MARKETING_QA: QACategory[] = [
  {
    id: "basics",
    title: "Cause marketing, defined",
    blurb: "What it is, and how it differs from the ideas it gets confused with.",
    items: [
      {
        q: "Is cause marketing just a marketing gimmick?",
        a: `It can be, and that is the risk every business should take seriously. Cause marketing becomes a gimmick when the giving is small, temporary, or disconnected from how the company actually operates, and customers are increasingly good at spotting the difference. It is genuine when the contribution is real, ongoing, and built into the business rather than bolted onto a campaign. The most credible version is structural: a fixed share of every sale goes to a cause automatically, so the giving scales with the business instead of depending on a one-time promotion.`,
      },
      {
        q: "What's the difference between corporate social responsibility and cause marketing?",
        a: `Corporate social responsibility, or CSR, is the broad set of commitments a company makes to operate responsibly, covering areas like labor practices, environmental impact, and governance. Cause marketing is narrower and outward-facing: it ties a product or sale to support for a specific cause, so that buying becomes a way to give. CSR is how you run the business; cause marketing is how you invite customers into the giving. The two work best together, because a cause-marketing claim is only believable when the underlying business practices support it.`,
      },
      {
        q: "What's the difference between sponsorship and cause marketing?",
        a: `Sponsorship is a flat payment for visibility, such as putting your logo on an event or a team. Cause marketing ties the contribution to customer activity, so the amount given reflects sales rather than a fixed fee. Sponsorship buys exposure; cause marketing turns each purchase into a contribution and gives the customer a role in it. For a small business, the cause-marketing model is usually more efficient because the spend is proportional to revenue instead of paid up front.`,
      },
      {
        q: "Is cause marketing better than corporate philanthropy?",
        a: `Neither is strictly better; they serve different goals. Traditional corporate philanthropy is a direct donation, often once a year, that may be capped for tax purposes and is largely invisible to customers. Cause marketing routes giving through the sale, so it is continuous, visible, and tied to the customer relationship, and for many businesses it can be treated as an ordinary business expense rather than a capped charitable deduction. If your aim is quiet giving, philanthropy is fine. If you want giving that also builds customer loyalty and grows with the business, cause marketing is the stronger structure. Confirm tax treatment with your accountant.`,
      },
    ],
  },
  {
    id: "trust",
    title: "Authenticity and trust",
    blurb: "How to be credible, and how to avoid the backlash that hits inauthentic campaigns.",
    items: [
      {
        q: "How do I know if a company's cause marketing is actually real?",
        a: `Look for specifics and proof rather than sentiment. A real program names the nonprofit, states exactly how much goes to it and how often, and can show that the money arrived. Vague language such as "a portion of proceeds" with no figure, no named partner, and no reporting is the clearest warning sign. The strongest signal of authenticity is a model where the contribution is automatic and verifiable on every sale, not a limited-time promotion timed to a marketing push.`,
      },
      {
        q: "Can I use cause marketing without looking like I'm faking it?",
        a: `Yes, by making the commitment concrete and durable. Pick a cause with a genuine connection to your business or community, state the exact contribution, keep it running rather than seasonal, and report what was given. Avoid claiming more than you do. The simplest way to stay credible is to remove your own discretion from the equation: when a set share of every sale goes to a cause automatically, there is nothing to exaggerate and nothing to quietly stop.`,
      },
      {
        q: "How do I talk about cause marketing without sounding preachy?",
        a: `Lead with the mechanism, not the morality. Tell customers plainly what happens when they buy from you and what it funds, then let them decide how to feel about it. Avoid lecturing, avoid implying that customers who shop elsewhere are doing harm, and keep the focus on the concrete outcome rather than your virtue. Stating that ten percent of the profit on a purchase funds a local nonprofit is informative; telling people they should care is preachy.`,
      },
      {
        q: "What role does transparency play in cause marketing?",
        a: `It is the foundation. The fastest way to lose trust is for a customer to suspect the giving is smaller or less real than implied. Publish the share you give, name the recipients, and make the totals easy to verify. Models that record each contribution at the moment of sale make transparency the default rather than a reporting chore, which is why a verifiable per-sale structure is more defensible than a campaign that reports a single lump sum after the fact.`,
      },
      {
        q: "What happens when a brand's cause marketing campaign backfires?",
        a: `Backlash usually follows a gap between claim and reality: the giving turns out to be tiny, the cause conflicts with the company's own conduct, or the campaign reads as opportunistic. The result is lost trust that costs more than the campaign was worth. The way to avoid it is to under-claim and over-deliver, to choose a cause you can defend, and to keep the contribution proportional and ongoing so there is no inflated promise to expose.`,
      },
      {
        q: "What are common mistakes companies make with cause marketing?",
        a: `The frequent ones are giving too little while implying a lot, treating it as a one-time stunt, picking a cause with no real connection to the business, hiding the actual numbers, and stopping quietly once the campaign ends. Each erodes trust. The underlying fix is the same: make the contribution real, specific, ongoing, and verifiable, so the program survives scrutiny instead of inviting it.`,
      },
    ],
  },
  {
    id: "results",
    title: "Does it work: results, ROI, and loyalty",
    blurb: "What the evidence supports, what it does not, and how to measure it honestly.",
    items: [
      {
        q: "Does cause marketing actually make customers buy more?",
        a: `It can, but the effect is conditional. When two options are otherwise comparable, a credible cause can tip the choice and support a modest price premium, and it tends to matter most for local and values-driven purchases. It does not rescue a weak product or overcome a large price gap, and stated support always outruns actual behavior, so expect a real but moderate lift rather than a transformation. The benefit is strongest when the giving is easy to understand and verify at the point of purchase.`,
      },
      {
        q: "Does cause marketing work better than traditional advertising?",
        a: `They do different jobs, so the honest answer is that it depends on the goal. Traditional advertising drives awareness and immediate response efficiently. Cause marketing is weaker at raw reach but stronger at differentiation, trust, and loyalty, and it can lower customer-acquisition cost when the giving itself motivates people to choose and recommend you. For a local business competing against larger advertisers, a credible cause is often a better use of limited budget than trying to outspend them.`,
      },
      {
        q: "Can cause marketing help me stand out from competitors?",
        a: `Yes, particularly where products and prices are similar. A genuine, ongoing commitment gives customers a reason to choose you that a competitor cannot copy by lowering a price. The differentiation holds only if the commitment is real and durable; a temporary promotion is easily matched and quickly forgotten. A model where every sale visibly supports a local cause makes the distinction concrete and continuous rather than a slogan.`,
      },
      {
        q: "Does cause marketing help with customer loyalty?",
        a: `It is one of its stronger effects. Customers who feel their purchase contributes to something they value tend to return more often and recommend the business more readily, because the relationship carries meaning beyond the transaction. Loyalty depends on consistency, so the giving has to continue, not appear once. When the contribution is built into how you sell, every repeat purchase reinforces the reason they chose you.`,
      },
      {
        q: "How long does it take to see results from cause marketing?",
        a: `Plan in terms of quarters, not weeks. Some lift in conversion and word of mouth can appear quickly when the offer is clear, but the durable gains in loyalty and reputation build over months of consistent delivery. Treating it as a permanent part of the business rather than a campaign with an end date is what produces compounding results, since trust accrues with repetition.`,
      },
      {
        q: "How do I measure the success of a cause marketing campaign?",
        a: `Measure both the giving and the business outcome. On the giving side, track the total contributed and the number of supporters reached, and be able to show it. On the business side, track repeat-purchase rate, referrals, conversion among customers who know about the program, and any price premium you can sustain. Tie the dollars given to the sales that generated them so the program is accountable on its own terms. Nonprofits can apply the same discipline using the approach in our guide to <a href="/resources/program-design/impact-reporting/">impact reporting</a>.`,
      },
      {
        q: "What do customers actually want from brands on social issues?",
        a: `Consistency and contribution far more than commentary. Most customers respond well to a business that quietly and reliably supports a relevant cause, and poorly to one that issues statements without backing them up. They want to know what you actually do, in concrete terms, and they reward businesses that make their own purchase part of the help. When in doubt, give more and say less.`,
      },
      {
        q: "How do I know if customers care about a brand's social cause?",
        a: `Ask and observe rather than assume. Light surveys, conversations at the point of sale, and simple tests such as featuring the cause prominently for a period and watching response will tell you more than speculation. Local causes with a clear connection to your customers' own community almost always land better than distant or abstract ones. A platform that lets customers choose which local nonprofit their purchase supports also turns the question into useful data, since the choices reveal what they care about.`,
      },
      {
        q: "How do millennials and Gen Z feel about cause marketing?",
        a: `Younger consumers consistently report that they prefer brands whose values align with their own and say they will switch to or pay more for them. The caveat is that stated preference outpaces real behavior, so the effect is genuine but easy to overstate. What converts that preference into purchases is credibility and ease: a contribution that is obviously real and requires nothing extra of the customer. Skepticism toward vague claims is also highest in these groups, which rewards transparency and punishes spin.`,
      },
    ],
  },
  {
    id: "execution",
    title: "Planning and execution",
    blurb: "Getting started, budgeting, and running it without a large team.",
    items: [
      {
        q: "How to start a cause marketing campaign from scratch",
        a: `Start with the connection, not the campaign. Choose a cause that genuinely relates to your business or community, decide the exact contribution and make it simple, pick a credible nonprofit partner, and tell customers plainly what their purchase does. Keep the first commitment modest and permanent rather than large and temporary, then report what you gave. If you would rather not build and administer this yourself, a marketplace that handles the contribution, the nonprofit relationship, and the reporting on every sale removes most of the setup. See ${how} for one such structure.`,
      },
      {
        q: "How can small businesses do cause marketing on a budget?",
        a: `The most affordable approach is to tie giving to sales rather than to a fixed advertising spend, so the cost is proportional and never exceeds what you earned. You do not need a campaign budget, an agency, or a separate fund. Building a set share of each sale into your pricing, partnering with a local nonprofit, and being transparent about it costs little and is highly credible. Good Circles is designed for exactly this case: it is free to join, the platform fee is one percent of profit, and the giving comes out of the sale, so a business with no marketing budget can still run a real program. Compare the economics in the ${compare}.`,
      },
      {
        q: "How much should I spend on cause marketing?",
        a: `Think in terms of a sustainable share of margin rather than a lump sum. A common and defensible approach is to commit a fixed percentage of profit on each sale, because it scales with the business and cannot put you underwater in a slow month. Avoid large one-time pledges you may not be able to repeat. For reference, the Good Circles model directs ten percent of the merchant's profit on a sale to a nonprofit while the business keeps about eighty-nine percent of that profit, which is a structure built to be sustainable rather than a budget you have to find each year.`,
      },
      {
        q: "What are the 5 most important questions in marketing planning?",
        a: `Five questions cover most of it. Who exactly is the customer? What problem do you solve better than the alternatives? Why should they believe you? Where do they actually make the decision? And how will you measure whether it worked? Cause marketing earns a place in the plan when it strengthens the answer to "why believe you" and "why choose you over a competitor," not as a substitute for a sound product and clear positioning.`,
      },
      {
        q: "What questions should I ask before starting a marketing campaign?",
        a: `Confirm that you understand the customer and the decision, that the offer is genuinely better than the alternative, that you can deliver what you promise, and that you can measure the result. For a cause element specifically, ask whether the contribution is real and ongoing, whether the cause connects to your business, whether you can prove the giving, and whether the program survives if a journalist or a skeptical customer examines it. If any answer is shaky, fix it before you launch.`,
      },
      {
        q: "Can small teams execute cause marketing campaigns?",
        a: `Yes, and small teams often do it more credibly because the owner's connection to the community is real. The constraint is administration: choosing a partner, moving the money, and reporting it can consume time a lean team does not have. The practical solution is to use a structure that automates the contribution and the nonprofit relationship so the team's only job is to sell. That is precisely what a cause-built marketplace provides, which is why ${forBiz} is aimed at owner-operated businesses rather than large marketing departments.`,
      },
      {
        q: "What platforms work best for promoting cause marketing?",
        a: `Use the channels where your customers already decide, which for a local business usually means your storefront, your point of sale, local social media, and word of mouth, rather than broad paid advertising. The most effective "platform," though, is the purchase itself: when giving is built into the transaction, every sale promotes the program without a separate campaign. National marketplaces and delivery apps can carry volume, but they keep you anonymous to the customer and take a large cut, which works against a local cause; the trade-offs are laid out in the ${compare}.`,
      },
      {
        q: "How can I make my cause marketing campaign go viral?",
        a: `Virality is unreliable and a poor primary goal, so build for steady sharing instead. Give customers something concrete and personal to talk about, such as the specific local nonprofit their purchase supported, and make sharing effortless. A genuine, ongoing program produces a stream of small, believable stories, which compounds more reliably than chasing a single viral moment. If a campaign does take off, the giving has to be real enough to withstand the scrutiny that attention brings.`,
      },
      {
        q: "How can I use employee involvement in cause marketing?",
        a: `Employees make a program credible when they help choose the cause and can speak to it honestly with customers. Involve them in selecting the nonprofit, give them a simple and accurate way to explain the contribution, and recognize their part in it. Avoid mandatory performances of enthusiasm, which customers detect quickly. Authentic staff who understand exactly what each sale gives are more persuasive than any slogan.`,
      },
      {
        q: "How do I avoid cause marketing fatigue with my audience?",
        a: `Fatigue comes from repetition of the message, not from the giving itself, so keep the contribution constant and vary how you talk about it. Rotate the specific stories and recipients, report results occasionally rather than constantly, and avoid turning every communication into an appeal. A built-in, always-on contribution actually reduces fatigue, because it works whether or not you are talking about it, freeing you to mention it only when there is something concrete to share.`,
      },
      {
        q: "Can I change my cause marketing focus each year?",
        a: `You can, but consistency builds more trust than variety. Frequent changes can read as chasing trends and make it harder for customers to associate your business with anything in particular. A durable approach is to keep a stable framework, such as supporting local nonprofits, while allowing the specific recipients to vary. A model where customers choose which local cause their purchase supports gives you natural variety without abandoning a consistent commitment.`,
      },
    ],
  },
  {
    id: "causes-partners",
    title: "Choosing causes and partners",
    blurb: "Selecting a cause, navigating risk, and partnering with a nonprofit well.",
    items: [
      {
        q: "What causes should my company support?",
        a: `Choose causes with a real connection to your business, your customers, or your community, because relevance is what makes the giving believable. A local restaurant supporting a local food program is credible; the same restaurant attaching itself to an unrelated global issue is not. Local causes also tend to resonate most with the customers a small business actually serves. If you are unsure, let your community guide the choice, or use a platform that lets your customers direct the support to nonprofits they already care about.`,
      },
      {
        q: "How do I choose between multiple social causes?",
        a: `Narrow by relevance, credibility, and your ability to sustain support over time, and resist spreading yourself thin across many causes, which dilutes the message and the impact. It is usually better to support one or a few causes well than many causes nominally. One way to avoid choosing badly is to let customers decide: when each buyer directs their purchase to a local nonprofit they value, the portfolio reflects your community's priorities rather than a guess.`,
      },
      {
        q: "Should my brand take a stand on political issues?",
        a: `Distinguish between politics and community causes. Taking sides on divisive political questions carries real risk of alienating customers and is rarely necessary for effective cause marketing. Supporting concrete community needs, such as local food security, schools, or shelters, is widely shared and far less polarizing. For most small businesses, the durable choice is to support tangible local good rather than to enter contested debates.`,
      },
      {
        q: "How to find the right nonprofit partner for cause marketing",
        a: `Vet for legitimacy and fit. Confirm the organization's tax-exempt status and good standing, look for transparent finances and clear outcomes, and choose a mission that connects to your business and community. A local partner with a visible impact is usually more compelling to your customers than a distant national one. Nonprofits evaluating partnerships from the other side can prepare using our guide to <a href="/resources/fundraising/corporate-partnerships/">corporate partnerships</a>.`,
      },
      {
        q: "What's the best way to partner with a charity?",
        a: `Put the arrangement in writing, agree on exactly what is given and how it is reported, and keep the relationship ongoing rather than transactional. Define the contribution, the use of names and logos, the reporting cadence, and any compliance obligations such as commercial co-venture registration where it applies. A clear, durable agreement protects both sides and makes the giving verifiable. Marketplaces built for this handle much of the structure automatically, and it is free for the nonprofit to take part. See ${forNp}.`,
      },
      {
        q: "Should I give away free products for a cause?",
        a: `Product donations can help, but they are a blunt instrument. They cost you full margin, the value to the nonprofit is often lower than the cost to you, and the tax treatment can be limited. A contribution tied to sales is usually more efficient, because it scales with revenue and keeps the business healthy. If you do donate product, do it deliberately and report it; do not treat it as a substitute for an ongoing, predictable contribution.`,
      },
    ],
  },
  {
    id: "cases",
    title: "Special cases, examples, and proof",
    blurb: "B2B, nonprofits, strong examples, and documenting results.",
    items: [
      {
        q: "Is cause marketing worth it for B2B companies?",
        a: `It can be, but the mechanics differ and it is often a weaker fit than for consumer businesses. B2B purchases are driven by procurement criteria and relationships, so a cause rarely moves a deal on its own, though shared values can support reputation and differentiation in close decisions. Be honest about the limits here. This is also the clearest case where Good Circles may not be the right tool, since it is built around consumer purchases at local businesses rather than B2B sales cycles.`,
      },
      {
        q: "How can nonprofits use cause marketing to raise funds?",
        a: `Nonprofits can partner with local businesses so that a share of sales supports their mission, which creates recurring revenue without a constant fundraising push and brings in supporters through the businesses those people already use. The keys are choosing aligned partners, making the arrangement clear, and reporting impact. Good Circles is built around this: it is free for nonprofits, and supporters fund a chosen organization simply by shopping at participating local businesses. Background reading is in our guide to <a href="/resources/passive-funding/passive-fundraising-explained/">passive fundraising</a>, and the model is summarized on ${forNp}.`,
      },
      {
        q: "What are the best examples of cause marketing done right?",
        a: `The programs that hold up share a pattern rather than a particular campaign: the contribution is real and specific, the cause connects to the business, the giving continues over time, and the results are reported plainly. Famous one-off campaigns get attention, but the more instructive examples are ordinary businesses that build a steady, verifiable contribution into how they operate. The lesson to copy is the structure, not the slogan.`,
      },
      {
        q: "What should I include in a cause marketing case study?",
        a: `Document the starting point, the mechanism, the results, and the proof. State the cause and why it fit, exactly how the contribution worked, the total given and the supporters reached, and the business outcomes such as repeat purchases or referrals. Include verifiable figures rather than adjectives, and acknowledge what did not work. A credible case study reads like an accounting of what happened, not a press release.`,
      },
    ],
  },
  {
    id: "good-circles",
    title: "Cause marketing with Good Circles",
    blurb: "How the model works in practice, what it costs, and the honest answer to whether it fits your business.",
    items: [
      {
        q: "What is the simplest way for a local business to do cause marketing?",
        a: `The simplest version removes the campaign entirely and builds the giving into the sale. Good Circles is a local marketplace where ten percent of the merchant's profit on each purchase funds a nonprofit the customer chooses, the customer saves about ten percent, and the business keeps about eighty-nine percent of its profit on a one percent fee on profit. There is no fund to administer, no campaign to launch, and no separate budget, because the contribution comes out of each sale automatically. See ${how} or start with ${sell}.`,
      },
      {
        q: "How is Good Circles different from a typical cause marketing campaign?",
        a: `A campaign is temporary, discretionary, and something you have to run; Good Circles is permanent, automatic, and something the sale does on its own. Every purchase records a contribution to a local nonprofit, so the giving is continuous and verifiable rather than a limited-time promotion reported as a lump sum. Because the structure is a commercial co-venture with the merchant as the donor of record, the giving is consistent and documented by design. That is the difference between marketing a cause and operating on one.`,
      },
      {
        q: "What does cause marketing through Good Circles cost?",
        a: `It is free to join, with no setup, monthly, or listing fees, and the platform fee is one percent of profit on a sale. The ten percent that funds a nonprofit comes from the profit on the sale rather than from a separate budget, and the customer's roughly ten percent saving is built into the model as well. Because the cost is proportional to sales, the program never runs at a loss in a slow period. The full economics, including how this compares to selling on other platforms, are in the ${compare}.`,
      },
      {
        q: "Will cause marketing through Good Circles hurt my margins?",
        a: `The giving is structured to be sustainable rather than to erode your margin. You keep about eighty-nine percent of your profit on each sale, the platform takes one percent of profit, and the ten percent contribution is a defined share of profit, not an open-ended cost. Compared with selling through national marketplaces and delivery apps that take fifteen to thirty percent of the sale, most local businesses keep more on Good Circles while also funding a cause. Run your own numbers in the ${compare} before deciding.`,
      },
      {
        q: "Do my customers actually benefit, or just the nonprofit?",
        a: `Both do. Customers save about ten percent on local purchases, which is real money returned to them, and that saving sits alongside the contribution to a local nonprofit they choose. The business keeps the large majority of its profit, the customer pays less, and the community gains, which is why the model is framed as a local circle rather than a one-directional donation. The customer's side is covered on the <a href="/shoppers">shoppers</a> page.`,
      },
      {
        q: "Is the donation tax-deductible for my business?",
        a: `The contribution that funds a local nonprofit on each sale is a charitable contribution that may be deductible, and because Good Circles operates as a commercial co-venture it is often treated as an ordinary business expense rather than a capped charitable gift. Treatment depends on your entity, your income, and how the arrangement is characterized, so confirm the specifics with your accountant or tax advisor. This page is informational and is not tax advice.`,
      },
      {
        q: "Is Good Circles the right fit for my business?",
        a: `Good Circles is not the right tool for every business, and it is better to say so plainly. A purely online national brand, or a business-to-business company with no local consumer base, will likely be served better elsewhere. It is the best fit for the large majority of businesses, which are local and consumer-facing: restaurants, shops, makers, salons, and service providers that sell to people in their own community. If that describes you, building giving into every sale is more durable and more affordable than any campaign. Compare it against your current platform in the ${compare}, or read ${forBiz}.`,
      },
    ],
  },
];
