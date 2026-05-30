// components/collections/payment-history-mini-chart.tsx
//
// P1 text-only summary of a customer's payment behavior — sits in the
// left column of the customer-detail page below the case list. A real
// time-series chart is deferred to P2; for the design demo we render a
// styled summary card pulling from `customer.behavior`.
//
// Spec: docs/handoff/collections/03-screen-specs.md § "Surface 3".
import * as React from "react"
import { ChartLineUp } from "@phosphor-icons/react"

import { Card } from "@/components/neoflo-os/ui/card"
import type { Customer } from "@/lib/neoflo-os/collections/types"

interface PaymentHistoryMiniChartProps {
  customer: Customer
}

function fmtDollars(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n.toLocaleString("en-US")}`
}

export function PaymentHistoryMiniChart({
  customer,
}: PaymentHistoryMiniChartProps) {
  const b = customer.behavior
  const volume = b.last6MonthsOrderVolume
  // Spec example: "avg 41.5d · $1.2M total over 24mo".
  // We project 24mo volume from the 6mo figure for a believable headline.
  const projected24mo = typeof volume === "number" ? volume * 4 : undefined
  const headlineParts: string[] = []
  headlineParts.push(`avg ${b.averageDaysToPay}d`)
  if (projected24mo) headlineParts.push(`${fmtDollars(projected24mo)} total`)
  headlineParts.push(`${b.monthsOnTimeHistory}mo on-time`)

  const bullets: string[] = []
  if (typeof b.silentDays === "number") {
    bullets.push(`Silent ${b.silentDays} days (no email reply)`)
  }
  if (typeof b.breachedPromiseCount === "number") {
    bullets.push(
      `${b.breachedPromiseCount} broken ${
        b.breachedPromiseCount === 1 ? "promise" : "promises"
      } in last 12 months`,
    )
  }
  if (typeof b.disputeCount === "number") {
    bullets.push(
      `${b.disputeCount} ${
        b.disputeCount === 1 ? "dispute" : "disputes"
      } in last 12 months`,
    )
  }
  if (b.relationshipTier) {
    bullets.push(`Relationship tier: ${b.relationshipTier}`)
  }
  if (typeof volume === "number") {
    bullets.push(`Last 6 months order volume: ${fmtDollars(volume)}`)
  }

  return (
    <Card className="bg-card flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <ChartLineUp size={14} weight="regular" className="text-primary" />
        <span className="text-muted-foreground text-xs uppercase tracking-wider">
          Payment history
        </span>
      </div>
      <div className="text-foreground text-sm font-medium tabular-nums">
        {headlineParts.join(" · ")}
      </div>
      {bullets.length > 0 ? (
        <ul className="text-muted-foreground flex flex-col gap-1 text-xs">
          {bullets.map((b) => (
            <li key={b}>• {b}</li>
          ))}
        </ul>
      ) : null}
    </Card>
  )
}
