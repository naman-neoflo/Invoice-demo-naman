// components/invoice-processing/insights-period-summary.tsx
//
// Single inline summary line below the pipeline band. Replaces the
// PM-PDF's 5-card cohort KPI row — same information density, ~80% less
// visual weight.

"use client"

import { getInsightsKpis } from "@/lib/neoflo-os/invoice-processing/derive"

function fmtMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toLocaleString("en-US")}`
}

function periodLabel(from: string, to: string): string {
  // "Apr 2026" when from + to are in the same month; otherwise "Apr 15 – May 15"
  // Stay on UTC for both month names and date numbers so the label doesn't
  // shift one day west of UTC (e.g., "2026-05-01" rendering as "Apr 30").
  const f = new Date(from)
  const t = new Date(to)
  const fMonth = f.toLocaleString("en-US", { month: "short", timeZone: "UTC" })
  if (f.getUTCMonth() === t.getUTCMonth() && f.getUTCFullYear() === t.getUTCFullYear()) {
    return `${fMonth} ${f.getUTCFullYear()}`
  }
  const tMonth = t.toLocaleString("en-US", { month: "short", timeZone: "UTC" })
  return `${fMonth} ${f.getUTCDate()} – ${tMonth} ${t.getUTCDate()}`
}

export function InsightsPeriodSummary({
  dateFrom,
  dateTo,
}: {
  dateFrom: string
  dateTo: string
}) {
  const k = getInsightsKpis({ dateFrom, dateTo })
  const label = periodLabel(dateFrom, dateTo)

  return (
    <div className="text-muted-foreground flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
      <span className="text-foreground font-semibold">{label}</span>
      <span className="text-muted-foreground/60">·</span>
      <span>
        <span className="text-foreground font-medium">{k.totalInvoices}</span>{" "}
        invoices
      </span>
      <span className="text-muted-foreground/60">·</span>
      <span className="text-foreground font-medium">{fmtMoney(k.totalValueUsd)}</span>
      <span className="text-muted-foreground/60">·</span>
      <span>
        STP{" "}
        <span className="text-foreground font-medium">{k.stpRatePercent}%</span>
      </span>
      <span className="text-muted-foreground/60">·</span>
      <span>
        <span className="text-foreground font-medium">{k.rejectedCount}</span>{" "}
        rejected
      </span>
      <span className="text-muted-foreground/60">·</span>
      <span>
        avg{" "}
        <span className="text-foreground font-medium">
          {k.avgProcessingMinutes.toFixed(1)} min
        </span>
      </span>
    </div>
  )
}
