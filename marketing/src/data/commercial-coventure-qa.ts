// Content for the /commercial-coventure Q&A page. 40 questions business owners
// and nonprofit leaders ask about commercial co-ventures, plus a Good Circles
// section. Same structure and conventions as cause-marketing-qa.ts.
//
// IMPORTANT: commercial co-ventures are legally regulated and vary by state.
// Answers are GENERAL INFORMATION, not legal or tax advice. They consistently
// point readers to a nonprofit attorney and their state charity regulator, and
// they do NOT assert Good Circles' specific registration/compliance status
// (that work is jurisdiction-specific and ongoing). Good Circles is described by
// its model mechanics only.
//
// ACCURACY CONTRACT: customers save ~10%; 10% of the merchant's net profit funds
// a chosen nonprofit; merchant keeps ~89% of profit on a 1% fee on profit; free
// for nonprofits; the merchant is the donor of record; commercial co-venture.

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

const how = '<a href="/how-it-works/">how Good Circles works</a>';
const forNp = '<a href="/for-nonprofits/">Good Circles for nonprofits</a>';
const forBiz = '<a href="/for-business/">Good Circles for business</a>';
const sell = '<a href="/sell/">Good Circles for sellers</a>';
const compare = '<a href="/sell/marketplace-fees-comparison/">marketplace fee comparison</a>';
const cause = '<a href="/cause-marketing/">cause marketing</a>';
const reg = '<a href="/resources/governance-compliance/charitable-solicitation-registration/">charitable solicitation registration</a>';
const coi = '<a href="/resources/governance-compliance/conflict-of-interest-policy/">conflict-of-interest policy</a>';
const partners = '<a href="/resources/fundraising/corporate-partnerships/">corporate partnerships</a>';
const fundingMix = '<a href="/resources/fundraising/the-funding-mix/">the funding mix</a>';
const finance = '<a href="/resources/operations/financial-management-basics/">financial management</a>';

export const COMMERCIAL_COVENTURE_QA: QACategory[] = [
  {
    id: "basics",
    title: "Commercial co-ventures, explained",
    blurb: "What the arrangement is, and how it differs from the terms it gets confused with.",
    items: [
      {
        q: "What is a commercial coventure and how does it work?",
        a: `A commercial co-venture, sometimes written commercial coventure, is an arrangement in which a for-profit business advertises that the purchase of its goods or services will benefit a charity. The business, often called the commercial co-venturer, makes a contribution tied to sales, and the charity lends its name to the campaign. The defining feature is that giving flows through ordinary commercial transactions rather than through a direct donation. Because the public is being told their purchase helps a charity, most states regulate these arrangements, so the structure has to be set up with care. Good Circles operates on exactly this model: ten percent of the merchant's profit on each sale funds a nonprofit the customer chooses. See ${how}.`,
      },
      {
        q: "What's the difference between cause marketing and commercial coventures?",
        a: `Cause marketing is the broad practice of tying a brand or product to a cause. A commercial co-venture is the specific, often legally defined subset in which a business represents to the public that buying its product will result in a contribution to a charity. Put simply, every commercial co-venture is cause marketing, but not all cause marketing is a regulated co-venture. The distinction matters because the co-venture form usually triggers state registration and disclosure rules. For the broader practice, see our ${cause} questions.`,
      },
      {
        q: "What's the difference between a joint venture and a coventure?",
        a: `A joint venture is a shared business enterprise in which two or more parties combine resources and own a stake in the result. A commercial co-venture is a marketing arrangement, not shared ownership: the business and the charity do not form a joint entity, and the charity does not take an ownership position. In a co-venture, the business sells, contributes a defined share to the charity, and discloses the arrangement to customers. Confusing the two leads to the wrong legal structure, so it is worth getting the terminology right before drafting anything.`,
      },
      {
        q: "How do nonprofits partner with for-profit companies?",
        a: `Common structures include sponsorships, licensing of the nonprofit's name or logo, cause-marketing campaigns, and commercial co-ventures where a share of sales is contributed. Each has different legal and tax treatment, so the right choice depends on the goal and the level of administration the nonprofit can support. A co-venture is attractive because the giving scales with sales and requires no grant cycle, but it carries registration and disclosure obligations. Our guide to ${partners} walks through how to approach these relationships, and joining an existing co-venture like Good Circles is one way to skip most of the setup.`,
      },
    ],
  },
  {
    id: "legal",
    title: "Legal and compliance",
    blurb: "Eligibility, registration, oversight, and the agreement. General information, not legal advice; rules vary by state.",
    items: [
      {
        q: "Is my nonprofit allowed to enter into commercial coventures?",
        a: `In general, yes. Charities are permitted to enter commercial co-ventures, and many do. The conditions are that the arrangement serve the mission, that the terms be fair to the charity, and that both parties meet their state's registration and disclosure requirements. Because eligibility and the specific obligations differ by state, confirm the rules with a nonprofit attorney and your state charity regulator before you sign anything. This page is general information, not legal advice.`,
      },
      {
        q: "What are the legal requirements for commercial coventures?",
        a: `Requirements vary by state, but they commonly include a written contract between the business and the charity, registration or advance notice with the state before the campaign runs, clear disclosure to consumers of how much each purchase contributes, financial accounting to the charity, and in some states a bond or specific contract terms. A number of states regulate co-ventures specifically, and others apply general charitable-solicitation rules. Treat compliance as state-by-state and verify it with counsel. Background on the related filings is in our guide to ${reg}.`,
      },
      {
        q: "How do I register a commercial coventure with my state?",
        a: `Where registration is required, it usually means filing with the state office that oversees charities, often the attorney general or secretary of state, before the campaign begins, and submitting the co-venture contract along with any required fee or bond. Some states also require the charity itself to be registered to solicit. The forms, deadlines, and thresholds differ by state, and several states have no specific co-venture filing at all, so check your own state's requirements rather than assuming. A nonprofit attorney or your state charity regulator can confirm the exact process.`,
      },
      {
        q: "Are commercial coventures regulated by state attorneys general?",
        a: `In many states, yes. The attorney general or an equivalent charity regulator typically has authority over charitable solicitations and commercial co-ventures, and may require registration, contracts, and financial reporting. Their core concern is that the public is not misled about how much of a purchase actually reaches the charity. This is why accurate disclosure and clean records are not optional; they are what keeps a co-venture in good standing.`,
      },
      {
        q: "What does the BBB say about charity-business partnerships?",
        a: `The BBB Wise Giving Alliance publishes standards that address cause-marketing and co-venture arrangements. In general, those standards call for disclosing at the point of solicitation the actual or anticipated portion of the purchase that will benefit the charity, the duration of the campaign, and any maximum or guaranteed minimum contribution. The through-line is transparency: tell the customer plainly what their purchase gives. Following that principle also tends to satisfy the spirit of most state rules.`,
      },
      {
        q: "What should be in a commercial coventure agreement?",
        a: `At minimum, the agreement should state the contribution, expressed as a clear amount or percentage per sale, the start and end dates, any cap or guaranteed minimum, how and when the charity is paid, the permitted use of the charity's name and logo, reporting and audit rights, who handles state registration and disclosure, and termination terms. Clear, specific language protects both parties and makes the giving verifiable. Have a nonprofit attorney review it before signing; templates are a starting point, not a substitute for counsel.`,
      },
      {
        q: "How to protect your nonprofit in a commercial partnership",
        a: `Protect the mission and the money. Use a written agreement that defines the contribution, caps the use of your name, requires regular accounting, and lets you exit if the partner behaves badly. Vet the business for reputation and financial stability, keep approval and oversight with the board, and make sure consumer disclosures are accurate so the regulator never has reason to look closely. Treat your name as the asset it is, because a partner's misconduct can damage the charity even when the charity did nothing wrong.`,
      },
      {
        q: "What insurance do you need for a commercial coventure?",
        a: `The right coverage depends on the activity, but nonprofits commonly carry general liability, directors-and-officers coverage, and, where events or products are involved, event or product liability. The co-venture agreement should also address indemnification, so the party that causes a loss bears it. Because needs vary with the type of campaign, review the specifics with an insurance broker and your attorney rather than relying on a generic checklist.`,
      },
    ],
  },
  {
    id: "tax",
    title: "Tax and finances",
    blurb: "Tax status, exemption, reporting, and what the numbers can look like. Not tax advice; confirm with a professional.",
    items: [
      {
        q: "What happens to profits from a nonprofit coventure?",
        a: `Funds a charity receives from a co-venture generally support its mission like other revenue, and a nonprofit cannot distribute profits to individuals. Whether the income is taxable depends on its character: payments structured as royalties for the use of the charity's name are generally excluded from unrelated business income tax, while income from an unrelated trade or business regularly carried on can be taxable. The business keeps its own profit and treats its contribution under its own tax rules. Because characterization drives the tax result, confirm it with a tax professional, and see ${finance} for the bookkeeping side.`,
      },
      {
        q: "Can a for-profit company use a nonprofit's tax status?",
        a: `No. A charity's tax exemption belongs to the charity and does not transfer to a business partner. A for-profit company does not become tax-exempt by partnering with a nonprofit, and any attempt to route the company's ordinary income through a charity to avoid tax is improper and risky for both parties. What the business can do is treat its genuine contribution under the normal rules for charitable or business expenses. Keep the two entities and their finances clearly separate.`,
      },
      {
        q: "How do commercial coventures affect nonprofit tax exemption?",
        a: `A properly structured co-venture usually does not threaten exemption, particularly when the charity's payment is characterized as a royalty for the use of its name and the activity is not an unrelated business the charity itself operates. Risk rises when the arrangement looks like the charity running a regular commercial business unrelated to its mission, which can create unrelated business income tax and, in extreme cases, raise exemption concerns. Structure and facts matter, so review any significant arrangement with a nonprofit tax advisor.`,
      },
      {
        q: "What financial reporting is required for coventures?",
        a: `Expect to account for co-venture funds in your normal financial statements and on the Form 990, and to provide the partner and, where required, the state with a clear accounting of amounts raised and contributed. Many state rules and the BBB standards effectively require that the charity be able to show how much each campaign produced. Keep records that tie contributions to the sales that generated them. Our overviews of ${finance} and Form 990 explain the basics, but a nonprofit accountant should confirm what your situation requires.`,
      },
      {
        q: "How much money can a nonprofit make from a coventure?",
        a: `It depends entirely on the partner's sales volume and the contribution rate, so there is no standard figure. A co-venture with a single small business produces modest, steady income; one tied to many businesses or high volume can produce meaningful recurring revenue. The honest expectation is a reliable stream that grows with participation rather than a windfall. Models that aggregate many local businesses, where a share of every sale supports a chosen nonprofit, are built to compound this over time; ${forNp} explains how that works.`,
      },
      {
        q: "How much does it cost to start a commercial coventure?",
        a: `Building your own from scratch carries real costs: legal fees to draft the agreement and handle state registrations, possible bonding, and staff time to administer and report. For a single small partnership those costs can outweigh the early revenue. Joining an existing co-venture platform avoids most of that, because the structure, the contribution mechanics, and the reporting already exist. Good Circles, for example, is free for nonprofits to join, which is why an aggregated model is often more practical for a small organization than a bespoke one.`,
      },
      {
        q: "Can you get equity in a nonprofit commercial venture?",
        a: `No. Nonprofits have no owners and issue no equity, and their assets must serve the mission rather than enrich individuals. You cannot hold an ownership stake in a charity or its charitable activities. A nonprofit can create a separate for-profit subsidiary that does have equity, but that is a distinct structure with its own tax and governance consequences and is not what a commercial co-venture is. If ownership is the goal, a co-venture is the wrong vehicle.`,
      },
    ],
  },
  {
    id: "governance",
    title: "Governance, ethics, and risk",
    blurb: "Conflicts of interest, compensation, donor trust, mission alignment, and what happens if things go wrong.",
    items: [
      {
        q: "Can I start a for-profit business as a nonprofit employee?",
        a: `It is often possible, but it raises conflict-of-interest questions that have to be handled openly. Disclose the outside venture, follow your employer's conflict-of-interest and outside-activity policies, and avoid using the nonprofit's resources, relationships, or confidential information for private gain. If the business would transact with the nonprofit, that adds another layer of scrutiny. When in doubt, raise it with leadership and document the disclosure; see our ${coi} guide.`,
      },
      {
        q: "Can a nonprofit board member start a coventure?",
        a: `A board member can be involved, but it is a textbook conflict of interest that must be managed. The member should disclose the interest, recuse from the board's decision, and let disinterested directors approve the arrangement on fair terms, all documented in the minutes. Self-dealing and private benefit rules apply, and regulators look closely at insider transactions. Follow a written ${coi} and, for anything material, get legal review.`,
      },
      {
        q: "Can you actually get paid for doing charity work?",
        a: `Yes. Nonprofit staff are paid reasonable salaries for their work, and that is entirely proper; what is not allowed is taking the organization's profits or paying insiders excessive compensation. The line is reasonable compensation for services actually rendered, benchmarked to comparable roles. So you can earn a living working for or with a nonprofit, but you cannot treat its surplus as personal income. Compensation decisions should be set by disinterested board members and documented.`,
      },
      {
        q: "Can you make money as a consultant for nonprofits?",
        a: `Yes. Charging fair-market fees to advise nonprofits on fundraising, operations, or partnerships is a legitimate business. The cautions are to charge reasonable rates, to avoid conflicts if you also sit on a board or have another relationship with the client, and to deliver real value rather than selling complexity. This is different from a commercial co-venture, which is a sales-linked giving arrangement rather than a professional services engagement.`,
      },
      {
        q: "How do commercial coventures impact your nonprofit's mission?",
        a: `Handled well, a co-venture funds the mission without distracting from it, because the giving runs through a partner's sales rather than through new programs you have to operate. The risk is mission drift or reputational harm if the partner or the cause is a poor fit, or if chasing revenue starts to shape decisions. Guard against this by choosing aligned partners, keeping the arrangement proportionate, and measuring it against mission rather than revenue alone. The money should serve the mission, never redefine it.`,
      },
      {
        q: "What happens if a commercial coventure fails?",
        a: `If a campaign underperforms, the usual consequence is simply less contributed revenue than hoped, which is why you should not budget as if it were guaranteed. The more serious risks are reputational or legal: a partner that misrepresents the giving, or a campaign that runs afoul of disclosure rules, can expose the charity to regulator scrutiny and lost donor trust. A well-drafted agreement with clear accounting, indemnification, and termination rights limits the damage. Plan for the downside before you launch.`,
      },
      {
        q: "How to end a commercial coventure partnership",
        a: `End it the way the agreement provides, which is why termination terms belong in the contract from the start. Give any required notice, settle outstanding contributions and final accounting, stop all use of each other's names and marks, and handle any required final report to the state. If the split is due to misconduct, document it and preserve records. A clean exit protects both the charity's reputation and its standing with regulators.`,
      },
      {
        q: "Do donors support nonprofits engaged in commercial ventures?",
        a: `Most do, provided the activity clearly serves the mission and is disclosed honestly. Donors generally welcome diversified, sustainable revenue and understand that earned income reduces dependence on any single source. Trust erodes only when the commercial activity looks disconnected from the mission or when the numbers are hidden. Transparency about what the venture funds and how much it raises keeps donors comfortable and often impressed.`,
      },
      {
        q: "How to disclose commercial coventure activities to donors",
        a: `Be proactive and specific. Explain the partnership, what it funds, the contribution terms, and the results, in your communications and where required in your filings. Do not bury it or describe it vaguely, since donors and regulators both reward plain disclosure and punish the appearance of concealment. Reporting the totals raised, alongside the mission outcomes they supported, turns a potential question into a demonstration of good stewardship.`,
      },
    ],
  },
  {
    id: "strategy",
    title: "Strategy, partners, and growth",
    blurb: "Choosing partners, building a program, setting expectations, and scaling.",
    items: [
      {
        q: "How can my nonprofit make money through partnerships?",
        a: `Beyond grants and individual gifts, nonprofits earn through corporate sponsorships, licensing, cause-marketing campaigns, and commercial co-ventures where a share of a partner's sales is contributed. The advantage of sales-linked models is recurring revenue that grows with participation and does not require a grant cycle. The work is in choosing aligned partners and handling the compliance. Joining an aggregated co-venture, where supporters fund your organization simply by shopping at participating local businesses, is one of the lowest-effort options; see ${forNp} and ${fundingMix}.`,
      },
      {
        q: "How to find the right for-profit partner for your nonprofit",
        a: `Look for alignment, reputation, and reliability. The partner's customers should overlap with the people who care about your mission, its conduct should withstand scrutiny, and it should be financially stable enough to deliver what it promises. Vet it as carefully as it will vet you, and start with a defined, modest arrangement before expanding. Our guide to ${partners} covers the diligence; an aggregated marketplace can also remove the matchmaking by connecting you with many local businesses at once.`,
      },
      {
        q: "What industries are best for nonprofit coventures?",
        a: `Consumer-facing businesses with steady transaction volume tend to work best, because the contribution is tied to everyday purchases. Restaurants, retailers, local services, and food businesses are natural fits, especially where the cause connects to the community those businesses serve. Industries with few, large, infrequent transactions or with no consumer touchpoint are weaker fits. The common thread is frequent local purchases by people who would be glad to know their spending also helps.`,
      },
      {
        q: "What makes a successful nonprofit-business partnership?",
        a: `Genuine alignment, clear terms, honest disclosure, and durability. The strongest partnerships connect to both organizations' communities, define exactly what is given and reported, communicate plainly to customers and donors, and continue long enough to build trust rather than ending after one campaign. Mutual benefit matters too: the business should gain loyalty and differentiation while the charity gains reliable funding. When both sides win and the public can see the giving, the partnership lasts.`,
      },
      {
        q: "What are common mistakes nonprofits make in commercial partnerships?",
        a: `Frequent errors include skipping the written agreement, ignoring state registration and disclosure rules, partnering with a poorly matched or risky business, letting one insider drive the deal without board oversight, over-promising results, and failing to account for the money. Each is avoidable with diligence and clear documentation. The simplest protection is to treat the arrangement as a real contract with real compliance, not a handshake, and to keep the board in the loop.`,
      },
      {
        q: "How long does it take to set up a commercial coventure?",
        a: `Building your own can take anywhere from a few weeks to several months, depending on the legal drafting, any state registrations, and how quickly both organizations move. The compliance steps, not the idea, are usually what set the timeline. Joining an existing co-venture platform is far faster, because the structure and the registrations behind it already exist and you are stepping into a running system rather than constructing one.`,
      },
      {
        q: "How to pitch a commercial coventure to your board",
        a: `Lead with mission and stewardship, then show the mechanics. Explain how the arrangement funds the mission, what it asks of the organization, how the money and the legal obligations are handled, and what the risks and safeguards are. Boards approve what they understand and can defend, so bring the draft terms, the compliance plan, and a realistic revenue estimate rather than a vague opportunity. Framing it as diversified, sustainable revenue with clear controls tends to win support.`,
      },
      {
        q: "Should nonprofits use coventures to replace grants?",
        a: `Use them to diversify, not to replace. Grants and co-venture income behave differently: grants can be larger but are competitive and time-limited, while co-venture revenue is usually smaller per source but recurring and less restricted. A healthy organization blends several streams so that no single source is a point of failure. Treat a co-venture as one durable leg of the funding base; our guide to ${fundingMix} explains how the pieces fit together.`,
      },
      {
        q: "How to launch a commercial coventure with national organizations",
        a: `Large partnerships demand more structure: multi-state registration, detailed contracts, defined disclosure across markets, and the capacity to account for higher volume. They can produce significant revenue but raise the compliance burden accordingly, so legal and financial readiness matters before you scale. Many organizations start local to prove the model and build records, then expand. An aggregated platform that already operates across markets can also provide reach without each nonprofit negotiating national deals alone.`,
      },
      {
        q: "Can you scale a nonprofit coventure nationally?",
        a: `Yes, with the compliance and administration to match. National scale means registering and disclosing in many states, managing more partners and reporting, and maintaining accurate consumer disclosures everywhere the campaign runs. The economics can be strong, but the operational and legal load grows with the footprint. Building on a platform that already handles multi-market structure is usually more realistic for a nonprofit than constructing a national program in-house.`,
      },
      {
        q: "Are there startup coventures specifically for nonprofits?",
        a: `Yes. A growing set of platforms is built to let nonprofits earn through everyday commerce without constructing their own arrangements, including marketplaces where a share of each local purchase funds a chosen organization. These lower the barrier for small nonprofits that could never staff a bespoke program. Good Circles is one such model, free for nonprofits, where supporters fund an organization simply by shopping at participating local businesses; see ${forNp}.`,
      },
      {
        q: "Can social enterprises be structured as coventures?",
        a: `They are related but not the same. A social enterprise earns revenue through its own mission-aligned business activity, whereas a commercial co-venture is a marketing arrangement with a separate for-profit partner whose sales generate the contribution. A nonprofit can pursue both, and the right choice depends on whether you want to run the business yourself or share in a partner's sales. Each carries distinct tax and governance implications, so map them with an advisor before committing.`,
      },
    ],
  },
  {
    id: "good-circles",
    title: "Commercial co-ventures with Good Circles",
    blurb: "How the Good Circles model applies in practice, and an honest read on whether it fits your organization.",
    items: [
      {
        q: "Do I have to set up my own commercial coventure, or can I join one?",
        a: `You can join one, which is usually the simpler path for a small business or nonprofit. Building your own means drafting agreements, handling state registration where it applies, and administering the contributions and reporting. Good Circles operates a commercial co-venture as a platform, so a local business and a nonprofit take part in a running structure rather than constructing their own. For most local, consumer-facing organizations, joining is far less work than building. See ${how}.`,
      },
      {
        q: "How does Good Circles work as a commercial coventure?",
        a: `When a customer buys from a participating local business, ten percent of the merchant's profit on that sale funds a nonprofit the customer chooses, the customer saves about ten percent, and the business keeps about eighty-nine percent of its profit on a one percent fee on profit. The merchant is the donor of record, and each contribution is recorded at the point of sale, so the giving is continuous and documented rather than a one-time campaign. That per-sale, verifiable structure is what makes it a true co-venture rather than a marketing slogan. Start with ${sell} or ${forBiz}.`,
      },
      {
        q: "Does my nonprofit pay anything to join Good Circles?",
        a: `No. Good Circles is free for nonprofits, with no fee on the distributions they receive. Supporters fund a chosen organization simply by shopping at participating local businesses, so the nonprofit gains a recurring stream without running a campaign, writing grant applications, or administering a co-venture of its own. Details are on ${forNp}.`,
      },
      {
        q: "Who is the donor of record in the Good Circles model?",
        a: `The merchant is the donor of record for the contribution that funds the nonprofit on each sale. Because the arrangement is a commercial co-venture, that contribution is generally treated as a deductible business expense rather than a capped personal charitable gift, though treatment depends on your entity and circumstances. This is general information, not tax advice, so confirm the specifics with your accountant. The customer's roughly ten percent saving is separate and stays with the customer.`,
      },
      {
        q: "Does Good Circles handle the legal and registration side of the coventure?",
        a: `Good Circles operates the co-venture arrangement as the platform, which removes most of the structure, contribution mechanics, and reporting that a business or nonprofit would otherwise build and maintain on its own. It does not replace your own professional advice: your organization remains responsible for its own legal, tax, and governance obligations, and you should confirm those with a nonprofit attorney and your accountant. For background on the related nonprofit filings, see our guide to ${reg}. This page is general information, not legal advice.`,
      },
      {
        q: "Is Good Circles a fit for my nonprofit?",
        a: `It fits best when your supporters live in and shop in the communities where participating businesses operate, since the model funds you through everyday local purchases. A national organization whose supporters have no local shopping connection to participating businesses will see less benefit, and it is fair to say so. For community-rooted nonprofits, it adds a recurring, low-effort revenue stream alongside grants and gifts; weigh it as part of ${fundingMix} and review the model on ${forNp}.`,
      },
      {
        q: "Is Good Circles the right fit for my business?",
        a: `Good Circles is not the right tool for every business, and we would rather be plain about that. A purely online national brand or a business-to-business company with no local consumer base will likely be served better elsewhere. It is the best fit for the large majority of businesses, which are local and consumer-facing: restaurants, shops, makers, salons, and service providers selling to people in their own community. If that describes you, a built-in co-venture is more durable and affordable than a campaign. Compare it against your current platform in the ${compare}, or read ${forBiz}.`,
      },
    ],
  },
];
