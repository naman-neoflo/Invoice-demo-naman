// 20-entry vendor concentration ranking for the spend-analytics demo.
//
// Source of truth: docs/handoff/spend-analytics/04-data-model.md § "seed-concentration.ts"
//   + Bundle C brief in docs/plans/2026-05-16-spend-analytics-phase-1-implementation.md.
//
// Composition:
//   - Top 5 sum to 0.62 (matches the "62%" demo KPI exactly).
//   - Rank 1: Acme Industrial Supplies @ 18% — single-source for 12 critical SKUs.
//   - Ranks 2–5: Pacific Logistics, Northeast, Coastal Print, Sumitomo Heavy.
//   - Ranks 6–20: long-tail vendors with shares declining from 4% to 0.5%.
//
// All vendorIds reference SEED_VENDORS in seed-vendors.ts (verified during seed).

import type { ConcentrationEntry } from "./types"

export const SEED_CONCENTRATION: ConcentrationEntry[] = [
  // ── Top 5 — sums to 0.62 ────────────────────────────────────────────────
  {
    vendorId: "vendor-acme-industrial-supplies",
    rank: 1,
    share: 0.18,
    spendYtd: 21_600_000,
    isSingleSource: true,
    alertNote:
      "Single-source for 12 critical SKUs — concentration risk above 15% threshold; benchmark for industry is 8% per vendor.",
  },
  {
    vendorId: "vendor-pacific-logistics",
    rank: 2,
    share: 0.13,
    spendYtd: 15_600_000,
    isSingleSource: false,
  },
  {
    vendorId: "vendor-northeast-industrial-supply",
    rank: 3,
    share: 0.12,
    spendYtd: 14_400_000,
    isSingleSource: false,
  },
  {
    vendorId: "vendor-coastal-print",
    rank: 4,
    share: 0.10,
    spendYtd: 12_000_000,
    isSingleSource: false,
  },
  {
    vendorId: "vendor-sumitomo-heavy",
    rank: 5,
    share: 0.09,
    spendYtd: 10_800_000,
    isSingleSource: false,
  },
  // Top 5 cumulative: 0.18 + 0.13 + 0.12 + 0.10 + 0.09 = 0.62 — matches spec exactly

  // ── Ranks 6–20: long-tail vendors, shares 4% → 0.5% ─────────────────────
  {
    vendorId: "vendor-westside-logistics",
    rank: 6,
    share: 0.04,
    spendYtd: 4_800_000,
    isSingleSource: false,
  },
  {
    vendorId: "vendor-summit-it",
    rank: 7,
    share: 0.035,
    spendYtd: 4_200_000,
    isSingleSource: false,
  },
  {
    vendorId: "vendor-blackford-facilities",
    rank: 8,
    share: 0.030,
    spendYtd: 3_600_000,
    isSingleSource: false,
  },
  {
    vendorId: "vendor-orion-power-systems",
    rank: 9,
    share: 0.0225,
    spendYtd: 2_700_000,
    isSingleSource: true,
    alertNote: "Sole supplier of certified power modules for Plant B — strategic single-source.",
  },
  {
    vendorId: "vendor-cornerstone-legal",
    rank: 10,
    share: 0.020,
    spendYtd: 2_400_000,
    isSingleSource: false,
  },
  {
    vendorId: "vendor-quantum-cloud",
    rank: 11,
    share: 0.020,
    spendYtd: 2_400_000,
    isSingleSource: false,
  },
  {
    vendorId: "vendor-skyharbor-logistics",
    rank: 12,
    share: 0.020,
    spendYtd: 2_400_000,
    isSingleSource: false,
  },
  {
    vendorId: "vendor-helios-research",
    rank: 13,
    share: 0.0175,
    spendYtd: 2_100_000,
    isSingleSource: false,
  },
  {
    vendorId: "vendor-pinewood-supplies",
    rank: 14,
    share: 0.015,
    spendYtd: 1_800_000,
    isSingleSource: false,
  },
  {
    vendorId: "vendor-atlas-engineering",
    rank: 15,
    share: 0.015,
    spendYtd: 1_800_000,
    isSingleSource: true,
    alertNote: "Single-source for Plant A retrofit engineering — strategic dependency.",
  },
  {
    vendorId: "vendor-pinnacle-insurance",
    rank: 16,
    share: 0.015,
    spendYtd: 1_800_000,
    isSingleSource: false,
  },
  {
    vendorId: "vendor-fairhaven-it",
    rank: 17,
    share: 0.0125,
    spendYtd: 1_500_000,
    isSingleSource: false,
  },
  {
    vendorId: "vendor-mariner-travel",
    rank: 18,
    share: 0.012,
    spendYtd: 1_440_000,
    isSingleSource: false,
  },
  {
    vendorId: "vendor-harmony-tools",
    rank: 19,
    share: 0.010,
    spendYtd: 1_200_000,
    isSingleSource: false,
  },
  {
    vendorId: "vendor-redwood-it",
    rank: 20,
    share: 0.005,
    spendYtd: 600_000,
    isSingleSource: false,
  },
]

// ════════════════════════════════════════════════════════════════════════
// Lookups
// ════════════════════════════════════════════════════════════════════════

export function getConcentrationRanking(): ConcentrationEntry[] {
  return SEED_CONCENTRATION
}

export function getConcentrationTop5Share(): number {
  return SEED_CONCENTRATION.slice(0, 5).reduce((acc, e) => acc + e.share, 0)
}
