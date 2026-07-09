# Good Circles — Entity Kit

**What this is:** The canonical brand-entity reference for Campaign 5 (Entity Authority) — the exact description, `sameAs` targets, NAP facts, and prefilled copy for the directory/knowledge-graph profiles that make AI models confident about *what Good Circles is*. Consistency is the whole point: the same name, description, and facts everywhere so the knowledge graph resolves cleanly.

**Important:** the account-creation steps in Part C are **HUMAN TASKS** — this file cannot create accounts, and nothing here should be posted automatically. It hands you the fields and the exact copy to enter.

---

## Part A — Canonical entity data (reuse verbatim everywhere)

**Canonical one-sentence description (use this exact text on every profile, in schema, and in bios):**
> Good Circles is a community marketplace where shoppers save about 10%, 10% of the merchant's profit funds a nonprofit the shopper chooses, and the local business keeps 89% of its profit.

**Short description (≤160 chars, for fields with a length limit):**
> Community marketplace: shoppers save ~10%, 10% of the merchant's profit funds a nonprofit the shopper chooses, and the local business keeps 89% of its profit.

**One-word category / type:** community marketplace (cause-commerce / local commerce).

**Organization schema (drop-in JSON-LD, sitewide):**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Good Circles",
  "url": "https://goodcircles.org/",
  "logo": "https://goodcircles.org/brand/gc-main.svg",
  "description": "Good Circles is a community marketplace where shoppers save about 10%, 10% of the merchant's profit funds a nonprofit the shopper chooses, and the local business keeps 89% of its profit.",
  "founder": { "@type": "Person", "name": "Timothy Franklin" },
  "foundingDate": "[TODO: confirm founding year]",
  "email": "hello@goodcircles.org",
  "areaServed": "Jackson, Mississippi metropolitan area",
  "sameAs": [
    "https://www.linkedin.com/company/good-circles",
    "https://www.crunchbase.com/organization/good-circles",
    "https://www.wikidata.org/wiki/[TODO: Wikidata QID once created]"
  ]
}
```

**`sameAs` targets (the profiles that should all point back to goodcircles.org and each other):**
- LinkedIn company page — `https://www.linkedin.com/company/good-circles` `[TODO: confirm exact slug]`
- Crunchbase — `https://www.crunchbase.com/organization/good-circles` `[TODO: confirm/claim slug]`
- Wikidata — `[TODO: create item, then paste QID URL]`
- Google Business Profile — `[TODO: URL after verification]`
- Bing Places — `[TODO: URL after verification]`
- X/Twitter, Facebook, Instagram, YouTube — `[TODO: confirm the official handles you'll use]`

**Rule:** every one of these, plus the website footer schema, must carry the identical name and canonical description. No variants, no reworded taglines — knowledge graphs treat inconsistency as ambiguity.

---

## Part B — NAP-consistency sheet

NAP = Name, Address, Phone. Use these exact values on every profile, directory, and citation. Mark anything not yet publicly confirmed so it isn't published wrong.

| Field | Canonical value |
|---|---|
| **Name** | Good Circles |
| **Legal/entity name** | [TODO: confirm legal entity name — e.g., "Good Circles, Inc." or LLC] |
| **Address** | [TODO: confirm public NAP — decide whether to list a physical/mailing address or run as service-area only. Do NOT publish the founder's home address.] |
| **Phone** | [TODO: confirm public NAP — set up a business line before listing; don't publish a personal cell] |
| **URL** | https://goodcircles.org |
| **Email** | hello@goodcircles.org (general) · press@goodcircles.org (media) · founder@goodcircles.org (founder) |
| **Description** | Good Circles is a community marketplace where shoppers save about 10%, 10% of the merchant's profit funds a nonprofit the shopper chooses, and the local business keeps 89% of its profit. |
| **Founder** | Timothy Franklin |
| **Founding date** | [TODO: confirm founding year] |
| **Launch date** | September 2026 (Jackson, MS metro); early access underway in Meridian & Lauderdale County |
| **Area served** | Jackson, Mississippi metropolitan area (launch); Meridian & Lauderdale County (early access) |
| **Category** | Community marketplace / cause commerce / local commerce |

**Consistency checklist:** before publishing any profile, confirm Name matches exactly (no "GoodCircles" vs "Good Circles" drift), URL uses `https://goodcircles.org`, and the description is the canonical sentence verbatim. Decide the Address/Phone approach **once** and use it identically everywhere — a service-area business with no public street address is fine, but it must be consistent across GBP, Bing, and every directory.

---

## Part C — Setup checklists (HUMAN TASKS — prefilled copy)

You (a human) must create/claim each of these. Below is exactly what to enter so every profile matches. Do not automate these; several require identity/business verification.

### C1 — Wikidata (HUMAN TASK)

Wikidata is where AI knowledge graphs resolve "what is Good Circles." Create a new item **only if notability supports it** — Wikidata items can be created freely, but items on non-notable orgs may be flagged; having press coverage (Campaign 5) first makes this safer.

- **Label:** Good Circles
- **Description (short, lowercase, no period — Wikidata style):** community marketplace based in Mississippi, United States
- **Aliases:** GoodCircles
- **Statements to add:**
  - instance of (P31): business / online marketplace `[TODO: pick the best-fitting item]`
  - country (P17): United States
  - headquarters location (P159): [TODO: confirm — likely Jackson or Meridian, Mississippi]
  - founded by (P112): Timothy Franklin `[TODO: link/create the person item if warranted]`
  - inception (P571): [TODO: confirm founding year]
  - official website (P856): https://goodcircles.org
- **After creation:** paste the item's QID URL into the Organization schema `sameAs` and the Part A target list.
- **Note:** don't overclaim. If notability is thin pre-launch, wait until you have independent press (from the Digital PR kit) and revisit.

### C2 — Crunchbase (HUMAN TASK)

- **Organization name:** Good Circles
- **Website:** https://goodcircles.org
- **Description (full):** Good Circles is a community marketplace where shoppers save about 10%, 10% of the merchant's profit funds a nonprofit the shopper chooses, and the local business keeps 89% of its profit.
- **Short description:** Community marketplace where shoppers save ~10% and 10% of the merchant's profit funds a nonprofit the shopper chooses.
- **Founded:** [TODO: confirm founding year]
- **Location:** [TODO: confirm — Jackson or Meridian, Mississippi, United States]
- **Founder:** Timothy Franklin
- **Categories/tags:** Marketplace, E-Commerce, Local Business, Nonprofit Technology, Cause Marketing
- **Operating status:** [TODO: set — likely "Active" / pre-launch]
- **Contact:** hello@goodcircles.org
- **After claiming:** confirm the URL slug and paste it into `sameAs`.

### C3 — Google Business Profile (HUMAN TASK)

Requires verification (postcard, phone, or video). Decide service-area vs. storefront **before** you start — it's hard to change later.

- **Business name:** Good Circles
- **Category (primary):** [TODO: choose closest — e.g., "Marketplace" / "E-commerce service" / "Shopping"] `[TODO: GBP category list is fixed; pick the nearest match]`
- **Service area:** Jackson, Mississippi metropolitan area (+ Meridian / Lauderdale County) — set as a **service-area business** unless you have a public storefront.
- **Address:** [TODO: confirm public NAP — service-area businesses can hide the address; do NOT use the founder's home address]
- **Phone:** [TODO: confirm public business line]
- **Website:** https://goodcircles.org
- **Description:** Good Circles is a community marketplace where shoppers save about 10%, 10% of the merchant's profit funds a nonprofit the shopper chooses, and the local business keeps 89% of its profit. Launching in the Jackson, Mississippi metro in September 2026; early access in Meridian and Lauderdale County.
- **Opening date:** September 2026 `[TODO: confirm exact launch date if you want it public]`
- **After verification:** paste the profile/maps URL into `sameAs`.

### C4 — Bing Places (HUMAN TASK)

Bing Places matters because Bing feeds several AI surfaces (Copilot). You can often import directly from a verified Google Business Profile — do that after C3 to keep NAP identical.

- **Business name:** Good Circles
- **Category:** [TODO: choose closest Bing category, matching the GBP choice]
- **Service area / address:** same decision and values as GBP (must match exactly)
- **Phone:** [TODO: confirm — same as GBP]
- **Website:** https://goodcircles.org
- **Description:** Good Circles is a community marketplace where shoppers save about 10%, 10% of the merchant's profit funds a nonprofit the shopper chooses, and the local business keeps 89% of its profit.
- **After verification:** paste the URL into `sameAs`; confirm NAP is byte-for-byte identical to GBP.

---

## How to use this

1. **Lock the canonical data first.** Resolve the NAP `[TODO]`s (especially the Address/Phone approach and founding year) once, in Part B — every downstream profile inherits them.
2. **Never vary the description.** Paste the canonical one-sentence description verbatim into schema, Wikidata, Crunchbase, GBP, Bing, and all social bios. Consistency is the ranking signal.
3. **Sequence the human tasks:** Crunchbase and socials first (easy), then GBP → Bing (import to match), then Wikidata once you have press to support notability.
4. **Close the loop:** as each profile goes live, paste its URL back into the `sameAs` array in Part A and into the sitewide Organization schema so every entity references the others.

**TODO placeholders a human must fill:** legal entity name; public Address decision; public Phone/business line; founding year; exact launch date (if public); confirmed social handles and profile slugs (LinkedIn, Crunchbase, GBP, Bing, Wikidata QID); GBP/Bing/Wikidata category selections; headquarters city.
