// 43 fictional vendor-bill Applications for the invoice-processing demo.
//
// Composition:
//   -  1 hero application `app-acme-may-2026` (the 3-way match + GL coding
//      hero — full 11-event verbatim audit trail per
//      docs/handoff/invoice-processing/03-screen-specs.md § Surface 5).
//   -  1 hero application `app-998123-a` (the historical April Acme deep-clean
//      that the duplicate hero `inv-998123-b` collides with — 12-event trail
//      including the original Tipalti payment reference TIP-77492).
//   - 41 other Applications, one per remaining auto-posted invoice in
//      seed-invoices.ts. Audit trails are 6-10 events synthesised from the
//      invoice's channel / matchMode / vendor master record.
//
// Notes:
//   - EDI invoices (channel === "edi-810") skip the ocr-extracted event.
//   - 2-way matches (matchMode === "2way") skip the grn-matched event.
//   - SG invoices (currency === "SGD" || vendor jurisdiction === "SG") include
//      a substantive tax-checked event. All other invoices include a brief
//      tax-checked event noting no tax applicable.
//   - Audit events for runtime user actions (human-approved, human-edited,
//      human-rejected, duplicate-confirmed, vendor-emailed) are never emitted
//      here — those exist only after a Lena action in the running app.
//
// Source of truth:
//   - docs/handoff/invoice-processing/04-data-model.md § "Static seed shape"
//   - docs/handoff/invoice-processing/03-screen-specs.md § Surface 5
//   - docs/plans/2026-05-15-invoice-processing-phase-1-implementation.md § Task 6

import { getGRNByPO } from "./seed-grns"
import { SEED_INVOICES } from "./seed-invoices"
import { getVendor } from "./seed-vendors"
import type {
  Application,
  ApplicationId,
  AuditEvent,
  HumanAction,
  Invoice,
  InvoiceId,
} from "./types"

// ════════════════════════════════════════════════════════════════════
// Hero application 1 — app-acme-may-2026 (11 events, verbatim)
// ════════════════════════════════════════════════════════════════════

const HERO_ACME_MAY: Application = {
  id: "app-acme-may-2026",
  invoiceId: "inv-acme-may-2026",
  vendorId: "vendor-aclng-001",
  poId: "po-1389",
  grnId: "grn-441",
  finalGL: { account: "62100", costCenter: "PLANT-A", entity: "AcmeCo US" },
  status: "auto-posted",
  postedToErpAt: "2026-05-15T06:42:05Z",
  erpTransactionId: "NS-7748412",
  hash: "a8f12c3d5e9b71fa4267c8b9e2d4af3c1b890f567a2e4d8c9e3a7b245f8c1d09",
  auditTrail: [
    {
      id: "evt-acme-may-2026-01",
      type: "ingested",
      timestamp: "2026-05-15T06:42:01.124Z",
      actor: "neo",
      source: "email",
      description:
        "Channel: email · From: ap@acmecleaning.com · Attachment: INV-AC-2206-MAY.pdf (148 KB)",
    },
    {
      id: "evt-acme-may-2026-02",
      type: "ocr-extracted",
      timestamp: "2026-05-15T06:42:01.998Z",
      actor: "neo",
      source: "anthropic-vision-2026-04",
      description:
        "Confidence 98%; extracted vendor, invoice #, dates, lines, totals",
    },
    {
      id: "evt-acme-may-2026-03",
      type: "vendor-lookup",
      timestamp: "2026-05-15T06:42:02.412Z",
      actor: "neo",
      source: "vendor master",
      description:
        "Match: vendor-aclng-001 (Acme Cleaning Services). Active: yes. Tax-registered: US-domestic, no GST.",
    },
    {
      id: "evt-acme-may-2026-04",
      type: "po-matched",
      timestamp: "2026-05-15T06:42:02.871Z",
      actor: "neo",
      source: "PO record",
      description:
        "Searched 4 open POs for vendor-aclng-001; matched PO-1389 (monthly cleaning, May 2026 period). Variance: $0.",
    },
    {
      id: "evt-acme-may-2026-05",
      type: "grn-matched",
      timestamp: "2026-05-15T06:42:03.148Z",
      actor: "neo",
      source: "GRN record",
      description:
        "Searched GRNs against PO-1389; matched GRN-441 (verified by Plant A mgr May 31, 2026). Variance: $0.",
    },
    {
      id: "evt-acme-may-2026-06",
      type: "duplicate-checked",
      timestamp: "2026-05-15T06:42:03.512Z",
      actor: "neo",
      source: "vendor invoice history",
      description:
        "Cross-referenced 12 prior invoices from vendor-aclng-001; no duplicate. Vendor's monthly pattern.",
    },
    {
      id: "evt-acme-may-2026-07",
      type: "gl-coded",
      timestamp: "2026-05-15T06:42:04.024Z",
      actor: "neo",
      source:
        "master agreement §2.3 · vendor history (12 invoices) · GL chart",
      description:
        "Account: 62100 Maintenance & Supplies. Cost center: PLANT-A. Entity: AcmeCo US. Confidence 94%.",
      reasoning:
        "Per master agreement §2.3 (signed Jan 2024), monthly cleaning service from Acme Cleaning Services is coded to Maintenance & Supplies — Plant A. Confirmed against last 12 invoices from this vendor (Jun 2025 – Apr 2026), all coded the same way and posted without exception.",
    },
    {
      id: "evt-acme-may-2026-08",
      type: "tax-checked",
      timestamp: "2026-05-15T06:42:04.288Z",
      actor: "neo",
      description: "No tax applicable (service, US-domestic).",
    },
    {
      id: "evt-acme-may-2026-09",
      type: "threshold-checked",
      timestamp: "2026-05-15T06:42:04.501Z",
      actor: "neo",
      description:
        "Confidence overall: 94%. Auto-post threshold: 90%. Decision: auto-post.",
    },
    {
      id: "evt-acme-may-2026-10",
      type: "erp-write-back",
      timestamp: "2026-05-15T06:42:05.119Z",
      actor: "neo",
      source: "NetSuite REST API (read+write, scope: vendor-bills)",
      description: "Transaction id: NS-7748412. Status: success.",
    },
    {
      id: "evt-acme-may-2026-11",
      type: "signed",
      timestamp: "2026-05-15T06:42:05.412Z",
      actor: "neo",
      description:
        "SHA-256 hash of full timeline + extracted fields: a8f12c3d5e9b71fa4267c8b9e2d4af3c1b890f567a2e4d8c9...",
    },
  ],
}

// ════════════════════════════════════════════════════════════════════
// Hero application 2 — app-998123-a (12 events, historical April post)
// ════════════════════════════════════════════════════════════════════
// The original Q2 deep-clean invoice that the May duplicate (`inv-998123-b`)
// collides with. Posted Apr 18, 2026; subsequently paid via Tipalti TIP-77492.

const HERO_998123_A: Application = {
  id: "app-998123-a",
  invoiceId: "inv-998123-a",
  vendorId: "vendor-aclng-001",
  poId: "po-1422",
  grnId: "grn-aclng-q2",
  finalGL: { account: "62100", costCenter: "PLANT-A", entity: "AcmeCo US" },
  status: "auto-posted",
  postedToErpAt: "2026-04-18T14:22:00Z",
  erpTransactionId: "NS-7741203",
  hash: "b3c89f12dac561e23489f7b4ad1c0e5f78a92b3d4567c8d9012e34f567a89bcd",
  auditTrail: [
    {
      id: "evt-998123-a-01",
      type: "ingested",
      timestamp: "2026-04-05T08:14:00.241Z",
      actor: "neo",
      source: "email",
      description:
        "Channel: email · From: ap@acmecleaning.com · Attachment: INV-998123-A.pdf (164 KB)",
    },
    {
      id: "evt-998123-a-02",
      type: "ocr-extracted",
      timestamp: "2026-04-05T08:14:01.108Z",
      actor: "neo",
      source: "anthropic-vision-2026-04",
      description:
        "Confidence 98%; extracted vendor, invoice # (998123-A), Q2 deep-clean line items × 3, totals.",
    },
    {
      id: "evt-998123-a-03",
      type: "vendor-lookup",
      timestamp: "2026-04-05T08:14:01.502Z",
      actor: "neo",
      source: "vendor master",
      description:
        "Match: vendor-aclng-001 (Acme Cleaning Services). Active: yes. Tax-registered: US-domestic, no GST.",
    },
    {
      id: "evt-998123-a-04",
      type: "po-matched",
      timestamp: "2026-04-05T08:14:01.926Z",
      actor: "neo",
      source: "PO record",
      description:
        "Searched open POs for vendor-aclng-001; matched PO-1422 (quarterly deep-clean Plants A+B + equipment rental, approved Mar 28 by Daniel Park). Variance: $0.",
    },
    {
      id: "evt-998123-a-05",
      type: "grn-matched",
      timestamp: "2026-04-05T08:14:02.221Z",
      actor: "neo",
      source: "GRN record",
      description:
        "Matched GRN-Q2-ACLNG (services performed Apr 6–15, verified by Plant A + Plant B managers). All 3 lines confirmed; variance $0.",
    },
    {
      id: "evt-998123-a-06",
      type: "duplicate-checked",
      timestamp: "2026-04-05T08:14:02.587Z",
      actor: "neo",
      source: "vendor invoice history",
      description:
        "Cross-referenced 11 prior invoices from vendor-aclng-001; no duplicate. First quarterly deep-clean of 2026.",
    },
    {
      id: "evt-998123-a-07",
      type: "gl-coded",
      timestamp: "2026-04-05T08:14:02.991Z",
      actor: "neo",
      source: "master agreement §2.3 · vendor history (11 invoices) · GL chart",
      description:
        "Account: 62100 Maintenance & Supplies. Cost center: PLANT-A. Entity: AcmeCo US. Confidence 96%.",
      reasoning:
        "Per master agreement §2.3, Acme Cleaning Services posts to Maintenance & Supplies — Plant A. Q2 deep-clean follows the same coding as monthly recurring service.",
    },
    {
      id: "evt-998123-a-08",
      type: "tax-checked",
      timestamp: "2026-04-05T08:14:03.184Z",
      actor: "neo",
      description: "No tax applicable (service, US-domestic).",
    },
    {
      id: "evt-998123-a-09",
      type: "threshold-checked",
      timestamp: "2026-04-05T08:14:03.402Z",
      actor: "neo",
      description:
        "Confidence overall: 96%. Auto-post threshold: 90%. Decision: auto-post.",
    },
    {
      id: "evt-998123-a-10",
      type: "erp-write-back",
      timestamp: "2026-04-05T08:14:03.844Z",
      actor: "neo",
      source: "NetSuite REST API (read+write, scope: vendor-bills)",
      description:
        "Transaction id: NS-7741203. Status: success. Subsequently scheduled and paid via Tipalti reference TIP-77492 on Apr 18, 2026.",
    },
    {
      id: "evt-998123-a-11",
      type: "signed",
      timestamp: "2026-04-05T08:14:04.066Z",
      actor: "neo",
      description:
        "SHA-256 hash of full timeline + extracted fields: b3c89f12dac561e23489f7b4ad1c0e5f78a92b3d4567c8d9...",
    },
    {
      id: "evt-998123-a-12",
      type: "erp-write-back",
      timestamp: "2026-04-18T14:22:00.000Z",
      actor: "neo",
      source: "Tipalti payment confirmation",
      description:
        "Payment posted to vendor via Tipalti TIP-77492 ($42,800 USD). Marked PAID in NetSuite (NS-7741203). No vendor follow-up.",
    },
  ],
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

// Stable 64-char hex hash per invoice id. We derive the leading 8 chars from
// the invoice id's char codes so two different invoices never collide, then
// pad with a fixed sentinel tail. This is mock data — no cryptographic claim.
function deterministicHash(invoiceId: InvoiceId): string {
  const seed = invoiceId
    .split("")
    .reduce((acc, ch) => ((acc * 31 + ch.charCodeAt(0)) & 0xffffffff) >>> 0, 7)
  const head = seed.toString(16).padStart(8, "0")
  const tail = "c4e1f29ab0d678f3527c91e4a8d063b15f72ace804d39127b568faec0193dc4e"
  return (head + tail).slice(0, 64)
}

// NetSuite transaction ids — incrementing within the NS-7748xxx series for
// the "today" cohort and NS-7746xxx for historical (received 2-7 days ago).
function netsuiteTxnId(idx: number, receivedAt: string): string {
  const isHistorical = new Date(receivedAt) < new Date("2026-05-14T00:00:00Z")
  const base = isHistorical ? 7746000 : 7748000
  // Reserve the head of each block for hero (NS-7748412 used by acme-may-2026).
  return `NS-${base + 100 + idx}`
}

// Pick a sensible default final-GL for an auto-posted invoice. Prefers the
// vendor master record's `defaultGL`; otherwise falls back to a vanilla corp
// coding. Singapore vendors are coded to AcmeCo Singapore.
function pickFinalGL(invoice: Invoice): Application["finalGL"] {
  const vendor = getVendor(invoice.vendorId)
  if (invoice.glProposal) {
    return {
      account: invoice.glProposal.account,
      costCenter: invoice.glProposal.costCenter,
      entity: invoice.glProposal.entity,
    }
  }
  if (vendor?.defaultGL) {
    return {
      account: vendor.defaultGL.account,
      costCenter: vendor.defaultGL.costCenter,
      entity: vendor.defaultGL.entity,
    }
  }
  // Defaults by jurisdiction
  if (vendor?.jurisdiction === "SG") {
    return { account: "60000", costCenter: "CORP-SG", entity: "AcmeCo Singapore" }
  }
  if (vendor?.jurisdiction === "GB") {
    return { account: "60000", costCenter: "CORP-UK", entity: "AcmeCo UK" }
  }
  if (vendor?.jurisdiction === "AU") {
    return { account: "60000", costCenter: "CORP-AU", entity: "AcmeCo AU" }
  }
  return { account: "60000", costCenter: "CORP", entity: "AcmeCo US" }
}

// Builds an 8-10 event audit trail for a "clean auto-post" application.
// Skips ocr-extracted for EDI, skips grn-matched for 2-way matches.
function buildAutoPostAuditTrail(args: {
  invoice: Invoice
  appId: ApplicationId
  finalGL: Application["finalGL"]
  postedAt: string
  erpTxnId: string
  hash: string
}): AuditEvent[] {
  const { invoice, appId, finalGL, postedAt, erpTxnId, hash } = args
  const vendor = getVendor(invoice.vendorId)
  const t = invoice.receivedAt
  const events: AuditEvent[] = []
  let n = 1
  const next = (e: Omit<AuditEvent, "id" | "actor">): AuditEvent => ({
    id: `evt-${appId.replace(/^app-/, "")}-${String(n++).padStart(2, "0")}`,
    actor: "neo",
    ...e,
  })

  // 1. ingested
  const channelLabel: Record<typeof invoice.channel, string> = {
    email: "email",
    "edi-810": "EDI 810",
    billcom: "Bill.com",
    coupa: "Coupa",
    ariba: "Ariba",
    photo: "photo upload",
    manual: "manual entry",
  }
  events.push(
    next({
      type: "ingested",
      timestamp: bumpIso(t, 120),
      source: invoice.channel,
      description: `Channel: ${channelLabel[invoice.channel]} · Vendor: ${vendor?.name ?? invoice.vendorId} · Invoice ${invoice.invoiceNumber}`,
    }),
  )

  // 2. ocr-extracted (skip for EDI — structured feed needs no OCR)
  if (invoice.channel !== "edi-810") {
    const conf = Math.round(invoice.ocrConfidence * 100)
    events.push(
      next({
        type: "ocr-extracted",
        timestamp: bumpIso(t, 740),
        source: "anthropic-vision-2026-04",
        description: `Confidence ${conf}%; extracted vendor, invoice #, dates, lines, totals.`,
      }),
    )
  }

  // 3. vendor-lookup
  const taxLabel = vendor?.taxRegistration
    ? `${vendor.taxRegistration.type}-registered (${vendor.taxRegistration.id})`
    : "US-domestic, no GST"
  events.push(
    next({
      type: "vendor-lookup",
      timestamp: bumpIso(t, 1180),
      source: "vendor master",
      description: `Match: ${invoice.vendorId} (${vendor?.name ?? "unknown vendor"}). Active: yes. Tax-registered: ${taxLabel}.`,
    }),
  )

  // 4. po-matched
  const variance =
    invoice.matchProposal && invoice.matchProposal.totalVariance !== 0
      ? `Variance: $${invoice.matchProposal.totalVariance.toLocaleString()}.`
      : "Variance: $0."
  events.push(
    next({
      type: "po-matched",
      timestamp: bumpIso(t, 1620),
      source: "PO record",
      description: `Matched ${invoice.poRef ?? invoice.poId ?? "PO"} for ${vendor?.name ?? invoice.vendorId}. ${variance}`,
    }),
  )

  // 5. grn-matched (skip for 2-way matches — service / utility / freight)
  if (invoice.matchMode !== "2way") {
    const grn = invoice.poId ? getGRNByPO(invoice.poId) : undefined
    events.push(
      next({
        type: "grn-matched",
        timestamp: bumpIso(t, 1990),
        source: "GRN record",
        description: grn
          ? `Matched ${grn.grnNumber} (${grn.isServiceConfirmation ? "service confirmation" : "goods receipt"} verified by ${grn.verifiedBy}). Variance $0.`
          : `Matched GRN against ${invoice.poRef ?? invoice.poId}. Variance $0.`,
      }),
    )
  }

  // 6. duplicate-checked
  events.push(
    next({
      type: "duplicate-checked",
      timestamp: bumpIso(t, 2330),
      source: "vendor invoice history",
      description: `Cross-referenced prior invoices from ${invoice.vendorId}; no duplicate detected.`,
    }),
  )

  // 7. gl-coded
  const glSources = invoice.glProposal?.sources?.join(" · ") ?? "vendor master · GL chart"
  const glConfPct = invoice.glProposal?.confidence ? Math.round(invoice.glProposal.confidence * 100) : 95
  const glReasoning =
    invoice.glProposal?.reasoning ??
    (vendor?.defaultGL
      ? `Per vendor master record, ${vendor.name} default-codes to ${vendor.defaultGL.account} ${vendor.defaultGL.accountLabel} for ${vendor.defaultGL.entity}.`
      : `Default coding from vendor master / GL chart. No master agreement on file for this vendor.`)
  events.push(
    next({
      type: "gl-coded",
      timestamp: bumpIso(t, 2710),
      source: glSources,
      description: `Account: ${finalGL.account}. Cost center: ${finalGL.costCenter}. Entity: ${finalGL.entity}. Confidence ${glConfPct}%.`,
      reasoning: glReasoning,
    }),
  )

  // 8. tax-checked
  if (invoice.currency === "SGD" || vendor?.jurisdiction === "SG") {
    events.push(
      next({
        type: "tax-checked",
        timestamp: bumpIso(t, 2980),
        source: "IRAS GST registry",
        description: invoice.taxLine
          ? `GST ${(invoice.taxLine.rate * 100).toFixed(0)}% on base S$${invoice.taxLine.base.toLocaleString()} = S$${invoice.taxLine.amount.toLocaleString()}. Input tax credit eligible.`
          : `GST treatment confirmed via IRAS GST registry. No additional tax line on this invoice.`,
      }),
    )
  } else if (vendor?.jurisdiction === "GB") {
    events.push(
      next({
        type: "tax-checked",
        timestamp: bumpIso(t, 2980),
        description: "VAT zero-rated for cross-border services; no tax line.",
      }),
    )
  } else {
    events.push(
      next({
        type: "tax-checked",
        timestamp: bumpIso(t, 2980),
        description: "No tax applicable (US-domestic).",
      }),
    )
  }

  // 9. threshold-checked
  const overallConf = Math.max(
    glConfPct,
    invoice.matchProposal ? Math.round(invoice.matchProposal.confidence * 100) : 95,
  )
  events.push(
    next({
      type: "threshold-checked",
      timestamp: bumpIso(t, 3210),
      description: `Confidence overall: ${overallConf}%. Auto-post threshold: 90%. Decision: auto-post.`,
      reasoning: `All upstream checks cleared above the auto-post threshold; routing to NetSuite write-back.`,
    }),
  )

  // 10. erp-write-back
  events.push(
    next({
      type: "erp-write-back",
      timestamp: bumpIso(t, 3640),
      source: "NetSuite REST API (read+write, scope: vendor-bills)",
      description: `Transaction id: ${erpTxnId}. Status: success.`,
    }),
  )

  // 11. signed
  events.push(
    next({
      type: "signed",
      timestamp: bumpIso(t, 3880),
      description: `SHA-256 hash of full timeline + extracted fields: ${hash.slice(0, 48)}...`,
    }),
  )

  return events
}

// ════════════════════════════════════════════════════════════════════
// Programmatic Applications — one per remaining auto-posted invoice
// ════════════════════════════════════════════════════════════════════

// Build an Application id from an invoice id.
// e.g. "inv-atlantic-77103" → "app-atlantic-77103"
function appIdForInvoice(invoiceId: InvoiceId): ApplicationId {
  return `app-${invoiceId.replace(/^inv-/, "")}`
}

// ─────────────────────────────────────────────────────────────────
// Human-action attribution overlay (drives the Insights workload table)
// ─────────────────────────────────────────────────────────────────
//
// A subset of auto-posted applications represent invoices that humans
// touched on the way to posting — resolving an exception, confirming a
// duplicate, overriding Neo's proposed GL, etc. The seed below attributes
// those touches to either Lena (ap-manager) for day-to-day triage or
// Daniel (controller) for higher-value / GL-governance work.
//
// Distribution (intentionally Neo-dominant — workload table shows ~5%
// of total volume touched by humans):
//   - Lena: 14 actions across 8 apps
//       (6 exception-resolved · 2 duplicate-confirmed · 2 gl-override ·
//        1 classifier-override · 3 approval)
//   - Daniel: 6 actions across 3 apps
//       (2 exception-resolved · 1 duplicate-confirmed · 2 gl-override ·
//        1 approval)
//
// Hero applications are deliberately left without human actions to keep
// their narratives (pure-Neo auto-post + the historical paid bill the
// May duplicate collides with) clean for the audit-trail demos.
const HUMAN_ACTIONS_BY_INVOICE: Record<InvoiceId, HumanAction[]> = {
  // ── Lena (ap-manager) ─────────────────────────────────────────
  "inv-atlantic-77103": [
    { personaId: "ap-manager", actionType: "exception-resolved", timestamp: "2026-05-15T09:14:22Z", invoiceId: "inv-atlantic-77103" },
    { personaId: "ap-manager", actionType: "approval",           timestamp: "2026-05-15T09:18:41Z", invoiceId: "inv-atlantic-77103" },
  ],
  "inv-northeast-4408": [
    { personaId: "ap-manager", actionType: "exception-resolved", timestamp: "2026-05-15T10:02:11Z", invoiceId: "inv-northeast-4408" },
  ],
  "inv-bluepeak-8821": [
    { personaId: "ap-manager", actionType: "duplicate-confirmed", timestamp: "2026-05-15T11:27:03Z", invoiceId: "inv-bluepeak-8821" },
  ],
  "inv-cascade-5142": [
    { personaId: "ap-manager", actionType: "exception-resolved", timestamp: "2026-05-15T11:48:55Z", invoiceId: "inv-cascade-5142" },
  ],
  "inv-fairfield-2233": [
    { personaId: "ap-manager", actionType: "gl-override", timestamp: "2026-05-15T13:05:32Z", invoiceId: "inv-fairfield-2233" },
    { personaId: "ap-manager", actionType: "approval",    timestamp: "2026-05-15T13:08:14Z", invoiceId: "inv-fairfield-2233" },
  ],
  "inv-tristate-9912": [
    { personaId: "ap-manager", actionType: "exception-resolved", timestamp: "2026-05-15T14:11:48Z", invoiceId: "inv-tristate-9912" },
    { personaId: "ap-manager", actionType: "duplicate-confirmed", timestamp: "2026-05-15T14:14:09Z", invoiceId: "inv-tristate-9912" },
  ],
  "inv-millbrook-7714": [
    { personaId: "ap-manager", actionType: "classifier-override", timestamp: "2026-05-15T15:22:01Z", invoiceId: "inv-millbrook-7714" },
    { personaId: "ap-manager", actionType: "approval",            timestamp: "2026-05-15T15:23:44Z", invoiceId: "inv-millbrook-7714" },
  ],
  "inv-northstar-hvac-562": [
    { personaId: "ap-manager", actionType: "exception-resolved", timestamp: "2026-05-15T16:04:27Z", invoiceId: "inv-northstar-hvac-562" },
    { personaId: "ap-manager", actionType: "exception-resolved", timestamp: "2026-05-15T16:09:18Z", invoiceId: "inv-northstar-hvac-562" },
    { personaId: "ap-manager", actionType: "gl-override",        timestamp: "2026-05-15T16:12:55Z", invoiceId: "inv-northstar-hvac-562" },
  ],

  // ── Daniel (controller) ───────────────────────────────────────
  "inv-meridian-pwr-9914": [
    { personaId: "controller", actionType: "gl-override", timestamp: "2026-05-15T10:42:18Z", invoiceId: "inv-meridian-pwr-9914" },
    { personaId: "controller", actionType: "approval",    timestamp: "2026-05-15T10:45:02Z", invoiceId: "inv-meridian-pwr-9914" },
  ],
  "inv-blackford-q2": [
    { personaId: "controller", actionType: "exception-resolved", timestamp: "2026-05-15T13:31:44Z", invoiceId: "inv-blackford-q2" },
    { personaId: "controller", actionType: "exception-resolved", timestamp: "2026-05-15T13:36:09Z", invoiceId: "inv-blackford-q2" },
  ],
  "inv-keystone-2026": [
    { personaId: "controller", actionType: "gl-override",          timestamp: "2026-05-15T15:18:27Z", invoiceId: "inv-keystone-2026" },
    { personaId: "controller", actionType: "duplicate-confirmed",  timestamp: "2026-05-15T15:21:55Z", invoiceId: "inv-keystone-2026" },
  ],
}

// Invoices already handled by hardcoded hero applications.
const HERO_INVOICE_IDS = new Set<InvoiceId>(["inv-acme-may-2026", "inv-998123-a"])

const AUTO_POSTED_APPLICATIONS: Application[] = SEED_INVOICES
  .filter((inv) => inv.status === "auto-posted" && !HERO_INVOICE_IDS.has(inv.id))
  .map((invoice, idx) => {
    const appId = appIdForInvoice(invoice.id)
    const finalGL = pickFinalGL(invoice)
    const postedAt = bumpIso(invoice.receivedAt, 5000)
    const erpTxnId = netsuiteTxnId(idx, invoice.receivedAt)
    const hash = deterministicHash(invoice.id)
    const grn = invoice.matchMode !== "2way" && invoice.poId
      ? getGRNByPO(invoice.poId)
      : undefined
    const auditTrail = buildAutoPostAuditTrail({
      invoice,
      appId,
      finalGL,
      postedAt,
      erpTxnId,
      hash,
    })
    const humanActions = HUMAN_ACTIONS_BY_INVOICE[invoice.id]
    const app: Application = {
      id: appId,
      invoiceId: invoice.id,
      vendorId: invoice.vendorId,
      poId: invoice.poId,
      grnId: grn?.id,
      finalGL,
      status: "auto-posted",
      postedToErpAt: postedAt,
      erpTransactionId: erpTxnId,
      hash,
      auditTrail,
      ...(humanActions ? { humanActions } : {}),
    }
    return app
  })

// ════════════════════════════════════════════════════════════════════
// Combined export + lookups
// ════════════════════════════════════════════════════════════════════

export const SEED_APPLICATIONS: Application[] = [
  HERO_ACME_MAY,
  HERO_998123_A,
  ...AUTO_POSTED_APPLICATIONS,
]

const APPLICATION_INDEX: Map<ApplicationId, Application> = new Map(
  SEED_APPLICATIONS.map((a) => [a.id, a]),
)

const APPLICATION_BY_INVOICE_INDEX: Map<InvoiceId, Application> = new Map(
  SEED_APPLICATIONS.map((a) => [a.invoiceId, a]),
)

export function getApplication(id: ApplicationId): Application | undefined {
  return APPLICATION_INDEX.get(id)
}

export function getApplicationByInvoiceId(
  invoiceId: InvoiceId,
): Application | undefined {
  return APPLICATION_BY_INVOICE_INDEX.get(invoiceId)
}
