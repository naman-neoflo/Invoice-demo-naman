// components/spend-analytics/deferral-batch-card.tsx
//
// Neo's deferral-batch recommendation card for the cash flow planner (C hero).
// Mirrors the switching-analysis card pattern on the maverick detail: header
// with primary-tinted shell, opportunity headline + confidence pill, italic
// blockquote reasoning, sources footer.
//
// The 6-invoice table renders separately on the page so the cashflow surface
// can interleave it between the card and the action row.
//
// Per docs/handoff/spend-analytics/03-screen-specs.md § "Surface 4".
import * as React from "react"
import { CurrencyDollar } from "@phosphor-icons/react/dist/ssr"

import { Card } from "@/components/neoflo-os/ui/card"
import type { DeferralBatchProposal } from "@/lib/neoflo-os/spend-analytics/types"

interface DeferralBatchCardProps {
  batch: DeferralBatchProposal
}

function fmtCompactDollars(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n.toLocaleString("en-US")}`
}

export function DeferralBatchCard({ batch }: DeferralBatchCardProps) {
  const confidencePct = Math.round(batch.confidence * 100)
  const minShiftDays = Math.min(
    ...batch.items.map((i) => daysBetween(i.currentDueDate, i.proposedNewDate)),
  )
  const maxShiftDays = Math.max(
    ...batch.items.map((i) => daysBetween(i.currentDueDate, i.proposedNewDate)),
  )

  return (
    <Card className="border-primary/20 bg-primary/[0.03] flex flex-col gap-4 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CurrencyDollar size={16} weight="fill" className="text-primary" />
          <h2 className="text-foreground text-sm font-semibold">
            Deferral recommendation
          </h2>
        </div>
        <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold">
          {confidencePct}% confident
        </span>
      </header>

      <div className="text-foreground text-base font-medium">
        {fmtCompactDollars(batch.totalDollars)} opportunity &middot;{" "}
        {batch.itemCount} invoices &middot; shift {minShiftDays}-{maxShiftDays}{" "}
        days within terms
      </div>

      <blockquote className="text-foreground/85 border-primary/30 border-l-2 pl-4 text-sm italic leading-relaxed">
        {batch.reasoning}
      </blockquote>

      <div className="text-muted-foreground border-border/60 border-t pt-3 text-xs">
        Sources: {batch.sources.join(" · ")}
      </div>
    </Card>
  )
}

// ISO date diff in whole days. Both inputs are YYYY-MM-DD; parse as UTC to
// avoid timezone wobble on the demo seed dates.
function daysBetween(startIso: string, endIso: string): number {
  const start = Date.UTC(
    Number(startIso.slice(0, 4)),
    Number(startIso.slice(5, 7)) - 1,
    Number(startIso.slice(8, 10)),
  )
  const end = Date.UTC(
    Number(endIso.slice(0, 4)),
    Number(endIso.slice(5, 7)) - 1,
    Number(endIso.slice(8, 10)),
  )
  return Math.round((end - start) / (1000 * 60 * 60 * 24))
}
