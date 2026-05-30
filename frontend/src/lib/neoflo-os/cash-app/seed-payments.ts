// 60 fictional B2B payments for the cash-app demo.
//
// Composition (per docs/plans/2026-05-15-cash-app-phase-1-implementation.md § "Task 5"):
//   - 1 hero short-pay (Acme Industrial $97,500 1:many w/ $700 freight short)
//   - 3 other short-pays today (Pacific, Northeast, Westpoint)
//   - 14 auto-applied today (1:1 clean, > 95% confidence)
//   - 8 auto-applied today (1:many clean, > 90% confidence)
//   - 6 unapplied today — TOTAL DOLLARS == $2,400,000 (drives the hero KPI)
//   - 28 historical applied payments across the last 30 days (audit-trail richness)
//
// Hero payment (pay-3392-2026) and the 4 short-pay scenarios are the verbatim
// spec — do not edit copy without updating the demo script and downstream
// seed-applications fixtures.
//
// The 6 unapplied items are spread across 4 aging buckets:
//   - current (received today, 2026-05-15) : 3 items totaling $1,200,000
//   - 1-7 days                              : 1 item  totaling   $720,000
//   - 8-30 days                             : 1 item  totaling   $360,000
//   - 30+ days                              : 1 item  totaling   $120,000

import type { CustomerId, Payment, PaymentChannel, PaymentId } from "./types"

// ════════════════════════════════════════════════════════════════════
// Hero + named scenario payments (today, 2026-05-15)
// ════════════════════════════════════════════════════════════════════

const HERO_PAYMENTS: Payment[] = [
  // ── HERO — Acme Industrial 1:many short-pay (drives the A hero moment) ──
  {
    id: "pay-3392-2026",
    amount: 97500,
    receivedAt: "2026-05-15T07:14:00Z",
    channel: "ach-email",
    bankReference: "TXN-3392-2026",
    bank: "JPMorgan Chase",
    extractedPayer: {
      name: "Acme Industrial Supplies",
      matchedCustomerId: "cust-acme-industrial",
      matchConfidence: 1.0,
    },
    remittance: {
      rawText: "Payment for INV-4421, INV-4422, INV-4423",
      parsedInvoiceIds: ["inv-4421", "inv-4422", "inv-4423"],
    },
    classification: {
      label: "1:many match",
      confidence: 0.92,
    },
  },

  // ── Pacific Distribution Co — RETURN_CREDIT short-pay $1,240 ──────────
  // 3 invoices summing to $60,370; payment arrives $1,240 short = $59,130.
  {
    id: "pay-5410-2026",
    amount: 59130,
    receivedAt: "2026-05-15T08:02:00Z",
    channel: "ach-email",
    bankReference: "TXN-5410-2026",
    bank: "Bank of America",
    extractedPayer: {
      name: "Pacific Distribution Co",
      matchedCustomerId: "cust-pacific-distribution",
      matchConfidence: 1.0,
    },
    remittance: {
      rawText: "Payment for INV-5101, INV-5102, INV-5103 (less RMA-2026-0418)",
      parsedInvoiceIds: ["inv-5101", "inv-5102", "inv-5103"],
    },
    classification: {
      label: "short-pay",
      confidence: 0.88,
    },
  },

  // ── Northeast Supply Group — BANK_FEE short-pay $84 ───────────────────
  // 1 invoice $14,280; payment arrives $84 short = $14,196 (wire fee).
  {
    id: "pay-6275-2026",
    amount: 14196,
    receivedAt: "2026-05-15T09:31:00Z",
    channel: "wire-portal",
    bankReference: "TXN-6275-2026",
    bank: "Wells Fargo",
    extractedPayer: {
      name: "Northeast Supply Group",
      matchedCustomerId: "cust-northeast-supply",
      matchConfidence: 1.0,
    },
    remittance: {
      rawText: "Wire payment INV-6201 net of wire fees",
      parsedInvoiceIds: ["inv-6201"],
    },
    classification: {
      label: "short-pay",
      confidence: 0.95,
    },
  },

  // ── Westpoint Manufacturing — VOLUME_TIER_DISCOUNT short-pay $312 ──
  // 2 invoices summing to $60,500; payment arrives $312 short = $60,188.
  {
    id: "pay-7388-2026",
    amount: 60188,
    receivedAt: "2026-05-15T10:18:00Z",
    channel: "ach-edi-820",
    bankReference: "TXN-7388-2026",
    bank: "Citibank",
    extractedPayer: {
      name: "Westpoint Manufacturing",
      matchedCustomerId: "cust-westpoint-mfg",
      matchConfidence: 1.0,
    },
    remittance: {
      rawText: "EDI 820 — INV-7301, INV-7302 (Q2 tier-3 rebate applied)",
      parsedInvoiceIds: ["inv-7301", "inv-7302"],
    },
    classification: {
      label: "short-pay",
      confidence: 0.76,
    },
  },
]

// ════════════════════════════════════════════════════════════════════
// 6 UNAPPLIED PAYMENTS — TOTAL DOLLARS = $2,400,000 EXACTLY
// ════════════════════════════════════════════════════════════════════
// Distributed across 4 aging buckets:
//   current (today)  : 48,500 + 12,400 + 1,139,100 = 1,200,000
//   1-7d             : 720,000
//   8-30d            : 360,000
//   30+d             : 120,000
//                                             total = 2,400,000

const UNAPPLIED_PAYMENTS: Payment[] = [
  // ── Atlantic Logistics LLC — name mismatch (canonical dashboard card) ──
  {
    id: "pay-unappl-8401",
    amount: 48500,
    receivedAt: "2026-05-15T06:45:00Z",
    channel: "ach-bank-stmt-only",
    bankReference: "TXN-8401-2026",
    bank: "JPMorgan Chase",
    extractedPayer: {
      name: "Atlantic Logistics LLC",
      matchedCustomerId: undefined,
      matchConfidence: 0.87,
    },
    classification: {
      label: "unapplied",
      confidence: 0.55,
    },
  },

  // ── Unknown payer — no remittance, no name match (dashboard card) ──
  {
    id: "pay-unappl-9120",
    amount: 12400,
    receivedAt: "2026-05-15T07:50:00Z",
    channel: "ach-bank-stmt-only",
    bankReference: "TXN-9120-2026",
    bank: "Bank of America",
    extractedPayer: {
      name: "MIDWEST HOLDCO LLC",
      matchedCustomerId: undefined,
      matchConfidence: undefined,
    },
    classification: {
      label: "unapplied",
      confidence: 0.42,
    },
  },

  // ── Stonebridge Construction — large wire, no remittance (current) ──
  // Drives the bulk of today's unapplied bucket. $1,139,100.
  {
    id: "pay-unappl-7715",
    amount: 1139100,
    receivedAt: "2026-05-15T05:22:00Z",
    channel: "wire-portal",
    bankReference: "TXN-7715-2026",
    bank: "Citibank",
    extractedPayer: {
      name: "Stonebridge Construction",
      matchedCustomerId: "cust-stonebridge-construction",
      matchConfidence: 0.78,
    },
    classification: {
      label: "unapplied",
      confidence: 0.48,
    },
  },

  // ── Gulfshore Energy Partners — 1-7d bucket, $720,000 ──
  // Received 4 days ago (2026-05-11). Wire, no remittance, partial name match.
  {
    id: "pay-unappl-6602",
    amount: 720000,
    receivedAt: "2026-05-11T11:08:00Z",
    channel: "wire-portal",
    bankReference: "TXN-6602-2026",
    bank: "JPMorgan Chase",
    extractedPayer: {
      name: "GULFSHORE ENERGY",
      matchedCustomerId: "cust-gulfshore-energy",
      matchConfidence: 0.84,
    },
    classification: {
      label: "unapplied",
      confidence: 0.52,
    },
  },

  // ── Stratoview Aerospace — 8-30d bucket, $360,000 ──
  // Received ~14 days ago (2026-05-01). Bank statement only.
  {
    id: "pay-unappl-5421",
    amount: 360000,
    receivedAt: "2026-05-01T14:12:00Z",
    channel: "ach-bank-stmt-only",
    bankReference: "TXN-5421-2026",
    bank: "Wells Fargo",
    extractedPayer: {
      name: "STRATOVIEW AERO",
      matchedCustomerId: "cust-stratoview-aerospace",
      matchConfidence: 0.81,
    },
    classification: {
      label: "unapplied",
      confidence: 0.5,
    },
  },

  // ── Truly unknown payer — 30+d bucket, $120,000 (worst-case stale item) ──
  // Received ~38 days ago (2026-04-07). No name match, no remittance.
  {
    id: "pay-unappl-3104",
    amount: 120000,
    receivedAt: "2026-04-07T09:30:00Z",
    channel: "ach-bank-stmt-only",
    bankReference: "TXN-3104-2026",
    bank: "Bank of America",
    extractedPayer: {
      name: "BLUEHILL PARTNERS LLC",
      matchedCustomerId: undefined,
      matchConfidence: undefined,
    },
    classification: {
      label: "unapplied",
      confidence: 0.4,
    },
  },
]

// ════════════════════════════════════════════════════════════════════
// Auto-applied today — 14 (1:1 clean) + 8 (1:many clean)
// ════════════════════════════════════════════════════════════════════
// These represent the "applied $1.8M overnight" headline. They reference
// invoice IDs from the filler pool (inv-1001..inv-1138). Each is a clean
// match — no short-pay flag — and is later linked via seed-applications.

type CleanSpec = {
  id: PaymentId
  customerId: CustomerId
  payerName: string
  amount: number
  hour: number          // hour of 2026-05-15 (UTC) when received
  minute: number
  channel: PaymentChannel
  bank: string
  invoiceIds: string[]
  confidence: number    // > 0.9
}

const ONE_TO_ONE_TODAY: CleanSpec[] = [
  { id: "pay-1001-2026", customerId: "cust-clearwater-pharma",  payerName: "Clearwater Pharmaceuticals", amount: 18450, hour: 3,  minute: 12, channel: "ach-email",      bank: "JPMorgan Chase",  invoiceIds: ["inv-1059"], confidence: 0.99 },
  { id: "pay-1002-2026", customerId: "cust-meridian-electric",   payerName: "Meridian Electric Supply",   amount: 22800, hour: 3,  minute: 45, channel: "ach-portal",     bank: "Bank of America", invoiceIds: ["inv-1062"], confidence: 0.98 },
  { id: "pay-1003-2026", customerId: "cust-grandview-hardware",  payerName: "Grandview Hardware Supply",  amount:  9750, hour: 4,  minute:  8, channel: "ach-email",      bank: "Wells Fargo",     invoiceIds: ["inv-1067"], confidence: 0.99 },
  { id: "pay-1004-2026", customerId: "cust-windrose-marine",     payerName: "Windrose Marine Equipment",  amount: 14200, hour: 4,  minute: 33, channel: "ach-edi-820",    bank: "Citibank",        invoiceIds: ["inv-1071"], confidence: 0.97 },
  { id: "pay-1005-2026", customerId: "cust-meridian-fitness",    payerName: "Meridian Fitness Equipment", amount: 11600, hour: 5,  minute:  2, channel: "ach-portal",     bank: "JPMorgan Chase",  invoiceIds: ["inv-1075"], confidence: 0.98 },
  { id: "pay-1006-2026", customerId: "cust-twinpines-lumber",    payerName: "Twin Pines Lumber",          amount:  7900, hour: 5,  minute: 41, channel: "ach-email",      bank: "Bank of America", invoiceIds: ["inv-1078"], confidence: 0.99 },
  { id: "pay-1007-2026", customerId: "cust-skyharbor-logistics", payerName: "Sky Harbor Logistics",       amount: 24300, hour: 6,  minute: 15, channel: "ach-edi-820",    bank: "Wells Fargo",     invoiceIds: ["inv-1082"], confidence: 0.97 },
  { id: "pay-1008-2026", customerId: "cust-ironforge-tools",     payerName: "Ironforge Tooling",          amount: 16850, hour: 6,  minute: 49, channel: "ach-email",      bank: "Citibank",        invoiceIds: ["inv-1085"], confidence: 0.99 },
  { id: "pay-1009-2026", customerId: "cust-orionstar-software",  payerName: "Orionstar Software Solutions", amount: 32500, hour: 7,  minute: 21, channel: "ach-portal", bank: "JPMorgan Chase",  invoiceIds: ["inv-1089"], confidence: 0.98 },
  { id: "pay-1010-2026", customerId: "cust-vanguard-security",   payerName: "Vanguard Security Systems",  amount: 19200, hour: 8,  minute: 11, channel: "ach-email",      bank: "Bank of America", invoiceIds: ["inv-1093"], confidence: 0.99 },
  { id: "pay-1011-2026", customerId: "cust-hawthorne-dental",    payerName: "Hawthorne Dental Supply",    amount: 13400, hour: 8,  minute: 55, channel: "ach-portal",     bank: "Wells Fargo",     invoiceIds: ["inv-1097"], confidence: 0.99 },
  { id: "pay-1012-2026", customerId: "cust-rivercrest-banking",  payerName: "Rivercrest Banking Services", amount: 27600, hour: 9,  minute:  7, channel: "wire-portal",   bank: "Citibank",        invoiceIds: ["inv-1100"], confidence: 0.98 },
  { id: "pay-1013-2026", customerId: "cust-evergreen-paper",     payerName: "Evergreen Paper Products",   amount: 15750, hour: 9,  minute: 42, channel: "ach-email",      bank: "JPMorgan Chase",  invoiceIds: ["inv-1104"], confidence: 0.99 },
  { id: "pay-1014-2026", customerId: "cust-burnsidehill-coffee", payerName: "Burnside Hill Coffee Roasters", amount: 8400, hour: 10, minute: 25, channel: "ach-portal",   bank: "Bank of America", invoiceIds: ["inv-1108"], confidence: 0.99 },
]

const ONE_TO_MANY_TODAY: CleanSpec[] = [
  { id: "pay-2001-2026", customerId: "cust-pinnacle-logistics",      payerName: "Pinnacle Logistics Partners",   amount: 64200,  hour: 3, minute: 28, channel: "ach-edi-820", bank: "JPMorgan Chase", invoiceIds: ["inv-1063", "inv-1064"], confidence: 0.95 },
  { id: "pay-2002-2026", customerId: "cust-aspenglow-resorts",       payerName: "Aspenglow Resorts",             amount: 87300,  hour: 4, minute: 17, channel: "ach-email",   bank: "Citibank",       invoiceIds: ["inv-1068", "inv-1069", "inv-1070"], confidence: 0.93 },
  { id: "pay-2003-2026", customerId: "cust-keystone-grocers",        payerName: "Keystone Grocers",              amount: 51800,  hour: 5, minute: 33, channel: "ach-portal",  bank: "Bank of America", invoiceIds: ["inv-1072", "inv-1073"], confidence: 0.96 },
  { id: "pay-2004-2026", customerId: "cust-driftwood-hospitality",   payerName: "Driftwood Hospitality Group",   amount: 102450, hour: 6, minute:  4, channel: "ach-edi-820", bank: "Wells Fargo",    invoiceIds: ["inv-1076", "inv-1077", "inv-1080"], confidence: 0.94 },
  { id: "pay-2005-2026", customerId: "cust-foundry-auto-parts",      payerName: "Foundry Auto Parts",            amount: 76900,  hour: 7, minute: 38, channel: "ach-email",   bank: "JPMorgan Chase", invoiceIds: ["inv-1083", "inv-1084", "inv-1086"], confidence: 0.93 },
  { id: "pay-2006-2026", customerId: "cust-magnolia-dairy",          payerName: "Magnolia Dairy Cooperative",    amount: 43750,  hour: 8, minute: 22, channel: "ach-portal",  bank: "Citibank",       invoiceIds: ["inv-1090", "inv-1091"], confidence: 0.97 },
  { id: "pay-2007-2026", customerId: "cust-cedarvalley-retail",      payerName: "Cedar Valley Retail Group",     amount: 91200,  hour: 9, minute: 14, channel: "ach-edi-820", bank: "Bank of America", invoiceIds: ["inv-1094", "inv-1095", "inv-1096"], confidence: 0.94 },
  { id: "pay-2008-2026", customerId: "cust-harborside-metals",       payerName: "Harborside Metals",             amount: 58600,  hour: 10, minute: 52, channel: "wire-portal", bank: "Wells Fargo",    invoiceIds: ["inv-1101", "inv-1102"], confidence: 0.96 },
]

function pad(n: number): string {
  return n.toString().padStart(2, "0")
}

function cleanSpecToPayment(spec: CleanSpec, isOneToMany: boolean): Payment {
  const ts = `2026-05-15T${pad(spec.hour)}:${pad(spec.minute)}:00Z`
  const remittanceText = isOneToMany
    ? `Payment for ${spec.invoiceIds.map((id) => `INV-${id.replace(/^inv-/, "")}`).join(", ")}`
    : `Payment for INV-${spec.invoiceIds[0].replace(/^inv-/, "")}`
  return {
    id: spec.id,
    amount: spec.amount,
    receivedAt: ts,
    channel: spec.channel,
    bankReference: `TXN-${spec.id.replace(/^pay-/, "").replace(/-2026$/, "")}-2026`,
    bank: spec.bank,
    extractedPayer: {
      name: spec.payerName,
      matchedCustomerId: spec.customerId,
      matchConfidence: 1.0,
    },
    remittance: {
      rawText: remittanceText,
      parsedInvoiceIds: spec.invoiceIds,
    },
    classification: {
      label: isOneToMany ? "1:many match" : "1:1 match",
      confidence: spec.confidence,
    },
  }
}

const AUTO_APPLIED_TODAY_PAYMENTS: Payment[] = [
  ...ONE_TO_ONE_TODAY.map((s) => cleanSpecToPayment(s, false)),
  ...ONE_TO_MANY_TODAY.map((s) => cleanSpecToPayment(s, true)),
]

// ════════════════════════════════════════════════════════════════════
// 28 historical applied payments (last 30 days, audit-trail richness)
// ════════════════════════════════════════════════════════════════════
// Generated programmatically. Vary date 1-30 days ago, vary customer,
// vary amount. All clean 1:1 matches (these are NOT exercised by the
// dashboard or inbox surfaces; they exist only so the audit log surface
// has a nontrivial backlog to scroll through).

const HISTORICAL_CUSTOMERS: { id: CustomerId; name: string }[] = [
  { id: "cust-ironforge-tools",            name: "Ironforge Tooling" },
  { id: "cust-evergreen-paper",            name: "Evergreen Paper Products" },
  { id: "cust-meridian-electric",          name: "Meridian Electric Supply" },
  { id: "cust-cascade-chemicals",          name: "Cascade Chemicals" },
  { id: "cust-clearwater-pharma",          name: "Clearwater Pharmaceuticals" },
  { id: "cust-blueridge-textiles",         name: "Blue Ridge Textiles" },
  { id: "cust-grandview-hardware",         name: "Grandview Hardware Supply" },
  { id: "cust-trailhead-outdoor",          name: "Trailhead Outdoor Gear" },
  { id: "cust-silverline-aviation",        name: "Silverline Aviation Services" },
  { id: "cust-magnolia-dairy",             name: "Magnolia Dairy Cooperative" },
  { id: "cust-cobaltridge-mining",         name: "Cobalt Ridge Mining" },
  { id: "cust-fieldcrest-agri",            name: "Fieldcrest Agricultural Supply" },
  { id: "cust-windrose-marine",            name: "Windrose Marine Equipment" },
  { id: "cust-bristol-printing",           name: "Bristol Commercial Printing" },
  { id: "cust-aspenglow-resorts",          name: "Aspenglow Resorts" },
  { id: "cust-keystone-grocers",           name: "Keystone Grocers" },
  { id: "cust-thornwood-furniture",        name: "Thornwood Furniture Co" },
  { id: "cust-vanguard-security",          name: "Vanguard Security Systems" },
  { id: "cust-twinpines-lumber",           name: "Twin Pines Lumber" },
  { id: "cust-meridian-fitness",           name: "Meridian Fitness Equipment" },
  { id: "cust-stratoview-aerospace",       name: "Stratoview Aerospace" },
  { id: "cust-foundry-auto-parts",         name: "Foundry Auto Parts" },
  { id: "cust-lighthouse-publishing",      name: "Lighthouse Publishing" },
  { id: "cust-rivercrest-banking",         name: "Rivercrest Banking Services" },
  { id: "cust-hawthorne-dental",           name: "Hawthorne Dental Supply" },
  { id: "cust-merrybrook-bakery",          name: "Merrybrook Bakery Group" },
  { id: "cust-foggy-harbor-shipping",      name: "Foggy Harbor Shipping" },
  { id: "cust-burnsidehill-coffee",        name: "Burnside Hill Coffee Roasters" },
]

const HISTORICAL_BANKS = ["JPMorgan Chase", "Bank of America", "Wells Fargo", "Citibank"]
const HISTORICAL_CHANNELS: PaymentChannel[] = ["ach-email", "ach-portal", "ach-edi-820", "wire-portal"]

// Deterministic LCG so re-runs are stable.
function rngFactory(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0x1_0000_0000
  }
}

const HISTORICAL_PAYMENTS: Payment[] = (() => {
  const rand = rngFactory(20260515)
  const out: Payment[] = []
  // Demo "today" anchor.
  const today = new Date(Date.UTC(2026, 4, 15, 12, 0, 0))

  for (let i = 0; i < 28; i += 1) {
    const cust = HISTORICAL_CUSTOMERS[i] // 28 customers, 1 payment each → unique
    // Spread across 1-30 days ago, deterministic but varied.
    const daysAgo = 1 + ((i * 17 + 3) % 30)
    const d = new Date(today)
    d.setUTCDate(d.getUTCDate() - daysAgo)
    d.setUTCHours(2 + Math.floor(rand() * 18), Math.floor(rand() * 60), 0, 0)
    const ts = d.toISOString().replace(/\.\d{3}Z$/, "Z")

    // Amounts: $4K to $48K, rounded to nearest $50.
    const baseAmt = 4000 + Math.floor(rand() * 44000)
    const amount = Math.round(baseAmt / 50) * 50

    const channel = HISTORICAL_CHANNELS[Math.floor(rand() * HISTORICAL_CHANNELS.length)]
    const bank = HISTORICAL_BANKS[Math.floor(rand() * HISTORICAL_BANKS.length)]

    // Reference an open invoice from the filler pool (inv-1001..inv-1138).
    // Reserve inv-1059..inv-1108 for today's auto-applied set; pick from the
    // back half so we don't double-link.
    const invSerial = 1109 + (i % 30)
    const invoiceId = `inv-${invSerial}`
    const invoiceNumber = `INV-${invSerial}`

    const serial = 800 + i
    out.push({
      id: `pay-h${pad(serial)}-2026`,
      amount,
      receivedAt: ts,
      channel,
      bankReference: `TXN-H${pad(serial)}-2026`,
      bank,
      extractedPayer: {
        name: cust.name,
        matchedCustomerId: cust.id,
        matchConfidence: 1.0,
      },
      remittance: {
        rawText: `Payment for ${invoiceNumber}`,
        parsedInvoiceIds: [invoiceId],
      },
      classification: {
        label: "1:1 match",
        confidence: 0.98,
      },
    })
  }
  return out
})()

// ════════════════════════════════════════════════════════════════════
// Combined export + lookups
// ════════════════════════════════════════════════════════════════════

export const SEED_PAYMENTS: Payment[] = [
  ...HERO_PAYMENTS,
  ...UNAPPLIED_PAYMENTS,
  ...AUTO_APPLIED_TODAY_PAYMENTS,
  ...HISTORICAL_PAYMENTS,
]

const PAYMENT_INDEX: Record<PaymentId, Payment> = SEED_PAYMENTS.reduce(
  (acc, p) => {
    acc[p.id] = p
    return acc
  },
  {} as Record<PaymentId, Payment>,
)

export function getPayment(id: PaymentId): Payment | undefined {
  return PAYMENT_INDEX[id]
}

// Returns payments received on the given YYYY-MM-DD (UTC).
export function getPaymentsByDate(date: string): Payment[] {
  return SEED_PAYMENTS.filter((p) => p.receivedAt.startsWith(date))
}

export function getUnappliedPayments(): Payment[] {
  return SEED_PAYMENTS.filter((p) => p.classification.label === "unapplied")
}
