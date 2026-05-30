// components/cash-app/aging-bar-chart.tsx
//
// Inline horizontal bar chart for the dashboard's "Unapplied cash by aging"
// panel. No chart library — keeps the bundle lean for what is one chart on
// one surface. Source-of-truth layout: docs/handoff/cash-app/03-screen-specs.md
// § "Surface 1: Dashboard" → aging chart block.
"use client"

import * as React from "react"

import { cn } from "@/lib/neoflo-os/utils"

type AgingBucketKey = "current" | "1-7d" | "8-30d" | "30+d"

interface AgingBucket {
  bucket: AgingBucketKey
  totalDollars: number
  count: number
}

interface AgingBarChartProps {
  buckets: AgingBucket[]
  className?: string
}

const BUCKET_LABEL: Record<AgingBucketKey, string> = {
  current: "Current",
  "1-7d": "1-7 days",
  "8-30d": "8-30 days",
  "30+d": "30+ days",
}

// Per the spec § "Visual details": status-tone bars at 40% opacity. These are
// allowed Tailwind palette tokens — they're status indicators, the same
// allowance house-style.md gives <StatusBadge>.
const BUCKET_BAR_CLASS: Record<AgingBucketKey, string> = {
  current: "bg-emerald-500/40",
  "1-7d": "bg-blue-500/40",
  "8-30d": "bg-amber-500/40",
  "30+d": "bg-rose-500/40",
}

function fmtDollars(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n.toLocaleString()}`
}

export function AgingBarChart({ buckets, className }: AgingBarChartProps) {
  const total = buckets.reduce((sum, b) => sum + b.totalDollars, 0)
  const max = Math.max(1, ...buckets.map((b) => b.totalDollars))

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {buckets.map((b) => {
        const widthPct = max === 0 ? 0 : (b.totalDollars / max) * 100
        const sharePct = total === 0 ? 0 : (b.totalDollars / total) * 100
        return (
          <div
            key={b.bucket}
            className="group/bar grid grid-cols-[7rem_1fr_5rem] items-center gap-3"
            title={`${b.count} payment${b.count === 1 ? "" : "s"} · ${sharePct.toFixed(0)}% of total`}
          >
            <span className="text-muted-foreground text-xs font-medium">
              {BUCKET_LABEL[b.bucket]}
            </span>
            <div className="bg-muted relative h-6 overflow-hidden rounded-md">
              <div
                className={cn(
                  "h-full rounded-md transition-all",
                  BUCKET_BAR_CLASS[b.bucket]
                )}
                style={{ width: `${widthPct}%` }}
              />
              {/* Hover tooltip */}
              <div className="bg-foreground text-background pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium opacity-0 shadow-md transition-opacity group-hover/bar:opacity-100">
                {b.count} payment{b.count === 1 ? "" : "s"} ·{" "}
                {sharePct.toFixed(0)}% of total
              </div>
            </div>
            <span className="text-foreground text-right text-xs font-semibold tabular-nums">
              {fmtDollars(b.totalDollars)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
