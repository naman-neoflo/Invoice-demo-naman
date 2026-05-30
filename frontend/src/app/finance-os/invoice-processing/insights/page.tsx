// app/neoflo-workspace/invoice-processing/insights/page.tsx
//
// Invoice-processing Insights tab — reporting / management view.
// Layout source-of-truth: docs/plans/2026-05-21-invoice-processing-insights-design.md
// Chrome (WorkspaceHeader, InvoiceProcessingTabs, ChatThread) is owned by
// app/neoflo-workspace/invoice-processing/layout.tsx — this page renders only the body.
// Components ① pipeline band, ② summary, ③ Neo-vs-humans, ④ bar chart, ⑤ workload
// table, ⑥ risk strip are wired in subsequent tasks C1–C6.

"use client"

import * as React from "react"
import { DownloadSimple } from "@phosphor-icons/react"
import { toast } from "sonner"

import { PageHeader } from "@/components/neoflo-os/page-header"
import { Button } from "@/components/neoflo-os/ui/button"
import { InsightsPipelineBand } from "@/components/neoflo-os/invoice-processing/insights-pipeline-band"
import { InsightsPeriodSummary } from "@/components/neoflo-os/invoice-processing/insights-period-summary"
import { InsightsNeoVsHumans } from "@/components/neoflo-os/invoice-processing/insights-neo-vs-humans"
import { InsightsWeeklyThroughput } from "@/components/neoflo-os/invoice-processing/insights-weekly-throughput"
import { InsightsWorkloadTable } from "@/components/neoflo-os/invoice-processing/insights-workload-table"
import { InsightsRiskStrip } from "@/components/neoflo-os/invoice-processing/insights-risk-strip"

// Demo anchor — must match lib/invoice-processing/derive.ts DEMO_TODAY.
const DEMO_TODAY = "2026-05-15"
const DEFAULT_DATE_FROM = "2026-04-15"  // 30 days back

export default function InvoiceProcessingInsightsPage() {
  // V1: local filter state. Persistence across navigations can move into
  // the invoice-processing store in V2 if controllers want it.
  const [dateFrom, setDateFrom] = React.useState(DEFAULT_DATE_FROM)
  const [dateTo, setDateTo] = React.useState(DEMO_TODAY)

  function handleExport() {
    toast.success("Export queued — your CSV will be ready in a moment.", {
      description: `Reporting · ${dateFrom} – ${dateTo}`,
    })
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader
        title="Insights"
        subtitle="Performance, throughput, and aging across invoice processing"
        action={
          <Button variant="outline" size="sm" onClick={handleExport}>
            <DownloadSimple size={14} weight="bold" />
            Export
          </Button>
        }
      />

      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <InsightsPipelineBand />

          <InsightsPeriodSummary dateFrom={dateFrom} dateTo={dateTo} />

          <InsightsNeoVsHumans dateFrom={dateFrom} dateTo={dateTo} />

          <InsightsWeeklyThroughput dateFrom={dateFrom} dateTo={dateTo} />

          <InsightsWorkloadTable dateFrom={dateFrom} dateTo={dateTo} />

          <InsightsRiskStrip />
        </div>
      </div>
    </div>
  )
}
