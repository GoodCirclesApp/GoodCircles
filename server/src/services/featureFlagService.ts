import { prisma } from '../lib/prisma';

export interface FeatureFlags {
  enable_marketplace: boolean;
  enable_internal_banking: boolean;
  enable_stripe_payments: boolean;
  enable_service_bookings: boolean;
  enable_nonprofit_election: boolean;
  enable_discount_waiver: boolean;
  enable_community_initiatives: boolean;
  enable_netting_simulation: boolean;
  enable_netting_execution: boolean;
  enable_coop_monitoring: boolean;
  enable_coop_deals: boolean;
  enable_platform_credits: boolean;
  enable_referral_bonuses: boolean;
  enable_data_coop_collection: boolean;
  enable_data_coop_insights: boolean;
  enable_cooperative_ownership: boolean;
  enable_cdfi_fund: boolean;
  enable_municipal_dashboard: boolean;
  enable_benefits_enrollment: boolean;
  enable_supply_chain_matching: boolean;
  enable_credit_transfers: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  enable_marketplace: true,
  enable_internal_banking: true,
  enable_stripe_payments: true,
  enable_service_bookings: true,
  enable_nonprofit_election: true,
  enable_discount_waiver: true,
  enable_community_initiatives: true,
  enable_netting_simulation: true,
  enable_netting_execution: false,
  enable_coop_monitoring: true,
  enable_coop_deals: false,
  enable_platform_credits: false,
  enable_referral_bonuses: true,
  enable_data_coop_collection: true,
  enable_data_coop_insights: false,
  enable_cooperative_ownership: false,
  enable_cdfi_fund: false,
  enable_municipal_dashboard: false,
  enable_benefits_enrollment: false,
  enable_supply_chain_matching: false,
  enable_credit_transfers: false,
};

const SETTINGS_KEY = 'feature_flags';
const DEMO_MODE_KEY = 'demo_mode';

// In-memory cache — loaded from DB on first use, written through on updates
let cache: FeatureFlags | null = null;
let demoModeCache: boolean | null = null;

export class FeatureFlagService {
  static async loadFromDb(): Promise<void> {
    try {
      const row = await prisma.systemSetting.findUnique({ where: { key: SETTINGS_KEY } });
      if (row) {
        cache = { ...DEFAULT_FLAGS, ...JSON.parse(row.value) };
      } else {
        cache = { ...DEFAULT_FLAGS };
        await prisma.systemSetting.create({ data: { key: SETTINGS_KEY, value: JSON.stringify(DEFAULT_FLAGS) } });
      }

      const demoRow = await prisma.systemSetting.findUnique({ where: { key: DEMO_MODE_KEY } });
      demoModeCache = demoRow ? demoRow.value === 'true' : false;
      if (!demoRow) {
        await prisma.systemSetting.create({ data: { key: DEMO_MODE_KEY, value: 'false' } });
      }
    } catch (err) {
      console.error('[FeatureFlags] Failed to load from DB, using defaults:', err);
      cache = { ...DEFAULT_FLAGS };
      demoModeCache = false;
    }
  }

  static getAll(): FeatureFlags {
    return { ...(cache ?? DEFAULT_FLAGS) };
  }

  static isEnabled(flag: keyof FeatureFlags): boolean {
    return (cache ?? DEFAULT_FLAGS)[flag] ?? false;
  }

  static async setFlag(flag: keyof FeatureFlags, value: boolean): Promise<void> {
    if (!cache) cache = { ...DEFAULT_FLAGS };
    cache[flag] = value;
    await prisma.systemSetting.upsert({
      where: { key: SETTINGS_KEY },
      update: { value: JSON.stringify(cache) },
      create: { key: SETTINGS_KEY, value: JSON.stringify(cache) },
    });
  }

  static async setMultiple(flags: Partial<FeatureFlags>): Promise<void> {
    if (!cache) cache = { ...DEFAULT_FLAGS };
    cache = { ...cache, ...flags };
    await prisma.systemSetting.upsert({
      where: { key: SETTINGS_KEY },
      update: { value: JSON.stringify(cache) },
      create: { key: SETTINGS_KEY, value: JSON.stringify(cache) },
    });
  }

  static async resetToDefaults(): Promise<void> {
    cache = { ...DEFAULT_FLAGS };
    await prisma.systemSetting.upsert({
      where: { key: SETTINGS_KEY },
      update: { value: JSON.stringify(DEFAULT_FLAGS) },
      create: { key: SETTINGS_KEY, value: JSON.stringify(DEFAULT_FLAGS) },
    });
  }

  static async activatePhase3(): Promise<void> {
    await FeatureFlagService.setMultiple({
      enable_cooperative_ownership: true,
      enable_cdfi_fund: true,
      enable_municipal_dashboard: true,
      enable_benefits_enrollment: true,
      enable_supply_chain_matching: true,
      enable_credit_transfers: true,
    });
  }

  // Demo mode: when ON, admin views show simulated data; live users always see real data
  static isDemoMode(): boolean {
    return demoModeCache ?? false;
  }

  static async setDemoMode(enabled: boolean): Promise<void> {
    demoModeCache = enabled;
    await prisma.systemSetting.upsert({
      where: { key: DEMO_MODE_KEY },
      update: { value: enabled ? 'true' : 'false' },
      create: { key: DEMO_MODE_KEY, value: enabled ? 'true' : 'false' },
    });
  }
}
