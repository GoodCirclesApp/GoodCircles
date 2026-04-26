import { prisma } from '../lib/prisma';

// US Census Bureau geocoding API — free, no key required.
// Returns census tract FIPS code and income characterization (LMI = Qualified Investment Area).
// Rate limit: ~1 req/sec sustained. We process async in batches to stay well under.
const CENSUS_GEOCODE_URL = 'https://geocoding.geo.census.gov/geocoder/geographies/address';
const FFIEC_TRACT_URL = 'https://ffiec.cfpb.gov/api/census/tract';

type GeocodeResult = {
  censusTractId: string | null;  // full FIPS: state(2) + county(3) + tract(6) = 11 digits
  isQualifiedInvestmentArea: boolean;
};

async function geocodeAddress(
  street: string,
  city: string,
  state: string,
  zip: string,
): Promise<GeocodeResult> {
  const params = new URLSearchParams({
    street,
    city,
    state,
    zip,
    benchmark: 'Public_AR_Current',
    vintage: 'Current_Current',
    layers: 'Census Tracts',
    format: 'json',
  });

  const res = await fetch(`${CENSUS_GEOCODE_URL}?${params}`, {
    headers: { 'User-Agent': 'GoodCircles/1.0 CDFI Compliance' },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return { censusTractId: null, isQualifiedInvestmentArea: false };

  const data = await res.json();
  const matches = data?.result?.addressMatches ?? [];
  if (!matches.length) return { censusTractId: null, isQualifiedInvestmentArea: false };

  const geographies = matches[0]?.geographies?.['Census Tracts'] ?? [];
  if (!geographies.length) return { censusTractId: null, isQualifiedInvestmentArea: false };

  // GEOID = state FIPS + county FIPS + tract — 11-digit unique identifier
  const tractGeoid: string = geographies[0]?.GEOID ?? '';
  if (!tractGeoid) return { censusTractId: null, isQualifiedInvestmentArea: false };

  // Check FFIEC income characterization for this tract (LMI = Qualified Investment Area)
  const isQIA = await checkQualifiedInvestmentArea(tractGeoid);

  return { censusTractId: tractGeoid, isQualifiedInvestmentArea: isQIA };
}

// FFIEC tract income characterization — LMI tracts qualify as Investment Areas
// for CDFI Fund purposes under 12 CFR Part 1805.
async function checkQualifiedInvestmentArea(tractGeoid: string): Promise<boolean> {
  try {
    const stateCode = tractGeoid.slice(0, 2);
    const countyCode = tractGeoid.slice(2, 5);
    const tractCode = tractGeoid.slice(5);

    const res = await fetch(
      `${FFIEC_TRACT_URL}/${stateCode}/${countyCode}/${tractCode}`,
      {
        headers: { 'User-Agent': 'GoodCircles/1.0 CDFI Compliance' },
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!res.ok) return false;
    const data = await res.json();

    // Income level codes: LMI = Low (< 50% AMI) or Moderate (50-79% AMI)
    const incomeLevel: string = data?.tractIncome?.tractIncomeLevel ?? '';
    return incomeLevel === 'Low' || incomeLevel === 'Moderate';
  } catch {
    return false;
  }
}

export class FfiecGeocodingService {

  // Geocode a single merchant and persist the result.
  static async geocodeMerchant(merchantId: string): Promise<GeocodeResult> {
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        physicalAddress: true, physicalCity: true,
        physicalState: true, physicalZip: true,
      },
    });

    if (!merchant?.physicalAddress || !merchant.physicalCity ||
        !merchant.physicalState || !merchant.physicalZip) {
      return { censusTractId: null, isQualifiedInvestmentArea: false };
    }

    const result = await geocodeAddress(
      merchant.physicalAddress,
      merchant.physicalCity,
      merchant.physicalState,
      merchant.physicalZip,
    );

    await prisma.merchant.update({
      where: { id: merchantId },
      data: {
        censusTractId: result.censusTractId,
        isQualifiedInvestmentArea: result.isQualifiedInvestmentArea,
        censusTractCheckedAt: new Date(),
      },
    });

    return result;
  }

  // Background job: geocode all merchants missing census tract data.
  // Processes 1/sec to respect Census Bureau rate limits.
  static async geocodeMissingMerchants(): Promise<number> {
    const merchants = await prisma.merchant.findMany({
      where: {
        censusTractId: null,
        physicalAddress: { not: null },
        physicalZip: { not: null },
      },
      select: { id: true },
      take: 100, // process in capped batches to avoid memory issues
    });

    let processed = 0;
    for (const { id } of merchants) {
      try {
        await FfiecGeocodingService.geocodeMerchant(id);
        processed++;
        // 1 req/sec — stay well under Census Bureau rate limit
        await new Promise(r => setTimeout(r, 1100));
      } catch (err: any) {
        console.error(`[FFIEC] Failed to geocode merchant ${id}:`, err.message);
      }
    }

    if (processed > 0) {
      console.log(`[FFIEC] Geocoded ${processed} merchants.`);
    }
    return processed;
  }

  // Check whether a merchant is in a CDFI's target census tracts.
  static async isInTargetArea(merchantId: string, cdfiPartnerId: string): Promise<boolean> {
    const [merchant, cdfi] = await Promise.all([
      prisma.merchant.findUnique({
        where: { id: merchantId },
        select: { censusTractId: true, isQualifiedInvestmentArea: true },
      }),
      prisma.cDFIPartner.findUnique({
        where: { id: cdfiPartnerId },
        select: { targetCensusTracts: true },
      }),
    ]);

    if (!merchant?.censusTractId || !cdfi) return false;
    if (!cdfi.targetCensusTracts.length) return merchant.isQualifiedInvestmentArea;
    return cdfi.targetCensusTracts.includes(merchant.censusTractId);
  }
}
