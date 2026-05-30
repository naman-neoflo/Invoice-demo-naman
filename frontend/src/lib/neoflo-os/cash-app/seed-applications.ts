// 36 fictional cash-application records for the cash-app demo.
//
// Composition (per docs/plans/2026-05-15-cash-app-phase-1-implementation.md § "Task 6"):
//   - 1 hero short-pay (Acme Industrial $97,500 1:many w/ $700 freight short, status: needs-review)
//   - 3 other short-pays today (Pacific RETURN_CREDIT, Northeast BANK_FEE, Westpoint
//     VOLUME_TIER_DISCOUNT — all status: needs-review)
//   - 22 auto-applied today (14 1:1 + 8 1:many) — postedToErpAt within the last hour
//   - 10 historical applied (status: auto-applied) — postedToErpAt 1-30 days ago
//
// The 6 unapplied payments do NOT have applications yet — those are created
// by the user during the demo (via "Confirm match" in the unapplied queue).
//
// Audit trails:
//   - Hero application: 10-event verbatim trail per the plan
//   - Other short-pays: 6-8 events (lookup + payment-history + propose + needs-review)
//   - 1:1 auto-applied:  5 events  (ingest → classify → lookup → propose → applied → erp → signed
//                                   collapsed into 5 by combining a couple)
//   - 1:many auto-applied: 7-8 events (adds payment-history lookup + multi-invoice propose)
//   - Historical: 5 events (treated as 1:1)
//
// Millisecond timestamps are computed from each payment's receivedAt + small
// monotonic offsets so the timeline reads cleanly in the audit-log surface.

import { getPayment } from "./seed-payments"
import type { Application, ApplicationId, AuditEvent, PaymentId } from "./types"

// ════════════════════════════════════════════════════════════════════
// Hero application — verbatim from plan § "Task 6 — Hero application"
// ════════════════════════════════════════════════════════════════════

const HERO_APPLICATION: Application = {
  id: "app-3392",
  paymentId: "pay-3392-2026",
  customerId: "cust-acme-industrial",
  invoiceIds: ["inv-4421", "inv-4422", "inv-4423"],
  invoiceAmounts: [
    { invoiceId: "inv-4421", appliedAmount: 32400 },
    { invoiceId: "inv-4422", appliedAmount: 34100 },
    { invoiceId: "inv-4423", appliedAmount: 31000 }, // partial — short by $700
  ],
  shortPay: {
    amount: 700,
    reasonCode: "FREIGHT_DISCOUNT",
    reasoning:
      "Per Acme Industrial's master agreement §4.2 ('Buyer may deduct freight charges if delivered later than agreed ship date'). Acme has applied this deduction on their last 7 of 8 multi-invoice payments (avg $620, range $400-$870). Today's $700 falls squarely in their pattern.",
    accountingTreatment: "Debit Freight expense, Credit AR",
  },
  status: "needs-review",
  audit: [
    {
      id: "ev-1",
      type: "ingested",
      timestamp: "2026-05-15T07:14:00.000Z",
      actor: "neo",
      description: "Inbound payment received from Tipalti webhook",
      source: "Tipalti webhook",
    },
    {
      id: "ev-2",
      type: "classified",
      timestamp: "2026-05-15T07:14:00.412Z",
      actor: "neo",
      description: "Classified as multi-invoice match (92% confidence)",
      source: "Neo classifier v3.4.1",
    },
    {
      id: "ev-3",
      type: "lookup",
      timestamp: "2026-05-15T07:14:01.208Z",
      actor: "neo",
      description: "NetSuite query — open invoices for Acme Industrial Supplies",
      source: "NetSuite REST API",
      reasoning: "Found 3 open invoices matching the remittance reference.",
    },
    {
      id: "ev-4",
      type: "lookup",
      timestamp: "2026-05-15T07:14:02.014Z",
      actor: "neo",
      description: "Master agreement excerpt fetched",
      source: "AcmeCo contracts library",
      reasoning: "Section §4.2 freight clause matched.",
    },
    {
      id: "ev-5",
      type: "lookup",
      timestamp: "2026-05-15T07:14:02.845Z",
      actor: "neo",
      description: "Payment-history lookup",
      source: "Neoflo historical applications",
      reasoning: "7 of 8 last multi-invoice payments had freight deduction (avg $620).",
    },
    {
      id: "ev-6",
      type: "proposed-match",
      timestamp: "2026-05-15T07:14:03.611Z",
      actor: "neo",
      description: "Match proposed: INV-4421 + INV-4422 + INV-4423 with $700 FREIGHT_DISCOUNT short-pay",
    },
    {
      id: "ev-7",
      type: "auto-applied",
      timestamp: "2026-05-15T07:14:04.192Z",
      actor: "neo",
      description: "Auto-applied (confidence 92% > threshold)",
    },
    {
      id: "ev-8",
      type: "erp-write-back",
      timestamp: "2026-05-15T07:14:04.500Z",
      actor: "neo",
      description: "NetSuite write-back: 3 invoices marked PAID, freight expense entry created",
      source: "NetSuite REST API",
    },
    {
      id: "ev-9",
      type: "bank-rec-flagged",
      timestamp: "2026-05-15T07:14:04.521Z",
      actor: "neo",
      description: "Tipalti reconciliation flagged TXN-3392-2026 as reconciled",
    },
    {
      id: "ev-10",
      type: "signed",
      timestamp: "2026-05-15T07:14:04.700Z",
      actor: "neo",
      description: "Audit log signed (SHA-256 forthcoming on render)",
    },
  ],
  postedToErpAt: undefined,
}

// ════════════════════════════════════════════════════════════════════
// Helpers for programmatic audit trails
// ════════════════════════════════════════════════════════════════════

// Add `ms` milliseconds to an ISO timestamp. Returns ISO with millisecond precision.
function bumpIso(iso: string, ms: number): string {
  const d = new Date(iso)
  d.setTime(d.getTime() + ms)
  return d.toISOString()
}

// 5-event 1:1 auto-applied trail (clean match, no short-pay).
function buildOneToOneAuditTrail(args: {
  paymentId: PaymentId
  receivedAt: string
  customerName: string
  invoiceNumber: string
  bankReference: string
  confidencePct: number
}): AuditEvent[] {
  const t = args.receivedAt
  return [
    {
      id: "ev-1",
      type: "ingested",
      timestamp: bumpIso(t, 0),
      actor: "neo",
      description: "Inbound payment received from Tipalti webhook",
      source: "Tipalti webhook",
    },
    {
      id: "ev-2",
      type: "classified",
      timestamp: bumpIso(t, 318),
      actor: "neo",
      description: `Classified as 1:1 match (${args.confidencePct}% confidence)`,
      source: "Neo classifier v3.4.1",
    },
    {
      id: "ev-3",
      type: "lookup",
      timestamp: bumpIso(t, 894),
      actor: "neo",
      description: `NetSuite query — open invoices for ${args.customerName}`,
      source: "NetSuite REST API",
      reasoning: `Single open invoice ${args.invoiceNumber} matched the remittance reference.`,
    },
    {
      id: "ev-4",
      type: "proposed-match",
      timestamp: bumpIso(t, 1421),
      actor: "neo",
      description: `Match proposed: ${args.invoiceNumber} (full payment, no short-pay)`,
    },
    {
      id: "ev-5",
      type: "auto-applied",
      timestamp: bumpIso(t, 1862),
      actor: "neo",
      description: `Auto-applied (confidence ${args.confidencePct}% > threshold)`,
    },
    {
      id: "ev-6",
      type: "erp-write-back",
      timestamp: bumpIso(t, 2104),
      actor: "neo",
      description: `NetSuite write-back: ${args.invoiceNumber} marked PAID`,
      source: "NetSuite REST API",
    },
    {
      id: "ev-7",
      type: "bank-rec-flagged",
      timestamp: bumpIso(t, 2128),
      actor: "neo",
      description: `Tipalti reconciliation flagged ${args.bankReference} as reconciled`,
    },
    {
      id: "ev-8",
      type: "signed",
      timestamp: bumpIso(t, 2301),
      actor: "neo",
      description: "Audit log signed (SHA-256 forthcoming on render)",
    },
  ]
}

// 7-8 event 1:many auto-applied trail (multi-invoice clean match).
function buildOneToManyAuditTrail(args: {
  paymentId: PaymentId
  receivedAt: string
  customerName: string
  invoiceNumbers: string[]
  bankReference: string
  confidencePct: number
}): AuditEvent[] {
  const t = args.receivedAt
  const list = args.invoiceNumbers.join(" + ")
  return [
    {
      id: "ev-1",
      type: "ingested",
      timestamp: bumpIso(t, 0),
      actor: "neo",
      description: "Inbound payment received from Tipalti webhook",
      source: "Tipalti webhook",
    },
    {
      id: "ev-2",
      type: "classified",
      timestamp: bumpIso(t, 402),
      actor: "neo",
      description: `Classified as multi-invoice match (${args.confidencePct}% confidence)`,
      source: "Neo classifier v3.4.1",
    },
    {
      id: "ev-3",
      type: "lookup",
      timestamp: bumpIso(t, 1118),
      actor: "neo",
      description: `NetSuite query — open invoices for ${args.customerName}`,
      source: "NetSuite REST API",
      reasoning: `Found ${args.invoiceNumbers.length} open invoices matching the remittance reference.`,
    },
    {
      id: "ev-4",
      type: "lookup",
      timestamp: bumpIso(t, 1841),
      actor: "neo",
      description: "Payment-history lookup",
      source: "Neoflo historical applications",
      reasoning: `${args.customerName} typically pays in multi-invoice batches; pattern confirmed.`,
    },
    {
      id: "ev-5",
      type: "proposed-match",
      timestamp: bumpIso(t, 2470),
      actor: "neo",
      description: `Match proposed: ${list} (sums to payment, no short-pay)`,
    },
    {
      id: "ev-6",
      type: "auto-applied",
      timestamp: bumpIso(t, 3012),
      actor: "neo",
      description: `Auto-applied (confidence ${args.confidencePct}% > threshold)`,
    },
    {
      id: "ev-7",
      type: "erp-write-back",
      timestamp: bumpIso(t, 3361),
      actor: "neo",
      description: `NetSuite write-back: ${args.invoiceNumbers.length} invoices marked PAID`,
      source: "NetSuite REST API",
    },
    {
      id: "ev-8",
      type: "bank-rec-flagged",
      timestamp: bumpIso(t, 3392),
      actor: "neo",
      description: `Tipalti reconciliation flagged ${args.bankReference} as reconciled`,
    },
    {
      id: "ev-9",
      type: "signed",
      timestamp: bumpIso(t, 3611),
      actor: "neo",
      description: "Audit log signed (SHA-256 forthcoming on render)",
    },
  ]
}

// 6-event needs-review short-pay trail (no auto-applied / no erp write-back yet).
function buildShortPayAuditTrail(args: {
  paymentId: PaymentId
  receivedAt: string
  customerName: string
  invoiceNumbers: string[]
  shortPayLabel: string  // e.g., "$1,240 RETURN_CREDIT"
  contractsLookup?: { source: string; reasoning: string }
  patternLookup?: { source: string; reasoning: string }
  classifierConfidencePct: number
}): AuditEvent[] {
  const t = args.receivedAt
  const events: AuditEvent[] = []
  let evId = 1
  const next = (e: Omit<AuditEvent, "id">): AuditEvent => ({ id: `ev-${evId++}`, ...e })

  events.push(
    next({
      type: "ingested",
      timestamp: bumpIso(t, 0),
      actor: "neo",
      description: "Inbound payment received from Tipalti webhook",
      source: "Tipalti webhook",
    }),
  )
  events.push(
    next({
      type: "classified",
      timestamp: bumpIso(t, 405),
      actor: "neo",
      description: `Classified as short-pay (${args.classifierConfidencePct}% confidence)`,
      source: "Neo classifier v3.4.1",
    }),
  )
  events.push(
    next({
      type: "lookup",
      timestamp: bumpIso(t, 1184),
      actor: "neo",
      description: `NetSuite query — open invoices for ${args.customerName}`,
      source: "NetSuite REST API",
      reasoning: `Found ${args.invoiceNumbers.length} open invoices matching the remittance reference.`,
    }),
  )
  if (args.contractsLookup) {
    events.push(
      next({
        type: "lookup",
        timestamp: bumpIso(t, 1962),
        actor: "neo",
        description: "Master agreement excerpt fetched",
        source: args.contractsLookup.source,
        reasoning: args.contractsLookup.reasoning,
      }),
    )
  }
  if (args.patternLookup) {
    events.push(
      next({
        type: "lookup",
        timestamp: bumpIso(t, 2745),
        actor: "neo",
        description: "Payment-history lookup",
        source: args.patternLookup.source,
        reasoning: args.patternLookup.reasoning,
      }),
    )
  }
  events.push(
    next({
      type: "proposed-match",
      timestamp: bumpIso(t, 3411),
      actor: "neo",
      description: `Match proposed: ${args.invoiceNumbers.join(" + ")} with ${args.shortPayLabel} short-pay`,
    }),
  )
  events.push(
    next({
      type: "signed",
      timestamp: bumpIso(t, 3702),
      actor: "neo",
      description: "Held for human review — short-pay reasoning surfaced for approval",
    }),
  )
  return events
}

// ════════════════════════════════════════════════════════════════════
// Other short-pay applications (3) — all status: needs-review
// ════════════════════════════════════════════════════════════════════

const SHORT_PAY_APPLICATIONS: Application[] = [
  // ── Pacific Distribution — RETURN_CREDIT $1,240 ─────────────────────
  // 3 invoices: 18,650 + 22,300 + 19,420 = 60,370. Pay 59,130 (short $1,240).
  // Apply RMA against the third invoice line.
  {
    id: "app-5410",
    paymentId: "pay-5410-2026",
    customerId: "cust-pacific-distribution",
    invoiceIds: ["inv-5101", "inv-5102", "inv-5103"],
    invoiceAmounts: [
      { invoiceId: "inv-5101", appliedAmount: 18650 },
      { invoiceId: "inv-5102", appliedAmount: 22300 },
      { invoiceId: "inv-5103", appliedAmount: 18180 }, // short by $1,240
    ],
    shortPay: {
      amount: 1240,
      reasonCode: "RETURN_CREDIT",
      reasoning:
        "Remittance references RMA-2026-0418 against INV-5103. NetSuite shows an open RMA for $1,240 issued 2026-04-29 against the same invoice line. Pacific has booked credit-against-payment on 4 of their last 5 RMAs rather than waiting for a separate refund — applying the credit here matches their established pattern.",
      accountingTreatment: "Debit Sales returns, Credit AR",
    },
    status: "needs-review",
    audit: buildShortPayAuditTrail({
      paymentId: "pay-5410-2026",
      receivedAt: "2026-05-15T08:02:00Z",
      customerName: "Pacific Distribution Co",
      invoiceNumbers: ["INV-5101", "INV-5102", "INV-5103"],
      shortPayLabel: "$1,240 RETURN_CREDIT",
      contractsLookup: {
        source: "NetSuite RMA module",
        reasoning: "Open RMA-2026-0418 found for $1,240 against INV-5103 line item.",
      },
      patternLookup: {
        source: "Neoflo historical applications",
        reasoning: "Pacific has booked credit-against-payment on 4 of last 5 RMAs.",
      },
      classifierConfidencePct: 88,
    }),
    postedToErpAt: undefined,
  },

  // ── Northeast Supply — BANK_FEE $84 ─────────────────────────────────
  // 1 invoice $14,280, pay $14,196 (short $84 wire fee).
  {
    id: "app-6275",
    paymentId: "pay-6275-2026",
    customerId: "cust-northeast-supply",
    invoiceIds: ["inv-6201"],
    invoiceAmounts: [
      { invoiceId: "inv-6201", appliedAmount: 14196 }, // short by $84
    ],
    shortPay: {
      amount: 84,
      reasonCode: "BANK_FEE",
      reasoning:
        "Wire fees are deducted at the originating bank before settlement. The $84 differential matches Wells Fargo's standard $25 originating-fee plus the customer's correspondent-bank fee schedule. Northeast has remitted net-of-wire-fees on every wire payment in the last 12 months (24 of 24).",
      accountingTreatment: "Debit Bank fees expense, Credit AR",
    },
    status: "needs-review",
    audit: buildShortPayAuditTrail({
      paymentId: "pay-6275-2026",
      receivedAt: "2026-05-15T09:31:00Z",
      customerName: "Northeast Supply Group",
      invoiceNumbers: ["INV-6201"],
      shortPayLabel: "$84 BANK_FEE",
      patternLookup: {
        source: "Neoflo historical applications",
        reasoning: "Northeast has remitted net-of-wire-fees on 24 of 24 wires in last 12 months.",
      },
      classifierConfidencePct: 95,
    }),
    postedToErpAt: undefined,
  },

  // ── Westpoint Manufacturing — VOLUME_TIER_DISCOUNT $312 ─────────────
  // 2 invoices: 28,900 + 31,600 = 60,500. Pay 60,188 (short $312).
  {
    id: "app-7388",
    paymentId: "pay-7388-2026",
    customerId: "cust-westpoint-mfg",
    invoiceIds: ["inv-7301", "inv-7302"],
    invoiceAmounts: [
      { invoiceId: "inv-7301", appliedAmount: 28900 },
      { invoiceId: "inv-7302", appliedAmount: 31288 }, // short by $312
    ],
    shortPay: {
      amount: 312,
      reasonCode: "VOLUME_TIER_DISCOUNT",
      reasoning:
        "EDI 820 segment references Q2 tier-3 rebate. Westpoint's master agreement §6.4 grants a 1% rebate on cumulative quarterly volume above $1M; Q2-to-date stands at $1.04M, putting them in tier 3. The $312 closely tracks the implied 1% on the rebate-eligible portion of these two invoices. Westpoint has reliably self-applied this rebate in the prior three quarters rather than invoicing separately.",
      accountingTreatment: "Debit Volume rebate expense, Credit AR",
    },
    status: "needs-review",
    audit: buildShortPayAuditTrail({
      paymentId: "pay-7388-2026",
      receivedAt: "2026-05-15T10:18:00Z",
      customerName: "Westpoint Manufacturing",
      invoiceNumbers: ["INV-7301", "INV-7302"],
      shortPayLabel: "$312 VOLUME_TIER_DISCOUNT",
      contractsLookup: {
        source: "Westpoint contracts library",
        reasoning: "§6.4 grants 1% rebate above $1M cumulative quarterly volume.",
      },
      patternLookup: {
        source: "Neoflo historical applications",
        reasoning: "Westpoint self-applied tier rebate in 3 of last 3 quarters.",
      },
      classifierConfidencePct: 76,
    }),
    postedToErpAt: undefined,
  },
]

// ════════════════════════════════════════════════════════════════════
// 22 auto-applied today (14 1:1 + 8 1:many) — generated from payments
// ════════════════════════════════════════════════════════════════════
// We trust the 1:1 / 1:many classification on each Payment to drive trail
// shape. invoiceIds + customerId come straight from the Payment, with
// per-invoice applied amount split evenly when the payment maps to multiple
// invoices (full payment, no short-pay).

const AUTO_APPLIED_TODAY_PAYMENT_IDS: PaymentId[] = [
  // 14 1:1 today
  "pay-1001-2026",
  "pay-1002-2026",
  "pay-1003-2026",
  "pay-1004-2026",
  "pay-1005-2026",
  "pay-1006-2026",
  "pay-1007-2026",
  "pay-1008-2026",
  "pay-1009-2026",
  "pay-1010-2026",
  "pay-1011-2026",
  "pay-1012-2026",
  "pay-1013-2026",
  "pay-1014-2026",
  // 8 1:many today
  "pay-2001-2026",
  "pay-2002-2026",
  "pay-2003-2026",
  "pay-2004-2026",
  "pay-2005-2026",
  "pay-2006-2026",
  "pay-2007-2026",
  "pay-2008-2026",
]

// Even split of the payment across the invoices (no short-pay), rounded to
// whole dollars with the residue absorbed by the last invoice so it sums
// exactly to the payment amount.
function splitEven(total: number, parts: number): number[] {
  if (parts <= 1) return [total]
  const each = Math.floor(total / parts)
  const out = Array.from({ length: parts }, () => each)
  const residue = total - each * parts
  out[parts - 1] += residue
  return out
}

function invNumberFromId(invId: string): string {
  return `INV-${invId.replace(/^inv-/, "")}`
}

const AUTO_APPLIED_TODAY_APPLICATIONS: Application[] = AUTO_APPLIED_TODAY_PAYMENT_IDS.map(
  (paymentId, idx) => {
    const payment = getPayment(paymentId)
    if (!payment) {
      throw new Error(`seed-applications: missing payment ${paymentId}`)
    }
    const invoiceIds = payment.remittance?.parsedInvoiceIds ?? []
    if (invoiceIds.length === 0) {
      throw new Error(`seed-applications: payment ${paymentId} has no parsed invoice IDs`)
    }
    const splits = splitEven(payment.amount, invoiceIds.length)
    const invoiceAmounts = invoiceIds.map((invoiceId, i) => ({
      invoiceId,
      appliedAmount: splits[i],
    }))
    const isOneToMany = payment.classification.label === "1:many match"
    const customerName = payment.extractedPayer.name
    const customerId = payment.extractedPayer.matchedCustomerId
    if (!customerId) {
      throw new Error(`seed-applications: payment ${paymentId} missing matchedCustomerId`)
    }
    const confidencePct = Math.round(payment.classification.confidence * 100)
    const audit = isOneToMany
      ? buildOneToManyAuditTrail({
          paymentId,
          receivedAt: payment.receivedAt,
          customerName,
          invoiceNumbers: invoiceIds.map(invNumberFromId),
          bankReference: payment.bankReference,
          confidencePct,
        })
      : buildOneToOneAuditTrail({
          paymentId,
          receivedAt: payment.receivedAt,
          customerName,
          invoiceNumber: invNumberFromId(invoiceIds[0]),
          bankReference: payment.bankReference,
          confidencePct,
        })

    // postedToErpAt: within the last hour (Today's auto-applied set was
    // written back as the payments were ingested; we anchor to receivedAt
    // + ~3.5s so it always reads as "minutes ago" relative to demo-now).
    const postedToErpAt = bumpIso(payment.receivedAt, 3500 + (idx % 5) * 120)

    return {
      id: `app-${paymentId.replace(/^pay-/, "").replace(/-2026$/, "")}`,
      paymentId,
      customerId,
      invoiceIds,
      invoiceAmounts,
      status: "auto-applied",
      audit,
      postedToErpAt,
    }
  },
)

// ════════════════════════════════════════════════════════════════════
// 10 historical applied applications (postedToErpAt 1-30 days ago)
// ════════════════════════════════════════════════════════════════════
// Reference 10 of the 28 historical payments. All clean 1:1 matches.

const HISTORICAL_APPLIED_PAYMENT_IDS: PaymentId[] = [
  "pay-h800-2026",
  "pay-h801-2026",
  "pay-h802-2026",
  "pay-h803-2026",
  "pay-h804-2026",
  "pay-h805-2026",
  "pay-h806-2026",
  "pay-h807-2026",
  "pay-h808-2026",
  "pay-h809-2026",
]

const HISTORICAL_APPLIED_APPLICATIONS: Application[] = HISTORICAL_APPLIED_PAYMENT_IDS.map(
  (paymentId) => {
    const payment = getPayment(paymentId)
    if (!payment) {
      throw new Error(`seed-applications: missing historical payment ${paymentId}`)
    }
    const invoiceIds = payment.remittance?.parsedInvoiceIds ?? []
    if (invoiceIds.length === 0) {
      throw new Error(`seed-applications: historical payment ${paymentId} has no parsed invoice IDs`)
    }
    const customerId = payment.extractedPayer.matchedCustomerId
    if (!customerId) {
      throw new Error(`seed-applications: historical payment ${paymentId} missing matchedCustomerId`)
    }
    const confidencePct = Math.round(payment.classification.confidence * 100)
    const audit = buildOneToOneAuditTrail({
      paymentId,
      receivedAt: payment.receivedAt,
      customerName: payment.extractedPayer.name,
      invoiceNumber: invNumberFromId(invoiceIds[0]),
      bankReference: payment.bankReference,
      confidencePct,
    })
    const postedToErpAt = bumpIso(payment.receivedAt, 4200)
    return {
      id: `app-${paymentId.replace(/^pay-/, "").replace(/-2026$/, "")}`,
      paymentId,
      customerId,
      invoiceIds,
      invoiceAmounts: [{ invoiceId: invoiceIds[0], appliedAmount: payment.amount }],
      status: "auto-applied",
      audit,
      postedToErpAt,
    }
  },
)

// ════════════════════════════════════════════════════════════════════
// Combined export + lookups
// ════════════════════════════════════════════════════════════════════

export const SEED_APPLICATIONS: Application[] = [
  HERO_APPLICATION,
  ...SHORT_PAY_APPLICATIONS,
  ...AUTO_APPLIED_TODAY_APPLICATIONS,
  ...HISTORICAL_APPLIED_APPLICATIONS,
]

const APPLICATION_INDEX: Record<ApplicationId, Application> = SEED_APPLICATIONS.reduce(
  (acc, a) => {
    acc[a.id] = a
    return acc
  },
  {} as Record<ApplicationId, Application>,
)

const APPLICATION_BY_PAYMENT_INDEX: Record<PaymentId, Application> = SEED_APPLICATIONS.reduce(
  (acc, a) => {
    acc[a.paymentId] = a
    return acc
  },
  {} as Record<PaymentId, Application>,
)

export function getApplication(id: ApplicationId): Application | undefined {
  return APPLICATION_INDEX[id]
}

export function getApplicationByPaymentId(paymentId: PaymentId): Application | undefined {
  return APPLICATION_BY_PAYMENT_INDEX[paymentId]
}
