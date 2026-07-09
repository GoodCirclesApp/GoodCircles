/**
 * Pluggable sales-tax calculation interface (compliance audit — Phase 4 tax
 * scaffolding). This defines the SEAM only: a provider-agnostic contract plus a
 * safe default that calculates NO tax. It intentionally does NOT choose or wire a
 * tax provider (Avalara / TaxJar / Stripe Tax / manual) — that is a business +
 * legal decision. When a provider is chosen, implement this interface and register
 * it in `getTaxCalculator()`; no call site has to change.
 *
 * Nothing here touches the database or requires a schema change. The transaction
 * tax fields that would PERSIST a quote live in the held migration
 * (docs/HELD-MIGRATION-tax-scaffolding.md) and are not referenced until applied.
 */

export interface TaxAddress {
  line1?: string;
  city?: string;
  state?: string; // 2-letter for US
  postalCode?: string;
  country?: string; // ISO-3166-1 alpha-2; defaults to 'US'
}

export interface TaxLineItem {
  reference: string;      // e.g. product/transaction id
  amountCents: number;    // taxable base for this line, in cents
  taxCode?: string;       // provider/product tax code, if known
  quantity?: number;
}

export interface TaxQuoteRequest {
  origin?: TaxAddress;        // merchant / ship-from
  destination: TaxAddress;    // customer / ship-to (jurisdiction driver)
  lineItems: TaxLineItem[];
  currency?: string;          // default 'usd'
}

export interface TaxQuoteLine {
  reference: string;
  taxableCents: number;
  taxCents: number;
  rate: number; // effective decimal rate for the line (0 for none)
}

export interface TaxQuote {
  provider: string;           // 'none' for the default
  jurisdiction: string | null;
  totalTaxCents: number;
  lines: TaxQuoteLine[];
  /** True when tax was actually computed by a real provider (not the no-op). */
  computed: boolean;
}

export interface TaxCalculator {
  readonly name: string;
  quote(req: TaxQuoteRequest): Promise<TaxQuote>;
}

/**
 * Default calculator: computes NO tax. This keeps the platform's current behavior
 * (no sales tax collected) explicit and auditable rather than implicit, and makes
 * every call site tax-aware so a real provider can be dropped in later.
 */
export class NoopTaxCalculator implements TaxCalculator {
  readonly name = 'none';
  async quote(req: TaxQuoteRequest): Promise<TaxQuote> {
    return {
      provider: 'none',
      jurisdiction: req.destination?.state
        ? `${req.destination.country ?? 'US'}-${req.destination.state}`
        : null,
      totalTaxCents: 0,
      lines: req.lineItems.map((li) => ({
        reference: li.reference,
        taxableCents: li.amountCents,
        taxCents: 0,
        rate: 0,
      })),
      computed: false,
    };
  }
}

let singleton: TaxCalculator | null = null;

/**
 * Returns the active tax calculator. Selection is env-driven (`TAX_PROVIDER`) so a
 * provider can be enabled without code changes; today only 'none' is registered.
 * Add real providers here when one is chosen and legally configured.
 */
export function getTaxCalculator(): TaxCalculator {
  if (singleton) return singleton;
  const provider = (process.env.TAX_PROVIDER || 'none').toLowerCase();
  switch (provider) {
    // case 'avalara': singleton = new AvalaraTaxCalculator(); break;
    // case 'taxjar':  singleton = new TaxJarTaxCalculator();  break;
    // case 'stripe':  singleton = new StripeTaxCalculator();  break;
    case 'none':
    default:
      singleton = new NoopTaxCalculator();
  }
  return singleton;
}

/** Test/DI hook to override the calculator. */
export function __setTaxCalculatorForTest(calc: TaxCalculator | null): void {
  singleton = calc;
}
