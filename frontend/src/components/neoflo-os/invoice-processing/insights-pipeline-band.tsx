// components/invoice-processing/insights-pipeline-band.tsx
//
// 5-inline-stat band at the top of the Insights page — the controller's
// morning pulse. Stock view (always as-of-today); ignores date filter.
// Each stat deep-links into the Inbox with the appropriate filter.

"use client"

import Link from "next/link"

import { getOutstandingPipeline } from "@/lib/neoflo-os/invoice-processing/derive"
import { cn } from "@/lib/neoflo-os/utils"

function Stat({
  label,
  value,
  href,
  tone = "neutral",
}: {
  label: string
  value: string | number
  href: string
  tone?: "neutral" | "warn"
}) {
  return (
    <Link
      href={href}
      className="group hover:bg-muted/40 flex flex-1 flex-col gap-0.5 rounded-md px-3 py-1 transition-colors"
    >
      <span
        className={cn(
          "text-2xl font-semibold tracking-tight",
          tone === "warn"
            ? "text-amber-700 dark:text-amber-400"
            : "text-foreground"
        )}
      >
        {value}
      </span>
      <span className="text-muted-foreground text-xs uppercase tracking-wider">
        {label}
      </span>
    </Link>
  )
}

export function InsightsPipelineBand() {
  const p = getOutstandingPipeline()
  const base = "/neoflo-workspace/invoice-processing/inbox"

  return (
    <section className="bg-card border-border divide-border flex flex-wrap items-stretch divide-x rounded-lg border py-3">
      <Stat label="Total outstanding" value={p.totalOutstanding} href={base} />
      <Stat
        label="In extraction"
        value={p.inExtraction}
        href={`${base}?filter=match-review`}
      />
      <Stat
        label="In review"
        value={p.inReview}
        href={`${base}?filter=match-review`}
      />
      <Stat
        label="Outstanding value"
        value={`$${(p.outstandingValueUsd / 1_000_000).toFixed(2)}M`}
        href={base}
      />
      <Stat
        label="Aged > 7d"
        value={p.agedOver7Days}
        href={`${base}?aged=true`}
        tone="warn"
      />
    </section>
  )
}
