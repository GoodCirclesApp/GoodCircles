// Cause-category pages target "[cause] nonprofits to support" intent. They
// describe a cause and how Good Circles funds it — they do NOT list specific
// organizations (avoids fabrication); the ItemList enumerates example
// nonprofit TYPES, which is accurate. Each page is unique, answer-first.
import type { Faq } from '../lib/faq';

export interface Cause {
  slug: string;
  name: string; // display name, e.g. "Food Security & Hunger"
  titleNoun: string; // short noun for the <title>, e.g. "Food Security"
  h1: string;
  answerHtml: string;
  whyHtml: string;
  exampleTypes: string[]; // generic nonprofit categories within this cause
  faqs: Faq[];
}

export const CAUSES: Cause[] = [
  {
    slug: 'food-security',
    name: 'Food Security & Hunger',
    titleNoun: 'Food Bank & Hunger',
    h1: 'Fund food security every time you shop',
    answerHtml:
      'With Good Circles, you can fund food banks and hunger-relief nonprofits every time you shop local. You <b>save about 10%</b>, and 10% of the merchant’s profit goes to the hunger-relief organization you choose — automatically, at no extra cost. Pick any IRS-verified 501(c)(3).',
    whyHtml:
      'Hunger relief is one of the most immediate, high-impact causes a community can fund — and one of the most stretched. Routing a share of everyday local spending to a food bank turns routine purchases into steady meals, without asking anyone to donate extra.',
    exampleTypes: ['Food banks and pantries', 'Meal-delivery programs', 'School and weekend backpack programs', 'Community gardens and fresh-food initiatives'],
    faqs: [
      {
        q: 'How do I support a food bank when I shop?',
        a: 'Pick a hunger-relief nonprofit as your cause in Good Circles. From then on, 10% of the merchant’s profit on every local purchase you make is routed to that food bank automatically — and you save about 10%, at no extra cost.',
      },
      {
        q: 'Can I choose my local food pantry?',
        a: 'Yes. You can choose any IRS-verified 501(c)(3), including your local food bank or pantry, and change your selection anytime.',
      },
    ],
  },
  {
    slug: 'education',
    name: 'Education & Schools',
    titleNoun: 'Education & School',
    h1: 'Fund education every time you shop',
    answerHtml:
      'Good Circles lets you fund schools and education nonprofits every time you shop local. You <b>save about 10%</b>, and 10% of the merchant’s profit goes to the education organization you choose — automatically, at no extra cost. Pick any IRS-verified 501(c)(3) or eligible school.',
    whyHtml:
      'Schools and education nonprofits run on tight budgets and constant fundraising. Directing a share of everyday local spending to them creates recurring, unrestricted support — no order forms, no galas, no extra spending by families.',
    exampleTypes: ['Public schools and PTAs', 'Scholarship funds', 'Literacy and tutoring programs', 'STEM and arts education nonprofits'],
    faqs: [
      {
        q: 'How can I support a school by shopping?',
        a: 'Choose a school or education nonprofit as your cause in Good Circles. Then 10% of the merchant’s profit on every local purchase you make is routed to it automatically — and you save about 10%.',
      },
      {
        q: 'Is there a dedicated option for schools?',
        a: 'Yes. Schools and PTAs can sign up directly for no-cost, recurring fundraising — see Good Circles fundraising for schools.',
      },
    ],
  },
  {
    slug: 'animal-rescue',
    name: 'Animal Rescue & Welfare',
    titleNoun: 'Animal Rescue',
    h1: 'Fund animal rescue every time you shop',
    answerHtml:
      'Good Circles lets you fund animal shelters and rescue nonprofits every time you shop local. You <b>save about 10%</b>, and 10% of the merchant’s profit goes to the animal-welfare organization you choose — automatically, at no extra cost. Pick any IRS-verified 501(c)(3).',
    whyHtml:
      'Shelters and rescues survive on donations and volunteers, and costs never stop. Routing a share of routine local spending to them funds food, medical care, and adoptions on a steady, recurring basis.',
    exampleTypes: ['Animal shelters and humane societies', 'Breed and wildlife rescues', 'Spay/neuter and TNR programs', 'Foster and adoption networks'],
    faqs: [
      {
        q: 'How do I support an animal shelter when I shop?',
        a: 'Pick an animal-rescue nonprofit as your cause in Good Circles. Then 10% of the merchant’s profit on every local purchase you make is routed to that shelter automatically — and you save about 10%, at no extra cost.',
      },
      {
        q: 'Can I choose a local rescue?',
        a: 'Yes. You can choose any IRS-verified 501(c)(3), including your local shelter or rescue, and change it anytime.',
      },
    ],
  },
  {
    slug: 'health',
    name: 'Health & Medical',
    titleNoun: 'Health & Medical',
    h1: 'Fund health and medical causes every time you shop',
    answerHtml:
      'Good Circles lets you fund health and medical nonprofits every time you shop local. You <b>save about 10%</b>, and 10% of the merchant’s profit goes to the health organization you choose — automatically, at no extra cost. Pick any IRS-verified 501(c)(3).',
    whyHtml:
      'From free clinics to research and patient-support groups, health nonprofits fill gaps that touch every family. A share of everyday local spending becomes steady funding for care, research, and support close to home.',
    exampleTypes: ['Free and community clinics', 'Disease research and awareness groups', 'Patient and caregiver support nonprofits', 'Mental-health and recovery services'],
    faqs: [
      {
        q: 'How can I fund a health nonprofit by shopping?',
        a: 'Choose a health or medical nonprofit as your cause in Good Circles. Then 10% of the merchant’s profit on every local purchase you make is routed to it automatically — and you save about 10%.',
      },
      {
        q: 'Can I pick a local clinic or support group?',
        a: 'Yes. Any IRS-verified 501(c)(3) qualifies, including local clinics and support organizations, and you can change your choice anytime.',
      },
    ],
  },
  {
    slug: 'housing',
    name: 'Housing & Homelessness',
    titleNoun: 'Housing & Shelter',
    h1: 'Fund housing and shelter every time you shop',
    answerHtml:
      'Good Circles lets you fund housing and homelessness nonprofits every time you shop local. You <b>save about 10%</b>, and 10% of the merchant’s profit goes to the housing organization you choose — automatically, at no extra cost. Pick any IRS-verified 501(c)(3).',
    whyHtml:
      'Shelters, affordable-housing builders, and homelessness-prevention programs need reliable funding, not one-off drives. A share of everyday local spending gives them recurring support for beds, repairs, and rapid rehousing.',
    exampleTypes: ['Homeless shelters and warming centers', 'Affordable-housing builders', 'Rapid-rehousing and prevention programs', 'Transitional and supportive housing'],
    faqs: [
      {
        q: 'How do I support a housing nonprofit by shopping?',
        a: 'Pick a housing or homelessness nonprofit as your cause in Good Circles. Then 10% of the merchant’s profit on every local purchase you make is routed to it automatically — and you save about 10%.',
      },
      {
        q: 'Can I choose a local shelter or housing group?',
        a: 'Yes. You can choose any IRS-verified 501(c)(3), including your local shelter or housing organization, and change it anytime.',
      },
    ],
  },
  {
    slug: 'youth',
    name: 'Youth & After-School',
    titleNoun: 'Youth & After-School',
    h1: 'Fund youth programs every time you shop',
    answerHtml:
      'Good Circles lets you fund youth and after-school nonprofits every time you shop local. You <b>save about 10%</b>, and 10% of the merchant’s profit goes to the youth organization you choose — automatically, at no extra cost. Pick any IRS-verified 501(c)(3).',
    whyHtml:
      'Mentoring, after-school, and youth-development programs change trajectories — and run on shoestring budgets. A share of routine local spending becomes steady support for the programs that keep kids engaged and supported.',
    exampleTypes: ['Boys & Girls Clubs and youth centers', 'Mentoring programs', 'After-school and summer programs', 'Sports leagues and youth arts'],
    faqs: [
      {
        q: 'How can I support youth programs by shopping?',
        a: 'Choose a youth or after-school nonprofit as your cause in Good Circles. Then 10% of the merchant’s profit on every local purchase you make is routed to it automatically — and you save about 10%.',
      },
      {
        q: 'Can I pick a local youth program?',
        a: 'Yes. Any IRS-verified 501(c)(3) qualifies, including local youth and after-school programs, and you can change your choice anytime.',
      },
    ],
  },
  {
    slug: 'veterans',
    name: 'Veterans & Military Families',
    titleNoun: 'Veterans',
    h1: 'Fund veterans causes every time you shop',
    answerHtml:
      'Good Circles lets you fund veterans and military-family nonprofits every time you shop local. You <b>save about 10%</b>, and 10% of the merchant’s profit goes to the organization you choose — automatically, at no extra cost. Pick any IRS-verified 501(c)(3).',
    whyHtml:
      'Nonprofits serving veterans and military families provide housing, counseling, and transition support that government programs don’t always reach. A share of everyday local spending turns into steady backing for those who served.',
    exampleTypes: ['Veteran housing and employment programs', 'Counseling and mental-health services', 'Military-family support groups', 'Disabled-veteran assistance nonprofits'],
    faqs: [
      {
        q: 'How do I support veterans by shopping?',
        a: 'Pick a veterans or military-family nonprofit as your cause in Good Circles. Then 10% of the merchant’s profit on every local purchase you make is routed to it automatically — and you save about 10%.',
      },
      {
        q: 'Can I choose a local veterans organization?',
        a: 'Yes. You can choose any IRS-verified 501(c)(3), including local veterans organizations, and change it anytime.',
      },
    ],
  },
  {
    slug: 'environment',
    name: 'Environment & Conservation',
    titleNoun: 'Environment',
    h1: 'Fund the environment every time you shop',
    answerHtml:
      'Good Circles lets you fund environmental and conservation nonprofits every time you shop local. You <b>save about 10%</b>, and 10% of the merchant’s profit goes to the organization you choose — automatically, at no extra cost. Pick any IRS-verified 501(c)(3).',
    whyHtml:
      'Local conservation, cleanups, and stewardship groups protect the rivers, parks, and habitats a community depends on. A share of everyday local spending gives them recurring funding — and keeps the dollars circulating close to home.',
    exampleTypes: ['Land and water conservation groups', 'River and park cleanup organizations', 'Wildlife and habitat nonprofits', 'Community sustainability initiatives'],
    faqs: [
      {
        q: 'How can I support the environment by shopping?',
        a: 'Choose an environmental or conservation nonprofit as your cause in Good Circles. Then 10% of the merchant’s profit on every local purchase you make is routed to it automatically — and you save about 10%.',
      },
      {
        q: 'Can I pick a local conservation group?',
        a: 'Yes. Any IRS-verified 501(c)(3) qualifies, including local conservation and cleanup groups, and you can change your choice anytime.',
      },
    ],
  },
  {
    slug: 'arts',
    name: 'Arts & Culture',
    titleNoun: 'Arts & Culture',
    h1: 'Fund arts and culture every time you shop',
    answerHtml:
      'Good Circles lets you fund arts and culture nonprofits every time you shop local. You <b>save about 10%</b>, and 10% of the merchant’s profit goes to the organization you choose — automatically, at no extra cost. Pick any IRS-verified 501(c)(3).',
    whyHtml:
      'Community theaters, museums, music programs, and public art make a place feel like home — and they’re often first to lose funding. A share of everyday local spending becomes steady support for the culture that defines a community.',
    exampleTypes: ['Community theaters and arts centers', 'Museums and galleries', 'Music and youth-arts programs', 'Public-art and cultural-heritage nonprofits'],
    faqs: [
      {
        q: 'How do I support the arts by shopping?',
        a: 'Pick an arts or culture nonprofit as your cause in Good Circles. Then 10% of the merchant’s profit on every local purchase you make is routed to it automatically — and you save about 10%.',
      },
      {
        q: 'Can I choose a local arts organization?',
        a: 'Yes. You can choose any IRS-verified 501(c)(3), including local theaters, museums, and arts programs, and change it anytime.',
      },
    ],
  },
];
