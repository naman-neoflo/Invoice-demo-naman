// components/invoice-processing/insights-risk-strip.tsx
//
// Replaces the PM-PDF's 2D age × status heatmap. Single horizontal bar
// with 4 colored age pills. Loses precision; gains scannability.

"use client"

import Link from "next/link"
import { ArrowRight } from "@phosphor-icons/react"

import { Card } from "@/components/neoflo-os/ui/card"
import { getAgingBuckets } from "@/lib/neoflo-os/invoice-processing/derive"
import { cn } from "@/lib/neoflo-os/utils"

const TONE_CLASS = {
  good: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  watch: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  warn: "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200",
  critical: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200",
} as const

export function InsightsRiskStrip() {
  const buckets = getAgingBuckets()

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-foreground text-sm font-semibold">Aging risk</h3>
        <Link
          href="/neoflo-workspace/invoice-processing/inbox?aged=true"
          className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs font-medium"
        >
          View aged
          <ArrowRight size={12} weight="bold" />
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {buckets.map((b) => (
          <div
            key={b.label}
            className={cn(
              "inline-flex items-baseline gap-1.5 rounded-md px-3 py-1.5",
              TONE_CLASS[b.tone]
            )}
          >
            <span className="text-base font-semibold">{b.count}</span>
            <span className="text-xs">{b.label}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
