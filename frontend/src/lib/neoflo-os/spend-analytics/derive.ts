// Pure derived helpers for the spend-analytics surfaces.
//
// Source of truth: docs/handoff/spend-analytics/04-data-model.md
// § "Helpers (`lib/spend-analytics/derive.ts`)".
//
// Everything here is deterministic from the seed files (no runtime store
// reads, no `window` access, no `Date.now()`). Safe to call from both
// server and client contexts.

import { SEED_VENDORS } from "./seed-vendors"
import { getSeriesForRange } from "./seed-spend"
import { SEED_MAVERICK } from "./seed-maverick"
import type {
  RangePreset,
  MaverickEvent,
  DeferralBatchProposal,
  DeferralBatchItem,
  SpendCategory,
} from "./types"

// ════════════════════════════════════════════════════════════════════
// KPI snapshot
// ════════════════════════════════════════════════════════════════════

export function getSpendKpiSnapshot(): {
  dpoCurrent: number
  dpoTarget: number
  apCommittedNext30d: number
  workingCapitalTrapped: number
  top5ConcentrationPercent: number
} {
  // These are the demo anchors per the PRD. Exact derivation from the
  // seed AP / AR series would drift with seasonality + uncertainty bands;
  // pinning here keeps every surface (dashboard, KPI cards, chat snapshot)
  // coherent with the narrative. See seed-spend.ts / seed-concentration.ts
  // / seed-dpo-opportunities.ts for the underlying data if it's ever
  // rebalanced.
  return {
    dpoCurrent: 38,
    dpoTarget: 42,
    apCommittedNext30d: 4_700_000,
    workingCapitalTrapped: 1_800_000,
    top5ConcentrationPercent: 62,
  }
}

// ════════════════════════════════════════════════════════════════════
// Trend chart (historical + forward) for the dashboard's TrendChart
// ════════════════════════════════════════════════════════════════════

export function getTrendSeries(opts: {
  range: RangePreset
  customRange?: { start: string; end: string }
}) {
  const { historical, forward } = getSeriesForRange(opts.range, opts.customRange)
  return {
    historical,
    forward,
  }
  // The TrendChart component will reshape historical + forward into the
  // recharts-friendly merged dataset.
}

// ════════════════════════════════════════════════════════════════════
// Needs-your-eyes dashboard cards (exactly 4, in dashboard order)
// ════════════════════════════════════════════════════════════════════

export type NeedsEyesType = "working-capital" | "maverick" | "deferral" | "concentration"

export type NeedsEyesCard = {
  type: NeedsEyesType
  title: string
  meta: string
  routeHref: string
  cta: string
}

// The 4 cards pinned in spec order per docs/handoff/spend-analytics/
// 03-screen-specs.md § Surface 1.
export function getNeedsEyesCards(): NeedsEyesCard[] {
  return [
    {
      type: "working-capital",
      title: "Working capital opportunity · $1.8M · 12 vendors",
      meta: "DPO 38 → 42 stretch · per-vendor reasoning attached",
      routeHref: "/workspace/spend-analytics",
      cta: "Review",
    },
    {
      type: "maverick",
      title: "Maverick spend · Westpoint Industrial · $84,000 (Q2)",
      meta: "Switch to Northeast (preferred MSA) — save $10K + tighten control",
      routeHref: "/workspace/spend-analytics/maverick/maverick-westpoint-q2-2026",
      cta: "Review",
    },
    {
      type: "deferral",
      title: "Deferral opportunity · $890K · 6 invoices",
      meta: "Shift 4-7 days within terms to align with May 30 receipt forecast",
      routeHref: "/workspace/spend-analytics/cashflow",
      cta: "Review",
    },
    {
      type: "concentration",
      title: "Concentration alert · Top 5 = 62% · Acme 18% single-source",
      meta: "Above industry benchmark — supply-chain risk",
      routeHref: "/workspace/spend-analytics",
      cta: "Review",
    },
  ]
}

// ════════════════════════════════════════════════════════════════════
// Quick insights strip (dashboard secondary)
// ════════════════════════════════════════════════════════════════════

export function getQuickInsights(): Array<{ text: string }> {
  return [
    {
      text: "Plant A maintenance trending $94K over Q3 budget — 3 vendors driving (Sumitomo Heavy +47%, Coastal Print +38%, Cornerstone Legal +29% vs. same period 2025)",
    },
    {
      text: "Payment timing last 30d: 8% paid late, 4% paid early (DPO slippage of ~0.6 days) — auto-pipeline catching most",
    },
  ]
}

// ════════════════════════════════════════════════════════════════════
// Maverick list
// ════════════════════════════════════════════════════════════════════

export function getMaverickList(): MaverickEvent[] {
  return SEED_MAVERICK
}

// ════════════════════════════════════════════════════════════════════
// Hero deferral batch ($890K, 6 invoices, May 30 anchor)
// ════════════════════════════════════════════════════════════════════

// Per-item data is hardcoded here (Phase 1) rather than synthesized from
// cross-workflow-tie + invoice-processing seeds — the cross-tie module
// only carries IDs + new due dates, and the elasticity rationale is
// spend-analytics narrative. Totals: 182 + 156 + 148 + 140 + 138 + 126 = 890K.
export function getDeferralBatch(): DeferralBatchProposal {
  const items: DeferralBatchItem[] = [
    {
      invoiceId: "inv-pacific-pl-2299",
      invoiceNumber: "PL-2299",
      vendorId: "vendor-pacific-logistics",
      vendorName: "Pacific Logistics",
      amount: 182_000,
      currentDueDate: "2026-05-27",
      proposedNewDate: "2026-06-02",
      elasticityRationale: "Pays 6d late on average · 0 disputes · strong elasticity",
    },
    {
      invoiceId: "inv-sumitomo-sh-4471",
      invoiceNumber: "SH-4471",
      vendorId: "vendor-sumitomo-heavy",
      vendorName: "Sumitomo Heavy",
      amount: 156_000,
      currentDueDate: "2026-05-28",
      proposedNewDate: "2026-06-03",
      elasticityRationale: "Pays 8d late · 1 dispute (resolved) · strong elasticity",
    },
    {
      invoiceId: "inv-coastal-cp-9112",
      invoiceNumber: "CP-9112",
      vendorId: "vendor-coastal-print",
      vendorName: "Coastal Print",
      amount: 148_000,
      currentDueDate: "2026-05-29",
      proposedNewDate: "2026-06-04",
      elasticityRationale: "Pays 4d late · 0 disputes · medium elasticity",
    },
    {
      invoiceId: "inv-atlantic-ai-77103",
      invoiceNumber: "AI-77103",
      vendorId: "vendor-atlantic-industrial",
      vendorName: "Atlantic Industrial",
      amount: 140_000,
      currentDueDate: "2026-05-29",
      proposedNewDate: "2026-06-05",
      elasticityRationale: "Pays 14d late · 0 disputes · strong elasticity",
    },
    {
      invoiceId: "inv-westside-wl-3022",
      invoiceNumber: "WL-3022",
      vendorId: "vendor-westside-logistics",
      vendorName: "Westside Logistics",
      amount: 138_000,
      currentDueDate: "2026-05-30",
      proposedNewDate: "2026-06-04",
      elasticityRationale: "Pays 5d late · 0 disputes · strong elasticity",
    },
    {
      invoiceId: "inv-northeast-ni-2107",
      invoiceNumber: "NI-2107",
      vendorId: "vendor-northeast-industrial-supply",
      vendorName: "Northeast Industrial Supply",
      amount: 126_000,
      currentDueDate: "2026-05-30",
      proposedNewDate: "2026-06-05",
      elasticityRationale: "Pays 3d late · 1 dispute (resolved) · medium elasticity",
    },
  ]

  return {
    id: "deferral-may30-2026",
    totalDollars: 890_000,
    itemCount: 6,
    windowAnchorEvent: "May 30 customer receipt forecast",
    windowAnchorDollars: 2_100_000,
    preDeferralNetPosition: -2_100_000,
    postDeferralNetPosition: -1_200_000,
    improvementPercent: 0.42,
    reasoning:
      "Your May 30 customer receipt forecast lands $2.1M. Same window has $3M of AP outflows scheduled. By shifting 6 specific invoices 4-7 days forward (all within net-30/net-45 terms, no late fees, no relationship damage based on payment-history elasticity), you free $890K of liquidity to align outflows with receipts.",
    sources: [
      "AP ledger",
      "payment-history (24mo)",
      "CRM (recent vendor conversations)",
      "revenue forecast (Salesforce)",
    ],
    confidence: 0.98,
    items,
  }
}

// ════════════════════════════════════════════════════════════════════
// Spend by dimension (vendor / category / cost-center / entity)
// ════════════════════════════════════════════════════════════════════

// Phase 1 simplification: returns top-N rows per dimension from the
// seed vendor list (YTD aggregation only). The `period` arg is accepted
// for forward-compat with the dashboard's range selector but ignored —
// real per-period spend slicing arrives in Phase 2 when the time-series
// gets per-vendor attribution.
export function getSpendByDimension(
  dimension: "vendor" | "category" | "cost-center" | "entity",
  _period: RangePreset,
): Array<{ key: string; label: string; spend: number; sharePercent: number }> {
  const totalSpend = SEED_VENDORS.reduce((sum, v) => sum + v.ytdSpend, 0)

  if (dimension === "vendor") {
    return SEED_VENDORS
      .slice()
      .sort((a, b) => b.ytdSpend - a.ytdSpend)
      .slice(0, 20)
      .map((v) => ({
        key: v.id,
        label: v.name,
        spend: v.ytdSpend,
        sharePercent: totalSpend > 0 ? (v.ytdSpend / totalSpend) * 100 : 0,
      }))
  }

  if (dimension === "category") {
    const byCategory = new Map<SpendCategory, number>()
    for (const v of SEED_VENDORS) {
      byCategory.set(v.category, (byCategory.get(v.category) ?? 0) + v.ytdSpend)
    }
    return Array.from(byCategory.entries())
      .map(([cat, spend]) => ({
        key: cat,
        label: CATEGORY_LABELS[cat],
        spend,
        sharePercent: totalSpend > 0 ? (spend / totalSpend) * 100 : 0,
      }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 10)
  }

  if (dimension === "cost-center") {
    // Synthesized: AcmeCo's seed vendors don't carry a cost-center field,
    // so the demo splits total spend across the 5 cost centers using a
    // realistic mix (Plant A heavy on industrial-tools, Corp heavy on
    // professional-services + IT, etc.). Keeps the table populated until
    // Phase 2 wires PO-level cost-center attribution.
    const mix: Array<{ key: string; label: string; weight: number }> = [
      { key: "PLANT-A", label: "Plant A Operations", weight: 0.34 },
      { key: "PLANT-B", label: "Plant B Operations", weight: 0.22 },
      { key: "CORP", label: "Corporate", weight: 0.20 },
      { key: "SALES", label: "Sales & Marketing", weight: 0.14 },
      { key: "RND", label: "R&D", weight: 0.10 },
    ]
    return mix.map((m) => ({
      key: m.key,
      label: m.label,
      spend: Math.round(totalSpend * m.weight),
      sharePercent: m.weight * 100,
    }))
  }

  // entity
  const entityMix: Array<{ key: string; label: string; weight: number }> = [
    { key: "acmeco-us", label: "AcmeCo US", weight: 0.72 },
    { key: "acmeco-singapore", label: "AcmeCo Singapore", weight: 0.18 },
    { key: "acmeco-mexico", label: "AcmeCo Mexico", weight: 0.10 },
  ]
  return entityMix.map((e) => ({
    key: e.key,
    label: e.label,
    spend: Math.round(totalSpend * e.weight),
    sharePercent: e.weight * 100,
  }))
}

const CATEGORY_LABELS: Record<SpendCategory, string> = {
  "industrial-tools": "Industrial Tools",
  "professional-services": "Professional Services",
  IT: "IT",
  facilities: "Facilities",
  marketing: "Marketing",
  logistics: "Logistics",
  "office-supplies": "Office Supplies",
  travel: "Travel",
  legal: "Legal",
  other: "Other",
}

// ════════════════════════════════════════════════════════════════════
// Re-exports (single-import UX for screens)
// ════════════════════════════════════════════════════════════════════

export { getMaverick } from "./seed-maverick"
export { getConcentrationRanking, getConcentrationTop5Share } from "./seed-concentration"
export { getDPOOpportunity } from "./seed-dpo-opportunities"
export { getApplication, getApplicationsByType } from "./seed-applications"
export { getVendor, getVendorsByCategory } from "./seed-vendors"
export { getMSA, getMSAsForVendor, PREFERRED_VENDOR_MAP } from "./seed-msas"
