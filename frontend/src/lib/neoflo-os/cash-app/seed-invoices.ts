// 150 fictional B2B invoices distributed across the 50 seed customers.
//
// Composition:
// - 12 hand-written "hero" invoices that drive specific demo scenarios
//   (Acme 1:many, Pacific RETURN_CREDIT, Northeast BANK_FEE, Westpoint
//   VOLUME_TIER_DISCOUNT, Atlantic name-mismatch unapplied $48,500).
// - 138 programmatically generated invoices to round out the AR ledger
//   (~108 open + 10 partial + 20 paid = ~120 open / ~10 partial / ~20 paid total).
//
// Source of truth: docs/plans/2026-05-15-cash-app-phase-1-implementation.md § "Task 4".
// Hero invoices are the verbatim spec — do not edit copy without also updating
// the demo script and downstream seed-payments / seed-applications fixtures.

import type { CustomerId, Invoice, InvoiceId } from "./types"

// ════════════════════════════════════════════════════════════════════
// Hero invoices — verbatim per the implementation plan / demo script
// ════════════════════════════════════════════════════════════════════

const HERO_INVOICES: Invoice[] = [
  // ── Acme Industrial 1:many match (the headline demo) ────────────────
  { id: "inv-4421", customerId: "cust-acme-industrial", invoiceNumber: "INV-4421", amount: 32400, issuedAt: "2026-04-28T10:00:00Z", dueAt: "2026-05-28T10:00:00Z", termsLabel: "Net-30", status: "open", lineSummary: "Industrial supplies — April delivery batch 1" },
  { id: "inv-4422", customerId: "cust-acme-industrial", invoiceNumber: "INV-4422", amount: 34100, issuedAt: "2026-05-02T10:00:00Z", dueAt: "2026-06-01T10:00:00Z", termsLabel: "Net-30", status: "open", lineSummary: "Industrial supplies — May delivery batch 1" },
  { id: "inv-4423", customerId: "cust-acme-industrial", invoiceNumber: "INV-4423", amount: 31700, issuedAt: "2026-05-04T10:00:00Z", dueAt: "2026-06-03T10:00:00Z", termsLabel: "Net-30", status: "open", lineSummary: "Industrial supplies — May delivery batch 2" },

  // ── Pacific Distribution Co — RETURN_CREDIT short-pay scenario ($1,240) ──
  // Three invoices; payment will arrive $1,240 short to offset returns.
  { id: "inv-5101", customerId: "cust-pacific-distribution", invoiceNumber: "INV-5101", amount: 18650, issuedAt: "2026-04-10T10:00:00Z", dueAt: "2026-05-25T10:00:00Z", termsLabel: "Net-45", status: "open", lineSummary: "Distribution services — April week 2" },
  { id: "inv-5102", customerId: "cust-pacific-distribution", invoiceNumber: "INV-5102", amount: 22300, issuedAt: "2026-04-17T10:00:00Z", dueAt: "2026-06-01T10:00:00Z", termsLabel: "Net-45", status: "open", lineSummary: "Distribution services — April week 3" },
  { id: "inv-5103", customerId: "cust-pacific-distribution", invoiceNumber: "INV-5103", amount: 19420, issuedAt: "2026-04-24T10:00:00Z", dueAt: "2026-06-08T10:00:00Z", termsLabel: "Net-45", status: "open", lineSummary: "Distribution services — April week 4 (RMA-2026-0418 returns pending)" },

  // ── Northeast Supply Group — BANK_FEE scenario ($84) ─────────────────
  { id: "inv-6201", customerId: "cust-northeast-supply", invoiceNumber: "INV-6201", amount: 14280, issuedAt: "2026-04-22T10:00:00Z", dueAt: "2026-05-22T10:00:00Z", termsLabel: "Net-30", status: "open", lineSummary: "Supply order — April restock" },

  // ── Westpoint Manufacturing — VOLUME_TIER_DISCOUNT scenario ($312) ───
  { id: "inv-7301", customerId: "cust-westpoint-mfg", invoiceNumber: "INV-7301", amount: 28900, issuedAt: "2026-03-28T10:00:00Z", dueAt: "2026-05-27T10:00:00Z", termsLabel: "Net-60", status: "open", lineSummary: "Component shipment — Q1 close batch" },
  { id: "inv-7302", customerId: "cust-westpoint-mfg", invoiceNumber: "INV-7302", amount: 31600, issuedAt: "2026-04-05T10:00:00Z", dueAt: "2026-06-04T10:00:00Z", termsLabel: "Net-60", status: "open", lineSummary: "Component shipment — Q2 opening batch (tier-3 rebate eligible)" },

  // ── Atlantic Industrial Logistics Co — name-mismatch unapplied ($48,500) ──
  // Three invoices summing to $48,500. Payment will arrive from "Atlantic Logistics LLC"
  // (subsidiary) with no remittance — this drives the Neo investigation queue card.
  { id: "inv-8401", customerId: "cust-atlantic-industrial-logistics", invoiceNumber: "INV-8401", amount: 16200, issuedAt: "2026-04-15T10:00:00Z", dueAt: "2026-05-15T10:00:00Z", termsLabel: "Net-30", status: "open", lineSummary: "Freight services — Eastern corridor week 16" },
  { id: "inv-8402", customerId: "cust-atlantic-industrial-logistics", invoiceNumber: "INV-8402", amount: 17400, issuedAt: "2026-04-22T10:00:00Z", dueAt: "2026-05-22T10:00:00Z", termsLabel: "Net-30", status: "open", lineSummary: "Freight services — Eastern corridor week 17" },
  { id: "inv-8403", customerId: "cust-atlantic-industrial-logistics", invoiceNumber: "INV-8403", amount: 14900, issuedAt: "2026-04-29T10:00:00Z", dueAt: "2026-05-29T10:00:00Z", termsLabel: "Net-30", status: "open", lineSummary: "Freight services — Eastern corridor week 18" },
]

// ════════════════════════════════════════════════════════════════════
// Generator — deterministic filler invoices
// ════════════════════════════════════════════════════════════════════

// Customers we want to leave room around (already heavy with hero invoices).
const HERO_HEAVY: Set<CustomerId> = new Set([
  "cust-acme-industrial",
  "cust-pacific-distribution",
  "cust-atlantic-industrial-logistics",
])

// Filler customer pool (ordered to give each customer at least 1-2 invoices,
// plus extras on the larger accounts to make the AR ledger feel realistic).
const FILLER_CUSTOMERS: CustomerId[] = [
  "cust-acme-industrial",            // +1 historical paid
  "cust-pacific-distribution",        // +1 historical paid
  "cust-northeast-supply",            // +2
  "cust-westpoint-mfg",               // +2
  "cust-atlantic-industrial-logistics", // +1 historical paid
  "cust-northstar-building",
  "cust-sunbelt-services",
  "cust-greatlakes-distribution",
  "cust-coastal-foods",
  "cust-redmesa-equipment",
  "cust-bayside-medical",
  "cust-summitline-mfg",
  "cust-ironforge-tools",
  "cust-evergreen-paper",
  "cust-meridian-electric",
  "cust-pinnacle-logistics",
  "cust-cascade-chemicals",
  "cust-driftwood-hospitality",
  "cust-stonebridge-construction",
  "cust-clearwater-pharma",
  "cust-blueridge-textiles",
  "cust-grandview-hardware",
  "cust-harborside-metals",
  "cust-trailhead-outdoor",
  "cust-silverline-aviation",
  "cust-magnolia-dairy",
  "cust-cobaltridge-mining",
  "cust-fieldcrest-agri",
  "cust-windrose-marine",
  "cust-bristol-printing",
  "cust-aspenglow-resorts",
  "cust-keystone-grocers",
  "cust-thornwood-furniture",
  "cust-vanguard-security",
  "cust-twinpines-lumber",
  "cust-meridian-fitness",
  "cust-stratoview-aerospace",
  "cust-foundry-auto-parts",
  "cust-lighthouse-publishing",
  "cust-rivercrest-banking",
  "cust-hawthorne-dental",
  "cust-merrybrook-bakery",
  "cust-foggy-harbor-shipping",
  "cust-burnsidehill-coffee",
  "cust-orionstar-software",
  "cust-cedarvalley-retail",
  "cust-gulfshore-energy",
  "cust-skyharbor-logistics",
  "cust-woodlandcrest-toys",
  "cust-emberlight-candles",
]

// Terms by customer — derived from seed-customers paymentTermsDays where
// possible, otherwise default to Net-30. Hard-coded here to avoid an import
// cycle and to keep this file deterministic.
const TERMS_DAYS: Record<CustomerId, number> = {
  "cust-acme-industrial": 30,
  "cust-pacific-distribution": 45,
  "cust-northeast-supply": 30,
  "cust-westpoint-mfg": 60,
  "cust-atlantic-industrial-logistics": 30,
  "cust-northstar-building": 45,
  "cust-sunbelt-services": 30,
  "cust-greatlakes-distribution": 60,
  "cust-coastal-foods": 30,
  "cust-redmesa-equipment": 30,
  "cust-bayside-medical": 45,
  "cust-summitline-mfg": 30,
  "cust-ironforge-tools": 30,
  "cust-evergreen-paper": 45,
  "cust-meridian-electric": 30,
  "cust-pinnacle-logistics": 60,
  "cust-cascade-chemicals": 30,
  "cust-driftwood-hospitality": 45,
  "cust-stonebridge-construction": 60,
  "cust-clearwater-pharma": 30,
  "cust-blueridge-textiles": 45,
  "cust-grandview-hardware": 30,
  "cust-harborside-metals": 60,
  "cust-trailhead-outdoor": 30,
  "cust-silverline-aviation": 45,
  "cust-magnolia-dairy": 30,
  "cust-cobaltridge-mining": 60,
  "cust-fieldcrest-agri": 45,
  "cust-windrose-marine": 30,
  "cust-bristol-printing": 30,
  "cust-aspenglow-resorts": 45,
  "cust-keystone-grocers": 30,
  "cust-thornwood-furniture": 60,
  "cust-vanguard-security": 30,
  "cust-twinpines-lumber": 30,
  "cust-meridian-fitness": 30,
  "cust-stratoview-aerospace": 60,
  "cust-foundry-auto-parts": 45,
  "cust-lighthouse-publishing": 30,
  "cust-rivercrest-banking": 45,
  "cust-hawthorne-dental": 30,
  "cust-merrybrook-bakery": 30,
  "cust-foggy-harbor-shipping": 45,
  "cust-burnsidehill-coffee": 30,
  "cust-orionstar-software": 30,
  "cust-cedarvalley-retail": 45,
  "cust-gulfshore-energy": 60,
  "cust-skyharbor-logistics": 30,
  "cust-woodlandcrest-toys": 60,
  "cust-emberlight-candles": 30,
}

// Short, plausible line-summary phrases keyed to customer flavor. Falls back
// to a generic "Order — <month>" when no entry exists.
const LINE_FLAVOR: Partial<Record<CustomerId, string>> = {
  "cust-acme-industrial": "Industrial supplies",
  "cust-pacific-distribution": "Distribution services",
  "cust-northeast-supply": "Supply restock",
  "cust-westpoint-mfg": "Component shipment",
  "cust-atlantic-industrial-logistics": "Freight services",
  "cust-northstar-building": "Building materials",
  "cust-sunbelt-services": "Field service hours",
  "cust-greatlakes-distribution": "Wholesale shipment",
  "cust-coastal-foods": "Cold-chain delivery",
  "cust-redmesa-equipment": "Equipment rental",
  "cust-bayside-medical": "Medical supplies",
  "cust-summitline-mfg": "Manufactured parts",
  "cust-ironforge-tools": "Tool order",
  "cust-evergreen-paper": "Paper products",
  "cust-meridian-electric": "Electrical supplies",
  "cust-pinnacle-logistics": "Logistics services",
  "cust-cascade-chemicals": "Chemical shipment",
  "cust-driftwood-hospitality": "Hospitality goods",
  "cust-stonebridge-construction": "Construction materials",
  "cust-clearwater-pharma": "Pharmaceutical order",
  "cust-blueridge-textiles": "Textile shipment",
  "cust-grandview-hardware": "Hardware order",
  "cust-harborside-metals": "Metals shipment",
  "cust-trailhead-outdoor": "Outdoor gear shipment",
  "cust-silverline-aviation": "Aviation services",
  "cust-magnolia-dairy": "Dairy delivery",
  "cust-cobaltridge-mining": "Mining supplies",
  "cust-fieldcrest-agri": "Agricultural supply",
  "cust-windrose-marine": "Marine equipment",
  "cust-bristol-printing": "Print job",
  "cust-aspenglow-resorts": "Resort supply order",
  "cust-keystone-grocers": "Grocery shipment",
  "cust-thornwood-furniture": "Furniture order",
  "cust-vanguard-security": "Security systems",
  "cust-twinpines-lumber": "Lumber order",
  "cust-meridian-fitness": "Fitness equipment",
  "cust-stratoview-aerospace": "Aerospace parts",
  "cust-foundry-auto-parts": "Auto parts shipment",
  "cust-lighthouse-publishing": "Publishing services",
  "cust-rivercrest-banking": "Banking services",
  "cust-hawthorne-dental": "Dental supplies",
  "cust-merrybrook-bakery": "Bakery delivery",
  "cust-foggy-harbor-shipping": "Shipping services",
  "cust-burnsidehill-coffee": "Coffee delivery",
  "cust-orionstar-software": "Software subscription",
  "cust-cedarvalley-retail": "Retail goods",
  "cust-gulfshore-energy": "Energy services",
  "cust-skyharbor-logistics": "Logistics services",
  "cust-woodlandcrest-toys": "Toy shipment",
  "cust-emberlight-candles": "Candle shipment",
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

function pad(n: number): string {
  return n.toString().padStart(2, "0")
}

function isoAt10(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}T10:00:00Z`
}

// Add `days` to (year, month, day) and return ISO at 10:00 UTC.
function addDaysIso(year: number, month: number, day: number, days: number): string {
  const d = new Date(Date.UTC(year, month - 1, day, 10, 0, 0))
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().replace(/\.\d{3}Z$/, "Z")
}

// Deterministic pseudo-random in [0, 1) seeded by an integer so re-runs are
// stable across builds. We don't import a PRNG library — a simple LCG is fine.
function rngFactory(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0x1_0000_0000
  }
}

type GenSpec = {
  customerId: CustomerId
  // Issue date components
  year: number
  month: number
  day: number
  status: Invoice["status"]
  // Used to index invoiceNumber and id (kept globally unique via the caller).
  serial: number
}

function makeInvoice(spec: GenSpec, rand: () => number): Invoice {
  const days = TERMS_DAYS[spec.customerId] ?? 30
  // Amounts: 4-figure to mid-5-figure, weighted toward $5K-$25K.
  const base = 3000 + Math.floor(rand() * 22000)
  // Round to nearest $50 to look like real billings.
  const amount = Math.round(base / 50) * 50
  const flavor = LINE_FLAVOR[spec.customerId] ?? "Order"
  const monthName = MONTH_NAMES[spec.month - 1]
  return {
    id: `inv-${spec.serial}`,
    customerId: spec.customerId,
    invoiceNumber: `INV-${spec.serial}`,
    amount,
    issuedAt: isoAt10(spec.year, spec.month, spec.day),
    dueAt: addDaysIso(spec.year, spec.month, spec.day, days),
    termsLabel: `Net-${days}`,
    status: spec.status,
    lineSummary: `${flavor} — ${monthName} ${spec.year}`,
  }
}

// ════════════════════════════════════════════════════════════════════
// Generated filler invoices
// ════════════════════════════════════════════════════════════════════

const FILLER_INVOICES: Invoice[] = (() => {
  const rand = rngFactory(20260515) // demo date as seed → deterministic
  const out: Invoice[] = []

  // Plan: 138 generated invoices.
  //   - 20 paid (historical: Jan-Mar 2026)
  //   - 10 partial (older open: Feb-Mar 2026)
  //   - 108 open (recent: Mar-May 2026)
  //
  // We rotate through FILLER_CUSTOMERS so every customer gets coverage.

  let serial = 1001
  let cursor = 0
  function nextCustomer(): CustomerId {
    // Light bias: skip an extra slot for hero-heavy customers occasionally
    // so the AR ledger isn't over-weighted on Acme/Pacific/Atlantic.
    let pick = FILLER_CUSTOMERS[cursor % FILLER_CUSTOMERS.length]
    cursor += 1
    if (HERO_HEAVY.has(pick) && cursor % 7 !== 0) {
      pick = FILLER_CUSTOMERS[cursor % FILLER_CUSTOMERS.length]
      cursor += 1
    }
    return pick
  }

  // ── 20 paid (historical, Jan-Mar 2026) ──
  for (let i = 0; i < 20; i += 1) {
    const monthOffset = i % 3 // 0=Jan, 1=Feb, 2=Mar
    const day = 4 + ((i * 3) % 24) // spread across the month
    out.push(
      makeInvoice(
        {
          customerId: nextCustomer(),
          year: 2026,
          month: 1 + monthOffset,
          day,
          status: "paid",
          serial: serial++,
        },
        rand,
      ),
    )
  }

  // ── 10 partial (Feb-Mar 2026, mid-range amounts) ──
  for (let i = 0; i < 10; i += 1) {
    const monthOffset = i % 2 // 0=Feb, 1=Mar
    const day = 6 + ((i * 4) % 22)
    out.push(
      makeInvoice(
        {
          customerId: nextCustomer(),
          year: 2026,
          month: 2 + monthOffset,
          day,
          status: "partial",
          serial: serial++,
        },
        rand,
      ),
    )
  }

  // ── 108 open (Mar-May 2026, the active AR ledger) ──
  for (let i = 0; i < 108; i += 1) {
    const monthOffset = i % 3 // 0=Mar, 1=Apr, 2=May
    // Avoid the May 4 Acme date by jittering issue day.
    const day = 2 + ((i * 5) % 26)
    out.push(
      makeInvoice(
        {
          customerId: nextCustomer(),
          year: 2026,
          month: 3 + monthOffset,
          day,
          status: "open",
          serial: serial++,
        },
        rand,
      ),
    )
  }

  return out
})()

// ════════════════════════════════════════════════════════════════════
// Combined export + lookups
// ════════════════════════════════════════════════════════════════════

export const SEED_INVOICES: Invoice[] = [...HERO_INVOICES, ...FILLER_INVOICES]

const INVOICE_INDEX: Record<InvoiceId, Invoice> = SEED_INVOICES.reduce(
  (acc, inv) => {
    acc[inv.id] = inv
    return acc
  },
  {} as Record<InvoiceId, Invoice>,
)

const INVOICES_BY_CUSTOMER: Record<CustomerId, Invoice[]> = SEED_INVOICES.reduce(
  (acc, inv) => {
    const list = acc[inv.customerId] ?? []
    list.push(inv)
    acc[inv.customerId] = list
    return acc
  },
  {} as Record<CustomerId, Invoice[]>,
)

export function getInvoice(id: InvoiceId): Invoice | undefined {
  return INVOICE_INDEX[id]
}

export function getInvoicesForCustomer(customerId: CustomerId): Invoice[] {
  return INVOICES_BY_CUSTOMER[customerId] ?? []
}
