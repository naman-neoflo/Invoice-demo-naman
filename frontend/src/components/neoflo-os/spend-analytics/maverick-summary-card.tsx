// components/spend-analytics/maverick-summary-card.tsx
//
// Maverick detail header — vendor name + total spend + PO count +
// time period + severity badge. Mirrors the dispute-summary card pattern
// from collections.
//
// Per docs/handoff/spend-analytics/03-screen-specs.md § "Surface 3 detail".
import * as React from "react"
import { Warning } from "@phosphor-icons/react/dist/ssr"

import { StatusBadge } from "@/components/neoflo-os/status-badge"
import { Card } from "@/components/neoflo-os/ui/card"
import { getMaverickReason } from "@/lib/neoflo-os/spend-analytics/reason-codes"
import type { MaverickEvent, Vendor } from "@/lib/neoflo-os/spend-analytics/types"

interface MaverickSummaryCardProps {
  maverick: MaverickEvent
  vendor?: Vendor
  /** Display label for the category (e.g. "Industrial tools"). */
  categoryLabel?: string
}

const SEVERITY_TONE: Record<
  MaverickEvent["severity"],
  "success" | "warning" | "danger"
> = {
  low: "success",
  medium: "warning",
  high: "danger",
}

function fmtDollars(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`
}

export function MaverickSummaryCard({
  maverick,
  vendor,
  categoryLabel,
}: MaverickSummaryCardProps) {
  const vendorName = vendor?.name ?? maverick.vendorId
  const severityTone = SEVERITY_TONE[maverick.severity]
  const reasonLabel = getMaverickReason(maverick.reason).label

  return (
    <Card className="bg-card flex flex-col gap-3 p-6">
      <header className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
          <Warning size={20} weight="regular" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-foreground text-xl font-semibold tracking-tight">
              {vendorName}
            </h1>
            <span className="text-foreground text-lg tabular-nums">
              {fmtDollars(maverick.totalSpend)}
            </span>
            <span className="text-muted-foreground text-sm">
              {maverick.timePeriod}
            </span>
          </div>
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span>Category: {categoryLabel ?? maverick.category}</span>
            <span className="text-muted-foreground/40">&middot;</span>
            <span>
              {maverick.pos.length} {maverick.pos.length === 1 ? "PO" : "POs"}
            </span>
            <span className="text-muted-foreground/40">&middot;</span>
            <span>Reason: {reasonLabel}</span>
          </div>
        </div>
        <StatusBadge tone={severityTone} showDot={false}>
          {maverick.severity.toUpperCase()}
        </StatusBadge>
      </header>
    </Card>
  )
}
