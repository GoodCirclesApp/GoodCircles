// ============================================================================
// launchChecklist.ts — Launch Readiness Checklist & Post-Launch Monitoring
// ============================================================================
// Structured checklist for the Catalog Upload Tool launch.
// Each item is actionable with verification steps.
// Run `npx ts-node validation/launchChecklist.ts` for a CLI status report.
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CheckStatus = 'PASS' | 'FAIL' | 'PENDING' | 'N/A';
type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface ChecklistItem {
  id: string;
  category: string;
  description: string;
  priority: Priority;
  status: CheckStatus;
  verificationSteps: string[];
  notes?: string;
}

// ---------------------------------------------------------------------------
// 1. SECURITY & SECRETS
// ---------------------------------------------------------------------------

const securityChecklist: ChecklistItem[] = [
  {
    id: 'SEC-001',
    category: 'Security',
    description: 'All API keys stored as environment variables (not in code)',
    priority: 'CRITICAL',
    status: 'PENDING',
    verificationSteps: [
      'Verify SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET in Railway env vars',
      'Verify ETSY_API_KEY, ETSY_SHARED_SECRET in Railway env vars',
      'Verify AMAZON_SP_CLIENT_ID, AMAZON_SP_CLIENT_SECRET, AMAZON_SP_REFRESH_TOKEN in Railway env vars',
      'Verify CLAUDE_API_KEY in Railway env vars',
      'Verify STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET in Railway env vars',
      'Verify RESEND_API_KEY in Railway env vars',
      'Run: grep -r "sk-ant\\|sk_live\\|rk_live\\|shpat_\\|etsv1_" src/ — should return 0 results',
    ],
  },
  {
    id: 'SEC-002',
    category: 'Security',
    description: 'OAuth redirect URIs properly configured per platform',
    priority: 'CRITICAL',
    status: 'PENDING',
    verificationSteps: [
      'Shopify: Verify redirect_uri in Shopify Partner Dashboard matches production URL',
      'Etsy: Verify redirect_uri in Etsy Developer Portal matches production URL',
      'Amazon: Verify redirect_uri in Amazon SP API app registration matches production URL',
      'Ensure no localhost URLs remain in production config',
    ],
  },
  {
    id: 'SEC-003',
    category: 'Security',
    description: 'Stripe webhook secret configured and endpoint verified',
    priority: 'CRITICAL',
    status: 'PENDING',
    verificationSteps: [
      'Verify webhook endpoint: POST /api/catalog/webhook/stripe',
      'Test with Stripe CLI: stripe trigger checkout.session.completed',
      'Verify signature validation in handleStripeWebhook()',
      'Confirm webhook is registered for: checkout.session.completed, checkout.session.expired',
    ],
  },
  {
    id: 'SEC-004',
    category: 'Security',
    description: 'CORS and CSP headers configured for OAuth callbacks',
    priority: 'HIGH',
    status: 'PENDING',
    verificationSteps: [
      'Verify CORS allows Shopify, Etsy, Amazon callback domains',
      'Verify CSP frame-ancestors allows Stripe Checkout',
      'Test cross-origin OAuth flow in incognito browser',
    ],
  },
];

// ---------------------------------------------------------------------------
// 2. RATE LIMITING & ABUSE PREVENTION
// ---------------------------------------------------------------------------

const rateLimitChecklist: ChecklistItem[] = [
  {
    id: 'RL-001',
    category: 'Rate Limiting',
    description: 'Rate limiting on GoodCircles catalog API endpoints',
    priority: 'CRITICAL',
    status: 'PENDING',
    verificationSteps: [
      'Apply rate limiter to POST /api/catalog/connect/:platform — 5 req/min per merchant',
      'Apply rate limiter to POST /api/catalog/scan — 10 req/min per merchant',
      'Apply rate limiter to POST /api/catalog/checkout — 3 req/min per merchant',
      'Apply rate limiter to POST /api/catalog/import/start — 2 req/min per merchant',
      'Apply rate limiter to GET /api/catalog/import/:id/status — 30 req/min (polling)',
      'Test: Send 10 rapid requests to /connect/shopify — verify 429 after 5',
    ],
  },
  {
    id: 'RL-002',
    category: 'Rate Limiting',
    description: 'Concurrent import limit enforced (max 3 jobs)',
    priority: 'HIGH',
    status: 'PENDING',
    verificationSteps: [
      'Verify MAX_CONCURRENT_JOBS = 3 in catalogJobQueue.ts',
      'Test: Start 3 imports simultaneously — 4th should receive 429 with retry-after',
      'Verify per-merchant limit: 1 active import per merchant',
    ],
  },
  {
    id: 'RL-003',
    category: 'Rate Limiting',
    description: 'Platform API rate limits respected per connector',
    priority: 'HIGH',
    status: 'PENDING',
    verificationSteps: [
      'Shopify: Verify 500ms delay between requests (2 req/s)',
      'Etsy: Verify 100ms delay between requests (10 req/s)',
      'Amazon: Verify 2000ms base delay with exponential backoff',
      'Test with rate-limit-simulating proxy to verify backoff behavior',
    ],
  },
];

// ---------------------------------------------------------------------------
// 3. TERMS OF SERVICE
// ---------------------------------------------------------------------------

const legalChecklist: ChecklistItem[] = [
  {
    id: 'LGL-001',
    category: 'Legal',
    description: 'Catalog Upload Terms of Service drafted and linked',
    priority: 'CRITICAL',
    status: 'PENDING',
    verificationSteps: [
      'Draft ToS covering: data handling, AI-generated descriptions disclaimer, refund policy',
      'Include: "AI-generated descriptions are suggestions; merchant is responsible for final content"',
      'Include: Refund policy (full refund on complete failure, prorated on partial)',
      'Include: Data retention (platform credentials stored encrypted, deleted on disconnect)',
      'Link ToS in CatalogPaymentStep.tsx checkbox (already implemented)',
      'Legal review of ToS document',
    ],
  },
  {
    id: 'LGL-002',
    category: 'Legal',
    description: 'Platform API compliance verified',
    priority: 'HIGH',
    status: 'PENDING',
    verificationSteps: [
      'Shopify: Verify app listing compliance with Shopify App Store requirements',
      'Etsy: Verify compliance with Etsy API Terms of Use (read-only access)',
      'Amazon: Verify SP-API Developer Registration and data handling agreement',
      'All: Confirm read-only scope — no write access to merchant stores',
    ],
  },
];

// ---------------------------------------------------------------------------
// 4. ANALYTICS EVENTS
// ---------------------------------------------------------------------------

const analyticsChecklist: ChecklistItem[] = [
  {
    id: 'ANA-001',
    category: 'Analytics',
    description: 'Core funnel events firing correctly',
    priority: 'HIGH',
    status: 'PENDING',
    verificationSteps: [
      'Verify tier_selected event fires with: tier, productCount, platform',
      'Verify import_started event fires with: importId, tier, platform, productCount',
      'Verify import_completed event fires with: importId, duration, productsPublished',
      'Verify payment_processed event fires with: amount, tier, stripeSessionId',
      'Test each event in development with analytics debugger',
    ],
    notes: 'Events defined in CATALOG_ANALYTICS_EVENTS (routing/catalogRouting.tsx)',
  },
  {
    id: 'ANA-002',
    category: 'Analytics',
    description: 'Error tracking events configured',
    priority: 'MEDIUM',
    status: 'PENDING',
    verificationSteps: [
      'Verify connection_failed event fires with: platform, errorCode, retryCount',
      'Verify payment_failed event fires with: errorType, stripeError',
      'Verify import_error event fires with: importId, phase, errorMessage',
      'Configure alerting on error event spike (>5 errors/hour)',
    ],
  },
];

// ---------------------------------------------------------------------------
// 5. MERCHANT ONBOARDING
// ---------------------------------------------------------------------------

const onboardingChecklist: ChecklistItem[] = [
  {
    id: 'ONB-001',
    category: 'Onboarding',
    description: 'Merchant onboarding email updated to mention catalog upload',
    priority: 'MEDIUM',
    status: 'PENDING',
    verificationSteps: [
      'Update welcome email template to include catalog import feature description',
      'Add "Import your existing catalog from Shopify, Etsy, or Amazon" callout',
      'Include link to /merchant/catalog-upload in email CTA',
      'Test email rendering in Litmus or Email on Acid',
    ],
  },
  {
    id: 'ONB-002',
    category: 'Onboarding',
    description: 'Navigation item visible in merchant portal',
    priority: 'HIGH',
    status: 'PENDING',
    verificationSteps: [
      'Verify "Import Catalog" nav item appears in merchant sidebar',
      'Verify "New" badge is visible (remove after 30 days)',
      'Verify nav item is hidden for non-merchant users',
      'Verify nav item links to /merchant/catalog-upload',
    ],
  },
];

// ---------------------------------------------------------------------------
// 6. MOBILE TESTING
// ---------------------------------------------------------------------------

const mobileChecklist: ChecklistItem[] = [
  {
    id: 'MOB-001',
    category: 'Mobile',
    description: 'iOS Safari testing complete',
    priority: 'HIGH',
    status: 'PENDING',
    verificationSteps: [
      'Test full flow on iPhone SE (375px) — Safari',
      'Test full flow on iPhone 14 Pro (393px) — Safari',
      'Test full flow on iPad (768px) — Safari',
      'Verify: No horizontal scroll on any step',
      'Verify: All buttons tappable (min 44x44px touch target)',
      'Verify: Stripe Checkout redirect works in Safari',
      'Verify: OAuth popups/redirects work in Safari',
      'Verify: Sticky publish bar doesn\'t overlap iOS home indicator',
    ],
  },
  {
    id: 'MOB-002',
    category: 'Mobile',
    description: 'Android Chrome testing complete',
    priority: 'HIGH',
    status: 'PENDING',
    verificationSteps: [
      'Test full flow on Pixel 7 (412px) — Chrome',
      'Test full flow on Samsung Galaxy S23 (360px) — Chrome',
      'Verify: No horizontal scroll on any step',
      'Verify: All buttons tappable',
      'Verify: Stripe Checkout redirect works in Chrome',
      'Verify: OAuth popups/redirects work in Chrome',
      'Verify: Back button behavior is correct at each step',
    ],
  },
];

// ---------------------------------------------------------------------------
// 7. COGS MONITORING
// ---------------------------------------------------------------------------

const monitoringChecklist: ChecklistItem[] = [
  {
    id: 'MON-001',
    category: 'Monitoring',
    description: 'COGS monitoring active and alerting configured',
    priority: 'CRITICAL',
    status: 'PENDING',
    verificationSteps: [
      'Verify trackImportCogs() is called during import execution',
      'Verify 20% over-budget threshold triggers alert',
      'Verify alerts appear in CatalogMonitorDashboard',
      'Configure email/Slack notification for COGS alerts to admin',
      'Test: Simulate high-token response to trigger over-budget alert',
    ],
  },
  {
    id: 'MON-002',
    category: 'Monitoring',
    description: 'Admin dashboard accessible and showing live data',
    priority: 'HIGH',
    status: 'PENDING',
    verificationSteps: [
      'Verify /admin/monitoring route is admin-only',
      'Verify 30-second auto-refresh is working',
      'Verify all 6 metric cards show real data after first import',
      'Verify tier COGS table populates correctly',
      'Verify alerts panel shows and resolves alerts',
    ],
  },
];

// ---------------------------------------------------------------------------
// 8. DATABASE & PRISMA
// ---------------------------------------------------------------------------

const databaseChecklist: ChecklistItem[] = [
  {
    id: 'DB-001',
    category: 'Database',
    description: 'Prisma schema migrated to production',
    priority: 'CRITICAL',
    status: 'PENDING',
    verificationSteps: [
      'Run: npx prisma migrate deploy (on Railway production DB)',
      'Verify CatalogImport table created with all columns',
      'Verify CatalogProduct table created with all columns',
      'Verify CatalogBilling table created with all columns',
      'Verify CatalogRevenue table created with all columns',
      'Verify indexes on merchantId, status, tier, createdAt',
      'Test: INSERT a test record and SELECT it back',
    ],
  },
  {
    id: 'DB-002',
    category: 'Database',
    description: 'Database connection pool sized for concurrent imports',
    priority: 'HIGH',
    status: 'PENDING',
    verificationSteps: [
      'Verify Prisma connection pool size >= 10 (handles 3 concurrent imports)',
      'Verify connection timeout is configured (30s recommended)',
      'Test under load: 3 simultaneous imports with DB queries',
    ],
  },
];

// ---------------------------------------------------------------------------
// POST-LAUNCH MONITORING PLAN
// ---------------------------------------------------------------------------

interface MonitoringPhase {
  phase: string;
  timeframe: string;
  activities: string[];
  successCriteria: string[];
  escalationTriggers: string[];
}

const postLaunchPlan: MonitoringPhase[] = [
  {
    phase: 'Phase 1: Manual Monitoring',
    timeframe: 'Week 1 (Days 1–7)',
    activities: [
      'Monitor every single import manually in admin dashboard',
      'Verify COGS accuracy: compare tracked vs actual Claude API billing',
      'Review AI-generated descriptions for quality (sample 10% of products)',
      'Check Stripe payment reconciliation daily',
      'Monitor error rates per platform connector',
      'Respond to any merchant support tickets within 2 hours',
      'Track conversion funnel: page view → connect → pay → import → publish',
    ],
    successCriteria: [
      'Zero failed payments without proper error handling',
      'All imports complete within 10-minute timeout',
      'COGS within 20% of projected for each tier',
      'No merchant data loss or corruption',
      'Mobile flow completable on both iOS Safari and Android Chrome',
    ],
    escalationTriggers: [
      'Any import COGS exceeds tier projected amount by >50%',
      'Import failure rate exceeds 10%',
      'More than 3 merchants report the same issue',
      'Any payment processed without corresponding import',
      'Claude API error rate exceeds 5%',
    ],
  },
  {
    phase: 'Phase 2: Aggregate Analysis',
    timeframe: 'Weeks 2–4 (Days 8–28)',
    activities: [
      'Review aggregate COGS data weekly',
      'Analyze per-tier profitability trends',
      'Identify most common merchant feedback themes',
      'Compare actual conversion rates vs projections',
      'Evaluate AI description quality via merchant edit rate',
      'Review platform connector reliability per platform',
      'Assess whether pricing tiers need adjustment',
    ],
    successCriteria: [
      'Average margin stays above 88% across all tiers',
      'Merchant edit rate on AI descriptions below 30%',
      'Import success rate above 95%',
      'Average time-to-publish under 15 minutes for Growth tier',
      'At least 10 successful imports completed',
    ],
    escalationTriggers: [
      'Average margin drops below 85% for any tier',
      'Merchant edit rate exceeds 50% (AI quality issue)',
      'Import success rate drops below 90%',
      'Claude API costs increase by >2x',
      'Any platform revokes API access',
    ],
  },
  {
    phase: 'Phase 3: Automation & Optimization',
    timeframe: 'Month 2+ (Day 29+)',
    activities: [
      'Automate COGS reporting (monthly report via catalogMonitor.generateMonthlyCOGSReport)',
      'Set up automated alerts for COGS outliers only (reduce manual monitoring)',
      'Implement A/B testing for AI description quality improvements',
      'Evaluate adding new platform connectors based on merchant demand',
      'Consider volume discounts for repeat merchants',
      'Optimize Claude prompts based on merchant edit patterns',
      'Explore adding image optimization as a premium feature',
    ],
    successCriteria: [
      'Fully automated monitoring with alert-only human intervention',
      'Monthly COGS report generated and reviewed automatically',
      'Feature profitable and self-sustaining',
      'Positive merchant NPS score for catalog import feature',
    ],
    escalationTriggers: [
      'Monthly revenue from catalog imports drops below $500',
      'Claude deprecates Haiku or significantly changes pricing',
      'Any platform changes API terms to disallow bulk reading',
      'Merchant churn attributed to catalog import issues',
    ],
  },
];

// ---------------------------------------------------------------------------
// CLI Status Report
// ---------------------------------------------------------------------------

function printChecklist() {
  const allItems = [
    ...securityChecklist,
    ...rateLimitChecklist,
    ...legalChecklist,
    ...analyticsChecklist,
    ...onboardingChecklist,
    ...mobileChecklist,
    ...monitoringChecklist,
    ...databaseChecklist,
  ];

  const statusEmoji: Record<CheckStatus, string> = {
    PASS: '✅',
    FAIL: '❌',
    PENDING: '⏳',
    'N/A': '➖',
  };

  const priorityOrder: Record<Priority, number> = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  };

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  CATALOG UPLOAD TOOL — LAUNCH READINESS CHECKLIST');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Group by category
  const grouped = allItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, ChecklistItem[]>
  );

  for (const [category, items] of Object.entries(grouped)) {
    console.log(`\n┌─── ${category.toUpperCase()} ${'─'.repeat(55 - category.length)}┐`);
    for (const item of items) {
      const emoji = statusEmoji[item.status];
      const pri = `[${item.priority}]`.padEnd(10);
      console.log(`│ ${emoji} ${pri} ${item.id}: ${item.description}`);
    }
    console.log(`└${'─'.repeat(62)}┘`);
  }

  // Summary
  const total = allItems.length;
  const passed = allItems.filter((i) => i.status === 'PASS').length;
  const failed = allItems.filter((i) => i.status === 'FAIL').length;
  const pending = allItems.filter((i) => i.status === 'PENDING').length;
  const critical = allItems.filter((i) => i.priority === 'CRITICAL' && i.status !== 'PASS').length;

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  SUMMARY: ${passed}/${total} passed | ${pending} pending | ${failed} failed`);
  console.log(`  CRITICAL ITEMS REMAINING: ${critical}`);
  console.log(
    `  LAUNCH READY: ${critical === 0 && failed === 0 ? '✅ YES' : '❌ NO — resolve critical items first'}`
  );
  console.log('═══════════════════════════════════════════════════════════════');

  // Post-launch plan summary
  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log('  POST-LAUNCH MONITORING PLAN');
  console.log('═══════════════════════════════════════════════════════════════\n');

  for (const phase of postLaunchPlan) {
    console.log(`\n📋 ${phase.phase} (${phase.timeframe})`);
    console.log('   Activities:');
    for (const activity of phase.activities) {
      console.log(`     • ${activity}`);
    }
    console.log('   Success Criteria:');
    for (const criterion of phase.successCriteria) {
      console.log(`     ✓ ${criterion}`);
    }
    console.log('   Escalation Triggers:');
    for (const trigger of phase.escalationTriggers) {
      console.log(`     ⚠ ${trigger}`);
    }
  }
}

// Run if executed directly
printChecklist();

// ---------------------------------------------------------------------------
// Exports (for programmatic use)
// ---------------------------------------------------------------------------

export {
  securityChecklist,
  rateLimitChecklist,
  legalChecklist,
  analyticsChecklist,
  onboardingChecklist,
  mobileChecklist,
  monitoringChecklist,
  databaseChecklist,
  postLaunchPlan,
  type ChecklistItem,
  type MonitoringPhase,
};
