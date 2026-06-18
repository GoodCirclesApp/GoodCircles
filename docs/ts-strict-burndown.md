# TypeScript `strict` burndown

Enterprise-audit P2 item: get the app/server compiling under TypeScript `strict`,
then make it a blocking gate. This is run **report-only** first so it can't break
the production build or the Railway deploy.

## How it runs

- **`tsconfig.strict.json`** — extends the base `tsconfig.json` and flips `strict: true`. Nothing else uses it.
- **`npm run lint:strict`** — runs it locally (`tsc --noEmit -p tsconfig.strict.json`).
- **CI** (`.github/workflows/app-ci.yml`) runs it as a **non-blocking** step (`|| true`) so the baseline shows in the log without failing the build. The production build (`npm run build`) still uses the non-strict `tsconfig.json`.

**Definition of done:** drive the count to 0, then make the CI step blocking (drop the `|| true`) and fold `strict: true` into the base `tsconfig.json`.

## Baseline — 2026-06-18

**32 errors across ~14 files.** (Note: this is far smaller than the ~369 raw `any` count from the audit — most `any`s are explicit annotations that `strict` does not flag.)

| Error | Count | Meaning |
|------|------:|---------|
| TS2322 | 11 | Type not assignable (mostly Recharts `formatter`/`Tooltip` prop typings) |
| TS7006 | 5 | Parameter implicitly `any` |
| TS2532 | 3 | Object is possibly `undefined` |
| TS2345 | 3 | Argument not assignable |
| TS18047 | 3 | Value is possibly `null` |
| TS2531 | 2 | Object is possibly `null` |
| TS18048 | 2 | Value is possibly `undefined` |
| TS7016 | 1 | Missing declaration file (`cors`) |
| TS2783 | 1 | Property specified more than once (**likely a real bug**) |
| TS2571 | 1 | Object is of type `unknown` |

### Clusters & remediation

1. **Recharts `Formatter` typings (~9 × TS2322 + 2 × TS18048)** — `MunicipalDemoSimulator.tsx`, `NonprofitAnalytics.tsx`, `PublicImpactDashboard.tsx`. The `formatter={(v) => ...}` / label `percent` props don't match Recharts' broad `Formatter<ValueType, NameType>` type. Fix once with a small typed helper (e.g. `const moneyFmt: Formatter<number,string> = ...`) and reuse; guard `percent` with `?? 0`.
2. **Implicit-any params (5 × TS7006)** — `MerchantProductManager.tsx` (`v` ×3), `server.ts` CORS `origin`/`callback`. Annotate the params (CORS: `origin?: string`, `callback: (err: Error | null, allow?: boolean) => void`).
3. **Missing `cors` types (1 × TS7016)** — add `@types/cors` to devDependencies (it's the only `@types/*` gap; a dep change, do it with the burndown).
4. **Null/undefined safety (TS2531/2532/18047/2571)** — `cdfiService.ts:138,141`, `cooperativeService.ts:122`, `cooperative.test.ts` (×5), `AdminPortalView.tsx:105`. Add narrow guards / non-null assertions where provably safe; these are in real money/coop paths so review each, don't blanket-`!`.
5. **Prisma input mismatches (TS2322/2345)** — `authController.ts:276` (nullable fields in a `user.update` input), `cdfiController.ts:35`, `aiUnderwritingService.ts:68` (`string | undefined` → `string`), `cooperativeService.ts:121`, `catalogE2ETests.ts:110`. Tighten the upstream types / coalesce nulls.
6. **⚠️ Likely a real bug (TS2783)** — `views/ImpactMapView.tsx:332`: `'city' is specified more than once, so this usage will be overwritten.` A `city` key is set twice in an object literal/spread; one value is silently dropped. Investigate intended value before the cosmetic strict fix.

## Progress log

- **2026-06-18** — Report-only strict added; baseline = 32. No fixes applied yet (this pass is reporting only).
