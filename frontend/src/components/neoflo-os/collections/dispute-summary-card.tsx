// components/collections/dispute-summary-card.tsx
//
// Top-of-page summary block on the dispute-detail surface — header line
// (customer · invoice · amount), reason badge, filed date, and aging days.
//
// Spec: docs/handoff/collections/03-screen-specs.md § "Surface 4 — Dispute detail".
import * as React from "react"

import { StatusBadge } from "@/components/neoflo-os/status-badge"
import { Card } from "@/components/neoflo-os/ui/card"
import type { Customer, Dispute } from "@/lib/neoflo-os/collections/types"

interface DisputeSummaryCardProps {
  dispute: Dispute
  customer: Customer
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

export function DisputeSummaryCard({
  dispute,
  customer,
}: DisputeSummaryCardProps) {
  return (
    <Card className="bg-card flex flex-col gap-3 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          {customer.name}{" "}
          <span className="text-muted-foreground font-normal">
            &middot; {dispute.invoiceNumber}
          </span>
        </h1>
        <span className="text-foreground text-xl font-semibold tabular-nums">
          {fmtDollars(dispute.disputeAmount)} dispute
        </span>
      </div>
      <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span>Filed {fmtDate(dispute.filedAt)}</span>
        <span aria-hidden="true">&middot;</span>
        <span className="flex items-center gap-1.5">
          Reason:{" "}
          <StatusBadge tone="warning" showDot={false}>
            {dispute.reasonLabel}
          </StatusBadge>
        </span>
        <span aria-hidden="true">&middot;</span>
        <span>
          Aging{" "}
          <span className="text-foreground tabular-nums">
            {dispute.agingDays}d
          </span>
        </span>
      </div>
    </Card>
  )
}
