import {
  formatCashAppContext,
  snapshotCashApp,
  type CashAppSnapshot,
} from "@/lib/neoflo-os/cash-app/cash-app-snapshot"
import {
  formatInvoiceProcessingContext,
  snapshotInvoiceProcessing,
  type InvoiceProcessingSnapshot,
} from "@/lib/neoflo-os/invoice-processing/invoice-processing-snapshot"
import {
  formatCollectionsContext,
  snapshotCollections,
  type CollectionsSnapshot,
} from "@/lib/neoflo-os/collections/collections-snapshot"
import {
  formatSpendAnalyticsContext,
  snapshotSpendAnalytics,
  type SpendAnalyticsSnapshot,
} from "@/lib/neoflo-os/spend-analytics/spend-analytics-snapshot"

import { SEED_BRIEFING } from "./seed-briefing"

export type BriefingSnapshot = {
  greetingName: string
  timeRange: string
  prose: string
  actionItems: { id: string; title: string; meta: string }[]
  handled: { text: string }[]
  feedSummary: { totalCount: number; topCategories: string[] }
  cashApp?: CashAppSnapshot
  invoiceProcessing?: InvoiceProcessingSnapshot
  collections?: CollectionsSnapshot
  spendAnalytics?: SpendAnalyticsSnapshot
}

export function snapshotBriefing(): BriefingSnapshot {
  return {
    greetingName: SEED_BRIEFING.greetingName,
    timeRange: SEED_BRIEFING.timeRange,
    prose: SEED_BRIEFING.prose,
    actionItems: SEED_BRIEFING.actionItems.map((a) => ({
      id: a.id,
      title: a.title,
      meta: a.meta,
    })),
    handled: SEED_BRIEFING.handled.map((h) => ({ text: h.text })),
    feedSummary: { totalCount: 12, topCategories: ["Helpdesk", "Cash app", "Close"] },
    cashApp: snapshotCashApp(),
    invoiceProcessing: snapshotInvoiceProcessing(),
    collections: snapshotCollections(),
    spendAnalytics: snapshotSpendAnalytics(),
  }
}

export function formatBriefingContext(snapshot: BriefingSnapshot): string {
  const actions = snapshot.actionItems
    .map((a, i) => `${i + 1}. [${a.id}] ${a.title}\n   ${a.meta}`)
    .join("\n")
  const handled = snapshot.handled.map((h) => `- ${h.text}`).join("\n")
  const briefingBlock = `---
CURRENT BRIEFING CONTEXT (snapshot taken at ${new Date().toISOString()})
User: ${snapshot.greetingName}
Time range: ${snapshot.timeRange}

What you handled overnight:
${handled}

What needs the user's attention:
${actions}

Other ranked items in the All work feed (${snapshot.feedSummary.totalCount} total): ${snapshot.feedSummary.topCategories.join(", ")}.
---`
  const cashAppBlock = snapshot.cashApp ? formatCashAppContext(snapshot.cashApp) : ""
  const invoiceBlock = snapshot.invoiceProcessing
    ? formatInvoiceProcessingContext(snapshot.invoiceProcessing)
    : ""
  const collectionsBlock = snapshot.collections
    ? formatCollectionsContext(snapshot.collections)
    : ""
  const spendAnalyticsBlock = snapshot.spendAnalytics
    ? formatSpendAnalyticsContext(snapshot.spendAnalytics)
    : ""
  return [
    briefingBlock,
    cashAppBlock,
    invoiceBlock,
    collectionsBlock,
    spendAnalyticsBlock,
  ]
    .filter(Boolean)
    .join("\n\n")
}
