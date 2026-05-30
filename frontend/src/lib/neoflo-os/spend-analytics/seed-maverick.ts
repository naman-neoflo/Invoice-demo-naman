// 5 fictional maverick-spend events for the spend-analytics demo.
//
// Source of truth: docs/handoff/spend-analytics/04-data-model.md § "seed-maverick.ts"
//   + Bundle C brief in docs/plans/2026-05-16-spend-analytics-phase-1-implementation.md.
//
// Composition:
//   - 1 hero (Westpoint Industrial Tools, $84K, high severity, NO_MSA) — IDs verbatim.
//   - 4 supporting events across professional-services / IT / logistics / office-supplies.
//
// Combined total spend ≈ $187K (matches the demo "~$200K maverick spend last 90 days" KPI).
// Vendor IDs for the supporting events are invented; the maverick list page
// only displays maverick name + alternative, so they don't need to live in
// SEED_VENDORS for Phase 1 to render correctly.

import type { MaverickEvent, MaverickId } from "./types"

export const SEED_MAVERICK: MaverickEvent[] = [
  // ── HERO: Westpoint Industrial Tools — NO_MSA, $84K, Q2 2026 ────────────
  {
    id: "maverick-westpoint-q2-2026",
    vendorId: "vendor-westpoint-industrial-tools",
    category: "industrial-tools",
    reason: "NO_MSA",
    timePeriod: "Q2 2026",
    totalSpend: 84_000,
    pos: [
      {
        poNumber: "PO-WP-2204",
        amount: 19_200,
        date: "2026-04-08",
        buyer: "Plant A Operations",
        costCenter: "PLANT-A",
        unitsOrdered: 800,
        unitPrice: 24,
      },
      {
        poNumber: "PO-WP-2207",
        amount: 28_800,
        date: "2026-04-19",
        buyer: "Plant A Operations",
        costCenter: "PLANT-A",
        unitsOrdered: 1200,
        unitPrice: 24,
      },
      {
        poNumber: "PO-WP-2210",
        amount: 14_400,
        date: "2026-05-01",
        buyer: "Plant A Operations",
        costCenter: "PLANT-A",
        unitsOrdered: 600,
        unitPrice: 24,
      },
      {
        poNumber: "PO-WP-2213",
        amount: 21_600,
        date: "2026-05-09",
        buyer: "Plant A Operations",
        costCenter: "PLANT-A",
        unitsOrdered: 900,
        unitPrice: 24,
      },
    ],
    severity: "high",
    preferredVendorId: "vendor-northeast-industrial-supply",
    preferredVendorMsaId: "msa-northeast-industrial-tools",
    switchingAnalysis: {
      currentPaceUnits: 4_000,
      currentPaceCostPerUnit: 24,
      currentPaceTotal: 96_000,
      preferredCostPerUnit: 21,
      preferredPaceTotal: 84_000,
      annualizedSavings: 48_000,
      savingsPercent: 0.125,
      bomMappingNote:
        "Specifications match per BOM mapping (industrial-fasteners-3/8, industrial-fasteners-1/2, industrial-tooling-bits)",
      reasoning:
        "Westpoint Industrial offers no preferred pricing and lacks an MSA. Northeast Industrial Supply has an active MSA for industrial-tools at $21/unit, with specs matching per the BOM mapping. Buyer (Plant A Operations) likely defaulted to Westpoint due to legacy supplier list — easy fix with procurement update.",
      sources: ["vendor master", "Northeast MSA (SAP Ariba)", "BOM mapping", "Q2 PO history"],
      confidence: 0.98,
    },
    draftedProcurementEmail: {
      to: "procurement@acmeco.com",
      cc: "daniel.park@acmeco.com, priya.mehta@acmeco.com",
      subject: "Vendor switch recommendation — Westpoint → Northeast",
      bodyMarkdown:
        "Hi team,\n\nNeo flagged $84K of Q2 spend on Westpoint Industrial Tools for industrial tools that we have a preferred MSA on with Northeast Industrial Supply ($21/unit vs $24/unit, 12% savings, specs match per BOM map).\n\nRecommend: update the Plant A approved supplier list to surface Northeast first for industrial-tools category, and reach out to Westpoint about closing out the current POs.\n\nSourcing event SOURCE-2024-1208 has the contract details.\n\nThanks,\nPriya",
    },
  },

  // ── Rosebrook Legal — OFF_PREFERRED, $42K, professional-services ────────
  {
    id: "maverick-rosebrook-legal-q2-2026",
    vendorId: "vendor-rosebrook-legal",
    category: "professional-services",
    reason: "OFF_PREFERRED",
    timePeriod: "Q2 2026",
    totalSpend: 42_000,
    pos: [
      {
        poNumber: "PO-RB-1144",
        amount: 18_000,
        date: "2026-04-11",
        buyer: "Legal Ops",
        costCenter: "CORP-LEGAL",
        unitsOrdered: 36,
        unitPrice: 500,
      },
      {
        poNumber: "PO-RB-1158",
        amount: 14_000,
        date: "2026-04-28",
        buyer: "Legal Ops",
        costCenter: "CORP-LEGAL",
        unitsOrdered: 28,
        unitPrice: 500,
      },
      {
        poNumber: "PO-RB-1172",
        amount: 10_000,
        date: "2026-05-08",
        buyer: "Legal Ops",
        costCenter: "CORP-LEGAL",
        unitsOrdered: 20,
        unitPrice: 500,
      },
    ],
    severity: "medium",
    preferredVendorId: "vendor-cornerstone-legal",
    preferredVendorMsaId: "msa-cornerstone-legal",
    switchingAnalysis: {
      currentPaceUnits: 84,
      currentPaceCostPerUnit: 500,
      currentPaceTotal: 42_000,
      preferredCostPerUnit: 425,
      preferredPaceTotal: 35_700,
      annualizedSavings: 25_200,
      savingsPercent: 0.15,
      bomMappingNote:
        "Engagement types (M&A diligence, employment counsel, commercial review) all covered under Cornerstone MSA scope",
      reasoning:
        "Cornerstone Legal is the preferred counsel of record with a rate of $425/hr per MSA, vs Rosebrook's $500/hr ad-hoc rate. Legal Ops likely engaged Rosebrook for a specific M&A diligence sprint and never moved subsequent matters back to Cornerstone. The 3 PO descriptions all map to engagement types Cornerstone routinely handles.",
      sources: ["vendor master", "Cornerstone MSA", "Legal Ops engagement log", "Q2 invoice review"],
      confidence: 0.91,
    },
    draftedProcurementEmail: {
      to: "procurement@acmeco.com",
      cc: "daniel.park@acmeco.com, legal-ops@acmeco.com",
      subject: "Vendor switch recommendation — Rosebrook → Cornerstone (legal)",
      bodyMarkdown:
        "Hi team,\n\nNeo flagged $42K of Q2 spend on Rosebrook Legal for outside counsel hours that fall squarely within Cornerstone Legal's MSA scope ($425/hr vs $500/hr, 15% savings, ~$25K annualized).\n\nRecommend: Legal Ops routes new matters back to Cornerstone unless conflict-checked out, and we close the Rosebrook engagements at the natural milestone.\n\nThanks,\nPriya",
    },
  },

  // ── Sterling SaaS — OFF_PREFERRED, $18K, IT ──────────────────────────────
  {
    id: "maverick-sterling-saas-2026",
    vendorId: "vendor-sterling-saas",
    category: "IT",
    reason: "OFF_PREFERRED",
    timePeriod: "Q2 2026",
    totalSpend: 18_000,
    pos: [
      {
        poNumber: "PO-ST-3041",
        amount: 6_000,
        date: "2026-04-02",
        buyer: "Engineering Ops",
        costCenter: "ENG-PLATFORM",
        unitsOrdered: 60,
        unitPrice: 100,
      },
      {
        poNumber: "PO-ST-3055",
        amount: 6_000,
        date: "2026-05-02",
        buyer: "Engineering Ops",
        costCenter: "ENG-PLATFORM",
        unitsOrdered: 60,
        unitPrice: 100,
      },
      {
        poNumber: "PO-ST-3069",
        amount: 6_000,
        date: "2026-05-15",
        buyer: "Engineering Ops",
        costCenter: "ENG-PLATFORM",
        unitsOrdered: 60,
        unitPrice: 100,
      },
    ],
    severity: "medium",
    preferredVendorId: "vendor-summit-it",
    preferredVendorMsaId: "msa-summit-it",
    switchingAnalysis: {
      currentPaceUnits: 180,
      currentPaceCostPerUnit: 100,
      currentPaceTotal: 18_000,
      preferredCostPerUnit: 78,
      preferredPaceTotal: 14_040,
      annualizedSavings: 15_840,
      savingsPercent: 0.22,
      bomMappingNote:
        "Sterling Observability and Summit IT's bundled APM offering cover the same Datadog-equivalent feature set",
      reasoning:
        "Sterling SaaS is a standalone observability subscription Engineering picked up directly. Summit IT's master agreement bundles equivalent APM/log analytics at $78/seat under the existing ERP middleware contract. Migrating saves ~$22/seat with no functionality loss; Engineering Ops just needs to consolidate dashboards.",
      sources: ["vendor master", "Summit IT MSA addendum", "Engineering SaaS inventory", "feature parity review"],
      confidence: 0.87,
    },
    draftedProcurementEmail: {
      to: "procurement@acmeco.com",
      cc: "daniel.park@acmeco.com, eng-ops@acmeco.com",
      subject: "Vendor switch recommendation — Sterling SaaS → Summit IT (observability)",
      bodyMarkdown:
        "Hi team,\n\nNeo flagged $18K of Q2 spend on Sterling SaaS for observability tooling that's already bundled under our Summit IT MSA ($78 vs $100 per seat, ~22% savings).\n\nRecommend: Engineering Ops migrates the 60 active seats over the next renewal cycle and we let the Sterling contract lapse at the May 2026 anniversary.\n\nThanks,\nPriya",
    },
  },

  // ── Blueridge Freight — NO_MSA, $35K, logistics ─────────────────────────
  {
    id: "maverick-blueridge-freight-2026",
    vendorId: "vendor-blueridge-freight",
    category: "logistics",
    reason: "NO_MSA",
    timePeriod: "Q2 2026",
    totalSpend: 35_000,
    pos: [
      {
        poNumber: "PO-BR-9201",
        amount: 12_000,
        date: "2026-04-04",
        buyer: "Plant B Logistics",
        costCenter: "PLANT-B",
        unitsOrdered: 24,
        unitPrice: 500,
      },
      {
        poNumber: "PO-BR-9214",
        amount: 11_500,
        date: "2026-04-22",
        buyer: "Plant B Logistics",
        costCenter: "PLANT-B",
        unitsOrdered: 23,
        unitPrice: 500,
      },
      {
        poNumber: "PO-BR-9228",
        amount: 11_500,
        date: "2026-05-12",
        buyer: "Plant B Logistics",
        costCenter: "PLANT-B",
        unitsOrdered: 23,
        unitPrice: 500,
      },
    ],
    severity: "high",
    preferredVendorId: "vendor-pacific-logistics",
    preferredVendorMsaId: "msa-pacific-logistics",
    switchingAnalysis: {
      currentPaceUnits: 70,
      currentPaceCostPerUnit: 500,
      currentPaceTotal: 35_000,
      preferredCostPerUnit: 410,
      preferredPaceTotal: 28_700,
      annualizedSavings: 25_200,
      savingsPercent: 0.18,
      bomMappingNote:
        "All Blueridge shipments fall within Pacific Logistics' contracted lane coverage (PNW + Midwest hub)",
      reasoning:
        "Blueridge Freight has no MSA and was used as a spot-market overflow when Pacific Logistics' capacity ran tight in April. Pacific's preferred lane rate is $410/shipment vs Blueridge's $500 spot rate. Plant B Logistics dispatched directly without going through the freight desk — process gap, not a true capacity issue per Pacific's confirmation.",
      sources: ["vendor master", "Pacific Logistics MSA lane schedule", "Q2 dispatch log", "Pacific capacity audit"],
      confidence: 0.93,
    },
    draftedProcurementEmail: {
      to: "procurement@acmeco.com",
      cc: "daniel.park@acmeco.com, freight-desk@acmeco.com",
      subject: "Vendor switch recommendation — Blueridge → Pacific (freight)",
      bodyMarkdown:
        "Hi team,\n\nNeo flagged $35K of Q2 spend on Blueridge Freight for shipments that fall inside Pacific Logistics' contracted lanes ($410 vs $500 per shipment, 18% savings).\n\nRecommend: route all PNW/Midwest dispatch through the freight desk going forward; Pacific confirmed capacity for the volume. Close out the Blueridge POs once in-transit shipments land.\n\nThanks,\nPriya",
    },
  },

  // ── Finch Stationery — OFF_PREFERRED, $8K, office-supplies ──────────────
  {
    id: "maverick-finch-stationery-2026",
    vendorId: "vendor-finch-stationery",
    category: "office-supplies",
    reason: "OFF_PREFERRED",
    timePeriod: "Q2 2026",
    totalSpend: 8_000,
    pos: [
      {
        poNumber: "PO-FN-5012",
        amount: 2_800,
        date: "2026-04-09",
        buyer: "Office Admin",
        costCenter: "CORP-ADMIN",
        unitsOrdered: 140,
        unitPrice: 20,
      },
      {
        poNumber: "PO-FN-5024",
        amount: 2_600,
        date: "2026-04-26",
        buyer: "Office Admin",
        costCenter: "CORP-ADMIN",
        unitsOrdered: 130,
        unitPrice: 20,
      },
      {
        poNumber: "PO-FN-5036",
        amount: 2_600,
        date: "2026-05-10",
        buyer: "Office Admin",
        costCenter: "CORP-ADMIN",
        unitsOrdered: 130,
        unitPrice: 20,
      },
    ],
    severity: "low",
    preferredVendorId: "vendor-keystone-office",
    preferredVendorMsaId: "msa-keystone-office",
    switchingAnalysis: {
      currentPaceUnits: 400,
      currentPaceCostPerUnit: 20,
      currentPaceTotal: 8_000,
      preferredCostPerUnit: 17,
      preferredPaceTotal: 6_800,
      annualizedSavings: 4_800,
      savingsPercent: 0.15,
      bomMappingNote:
        "SKU coverage match per Keystone catalog (notebooks, pens, binders, toner refills)",
      reasoning:
        "Finch Stationery has an MSA but isn't preferred. Keystone Office is the preferred office-supplies vendor at a 15% lower blended rate. Low absolute dollars but easy win — Office Admin can switch the default reorder list with a single Coupa update.",
      sources: ["vendor master", "Keystone MSA price list", "Coupa reorder defaults"],
      confidence: 0.95,
    },
    draftedProcurementEmail: {
      to: "procurement@acmeco.com",
      cc: "office-admin@acmeco.com",
      subject: "Vendor switch recommendation — Finch → Keystone (office supplies)",
      bodyMarkdown:
        "Hi team,\n\nNeo flagged $8K of Q2 spend on Finch Stationery for office supplies that map cleanly to Keystone Office's preferred catalog ($17 vs $20 blended, 15% savings).\n\nRecommend: Office Admin updates the default Coupa reorder list to point at Keystone for these SKUs. Low-stakes switch, ~$5K/yr saved.\n\nThanks,\nPriya",
    },
  },
]

// ════════════════════════════════════════════════════════════════════════
// Indexed lookup
// ════════════════════════════════════════════════════════════════════════

const MAVERICK_INDEX: Record<MaverickId, MaverickEvent> = SEED_MAVERICK.reduce(
  (acc, event) => {
    acc[event.id] = event
    return acc
  },
  {} as Record<MaverickId, MaverickEvent>,
)

export function getMaverick(id: MaverickId): MaverickEvent | undefined {
  return MAVERICK_INDEX[id]
}
