// Pure derived helpers for the invoice-processing surfaces.
//
// Source of truth: docs/handoff/invoice-processing/04-data-model.md
// § "Helpers and derived data".
//
// Everything here is deterministic from the seed files (no runtime store
// reads, no Date.now()). "Today" for received-at math is the demo anchor
// 2026-05-15 (matches the hero invoice receivedAt). Don't read the clock.

import { SEED_INVOICES, getInvoice } from "./seed-invoices"
import { getVendor } from "./seed-vendors"
import {
  getApplication,
  getApplicationByInvoiceId,
  SEED_APPLICATIONS,
} from "./seed-applications"
import type { Invoice, InvoiceChannel, HumanActionType } from "./types"
import { getPersona, type PersonaId } from "@/lib/neoflo-os/neoflo-workspace/personas"

// ════════════════════════════════════════════════════════════════════
// Constants
// ════════════════════════════════════════════════════════════════════

const DEMO_TODAY = "2026-05-15"

// ════════════════════════════════════════════════════════════════════
// KPI snapshot
// ════════════════════════════════════════════════════════════════════

export function getInvoiceKpiSnapshot(): {
  stpRatePercent: number
  duplicatesPreventedDollarsMtd: number
  postedTodayCount: number
  needsEyesCount: number
} {
  // STP rate = autoPosted / (autoPosted + needsReview + exception + duplicateSuspected).
  // Across the full seed: 41 auto-posted, 2 needs-review, 6 exception, 1 duplicate-suspected
  // → 41/50 = 0.82, which lines up with the demo-script anchor. We compute it instead of
  // hardcoding so the helper stays honest if the seed shifts.
  let autoPosted = 0
  let denominator = 0
  for (const inv of SEED_INVOICES) {
    if (inv.status === "auto-posted") {
      autoPosted += 1
      denominator += 1
    } else if (
      inv.status === "needs-review" ||
      inv.status === "exception" ||
      inv.status === "duplicate-suspected"
    ) {
      denominator += 1
    }
  }
  const stpRatePercent = denominator === 0 ? 0 : Math.round((autoPosted / denominator) * 100)

  // Duplicates prevented MTD: the duplicate hero's amount (inv-998123-b at $42,800).
  // In Phase 1 there's exactly one suspected duplicate in the seed.
  const duplicatesPreventedDollarsMtd = 42_800

  // Posted today = invoices with status auto-posted AND receivedAt on the demo day.
  let postedTodayCount = 0
  for (const inv of SEED_INVOICES) {
    if (inv.status !== "auto-posted") continue
    if (!inv.receivedAt.startsWith(DEMO_TODAY)) continue
    postedTodayCount += 1
  }

  // Needs your eyes: the 5 dashboard cards (see getNeedsEyesCards below).
  const needsEyesCount = 5

  return {
    stpRatePercent,
    duplicatesPreventedDollarsMtd,
    postedTodayCount,
    needsEyesCount,
  }
}

// ════════════════════════════════════════════════════════════════════
// Needs-your-eyes dashboard cards (exactly 5, in the dashboard order)
// ════════════════════════════════════════════════════════════════════

export type NeedsEyesType =
  | "duplicate"
  | "variance"
  | "missing-grn"
  | "tax"
  | "gl-ambiguous"

export type NeedsEyesCard = {
  type: NeedsEyesType
  invoiceId: string
  vendorName: string
  amount: number
  currency: string
  summary: string
  confidence?: number
}

// The dashboard spec pins these 5 items in this order. Hand-picked to span all
// 5 review types — they're the canonical "Needs your eyes" set.
const NEEDS_EYES_SPEC: Array<{ invoiceId: string; type: NeedsEyesType; summary: string }> = [
  {
    invoiceId: "inv-998123-b",
    type: "duplicate",
    summary: "INV-998123-B identical to INV-998123-A paid Apr 18",
  },
  {
    invoiceId: "inv-ne-4471",
    type: "variance",
    summary: "$1,500 over PO ($52 vs $48/unit)",
  },
  {
    invoiceId: "inv-pacific-logistics-001",
    type: "missing-grn",
    summary: "PO matched, no GRN logged for container PALC-22487",
  },
  {
    invoiceId: "inv-singapore-stationery-may",
    type: "tax",
    summary: "GST input tax credit eligibility 96%",
  },
  {
    invoiceId: "inv-westpoint-mkt-001",
    type: "gl-ambiguous",
    summary: "Marketing — Digital vs Marketing — Events",
  },
]

export function getNeedsEyesCards(): NeedsEyesCard[] {
  const cards: NeedsEyesCard[] = []
  for (const spec of NEEDS_EYES_SPEC) {
    const inv = getInvoice(spec.invoiceId)
    if (!inv) continue
    const vendor = getVendor(inv.vendorId)
    const confidence =
      inv.duplicateFinding?.similarityScore ??
      inv.taxProposal?.confidence ??
      inv.glProposal?.confidence ??
      inv.matchProposal?.confidence
    cards.push({
      type: spec.type,
      invoiceId: inv.id,
      vendorName: vendor?.name ?? inv.vendorId,
      amount: inv.amount,
      currency: inv.currency,
      summary: spec.summary,
      confidence,
    })
  }
  return cards
}

// ════════════════════════════════════════════════════════════════════
// Duplicate spotlight banner (single hero item)
// ════════════════════════════════════════════════════════════════════

export type DuplicateSpotlight = {
  invoiceId: string
  vendorName: string
  amount: number
  originalPaidAt: string
  originalErpTxnId: string
}

export function getDuplicateSpotlight(): DuplicateSpotlight | null {
  const inv = getInvoice("inv-998123-b")
  if (!inv) return null
  const vendor = getVendor(inv.vendorId)
  // Original application (the one Acme already paid via Tipalti in April).
  // We pin these so the banner doesn't drift if the seed audit trail changes.
  const originalApp = getApplication("app-998123-a")
  return {
    invoiceId: inv.id,
    vendorName: vendor?.name ?? inv.vendorId,
    amount: inv.amount,
    originalPaidAt: originalApp?.postedToErpAt ?? "2026-04-18T14:22:00Z",
    originalErpTxnId: originalApp?.erpTransactionId ?? "NS-7741203",
  }
}

// ════════════════════════════════════════════════════════════════════
// Early-pay items (dashboard panel)
// ════════════════════════════════════════════════════════════════════

export type EarlyPayItem = {
  invoiceId: string
  vendorName: string
  discountDollars: number
  payByDate: string
  deadlineDays: number
}

export function getEarlyPayItems(): EarlyPayItem[] {
  const items: EarlyPayItem[] = []
  for (const inv of SEED_INVOICES) {
    if (!inv.earlyPayDiscount?.eligible) continue
    const vendor = getVendor(inv.vendorId)
    items.push({
      invoiceId: inv.id,
      vendorName: vendor?.name ?? inv.vendorId,
      discountDollars: inv.earlyPayDiscount.discountAmount,
      payByDate: inv.earlyPayDiscount.payByDate,
      deadlineDays: inv.earlyPayDiscount.deadlineDays,
    })
  }
  // Sort by payByDate ascending (most urgent first).
  items.sort((a, b) => a.payByDate.localeCompare(b.payByDate))
  return items
}

// ════════════════════════════════════════════════════════════════════
// Inbox items (received in the last 24h, filterable + searchable)
// ════════════════════════════════════════════════════════════════════

export type InboxFilter = "all" | "auto-posted" | "match-review" | "exception"

export function getInboxItems(opts?: {
  filter?: InboxFilter | string
  search?: string
  dateFrom?: string | null
  dateTo?: string | null
  amountBucket?: "all" | "lt-1k" | "1k-10k" | "10k-50k" | "gt-50k"
  vendorIds?: string[]
  sortKey?: "receivedAt" | "amount" | "vendorName" | null
  sortDir?: "asc" | "desc"
  agedOnly?: boolean
}): Invoice[] {
  const filter = opts?.filter ?? "all"
  const search = (opts?.search ?? "").trim().toLowerCase()

  // Today-only gate: the default inbox view is "what arrived today" (matches the
  // tab badges + channel breakdown). Lift the gate whenever the caller passes a
  // widening option (date range or agedOnly) so those filters can actually reach
  // older invoices instead of being neutered by the today pre-filter.
  const hasWideningFilter =
    !!opts?.dateFrom || !!opts?.dateTo || opts?.agedOnly === true

  let results = SEED_INVOICES.filter((inv) => {
    if (!hasWideningFilter && !inv.receivedAt.startsWith(DEMO_TODAY)) return false

    if (filter === "auto-posted" && inv.status !== "auto-posted") return false
    if (filter === "match-review") {
      // "Needs review" tab covers both needs-review and duplicate-suspected.
      if (inv.status !== "needs-review" && inv.status !== "duplicate-suspected") return false
    }
    if (filter === "exception" && inv.status !== "exception") return false

    if (search.length > 0) {
      const vendor = getVendor(inv.vendorId)
      const vendorName = (vendor?.name ?? "").toLowerCase()
      const invoiceNumber = inv.invoiceNumber.toLowerCase()
      if (!vendorName.includes(search) && !invoiceNumber.includes(search)) return false
    }
    return true
  })

  // Apply date range (inclusive). dateTo expands to end-of-day so the full
  // calendar day is included.
  if (opts?.dateFrom) {
    const from = opts.dateFrom
    results = results.filter((inv) => inv.receivedAt >= from)
  }
  if (opts?.dateTo) {
    const toCeiling = opts.dateTo + "T23:59:59Z"
    results = results.filter((inv) => inv.receivedAt <= toCeiling)
  }

  // Apply amount bucket. "all" or undefined → no-op.
  switch (opts?.amountBucket) {
    case "lt-1k":
      results = results.filter((inv) => inv.amount < 1_000)
      break
    case "1k-10k":
      results = results.filter((inv) => inv.amount >= 1_000 && inv.amount < 10_000)
      break
    case "10k-50k":
      results = results.filter((inv) => inv.amount >= 10_000 && inv.amount < 50_000)
      break
    case "gt-50k":
      results = results.filter((inv) => inv.amount >= 50_000)
      break
  }

  // Apply vendor multiselect.
  if (opts?.vendorIds && opts.vendorIds.length > 0) {
    const set = new Set(opts.vendorIds)
    results = results.filter((inv) => set.has(inv.vendorId))
  }

  // Apply agedOnly (Insights "aged > 7d" deep link).
  // Cutoff is DEMO_TODAY minus 7 days, formatted as YYYY-MM-DD.
  if (opts?.agedOnly) {
    const cutoffMs = new Date(`${DEMO_TODAY}T00:00:00.000Z`).getTime() - 7 * 86_400_000
    const cutoff = new Date(cutoffMs).toISOString().slice(0, 10)
    results = results.filter((inv) => inv.receivedAt <= cutoff)
  }

  // Apply sort. When sortKey is set we return a fresh array (no in-place mutation).
  if (opts?.sortKey) {
    const dir = opts.sortDir === "asc" ? 1 : -1
    const sortKey = opts.sortKey
    results = [...results].sort((a, b) => {
      switch (sortKey) {
        case "amount":
          return dir * (a.amount - b.amount)
        case "receivedAt":
          return dir * a.receivedAt.localeCompare(b.receivedAt)
        case "vendorName": {
          const aName = getVendor(a.vendorId)?.name ?? ""
          const bName = getVendor(b.vendorId)?.name ?? ""
          return dir * aName.localeCompare(bName)
        }
        default:
          return 0
      }
    })
  } else {
    results.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))
  }
  return results
}

// ════════════════════════════════════════════════════════════════════
// Exception queue
// ════════════════════════════════════════════════════════════════════

// All invoices with status === "exception". Note: the data model spec called
// for 8 items but Phase-1 seed currently has 6 — we return whatever's in the
// seed. The dashboard "Needs your eyes" picks 5 items that span exception +
// duplicate-suspected + needs-review (only partially overlaps with this list).
export function getExceptionItems(): Invoice[] {
  return SEED_INVOICES.filter((inv) => inv.status === "exception")
}

// ════════════════════════════════════════════════════════════════════
// Convenience re-exports
// ════════════════════════════════════════════════════════════════════

export function getApplicationById(id: string) {
  return getApplication(id)
}

export function getApplicationForInvoice(invoiceId: string) {
  return getApplicationByInvoiceId(invoiceId)
}

// ════════════════════════════════════════════════════════════════════
// Channel breakdown (inbox header)
// ════════════════════════════════════════════════════════════════════

export function getChannelBreakdown(): { channel: InvoiceChannel; count: number }[] {
  const counts: Record<InvoiceChannel, number> = {
    email: 0,
    "edi-810": 0,
    billcom: 0,
    coupa: 0,
    ariba: 0,
    photo: 0,
    manual: 0,
  }
  for (const inv of SEED_INVOICES) {
    if (!inv.receivedAt.startsWith(DEMO_TODAY)) continue
    counts[inv.channel] += 1
  }
  return (Object.keys(counts) as InvoiceChannel[])
    .map((channel) => ({ channel, count: counts[channel] }))
    .filter((entry) => entry.count > 0)
}

// ════════════════════════════════════════════════════════════════════
// Insights tab — shared filter / period helpers
// ════════════════════════════════════════════════════════════════════

// "Open" = invoice still moving through extraction / review (not yet a
// closed Application). Excludes auto-posted, human-approved, rejected,
// duplicate-confirmed.
const OPEN_STATUSES = new Set<Invoice["status"]>([
  "needs-review",
  "exception",
  "duplicate-suspected",
])

// Normalize a date input to a comparable ISO string. Bare dates ("YYYY-MM-DD")
// expand to start-/end-of-day UTC so they bracket the full calendar day.
function normalizeDateBound(input: string | undefined, edge: "start" | "end"): string | undefined {
  if (!input) return undefined
  // If it already has a time component, return as-is.
  if (input.includes("T")) return input
  return edge === "start" ? `${input}T00:00:00.000Z` : `${input}T23:59:59.999Z`
}

// Inclusive period filter on a single invoice's receivedAt.
function isInPeriod(receivedAt: string, dateFrom?: string, dateTo?: string): boolean {
  const from = normalizeDateBound(dateFrom, "start")
  const to = normalizeDateBound(dateTo, "end")
  if (from && receivedAt < from) return false
  if (to && receivedAt > to) return false
  return true
}

// Difference in whole calendar days from `iso` to DEMO_TODAY (anchored to UTC
// midnight on each side so partial-day timestamps don't skew the count).
function daysSince(iso: string): number {
  const recv = new Date(iso)
  const recvMidnight = Date.UTC(
    recv.getUTCFullYear(),
    recv.getUTCMonth(),
    recv.getUTCDate(),
  )
  const today = new Date(`${DEMO_TODAY}T00:00:00.000Z`)
  const todayMidnight = today.getTime()
  return Math.floor((todayMidnight - recvMidnight) / (1000 * 60 * 60 * 24))
}

// Cycle minutes from an invoice's receivedAt to its application's postedToErpAt.
// Returns undefined when either anchor is missing.
function cycleMinutes(invoiceReceivedAt: string, postedAt: string | undefined): number | undefined {
  if (!postedAt) return undefined
  const start = new Date(invoiceReceivedAt).getTime()
  const end = new Date(postedAt).getTime()
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return undefined
  return (end - start) / (1000 * 60)
}

// ════════════════════════════════════════════════════════════════════
// Helper 1 — Outstanding pipeline (stock view, ignores date filter)
// ════════════════════════════════════════════════════════════════════

export type OutstandingPipeline = {
  totalOutstanding: number
  inExtraction: number
  inReview: number
  outstandingValueUsd: number
  agedOver7Days: number
}

export function getOutstandingPipeline(): OutstandingPipeline {
  let inExtraction = 0
  let inReview = 0
  let outstandingValueUsd = 0
  let agedOver7Days = 0
  let totalOutstanding = 0
  for (const inv of SEED_INVOICES) {
    if (!OPEN_STATUSES.has(inv.status)) continue
    totalOutstanding += 1
    // Extraction vs review split — "extraction" = the OCR is still shaky.
    if (inv.status === "needs-review" && inv.ocrConfidence < 0.8) {
      inExtraction += 1
    } else {
      inReview += 1
    }
    // Outstanding value: USD only. FX conversion deferred to V2.
    // TODO: support multi-currency conversion when an FX-rate provider is wired up.
    if (inv.currency === "USD") {
      outstandingValueUsd += inv.amount
    }
    if (daysSince(inv.receivedAt) > 7) {
      agedOver7Days += 1
    }
  }
  return {
    totalOutstanding,
    inExtraction,
    inReview,
    outstandingValueUsd,
    agedOver7Days,
  }
}

// ════════════════════════════════════════════════════════════════════
// Helper 2 — Insights KPIs (period cohort, optional persona filter)
// ════════════════════════════════════════════════════════════════════

export type InsightsKpisInput = {
  dateFrom?: string
  dateTo?: string
  personaId?: PersonaId
}

export type InsightsKpis = {
  totalInvoices: number
  totalValueUsd: number
  avgProcessingMinutes: number
  stpRatePercent: number
  rejectedCount: number
}

export function getInsightsKpis(opts: InsightsKpisInput): InsightsKpis {
  const { dateFrom, dateTo, personaId } = opts
  const wantsPersonaFilter = personaId !== undefined && personaId !== "all"

  // Build a quick lookup of invoiceId → personas who touched it (via humanActions).
  // This is a simplification: deeper persona ownership rules can land in V2.
  const personasByInvoiceId: Map<string, Set<PersonaId>> = new Map()
  for (const app of SEED_APPLICATIONS) {
    if (!app.humanActions || app.humanActions.length === 0) continue
    let bucket = personasByInvoiceId.get(app.invoiceId)
    if (!bucket) {
      bucket = new Set<PersonaId>()
      personasByInvoiceId.set(app.invoiceId, bucket)
    }
    for (const action of app.humanActions) bucket.add(action.personaId)
  }

  const filtered = SEED_INVOICES.filter((inv) => {
    if (!isInPeriod(inv.receivedAt, dateFrom, dateTo)) return false
    if (wantsPersonaFilter) {
      // Persona match if invoice is explicitly assigned OR if a human action
      // by that persona touched the corresponding application.
      if (inv.assignedTo === personaId) return true
      const touched = personasByInvoiceId.get(inv.id)
      if (touched && touched.has(personaId as PersonaId)) return true
      return false
    }
    return true
  })

  const totalInvoices = filtered.length
  let totalValueUsd = 0
  for (const inv of filtered) {
    if (inv.currency === "USD") totalValueUsd += inv.amount
  }

  // Average processing minutes across closed (Applicatied) invoices in the period.
  let cycleSum = 0
  let cycleCount = 0
  for (const inv of filtered) {
    const app = getApplicationByInvoiceId(inv.id)
    if (!app) continue
    const mins = cycleMinutes(inv.receivedAt, app.postedToErpAt)
    if (mins === undefined) continue
    cycleSum += mins
    cycleCount += 1
  }
  // Fallback: the demo's published anchor is "3 min". Use it if no closed apps land in window.
  // TODO: revisit fallback once persona/date filters can match a meaningful application sample.
  const avgProcessingMinutes = cycleCount === 0 ? 3.0 : Math.round((cycleSum / cycleCount) * 10) / 10

  // STP rate — restricted to the filtered period.
  let autoPosted = 0
  let denom = 0
  for (const inv of filtered) {
    if (inv.status === "auto-posted") {
      autoPosted += 1
      denom += 1
    } else if (
      inv.status === "needs-review" ||
      inv.status === "exception" ||
      inv.status === "duplicate-suspected"
    ) {
      denom += 1
    }
  }
  const stpRatePercent = denom === 0 ? 0 : Math.round((autoPosted / denom) * 100)

  // "rejected" exists in the InvoiceStatus union but no seed invoices use it yet.
  let rejectedCount = 0
  for (const inv of filtered) {
    if (inv.status === "rejected") rejectedCount += 1
  }

  return {
    totalInvoices,
    totalValueUsd,
    avgProcessingMinutes,
    stpRatePercent,
    rejectedCount,
  }
}

// ════════════════════════════════════════════════════════════════════
// Helper 3 — Neo vs Humans split (period cohort)
// ════════════════════════════════════════════════════════════════════

const HUMAN_ACTION_LABEL: Record<HumanActionType, string> = {
  "exception-resolved": "exception resolutions",
  "duplicate-confirmed": "duplicate confirms",
  "gl-override": "GL overrides",
  "classifier-override": "classifier overrides",
  approval: "approvals",
}

export type NeoVsHumansSplit = {
  neoCount: number
  neoAvgCycleSeconds: number
  humansCount: number
  humansPercentOfVolume: number
  humansAvgCycleMinutes: number
  proseSummary: string
}

export function getNeoVsHumansSplit(opts: { dateFrom?: string; dateTo?: string }): NeoVsHumansSplit {
  const { dateFrom, dateTo } = opts

  // For each application, find its anchor receivedAt via the linked invoice
  // (postedAt is also a valid anchor but invoice receivedAt aligns the cohort
  // with the rest of the insights page).
  let neoCount = 0
  let humansCount = 0
  let humanCycleSum = 0
  let humanCycleCount = 0
  const actionTypeCounts: Record<HumanActionType, number> = {
    "exception-resolved": 0,
    "duplicate-confirmed": 0,
    "gl-override": 0,
    "classifier-override": 0,
    approval: 0,
  }

  for (const app of SEED_APPLICATIONS) {
    const invoice = getInvoice(app.invoiceId)
    if (!invoice) continue
    if (!isInPeriod(invoice.receivedAt, dateFrom, dateTo)) continue

    const wasTouched = !!app.humanActions && app.humanActions.length > 0
    if (wasTouched) {
      humansCount += 1
      const mins = cycleMinutes(invoice.receivedAt, app.postedToErpAt)
      if (mins !== undefined) {
        humanCycleSum += mins
        humanCycleCount += 1
      }
      for (const action of app.humanActions!) {
        actionTypeCounts[action.actionType] += 1
      }
    } else {
      neoCount += 1
    }
  }

  const total = neoCount + humansCount
  const humansPercentOfVolume = total === 0 ? 0 : Math.round((humansCount / total) * 100)
  // Real seed numbers are tiny because human-touched apps still post within
  // ~5s of receivedAt (auto-post timestamp + bumpIso(5000) — no real per-
  // action timestamp yet). Anything under 0.5 min is implausible for human
  // work, so we fall back to the demo's published 3.2 min anchor.
  // TODO: replace the 3.2 fallback once human-touched apps carry a real
  // post-action timestamp (rather than reusing the auto-post receivedAt+5s).
  const humansAvgCycleMinutesRaw =
    humanCycleCount === 0
      ? 3.2
      : Math.round((humanCycleSum / humanCycleCount) * 10) / 10
  const humansAvgCycleMinutes =
    humansAvgCycleMinutesRaw < 0.5 ? 3.2 : humansAvgCycleMinutesRaw

  // Build prose summary using the top-2 action types.
  const ranked = (Object.entries(actionTypeCounts) as Array<[HumanActionType, number]>)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
  const neoPct = total === 0 ? 0 : 100 - humansPercentOfVolume
  let proseSummary: string
  if (humansCount === 0) {
    proseSummary = `Neo handled ${neoPct}% straight-through; no human intervention in this period.`
  } else if (ranked.length === 0) {
    proseSummary = `Neo handled ${neoPct}% straight-through; humans intervened on ${humansCount}.`
  } else if (ranked.length === 1) {
    proseSummary = `Neo handled ${neoPct}% straight-through; humans intervened on ${humansCount} — mostly ${HUMAN_ACTION_LABEL[ranked[0][0]]}.`
  } else {
    proseSummary = `Neo handled ${neoPct}% straight-through; humans intervened on ${humansCount} — mostly ${HUMAN_ACTION_LABEL[ranked[0][0]]} and ${HUMAN_ACTION_LABEL[ranked[1][0]]}.`
  }

  return {
    neoCount,
    neoAvgCycleSeconds: 4, // narrative anchor — Neo posts in ~4 seconds
    humansCount,
    humansPercentOfVolume,
    humansAvgCycleMinutes,
    proseSummary,
  }
}

// ════════════════════════════════════════════════════════════════════
// Helper 4 — Weekly throughput (bar chart)
// ════════════════════════════════════════════════════════════════════

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export type WeeklyThroughputBucket = {
  weekLabel: string
  extraction: number
  inReview: number
  approved: number
  rejected: number
}

// Snap an ISO timestamp to the Monday of its week (UTC). Buckets run Mon-Sun.
function mondayOf(iso: string): Date {
  const d = new Date(iso)
  const dayUtc = d.getUTCDay() // 0=Sun, 1=Mon, …
  const offset = (dayUtc + 6) % 7 // days since Monday
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - offset))
}

function formatWeekLabel(weekStart: Date): string {
  const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
  const startMonth = MONTH_ABBR[weekStart.getUTCMonth()]
  const endMonth = MONTH_ABBR[weekEnd.getUTCMonth()]
  if (startMonth === endMonth) {
    return `${startMonth} ${weekStart.getUTCDate()}-${weekEnd.getUTCDate()}`
  }
  return `${startMonth} ${weekStart.getUTCDate()}-${endMonth} ${weekEnd.getUTCDate()}`
}

export function getWeeklyThroughput(opts: { dateFrom?: string; dateTo?: string }): WeeklyThroughputBucket[] {
  let from = opts.dateFrom
  let to = opts.dateTo
  if (!from || !to) {
    // Default: last 30 days from DEMO_TODAY.
    const today = new Date(`${DEMO_TODAY}T00:00:00.000Z`)
    const start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    if (!from) from = start.toISOString().slice(0, 10)
    if (!to) to = DEMO_TODAY
  }

  // Snap the cohort start to a Monday so the first bucket has a clean boundary.
  const cohortStart = mondayOf(`${from}T00:00:00.000Z`)
  const cohortEnd = new Date(`${to}T23:59:59.999Z`)

  // Seed buckets by walking Mondays from cohortStart up to cohortEnd.
  const buckets = new Map<string, WeeklyThroughputBucket>()
  for (
    let cursor = new Date(cohortStart.getTime());
    cursor.getTime() <= cohortEnd.getTime();
    cursor = new Date(cursor.getTime() + 7 * 24 * 60 * 60 * 1000)
  ) {
    const key = cursor.toISOString().slice(0, 10)
    buckets.set(key, {
      weekLabel: formatWeekLabel(cursor),
      extraction: 0,
      inReview: 0,
      approved: 0,
      rejected: 0,
    })
  }

  for (const inv of SEED_INVOICES) {
    if (!isInPeriod(inv.receivedAt, from, to)) continue
    const key = mondayOf(inv.receivedAt).toISOString().slice(0, 10)
    const bucket = buckets.get(key)
    if (!bucket) continue
    switch (inv.status) {
      case "needs-review":
        if (inv.ocrConfidence < 0.8) bucket.extraction += 1
        else bucket.inReview += 1
        break
      case "exception":
      case "duplicate-suspected":
        bucket.inReview += 1
        break
      case "auto-posted":
      case "human-approved":
        bucket.approved += 1
        break
      case "rejected":
        bucket.rejected += 1
        break
      // duplicate-confirmed = not counted in throughput (no post happened)
    }
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value)
}

// ════════════════════════════════════════════════════════════════════
// Helper 5 — Workload by actor (Neo + humans table)
// ════════════════════════════════════════════════════════════════════

export type WorkloadRow = {
  actorKey: "neo" | PersonaId
  displayName: string
  autoPosted: number
  exceptionResolved: number
  duplicateConfirmed: number
  glOverride: number
  classifierOverride: number
  avgCycle: string
  openQueue: number
}

export function getWorkloadByActor(opts: { dateFrom?: string; dateTo?: string }): WorkloadRow[] {
  const { dateFrom, dateTo } = opts

  // Pass 1 — Neo row + collect persona-touched apps in the period.
  let neoAutoPosted = 0
  const personaApps: Map<PersonaId, { invoiceId: string; postedAt?: string; receivedAt: string }[]> = new Map()
  const personaActionCounts: Map<PersonaId, Record<HumanActionType, number>> = new Map()

  for (const app of SEED_APPLICATIONS) {
    const invoice = getInvoice(app.invoiceId)
    if (!invoice) continue
    if (!isInPeriod(invoice.receivedAt, dateFrom, dateTo)) continue

    const touched = !!app.humanActions && app.humanActions.length > 0
    if (!touched) {
      neoAutoPosted += 1
      continue
    }
    // Touched: attribute cycle + per-persona action counts.
    const touchedBy = new Set<PersonaId>()
    for (const action of app.humanActions!) {
      touchedBy.add(action.personaId)
      let counts = personaActionCounts.get(action.personaId)
      if (!counts) {
        counts = {
          "exception-resolved": 0,
          "duplicate-confirmed": 0,
          "gl-override": 0,
          "classifier-override": 0,
          approval: 0,
        }
        personaActionCounts.set(action.personaId, counts)
      }
      counts[action.actionType] += 1
    }
    for (const persona of touchedBy) {
      let bucket = personaApps.get(persona)
      if (!bucket) {
        bucket = []
        personaApps.set(persona, bucket)
      }
      bucket.push({ invoiceId: app.invoiceId, postedAt: app.postedToErpAt, receivedAt: invoice.receivedAt })
    }
  }

  // Open-queue: assigned-to invoices in OPEN_STATUSES, per persona. Stock view.
  const openQueueByPersona = new Map<PersonaId, number>()
  for (const inv of SEED_INVOICES) {
    if (!OPEN_STATUSES.has(inv.status)) continue
    if (!inv.assignedTo) continue
    openQueueByPersona.set(inv.assignedTo, (openQueueByPersona.get(inv.assignedTo) ?? 0) + 1)
  }

  const neoRow: WorkloadRow = {
    actorKey: "neo",
    displayName: "Neo",
    autoPosted: neoAutoPosted,
    exceptionResolved: 0,
    duplicateConfirmed: 0,
    glOverride: 0,
    classifierOverride: 0,
    avgCycle: "4 s",
    openQueue: 0,
  }

  const humanRows: WorkloadRow[] = []
  for (const [personaId, counts] of personaActionCounts.entries()) {
    const persona = getPersona(personaId)
    const apps = personaApps.get(personaId) ?? []
    let cycleSum = 0
    let cycleCount = 0
    for (const a of apps) {
      const mins = cycleMinutes(a.receivedAt, a.postedAt)
      if (mins === undefined) continue
      cycleSum += mins
      cycleCount += 1
    }
    // Same fallback rationale as getNeoVsHumansSplit — anything under 0.5
    // min reflects the receivedAt+5s seed timestamp, not real human work.
    const avgMinRaw = cycleCount === 0 ? 3.2 : Math.round((cycleSum / cycleCount) * 10) / 10
    const avgMin = avgMinRaw < 0.5 ? 3.2 : avgMinRaw
    humanRows.push({
      actorKey: personaId,
      displayName: `${persona.name} · ${persona.title}`,
      autoPosted: 0,
      exceptionResolved: counts["exception-resolved"],
      duplicateConfirmed: counts["duplicate-confirmed"],
      glOverride: counts["gl-override"],
      classifierOverride: counts["classifier-override"],
      avgCycle: `${avgMin.toFixed(1)} min`,
      openQueue: openQueueByPersona.get(personaId) ?? 0,
    })
  }

  // Sort humans by total action count desc.
  humanRows.sort((a, b) => {
    const totalA = a.exceptionResolved + a.duplicateConfirmed + a.glOverride + a.classifierOverride
    const totalB = b.exceptionResolved + b.duplicateConfirmed + b.glOverride + b.classifierOverride
    return totalB - totalA
  })

  return [neoRow, ...humanRows]
}

// ════════════════════════════════════════════════════════════════════
// Helper 6 — Aging buckets (stock view, risk strip)
// ════════════════════════════════════════════════════════════════════

export type AgingBucket = {
  label: "0-3d" | "4-7d" | "8-14d" | "15d+"
  count: number
  tone: "good" | "watch" | "warn" | "critical"
}

export function getAgingBuckets(): AgingBucket[] {
  const buckets: AgingBucket[] = [
    { label: "0-3d", count: 0, tone: "good" },
    { label: "4-7d", count: 0, tone: "watch" },
    { label: "8-14d", count: 0, tone: "warn" },
    { label: "15d+", count: 0, tone: "critical" },
  ]
  for (const inv of SEED_INVOICES) {
    if (!OPEN_STATUSES.has(inv.status)) continue
    const days = daysSince(inv.receivedAt)
    if (days <= 3) buckets[0].count += 1
    else if (days <= 7) buckets[1].count += 1
    else if (days <= 14) buckets[2].count += 1
    else buckets[3].count += 1
  }
  return buckets
}
