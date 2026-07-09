// Thin-content guard for programmatic pages (/shop-local/[city]/, /causes/[cause]/,
// and future generated sets). AI engines and search discount low-substance
// "doorway" pages and it can hurt entity trust — so a generated page that doesn't
// clear a real content/entity threshold is rendered but marked NOINDEX (it still
// exists at its URL for users and internal links; it just won't be indexed until
// it has genuine, specific content).
//
// This does NOT delete or block pages — it only decides the `noindex` flag passed
// to Base.astro. Callers compute cheap signals (unique word count, count of real
// entities like merchants/districts/markets/FAQs) and let this decide.

export interface ThinSignals {
  /** Approx unique body word count. */
  words?: number;
  /** Count of specific real entities on the page (merchants, districts, markets, FAQs…). */
  entities?: number;
  /** Post-launch: number of real Good Circles merchants in this place. */
  merchants?: number;
  /** Force-index a hand-curated page regardless of signals. */
  force?: boolean;
}

// Thresholds — a page needs EITHER enough unique words OR enough specific entities.
// Pre-launch there are no merchants, so `merchants` is not required; when it is
// provided (post-launch) it counts as entities too.
export const THIN_MIN_WORDS = 250;
export const THIN_MIN_ENTITIES = 3;

export interface ThinVerdict {
  indexable: boolean;
  reason: string;
}

export function evaluateThinContent(s: ThinSignals): ThinVerdict {
  if (s.force) return { indexable: true, reason: 'forced' };
  const words = s.words ?? 0;
  const entities = (s.entities ?? 0) + (s.merchants ?? 0);
  if (words >= THIN_MIN_WORDS || entities >= THIN_MIN_ENTITIES) {
    return { indexable: true, reason: `ok (${words}w, ${entities} entities)` };
  }
  return {
    indexable: false,
    reason: `thin: ${words}w & ${entities} entities below ${THIN_MIN_WORDS}w / ${THIN_MIN_ENTITIES} entities`,
  };
}

/** Convenience: the noindex boolean to pass straight to Base/AnswerPage. */
export function shouldNoindex(s: ThinSignals): boolean {
  return !evaluateThinContent(s).indexable;
}

/** Rough word counter for a chunk of HTML/text (strips tags). */
export function wordCount(html: string): number {
  if (!html) return 0;
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.split(' ').length : 0;
}
