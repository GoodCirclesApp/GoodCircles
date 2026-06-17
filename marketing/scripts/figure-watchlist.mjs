// Currency watch-list for the resource hub's citation/currency QA gate.
// Each entry flags an OUTDATED figure so a stale number fails the build.
// When a real-world figure changes, update `current` here and fix the pages —
// the gate then enforces the new value across all ~100+ resource pages.
// Review cadence: at least annually (and whenever a cited authority updates).
export const STALE_FIGURES = [
  {
    label: 'Federal de minimis indirect cost rate is 15% of MTDC (2 CFR 200, eff. 2024-10-01)',
    current: '15% de minimis',
    pattern: /10%\s*de\s*minimis/i,
    // Suppress when the page also states the current value (i.e. it's explaining the rise, not stating the old rate as current).
    okIf: /15%\s*de\s*minimis/i,
  },
  {
    label: 'Single Audit threshold is $1,000,000 (Uniform Guidance, FYs beginning on/after 2024-10-01)',
    current: '$1,000,000',
    pattern: /single\s*audit[\s\S]{0,90}\$\s*750,?000/i,
    okIf: /\$\s*1,000,000|\b1\s*million\b/i,
  },
  // NOTE: only track figures that actually CHANGE year to year (rates, thresholds,
  // statutory limits). Historical facts (e.g. AmazonSmile shut down in 2023) belong
  // in the prose, not here — a watch-list pattern on them only yields false positives.
];

// Benchmark/statutory source years currently cited across the hub. The gate warns
// (does not fail) if a NEWER major-source year should be adopted — bump here when
// the new annual report lands.
export const SOURCE_YEARS = {
  'M+R Benchmarks': 2026,
  'Giving USA': 2025,
  'Fundraising Effectiveness Project': 2025,
};
