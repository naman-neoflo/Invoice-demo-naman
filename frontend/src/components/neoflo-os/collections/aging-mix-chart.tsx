// components/collections/aging-mix-chart.tsx
//
// Horizontal aging-mix bar chart for the Collections dashboard. 5 buckets
// (current → 90+d). Click a bar → worklist filtered by that bucket.
// Source-of-truth layout: docs/handoff/collections/03-screen-specs.md
// § "Surface 1: Dashboard" → aging mix.
"use client"

import * as React from "react"
import { Link } from "next-view-transitions"

import { useBasePath } from "@/lib/neoflo-os/workspace/use-base-path"
import { cn } from "@/lib/neoflo-os/utils"

type AgingBucketKey = "current" | "1-30d" | "31-60d" | "61-90d" | "90+d"

interface AgingBucket {
  bucket: AgingBucketKey
  totalDollars: number
  customerCount: number
}

interface AgingMixChartProps {
  buckets: AgingBucket[]
  className?: string
}

const BUCKET_LABEL: Record<AgingBucketKey, string> = {
  current: "Current",
  "1-30d": "1-30 days",
  "31-60d": "31-60 days",
  "61-90d": "61-90 days",
  "90+d": "90+ days",
}

// Severity ramps from primary-tinted (healthy) → status-tone bars (escalating
// risk). Status colors here are allowed under the same house-style allowance
// that covers <StatusBadge> — they're indicators, not chrome.
const BUCKET_BAR_CLASS: Record<AgingBucketKey, string> = {
  current: "bg-primary/30",
  "1-30d": "bg-primary/45",
  "31-60d": "bg-amber-500/50",
  "61-90d": "bg-amber-600/60",
  "90+d": "bg-rose-500/60",
}

function fmtDollars(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n.toLocaleString("en-US")}`
}

export function AgingMixChart({ buckets, className }: AgingMixChartProps) {
  const base = useBasePath()
  const total = buckets.reduce((sum, b) => sum + b.totalDollars, 0)
  const max = Math.max(1, ...buckets.map((b) => b.totalDollars))

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {buckets.map((b) => {
        const widthPct = max === 0 ? 0 : (b.totalDollars / max) * 100
        const sharePct = total === 0 ? 0 : (b.totalDollars / total) * 100
        const customers = b.customerCount
        return (
          <Link
            key={b.bucket}
            href={`${base}/collections/worklist?aging=${encodeURIComponent(b.bucket)}`}
            className="group/bar grid grid-cols-[7rem_1fr_8rem] items-center gap-3 rounded-md text-left hover:bg-muted/30 transition-colors px-1 py-0.5"
            title={`${customers} customer${customers === 1 ? "" : "s"} · ${sharePct.toFixed(0)}% of total`}
          >
            <span className="text-muted-foreground text-xs font-medium">
              {BUCKET_LABEL[b.bucket]}
            </span>
            <div className="bg-muted relative h-6 overflow-hidden rounded-md">
              <div
                className={cn(
                  "h-full rounded-md transition-all",
                  BUCKET_BAR_CLASS[b.bucket],
                )}
                style={{ width: `${widthPct}%` }}
              />
              <div className="bg-foreground text-background pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium opacity-0 shadow-md transition-opacity group-hover/bar:opacity-100">
                {customers} customer{customers === 1 ? "" : "s"} ·{" "}
                {sharePct.toFixed(0)}% of total
              </div>
            </div>
            <span className="text-foreground text-right text-xs font-semibold tabular-nums">
              {fmtDollars(b.totalDollars)}
              <span className="text-muted-foreground ml-1 font-normal">
                ({sharePct.toFixed(0)}%)
              </span>
            </span>
          </Link>
        )
      })}
    </div>
  )
}
