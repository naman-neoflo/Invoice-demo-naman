// Pure derived helpers for the collections, dunning & dispute surfaces.
//
// Source of truth: docs/handoff/collections/04-data-model.md
// § "Helpers (`lib/collections/derive.ts`)".
//
// Everything here is deterministic from the seed files (no runtime store
// reads, no `window` access, no `Date.now()`). Safe to call from both
// server and client contexts.

import { getCustomer } from "./seed-customers"
import { SEED_OPEN_INVOICES } from "./seed-open-invoices"
import { SEED_CASES, getCase, getCasesByCustomer } from "./seed-cases"
import { getDispute } from "./seed-disputes"
import { getApplication } from "./seed-applications"
import type { CollectionsCase } from "./types"

// ════════════════════════════════════════════════════════════════════
// KPI snapshot
// ════════════════════════════════════════════════════════════════════

export function getCollectionsKpiSnapshot(): {
  dsoCurrent: number
  dsoTarget: number
  totalOverdueDollars: number
  atRisk60PlusDollars: number
  needsEyesCount: number
} {
  // DSO is a narrative anchor in the spec (41 days current, 38 target). Not
  // derivable from the seeds without a longer payment-history feed, so we
  // pin to the spec values.
  const dsoCurrent = 41
  const dsoTarget = 38

  // Spec calls for $4.2M total overdue and $480K at risk in 60+. The live
  // seed sums to ~$4.44M total / ~$650K in 61+90+ buckets. We hardcode to
  // the spec demo numbers so all chat/KPI surfaces stay coherent with the
  // PRD; see seed-open-invoices.ts if the seed is ever rebalanced.
  const totalOverdueDollars = 4_200_000
  const atRisk60PlusDollars = 480_000

  // 4 dashboard "Needs your eyes" hero cards (see getNeedsEyesCards).
  // We compute live (and cap) instead of hardcoding so the helper stays
  // honest if the seed flags shift.
  let attentionCount = 0
  for (const c of SEED_CASES) {
    if (
      c.caseFlags.quietlyOverdue ||
      c.caseFlags.promiseBroken ||
      c.caseFlags.accountHoldCandidate ||
      c.caseFlags.activeDispute
    ) {
      attentionCount += 1
    }
  }
  const needsEyesCount = Math.min(attentionCount, 4)

  return {
    dsoCurrent,
    dsoTarget,
    totalOverdueDollars,
    atRisk60PlusDollars,
    needsEyesCount,
  }
}

// ════════════════════════════════════════════════════════════════════
// Aging mix (5 buckets, dashboard chart)
// ════════════════════════════════════════════════════════════════════

type AgingBucket = "current" | "1-30d" | "31-60d" | "61-90d" | "90+d"

const AGING_BUCKETS: AgingBucket[] = ["current", "1-30d", "31-60d", "61-90d", "90+d"]

export function getAgingMix(): Array<{
  bucket: AgingBucket
  totalDollars: number
  customerCount: number
}> {
  const byBucket = new Map<
    AgingBucket,
    { totalDollars: number; customers: Set<string> }
  >()
  for (const b of AGING_BUCKETS) byBucket.set(b, { totalDollars: 0, customers: new Set() })

  for (const inv of SEED_OPEN_INVOICES) {
    const slot = byBucket.get(inv.agingBucket)
    if (!slot) continue
    slot.totalDollars += inv.amount
    slot.customers.add(inv.customerId)
  }

  return AGING_BUCKETS.map((bucket) => {
    const slot = byBucket.get(bucket)!
    return {
      bucket,
      totalDollars: slot.totalDollars,
      customerCount: slot.customers.size,
    }
  })
}

// ════════════════════════════════════════════════════════════════════
// Needs-your-eyes dashboard cards (exactly 4, in dashboard order)
// ════════════════════════════════════════════════════════════════════

export type NeedsEyesType =
  | "quietly-overdue"
  | "broken-promise"
  | "active-dispute"
  | "account-hold-rec"

export type NeedsEyesCard = {
  type: NeedsEyesType
  caseId: string
  customerId: string
  customerName: string
  amount: number
  agingSummary: string
  summary: string
  routeHref: string
}

// The dashboard spec pins these 4 items in this order. Each card sources
// its case + customer from the seed; only the 1-line summary + aging
// summary are hand-tuned per Surface 1 of the data-model doc.
const NEEDS_EYES_SPEC: Array<{
  caseId: string
  type: NeedsEyesType
  agingSummary: string
  summary: string
  routeHref: string
}> = [
  {
    caseId: "case-westpoint-2026-may",
    type: "quietly-overdue",
    agingSummary: "35-42d aging",
    summary: "silent 14d, normally pays at 42d",
    routeHref: "/workspace/collections/customer/cust-westpoint-mfg",
  },
  {
    caseId: "case-atlantic-logistics-promise-breach",
    type: "broken-promise",
    agingSummary: "promised May 9, 4d late",
    summary: "4 days late",
    routeHref: "/workspace/collections/customer/cust-atlantic-logistics",
  },
  {
    caseId: "case-atlantic-industrial-dispute",
    type: "active-dispute",
    agingSummary: "17d aging",
    summary: "wrong qty (Neo: 3-unit short)",
    routeHref: "/workspace/collections/dispute/dispute-atlantic-9912",
  },
  {
    caseId: "case-pacific-distribution-hold",
    type: "account-hold-rec",
    agingSummary: "95d, 3 ignored emails",
    summary: "95d, 3 ignored emails",
    routeHref: "/workspace/collections/customer/cust-pacific-distribution",
  },
]

export function getNeedsEyesCards(): NeedsEyesCard[] {
  const cards: NeedsEyesCard[] = []
  for (const spec of NEEDS_EYES_SPEC) {
    const c = getCase(spec.caseId)
    if (!c) continue
    const customer = getCustomer(c.customerId)
    if (!customer) continue
    cards.push({
      type: spec.type,
      caseId: c.id,
      customerId: c.customerId,
      customerName: customer.name,
      amount: c.totalOverdue,
      agingSummary: spec.agingSummary,
      summary: spec.summary,
      routeHref: spec.routeHref,
    })
  }
  return cards
}

// ════════════════════════════════════════════════════════════════════
// Ready-to-send batch summary
// ════════════════════════════════════════════════════════════════════

export function getReadyBatchSummary(): {
  totalCount: number
  totalDollars: number
  byTier: Array<{ tier: 1 | 2 | 3; count: number; dollars: number }>
} {
  const inBatch = SEED_CASES.filter((c) => c.status === "in-batch")

  const byTier = new Map<1 | 2 | 3, { count: number; dollars: number }>([
    [1, { count: 0, dollars: 0 }],
    [2, { count: 0, dollars: 0 }],
    [3, { count: 0, dollars: 0 }],
  ])

  let totalDollars = 0
  for (const c of inBatch) {
    totalDollars += c.totalOverdue
    const tier = c.draftedEmail?.tier
    if (tier === 1 || tier === 2 || tier === 3) {
      const slot = byTier.get(tier)!
      slot.count += 1
      slot.dollars += c.totalOverdue
    }
  }

  return {
    totalCount: inBatch.length,
    totalDollars,
    byTier: [
      { tier: 1, ...byTier.get(1)! },
      { tier: 2, ...byTier.get(2)! },
      { tier: 3, ...byTier.get(3)! },
    ],
  }
}

// ════════════════════════════════════════════════════════════════════
// Worklist — filter, search, ranked ascending
// ════════════════════════════════════════════════════════════════════

const AGING_BUCKET_SET = new Set<AgingBucket>(AGING_BUCKETS)

function matchesFilter(c: CollectionsCase, filter: string): boolean {
  if (filter === "all") return true
  if (filter === "disputes") return Boolean(c.caseFlags.activeDispute)
  if (filter === "promises") return Boolean(c.caseFlags.promiseBroken)
  if (filter === "escalations") {
    return c.status === "escalated" || Boolean(c.caseFlags.accountHoldCandidate)
  }
  if (AGING_BUCKET_SET.has(filter as AgingBucket)) {
    // Map oldestAgingDays back to bucket so we don't need an extra field.
    const days = c.oldestAgingDays
    let bucket: AgingBucket
    if (days <= 0) bucket = "current"
    else if (days <= 30) bucket = "1-30d"
    else if (days <= 60) bucket = "31-60d"
    else if (days <= 90) bucket = "61-90d"
    else bucket = "90+d"
    return bucket === filter
  }
  return true
}

function matchesSearch(c: CollectionsCase, q: string): boolean {
  if (!q) return true
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  const customer = getCustomer(c.customerId)
  if (customer && customer.name.toLowerCase().includes(needle)) return true
  for (const invoiceId of c.invoiceIds) {
    if (invoiceId.toLowerCase().includes(needle)) return true
  }
  return false
}

export function getWorklist(opts?: { filter?: string; search?: string }): CollectionsCase[] {
  const filter = opts?.filter ?? "all"
  const search = opts?.search ?? ""
  return SEED_CASES
    .filter((c) => matchesFilter(c, filter))
    .filter((c) => matchesSearch(c, search))
    .slice() // copy before sort
    .sort((a, b) => a.ranking.rank - b.ranking.rank)
}

// ════════════════════════════════════════════════════════════════════
// Per-customer + entity accessors (re-exported for single-import UX)
// ════════════════════════════════════════════════════════════════════

export function getCustomerCases(customerId: string): CollectionsCase[] {
  return getCasesByCustomer(customerId)
}

export { getCustomer } from "./seed-customers"
export { getDispute } from "./seed-disputes"
export { getApplication } from "./seed-applications"
export { getCase } from "./seed-cases"
