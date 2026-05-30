// components/collections/customer-summary-card.tsx
//
// Top-of-page customer summary block on the collections customer-detail
// surface. Spec: docs/handoff/collections/03-screen-specs.md § "Surface 3".
import * as React from "react"

import { Card } from "@/components/neoflo-os/ui/card"
import type { Customer } from "@/lib/neoflo-os/collections/types"

interface CustomerSummaryCardProps {
  customer: Customer
  totalOverdue: number
  caseCount: number
  lastContactAt?: string
  lastPaidSummary?: string
}

function fmtDollars(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`
}

function fmtDate(iso?: string): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  const month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" })
  return `${month} ${d.getUTCDate()}`
}

export function CustomerSummaryCard({
  customer,
  totalOverdue,
  caseCount,
  lastContactAt,
  lastPaidSummary,
}: CustomerSummaryCardProps) {
  return (
    <Card className="bg-card flex flex-col gap-3 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          {customer.name}{" "}
          <span className="text-muted-foreground font-mono text-sm font-normal">
            · {customer.id}
          </span>
        </h1>
        <span className="text-foreground text-xl font-semibold tabular-nums">
          {fmtDollars(totalOverdue)} overdue
        </span>
      </div>
      <dl className="text-muted-foreground grid grid-cols-1 gap-x-6 gap-y-1 text-sm md:grid-cols-2">
        <div className="flex gap-2">
          <dt>Account #</dt>
          <dd className="text-foreground font-mono text-xs">
            {customer.accountNumber}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt>Cases</dt>
          <dd className="text-foreground tabular-nums">{caseCount}</dd>
        </div>
        <div className="flex gap-2">
          <dt>Last contact</dt>
          <dd className="text-foreground">{fmtDate(lastContactAt)}</dd>
        </div>
        <div className="flex gap-2">
          <dt>Last paid</dt>
          <dd className="text-foreground">{lastPaidSummary ?? "—"}</dd>
        </div>
      </dl>
    </Card>
  )
}
