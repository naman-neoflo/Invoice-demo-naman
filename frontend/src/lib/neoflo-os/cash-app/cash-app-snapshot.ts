// Cash-app context for Neo's chat.
//
// Source of truth: docs/handoff/cash-app/04-data-model.md § "Cash-app context for Neo's chat".
//
// snapshotCashApp() captures the current cash-app state in a flat shape that
// can be serialized into Neo's system prompt. formatCashAppContext() renders
// the snapshot as a human-readable text block to append to the briefing context.

import { getKpiSnapshot, getNeedsEyesCards } from "./derive"
import type { PaymentId } from "./types"

export type CashAppSnapshot = {
  unappliedTotalDollars: number
  unappliedCount: number
  autoMatchRatePercent: number
  appliedTodayDollars: number
  needsEyesCount: number
  needsEyesItems: {
    paymentId: PaymentId
    customerName: string
    amount: number
    type: "short-pay" | "unapplied"
    proposedReason?: string
  }[]
}

export function snapshotCashApp(): CashAppSnapshot {
  const kpis = getKpiSnapshot()
  const cards = getNeedsEyesCards()
  return {
    unappliedTotalDollars: kpis.unapplied,
    unappliedCount: cards.length,
    autoMatchRatePercent: kpis.autoMatchRate * 100,
    appliedTodayDollars: kpis.appliedToday,
    needsEyesCount: cards.length,
    needsEyesItems: cards.map((c) => ({
      paymentId: c.paymentId,
      customerName: c.customerName,
      amount: c.amount,
      type: c.type,
      proposedReason: c.proposedReason,
    })),
  }
}

// ════════════════════════════════════════════════════════════════════
// Formatting helpers
// ════════════════════════════════════════════════════════════════════

// Format a dollar amount as $XK or $X.XM. Round half-up.
function formatDollarsCompact(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000
    // One decimal unless it rounds clean.
    const rounded = Math.round(millions * 10) / 10
    return `$${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}M`
  }
  if (amount >= 1_000) {
    const thousands = Math.round(amount / 1_000)
    return `$${thousands}K`
  }
  return `$${Math.round(amount)}`
}

export function formatCashAppContext(snapshot: CashAppSnapshot): string {
  const shortPays = snapshot.needsEyesItems.filter((i) => i.type === "short-pay").length
  const investigations = snapshot.needsEyesItems.filter((i) => i.type === "unapplied").length

  const items = snapshot.needsEyesItems
    .map((item, i) => {
      const amt = formatDollarsCompact(item.amount)
      if (item.type === "short-pay") {
        const reason = item.proposedReason ? ` · proposed ${item.proposedReason}` : ""
        return `${i + 1}. ${item.customerName} · ${amt} · short-pay${reason}`
      }
      return `${i + 1}. ${item.customerName} · ${amt} · unapplied investigation`
    })
    .join("\n")

  return `---
CASH APP CONTEXT (snapshot taken at ${new Date().toISOString()})
Unapplied: ${formatDollarsCompact(snapshot.unappliedTotalDollars)} across ${snapshot.unappliedCount} payments
Auto-match rate today: ${Math.round(snapshot.autoMatchRatePercent)}%
Applied today: ${formatDollarsCompact(snapshot.appliedTodayDollars)}
Needs your eyes: ${snapshot.needsEyesCount} items (${shortPays} short-pays, ${investigations} unapplied investigations)

Top items needing review:
${items}
---`
}
