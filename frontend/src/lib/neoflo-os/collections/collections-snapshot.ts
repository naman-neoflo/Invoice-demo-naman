// Collections context for Neo's chat.
//
// Source of truth: docs/handoff/collections/04-data-model.md
// § "Collections context for Neo's chat".
//
// snapshotCollections() captures the current collections KPI + hero state
// in a flat shape that can be serialized into Neo's system prompt.
// formatCollectionsContext() renders the snapshot as a human-readable
// text block to append to the briefing context.

import {
  getCollectionsKpiSnapshot,
  getNeedsEyesCards,
  getReadyBatchSummary,
  type NeedsEyesType,
} from "./derive"

export type CollectionsSnapshot = {
  dsoCurrent: number
  dsoTarget: number
  totalOverdueDollars: number
  atRisk60PlusDollars: number
  needsEyesCount: number
  readyBatchCount: number
  needsEyesItems: Array<{
    customerName: string
    amount: number
    type: NeedsEyesType
    summary: string
  }>
}

export function snapshotCollections(): CollectionsSnapshot {
  const kpis = getCollectionsKpiSnapshot()
  const cards = getNeedsEyesCards()
  const batch = getReadyBatchSummary()
  return {
    dsoCurrent: kpis.dsoCurrent,
    dsoTarget: kpis.dsoTarget,
    totalOverdueDollars: kpis.totalOverdueDollars,
    atRisk60PlusDollars: kpis.atRisk60PlusDollars,
    needsEyesCount: kpis.needsEyesCount,
    readyBatchCount: batch.totalCount,
    needsEyesItems: cards.map((c) => ({
      customerName: c.customerName,
      amount: c.amount,
      type: c.type,
      summary: c.summary,
    })),
  }
}

// ════════════════════════════════════════════════════════════════════
// Formatting helpers
// ════════════════════════════════════════════════════════════════════

function formatDollars(amount: number): string {
  return `$${Math.round(amount).toLocaleString("en-US")}`
}

function formatCompactDollars(amount: number): string {
  // Renders 4_200_000 → "$4.2M", 480_000 → "$480K".
  const abs = Math.abs(amount)
  if (abs >= 1_000_000) {
    const millions = amount / 1_000_000
    // 1 decimal unless already whole
    const value = Number.isInteger(millions) ? millions.toFixed(0) : millions.toFixed(1)
    return `$${value}M`
  }
  if (abs >= 1_000) {
    const thousands = Math.round(amount / 1_000)
    return `$${thousands}K`
  }
  return formatDollars(amount)
}

function typeLabel(type: NeedsEyesType): string {
  switch (type) {
    case "quietly-overdue":
      return "QUIETLY-OVERDUE"
    case "broken-promise":
      return "PROMISE-BROKEN"
    case "active-dispute":
      return "DISPUTE"
    case "account-hold-rec":
      return "ACCOUNT-HOLD-REC"
  }
}

export function formatCollectionsContext(snapshot: CollectionsSnapshot): string {
  const items = snapshot.needsEyesItems
    .map((item, i) => {
      return `${i + 1}. ${item.customerName} · ${formatDollars(item.amount)} · ${typeLabel(item.type)} — ${item.summary}`
    })
    .join("\n")

  return `---
COLLECTIONS CONTEXT
DSO: ${snapshot.dsoCurrent} days (target ${snapshot.dsoTarget})
Overdue: ${formatCompactDollars(snapshot.totalOverdueDollars)} across 120 customers
At risk in 60+: ${formatCompactDollars(snapshot.atRisk60PlusDollars)}
Needs your eyes: ${snapshot.needsEyesCount} items
Ready to send: ${snapshot.readyBatchCount} emails

Top items needing review:
${items}
---`
}
