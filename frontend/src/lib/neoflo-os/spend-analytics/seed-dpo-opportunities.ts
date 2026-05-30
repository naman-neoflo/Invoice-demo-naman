// DPO stretch opportunity for the spend-analytics demo.
//
// Source of truth: docs/handoff/spend-analytics/04-data-model.md § "seed-dpo-opportunities.ts"
//   + Bundle C brief in docs/plans/2026-05-16-spend-analytics-phase-1-implementation.md.
//
// Composition:
//   - 12 vendors, each absorbing a 3-7 day stretch within payment-history tolerance.
//   - Sum of freedDollars = $1.8M exactly (matches the "1.8M working capital freed" KPI).
//   - All vendors are standard-tier or long-tail (none strategic, none single-source).
//   - All have averageDaysToPay > paymentTermsDays in SEED_VENDORS (late-payers with
//     demonstrated elasticity).
//
// Hero vendors Sumitomo Heavy + Coastal Print anchor the list; the remaining
// 10 are from the 12 "absorbs DPO stretch" cohort in seed-vendors.ts.

import type { DPOOpportunitySummary } from "./types"

export const SEED_DPO_OPPORTUNITY: DPOOpportunitySummary = {
  totalFreedDollars: 1_800_000,
  currentDPO: 38,
  targetDPO: 42,
  globalReasoning:
    "Stretching DPO 4 days frees $1.8M working capital. 12 vendors absorb the shift based on payment-history elasticity and concentration analysis — none are single-source or strategic-tier. Strategic vendors (Acme, Northeast, Pacific) preserved at current timing.",
  perVendor: [
    {
      vendorId: "vendor-sumitomo-heavy",
      currentDaysToPay: 32,
      recommendedStretchDays: 5,
      freedDollars: 250_000,
      elasticityReasoning: "Pays 4d late vs terms; 0 disputes last 24mo; strong elasticity per payment-history.",
      riskScore: "low",
    },
    {
      vendorId: "vendor-coastal-print",
      currentDaysToPay: 28,
      recommendedStretchDays: 4,
      freedDollars: 220_000,
      elasticityReasoning: "On-terms; 0 disputes; standard tier; modest elasticity.",
      riskScore: "low",
    },
    {
      vendorId: "vendor-skyharbor-logistics",
      currentDaysToPay: 37,
      recommendedStretchDays: 6,
      freedDollars: 220_000,
      elasticityReasoning: "Pays 7d late on average; 0 disputes; logistics vendor with high billing tolerance.",
      riskScore: "low",
    },
    {
      vendorId: "vendor-pinewood-supplies",
      currentDaysToPay: 34,
      recommendedStretchDays: 5,
      freedDollars: 180_000,
      elasticityReasoning: "Pays 4d late; 0 disputes; standard-tier facilities supplier with consistent terms.",
      riskScore: "low",
    },
    {
      vendorId: "vendor-harmony-tools",
      currentDaysToPay: 36,
      recommendedStretchDays: 6,
      freedDollars: 150_000,
      elasticityReasoning: "Pays 6d late; 0 disputes; mid-spend tools vendor with proven elasticity.",
      riskScore: "low",
    },
    {
      vendorId: "vendor-fairhaven-it",
      currentDaysToPay: 35,
      recommendedStretchDays: 5,
      freedDollars: 140_000,
      elasticityReasoning: "Pays 5d late; 0 disputes; IT-services contract with standard payment terms.",
      riskScore: "low",
    },
    {
      vendorId: "vendor-cascadia-facilities",
      currentDaysToPay: 34,
      recommendedStretchDays: 4,
      freedDollars: 130_000,
      elasticityReasoning: "Pays 4d late; 0 disputes; facilities recurring billing absorbs shift cleanly.",
      riskScore: "low",
    },
    {
      vendorId: "vendor-redwood-it",
      currentDaysToPay: 35,
      recommendedStretchDays: 5,
      freedDollars: 130_000,
      elasticityReasoning: "Pays 5d late; 0 disputes; IT vendor with strong elasticity.",
      riskScore: "low",
    },
    {
      vendorId: "vendor-northstar-marketing",
      currentDaysToPay: 34,
      recommendedStretchDays: 4,
      freedDollars: 120_000,
      elasticityReasoning: "Pays 4d late; 0 disputes; marketing vendor with medium elasticity.",
      riskScore: "medium",
    },
    {
      vendorId: "vendor-evergreen-print",
      currentDaysToPay: 38,
      recommendedStretchDays: 6,
      freedDollars: 100_000,
      elasticityReasoning: "Pays 8d late; 0 disputes; no MSA, long-tail vendor with high tolerance.",
      riskScore: "low",
    },
    {
      vendorId: "vendor-trailhead-office",
      currentDaysToPay: 36,
      recommendedStretchDays: 6,
      freedDollars: 90_000,
      elasticityReasoning: "Pays 6d late; 0 disputes; long-tail office vendor with strong elasticity.",
      riskScore: "low",
    },
    {
      vendorId: "vendor-meridian-print",
      currentDaysToPay: 36,
      recommendedStretchDays: 6,
      freedDollars: 70_000,
      elasticityReasoning: "Pays 6d late; 0 disputes; long-tail print vendor; medium elasticity.",
      riskScore: "medium",
    },
  ],
}

// Sum check: 250+220+220+180+150+140+130+130+120+100+90+70 = 1,800 (×1000 = $1.8M) ✓

// ════════════════════════════════════════════════════════════════════════
// Lookup
// ════════════════════════════════════════════════════════════════════════

export function getDPOOpportunity(): DPOOpportunitySummary {
  return SEED_DPO_OPPORTUNITY
}
