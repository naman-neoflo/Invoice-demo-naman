// Spend-analytics context for Neo's chat.
//
// Source of truth: docs/handoff/spend-analytics/04-data-model.md
// § "Snapshot (`lib/spend-analytics/spend-analytics-snapshot.ts`)".
//
// snapshotSpendAnalytics() captures the current spend KPI + hero state
// in a flat shape that can be serialized into Neo's system prompt.
// formatSpendAnalyticsContext() renders the snapshot as a human-readable
// text block to append to the briefing context.

import { getSpendKpiSnapshot, getNeedsEyesCards } from "./derive"

export type SpendAnalyticsSnapshot = {
  dpoCurrent: number
  dpoTarget: number
  workingCapitalTrapped: number
  apCommittedNext30d: number
  top5ConcentrationPercent: number
  needsEyesCount: number
  needsEyesItems: Array<{ title: string; meta: string; type: string }>
}

export function snapshotSpendAnalytics(): SpendAnalyticsSnapshot {
  const kpi = getSpendKpiSnapshot()
  const cards = getNeedsEyesCards()
  return {
    dpoCurrent: kpi.dpoCurrent,
    dpoTarget: kpi.dpoTarget,
    workingCapitalTrapped: kpi.workingCapitalTrapped,
    apCommittedNext30d: kpi.apCommittedNext30d,
    top5ConcentrationPercent: kpi.top5ConcentrationPercent,
    needsEyesCount: cards.length,
    needsEyesItems: cards.map((c) => ({ title: c.title, meta: c.meta, type: c.type })),
  }
}

// ════════════════════════════════════════════════════════════════════
// Formatting helpers
// ════════════════════════════════════════════════════════════════════

function formatCompactDollars(amount: number): string {
  // Renders 1_800_000 → "$1.8M", 4_700_000 → "$4.7M".
  const abs = Math.abs(amount)
  if (abs >= 1_000_000) {
    const millions = amount / 1_000_000
    const value = Number.isInteger(millions) ? millions.toFixed(0) : millions.toFixed(1)
    return `$${value}M`
  }
  if (abs >= 1_000) {
    const thousands = Math.round(amount / 1_000)
    return `$${thousands}K`
  }
  return `$${Math.round(amount).toLocaleString("en-US")}`
}

// One-line review summaries paired by card type — these are denser than
// the dashboard card titles (which carry display formatting like " · ")
// so chat answers stay scannable.
const REVIEW_SUMMARIES: Record<string, string> = {
  "working-capital":
    "Working capital opportunity — $1.8M from DPO 38→42 stretch (12 vendors absorb)",
  maverick:
    "Maverick spend — $84K Westpoint Industrial Q2 2026, switch to Northeast saves 12%",
  deferral:
    "Deferral opportunity — $890K 6-invoice batch shifts 4-7 days within terms",
  concentration:
    "Concentration alert — Top 5 = 62%, Acme Industrial 18% single-source risk",
}

export function formatSpendAnalyticsContext(snapshot: SpendAnalyticsSnapshot): string {
  const dpoDelta = snapshot.dpoTarget - snapshot.dpoCurrent
  const dpoDeltaStr = dpoDelta > 0 ? `+${dpoDelta} day opportunity` : `${dpoDelta} day delta`

  const items = snapshot.needsEyesItems
    .map((item, i) => {
      const summary = REVIEW_SUMMARIES[item.type] ?? `${item.title} — ${item.meta}`
      return `${i + 1}. ${summary}`
    })
    .join("\n")

  return `---
SPEND ANALYTICS CONTEXT
DPO: ${snapshot.dpoCurrent} days (target ${snapshot.dpoTarget}, ${dpoDeltaStr})
Working capital trapped: ${formatCompactDollars(snapshot.workingCapitalTrapped)}
AP committed next 30 days: ${formatCompactDollars(snapshot.apCommittedNext30d)}
Top-5 vendor concentration: ${snapshot.top5ConcentrationPercent}% (target <50%)
Needs your eyes: ${snapshot.needsEyesCount} items

Top items needing review:
${items}
---`
}
