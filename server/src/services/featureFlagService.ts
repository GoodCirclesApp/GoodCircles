/**
 * Feature Flag System for Good Circles
 * 
 * Simple config-based feature flags. In production, these could be moved
 * to a database table or a service like LaunchDarkly.
 */

export interface FeatureFlags {
  // Phase 1 features (ON for beta)
  enable_marketplace: boolean;
  enable_internal_banking: boolean;
  enable_stripe_payments: boolean;
  enable_service_bookings: boolean;
  enable_nonprofit_election: boolean;
  enable_discount_waiver: boolean;
  enable_community_initiatives: boolean;

  // Phase 2 features (gated — auto-activate)
  enable_netting_simulation: boolean;     // Always on — runs in sim mode
  enable_netting_execution: boolean;      // Auto-activates at dual triggers
  enable_coop_monitoring: boolean;        // Always on — tracks progress
  enable_coop_deals: boolean;             // Auto-activates per category
  enable_platform_credits: boolean;       // Auto-activates at 200 merchants
  enable_referral_bonuses: boolean;       // ON for beta
  enable_data_coop_collection: boolean;   // ON — collects anonymized data
  enable_data_coop_insights: boolean;     // Auto-activates at 10 merchants/category

  // Phase 3 features (OFF for initial beta)
  enable_cooperative_ownership: boolean;
  enable_cdfi_fund: boolean;
  enable_municipal_dashboard: boolean;
  enable_benefits_enrollment: boolean;
  enable_supply_chain_matching: boolean;
  enable_credit_transfers: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  // Phase 1 — ON
  enable_marketplace: true,
  enable_internal_banking: true,
  enable_stripe_payments: true,
  enable_service_bookings: true,
  enable_nonprofit_election: true,
  enable_discount_waiver: true,
  enable_community_initiatives: true,

  // Phase 2 — Auto-gated (monitoring/simulation ON, execution gated)
  enable_netting_simulation: true,
  enable_netting_execution: false,
  enable_coop_monitoring: true,
  enable_coop_deals: false,
  enable_platform_credits: false,
  enable_referral_bonuses: true,
  enable_data_coop_collection: true,
  enable_data_coop_insights: false,

  // Phase 3 — OFF for initial beta
  enable_cooperative_ownership: false,
  enable_cdfi_fund: false,
  enable_municipal_dashboard: false,
  enable_benefits_enrollment: false,
  enable_supply_chain_matching: false,
  enable_credit_transfers: false,
};

// In-memory store — in production, load from DB or config service
let currentFlags: FeatureFlags = { ...DEFAULT_FLAGS };

export class FeatureFlagService {
  static getAll(): FeatureFlags {
    return { ...currentFlags };
  }

  static isEnabled(flag: keyof FeatureFlags): boolean {
    return currentFlags[flag] ?? false;
  }

  static setFlag(flag: keyof FeatureFlags, value: boolean): void {
    currentFlags[flag] = value;
  }

  static setMultiple(flags: Partial<FeatureFlags>): void {
    currentFlags = { ...currentFlags, ...flags };
  }

  static resetToDefaults(): void {
    currentFlags = { ...DEFAULT_FLAGS };
  }

  /**
   * Activate Phase 3 features (admin action after beta validation)
   */
  static activatePhase3(): void {
    currentFlags.enable_cooperative_ownership = true;
    currentFlags.enable_cdfi_fund = true;
    currentFlags.enable_municipal_dashboard = true;
    currentFlags.enable_benefits_enrollment = true;
    currentFlags.enable_supply_chain_matching = true;
    currentFlags.enable_credit_transfers = true;
  }
}
