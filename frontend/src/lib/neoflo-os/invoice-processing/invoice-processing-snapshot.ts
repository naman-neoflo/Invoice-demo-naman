// Invoice-processing context for Neo's chat.
//
// Source of truth: docs/handoff/invoice-processing/04-data-model.md
// § "Invoice-processing context for Neo's chat".
//
// snapshotInvoiceProcessing() captures the current invoice-processing state
// in a flat shape that can be serialized into Neo's system prompt.
// formatInvoiceProcessingContext() renders the snapshot as a human-readable
// text block to append to the briefing context.

import {
  getEarlyPayItems,
  getExceptionItems,
  getInvoiceKpiSnapshot,
  getNeedsEyesCards,
  type NeedsEyesType,
} from "./derive"

export type InvoiceProcessingSnapshot = {
  stpRatePercent: number
  duplicatesPreventedDollarsMtd: number
  postedTodayCount: number
  needsEyesCount: number
  exceptionsCount: number
  needsEyesItems: {
    invoiceId: string
    vendorName: string
    amount: number
    currency: string
    type: NeedsEyesType
    summary: string
  }[]
  earlyPayItems: {
    invoiceId: string
    vendorName: string
    discountDollars: number
    payByDate: string
    deadlineDays: number
  }[]
}

export function snapshotInvoiceProcessing(): InvoiceProcessingSnapshot {
  const kpis = getInvoiceKpiSnapshot()
  const cards = getNeedsEyesCards()
  const earlyPay = getEarlyPayItems()
  const exceptions = getExceptionItems()
  return {
    stpRatePercent: kpis.stpRatePercent,
    duplicatesPreventedDollarsMtd: kpis.duplicatesPreventedDollarsMtd,
    postedTodayCount: kpis.postedTodayCount,
    needsEyesCount: kpis.needsEyesCount,
    exceptionsCount: exceptions.length,
    needsEyesItems: cards.map((c) => ({
      invoiceId: c.invoiceId,
      vendorName: c.vendorName,
      amount: c.amount,
      currency: c.currency,
      type: c.type,
      summary: c.summary,
    })),
    earlyPayItems: earlyPay.map((e) => ({
      invoiceId: e.invoiceId,
      vendorName: e.vendorName,
      discountDollars: e.discountDollars,
      payByDate: e.payByDate,
      deadlineDays: e.deadlineDays,
    })),
  }
}

// ════════════════════════════════════════════════════════════════════
// Formatting helpers
// ════════════════════════════════════════════════════════════════════

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

function formatAmount(amount: number, currency: string): string {
  // Whole-dollar formatting with thousand separators; non-USD prefixed with code.
  const rounded = Math.round(amount)
  const formatted = rounded.toLocaleString("en-US")
  if (currency === "USD") return `$${formatted}`
  return `${currency} ${formatted}`
}

function formatPayByDate(iso: string): string {
  // YYYY-MM-DD → "MMM D"
  const [, mm, dd] = iso.split("-")
  const monthIdx = Number.parseInt(mm, 10) - 1
  const day = Number.parseInt(dd, 10)
  if (!Number.isFinite(monthIdx) || monthIdx < 0 || monthIdx > 11) return iso
  return `${MONTH_SHORT[monthIdx]} ${day}`
}

function typeLabel(type: NeedsEyesType): string {
  switch (type) {
    case "duplicate":
      return "DUPLICATE"
    case "variance":
      return "PRICE_VARIANCE"
    case "missing-grn":
      return "MISSING_GRN"
    case "tax":
      return "TAX_REVIEW"
    case "gl-ambiguous":
      return "GL_AMBIGUOUS"
  }
}

export function formatInvoiceProcessingContext(snapshot: InvoiceProcessingSnapshot): string {
  const items = snapshot.needsEyesItems
    .map((item, i) => {
      const amt = formatAmount(item.amount, item.currency)
      return `${i + 1}. ${item.vendorName} · ${amt} · ${typeLabel(item.type)} — ${item.summary}`
    })
    .join("\n")

  const earlyPay = snapshot.earlyPayItems
    .map(
      (e) =>
        `- ${e.vendorName} $${e.discountDollars.toLocaleString("en-US")} by ${formatPayByDate(
          e.payByDate,
        )}`,
    )
    .join("\n")

  return `---
INVOICE PROCESSING CONTEXT
STP rate (last 7d): ${snapshot.stpRatePercent}%
Duplicates prevented MTD: $${snapshot.duplicatesPreventedDollarsMtd.toLocaleString("en-US")}
Posted today: ${snapshot.postedTodayCount}
Needs your eyes: ${snapshot.needsEyesCount} items
Exceptions in queue: ${snapshot.exceptionsCount} items

Top items needing review:
${items}

Early-pay discounts available:
${earlyPay}
---`
}

