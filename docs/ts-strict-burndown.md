# TypeScript `strict` — COMPLETE

Enterprise-audit P2 item. **Status: DONE (2026-06-18).** `strict: true` is now set in
the base `tsconfig.json`, so the production build (`npm run build` → `tsc`) and CI
both enforce it — a strict regression now fails the build/deploy.

## How it's enforced now

- `tsconfig.json` has `"strict": true`. `npm run build` (and the Dockerfile build) run `tsc --noEmit` strict.
- CI (`.github/workflows/app-ci.yml`) "Typecheck (tsc --noEmit, strict)" step is blocking.
- The interim report-only scaffolding (`tsconfig.strict.json`, `lint:strict`, the non-blocking CI step) has been removed now that the count is 0.

## Burndown record

Baseline **32 errors across ~14 files** → **0**. Fixes applied 2026-06-18:

1. **Recharts formatter/label typings (~11 + 2)** — dropped the explicit `(v: number)` annotations so the params get Recharts' contextual `ValueType`, and coerced with `Number(v)`; guarded `percent` with `?? 0`. Files: `MunicipalDemoSimulator`, `NonprofitAnalytics`, `PublicImpactDashboard`.
2. **Missing `cors` types** — added `@types/cors` (devDep). This also resolved the two CORS implicit-`any` params in `server.ts` via contextual typing.
3. **Implicit-any (`InputBlock`)** — typed `MerchantProductManager`'s `InputBlock` props (`value: string`, `onChange: (v: string) => void`).
4. **CDFI/coop null-safety** — `cdfiService` now fetches the merchant wallet once and guards null (was two unguarded `findUnique(...).id`/`.balance` calls); `cooperativeService` skips a member (records 0) when the coop merchant or member merchant is missing; `cdfiController` rejects an application with no recipient merchant before AI evaluation (also fixed the `Merchant | null` → `Merchant` type to the underwriter). These are real robustness improvements, not just type appeasement.
5. **`authController.updateProfile`** — profile-update zod schema switched from `.nullish()` to `.optional()` so it never passes `null` to non-nullable columns (email/discountMode).
6. **`aiUnderwritingService`** — guard the GenAI `response.text` (possibly undefined) before `JSON.parse` (throws into the existing fallback).
7. **`AdminPortalView`** — cast `activeUsersByRole` to `Record<string, number>` before `Object.values(...).reduce`.
8. **Tests** — `cooperative.test.ts` / `catalogE2ETests.ts` got non-null assertions (`details!`, `.find(...)!`) and `?? Infinity` for the unbounded top-tier `maxProducts`.
9. **`ImpactMapView:332`** — the TS2783 "duplicate `city`" was a harmless redundancy (`{ city: c.city, ...c }` re-supplied the identical `city`); simplified to `{ ...c }`. No behavior change.

Verified: `npm run build` (strict) green, DB-free tests green, `npm ci` clean.
