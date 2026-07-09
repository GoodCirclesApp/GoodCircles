// Cities that get a localized Local Giving Index edition. `households` is the
// number of households in the market — a REAL number required before the
// community-total projection can be shown; left null (TODO) until confirmed from a
// citable source (Census/ACS). The per-$100 and per-household figures don't need
// it, so the city pages publish today and the community total lights up when the
// count is filled in.
export interface IndexCity {
  slug: string;
  name: string;
  /** How the market is described in copy, e.g. "the Jackson metro". */
  market: string;
  /** Total households in the market — TODO: confirm from Census/ACS, then set. */
  households: number | null;
  householdsSource?: string;
}

export const INDEX_CITIES: IndexCity[] = [
  { slug: 'jackson', name: 'Jackson', market: 'the Jackson, Mississippi metro', households: null },
  { slug: 'meridian', name: 'Meridian', market: 'Meridian & Lauderdale County', households: null },
];
