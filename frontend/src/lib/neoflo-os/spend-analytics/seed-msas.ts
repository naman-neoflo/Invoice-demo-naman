// 20 Master Service Agreements covering the spend-analytics vendor master.
//
// Source of truth: docs/handoff/spend-analytics/04-data-model.md § "seed-msas.ts"
// + Bundle B brief.
//
// Status distribution: 16 active, 2 pending-renewal, 2 expired.
//
// Includes the hero MSA `msa-northeast-industrial-tools` verbatim plus the
// 8 PREFERRED_VENDOR_MAP MSAs and 11 supporting MSAs across categories.

import type {
  MSA,
  MSAId,
  PreferredVendorMap,
  VendorId,
} from "./types"

export const SEED_MSAS: MSA[] = [
  // ── Hero MSA (verbatim from 04-data-model.md) ──────────────────────────
  {
    id: "msa-northeast-industrial-tools",
    vendorId: "vendor-northeast-industrial-supply",
    category: "industrial-tools",
    effectiveFrom: "2025-01-15",
    effectiveUntil: "2027-01-15",
    agreedPricingSummary:
      "Industrial fasteners $21/unit; industrial tooling $18/unit; volume tier discount at 5K+ units.",
    signedBy: "Daniel Park (CFO) and Carlos Mendes (Northeast VP Sales)",
    sourcingEventId: "SOURCE-2024-1208",
    status: "active",
  },

  // ── PREFERRED_VENDOR_MAP MSAs ──────────────────────────────────────────
  {
    id: "msa-acme-industrial",
    vendorId: "vendor-acme-industrial-supplies",
    category: "industrial-tools",
    effectiveFrom: "2024-03-01",
    effectiveUntil: "2027-03-01",
    agreedPricingSummary:
      "Critical-SKU consignment for 12 line-items at locked unit pricing; volume rebate triggers at $20M annual spend.",
    signedBy: "Daniel Park (CFO) and Helena Voss (Acme SVP Strategic Accounts)",
    sourcingEventId: "SOURCE-2024-0322",
    status: "active",
  },
  {
    id: "msa-cornerstone-legal",
    vendorId: "vendor-cornerstone-legal",
    category: "legal",
    effectiveFrom: "2024-07-01",
    effectiveUntil: "2026-12-31",
    agreedPricingSummary:
      "Partner rate $720/hr; associate rate $450/hr; capped retainer at $200K/quarter.",
    signedBy: "Daniel Park (CFO) and Margaret Yi (Cornerstone Managing Partner)",
    sourcingEventId: "SOURCE-2024-0608",
    status: "active",
  },
  {
    id: "msa-summit-it",
    vendorId: "vendor-summit-it",
    category: "IT",
    effectiveFrom: "2025-04-01",
    effectiveUntil: "2028-03-31",
    agreedPricingSummary:
      "ERP middleware subscription $360K/yr; professional services blended rate $235/hr; SLA credits for 99.9% uptime.",
    signedBy: "Daniel Park (CFO) and Owen Patel (Summit IT Chief Revenue)",
    sourcingEventId: "SOURCE-2025-0204",
    status: "active",
  },
  {
    id: "msa-blackford-facilities",
    vendorId: "vendor-blackford-facilities",
    category: "facilities",
    effectiveFrom: "2024-10-01",
    effectiveUntil: "2026-09-30",
    agreedPricingSummary:
      "Bundled facilities mgmt for Plant A + HQ at $300K/month; emergency callout capped at $35K/event.",
    signedBy: "Daniel Park (CFO) and Reuben Tate (Blackford VP Accounts)",
    sourcingEventId: "SOURCE-2024-0814",
    status: "active",
  },
  {
    id: "msa-keystone-office",
    vendorId: "vendor-keystone-office",
    category: "office-supplies",
    effectiveFrom: "2025-02-15",
    effectiveUntil: "2027-02-14",
    agreedPricingSummary:
      "Punchout catalog at GSA -8%; quarterly rebate of 1.5% on aggregate spend.",
    signedBy: "Priya Mehta (Procurement) and Janelle Brooks (Keystone)",
    sourcingEventId: "SOURCE-2025-0119",
    status: "active",
  },
  {
    id: "msa-mariner-travel",
    vendorId: "vendor-mariner-travel",
    category: "travel",
    effectiveFrom: "2025-01-01",
    effectiveUntil: "2026-12-31",
    agreedPricingSummary:
      "Negotiated air-discounts on 14 carriers; hotel program with preferred rates at 220 properties.",
    signedBy: "Priya Mehta (Procurement) and Lucia Romero (Mariner)",
    sourcingEventId: "SOURCE-2024-1112",
    status: "active",
  },
  {
    id: "msa-coastal-print",
    vendorId: "vendor-coastal-print",
    category: "marketing",
    effectiveFrom: "2025-03-01",
    effectiveUntil: "2027-02-28",
    agreedPricingSummary:
      "Marketing print + collateral at locked unit pricing across 38 SKUs; volume tier at 50K+ units/quarter.",
    signedBy: "Daniel Park (CFO) and Mateo Alves (Coastal Print VP Sales)",
    sourcingEventId: "SOURCE-2025-0118",
    status: "active",
  },
  {
    id: "msa-pacific-logistics",
    vendorId: "vendor-pacific-logistics",
    category: "logistics",
    effectiveFrom: "2024-06-15",
    effectiveUntil: "2026-06-14",
    agreedPricingSummary:
      "LTL freight at GRI -12%; dedicated lane pricing for Plant A→DC East at $1.92/mi.",
    signedBy: "Daniel Park (CFO) and Lin Zhao (Pacific Logistics SVP)",
    sourcingEventId: "SOURCE-2024-0518",
    status: "pending-renewal",
  },
  {
    id: "msa-vanguard-misc",
    vendorId: "vendor-vanguard-misc",
    category: "other",
    effectiveFrom: "2024-09-01",
    effectiveUntil: "2026-08-31",
    agreedPricingSummary:
      "Catch-all services fallback at GSA pricing for misc / off-category buys.",
    signedBy: "Priya Mehta (Procurement) and Tomás Reyes (Vanguard)",
    sourcingEventId: "SOURCE-2024-0810",
    status: "active",
  },

  // ── Supporting MSAs (non-preferred / sub-preferred vendors) ────────────
  {
    id: "msa-sumitomo-heavy",
    vendorId: "vendor-sumitomo-heavy",
    category: "industrial-tools",
    effectiveFrom: "2024-11-01",
    effectiveUntil: "2026-10-31",
    agreedPricingSummary:
      "Equipment rental rate card at OEM list -22%; long-term lease tier for >180-day rentals.",
    signedBy: "Daniel Park (CFO) and Aoi Tanaka (Sumitomo NA Director)",
    sourcingEventId: "SOURCE-2024-0915",
    status: "active",
  },
  {
    id: "msa-westside-logistics",
    vendorId: "vendor-westside-logistics",
    category: "logistics",
    effectiveFrom: "2024-08-01",
    effectiveUntil: "2026-07-31",
    agreedPricingSummary:
      "Backup carrier for Pacific overflow; spot-rate cap at GRI +8%.",
    signedBy: "Priya Mehta (Procurement) and Ana Petrov (Westside)",
    sourcingEventId: "SOURCE-2024-0705",
    status: "active",
  },
  {
    id: "msa-helios-research",
    vendorId: "vendor-helios-research",
    category: "professional-services",
    effectiveFrom: "2024-01-15",
    effectiveUntil: "2026-12-31",
    agreedPricingSummary:
      "R&D research retainer at $175K/quarter; project SOWs billed at PhD $310/hr, analyst $185/hr.",
    signedBy: "Daniel Park (CFO) and Isabel Marchetti (Helios CEO)",
    sourcingEventId: "SOURCE-2023-1109",
    status: "active",
  },
  {
    id: "msa-atlas-engineering",
    vendorId: "vendor-atlas-engineering",
    category: "professional-services",
    effectiveFrom: "2024-05-01",
    effectiveUntil: "2027-04-30",
    agreedPricingSummary:
      "Plant retrofit engineering SOWs; senior engineer $265/hr, capped escalation 3%/yr.",
    signedBy: "Daniel Park (CFO) and Holt Carrington (Atlas Managing Partner)",
    sourcingEventId: "SOURCE-2024-0402",
    status: "active",
  },
  {
    id: "msa-orion-power-systems",
    vendorId: "vendor-orion-power-systems",
    category: "industrial-tools",
    effectiveFrom: "2024-02-01",
    effectiveUntil: "2027-01-31",
    agreedPricingSummary:
      "Certified power-module supply; warranty extension 5yr; spares stocking at vendor-managed inventory.",
    signedBy: "Daniel Park (CFO) and Sven Kjellberg (Orion VP Strategic Accounts)",
    sourcingEventId: "SOURCE-2023-1218",
    status: "active",
  },
  {
    id: "msa-quantum-cloud",
    vendorId: "vendor-quantum-cloud",
    category: "IT",
    effectiveFrom: "2024-04-01",
    effectiveUntil: "2027-03-31",
    agreedPricingSummary:
      "Reserved-instance commit $200K/month; credit-tier rebate of 4% if auto-pay maintained.",
    signedBy: "Daniel Park (CFO) and Iris Halloran (Quantum CRO)",
    sourcingEventId: "SOURCE-2024-0301",
    status: "active",
  },
  {
    id: "msa-pinnacle-insurance",
    vendorId: "vendor-pinnacle-insurance",
    category: "professional-services",
    effectiveFrom: "2025-01-01",
    effectiveUntil: "2025-12-31",
    agreedPricingSummary:
      "Property + GL bundled premium of $1.8M/yr; carrier auto-pay credit at 2% on early annual settlement.",
    signedBy: "Daniel Park (CFO) and Robin Esperanza (Pinnacle Underwriting Lead)",
    sourcingEventId: "SOURCE-2024-0928",
    status: "expired",
  },
  {
    id: "msa-vertex-audit",
    vendorId: "vendor-vertex-audit",
    category: "professional-services",
    effectiveFrom: "2024-01-01",
    effectiveUntil: "2026-12-31",
    agreedPricingSummary:
      "Year-end audit + quarterly review SOWs at $1.2M/yr blended; out-of-scope billed at partner $640/hr.",
    signedBy: "Daniel Park (CFO) and Niamh O'Connor (Vertex Audit Partner)",
    sourcingEventId: "SOURCE-2023-1215",
    status: "active",
  },
  {
    id: "msa-amberglass-counsel",
    vendorId: "vendor-baseline-leg-001-amberglass-counsel",
    category: "legal",
    effectiveFrom: "2023-07-01",
    effectiveUntil: "2025-06-30",
    agreedPricingSummary:
      "Specialty environmental counsel; partner rate $680/hr; quarterly minimum retainer of $80K.",
    signedBy: "Daniel Park (CFO) and Hugo Larsson (Amberglass Partner)",
    sourcingEventId: "SOURCE-2023-0608",
    status: "expired",
  },
  {
    id: "msa-juniper-utilities",
    vendorId: "vendor-baseline-fac-006-juniper-utilities",
    category: "facilities",
    effectiveFrom: "2024-06-01",
    effectiveUntil: "2026-05-31",
    agreedPricingSummary:
      "Multi-site utility procurement aggregation; capacity-tier blended rate -6% vs spot.",
    signedBy: "Priya Mehta (Procurement) and Aaron Wexler (Juniper VP Accounts)",
    sourcingEventId: "SOURCE-2024-0420",
    status: "pending-renewal",
  },
]

// ════════════════════════════════════════════════════════════════════════
// Preferred-vendor map (consumed by maverick detection in derive.ts)
// ════════════════════════════════════════════════════════════════════════

export const PREFERRED_VENDOR_MAP: PreferredVendorMap = {
  "industrial-tools": "vendor-northeast-industrial-supply",
  "professional-services": "vendor-cornerstone-legal",
  "IT": "vendor-summit-it",
  "facilities": "vendor-blackford-facilities",
  "marketing": "vendor-coastal-print",
  "logistics": "vendor-pacific-logistics",
  "office-supplies": "vendor-keystone-office",
  "travel": "vendor-mariner-travel",
  "legal": "vendor-cornerstone-legal",
  "other": "vendor-vanguard-misc",
}

// ════════════════════════════════════════════════════════════════════════
// Indexed lookups
// ════════════════════════════════════════════════════════════════════════

const MSA_INDEX: Record<MSAId, MSA> = SEED_MSAS.reduce(
  (acc, msa) => {
    acc[msa.id] = msa
    return acc
  },
  {} as Record<MSAId, MSA>,
)

export function getMSA(id: MSAId): MSA | undefined {
  return MSA_INDEX[id]
}

export function getMSAsForVendor(vendorId: VendorId): MSA[] {
  return SEED_MSAS.filter((msa) => msa.vendorId === vendorId)
}
