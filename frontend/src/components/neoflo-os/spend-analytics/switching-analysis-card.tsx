// components/spend-analytics/switching-analysis-card.tsx
//
// Two-column side-by-side comparison for the maverick detail surface:
//   - Left: off-MSA PO list (vendor's actual Q-spend with the PO breakdown)
//   - Right: preferred-vendor alternative (MSA dates, signed-by, agreed
//     pricing, BOM mapping note, sourcing event)
//
// Mirrors the duplicate-finding-card side-by-side InvoiceColumn shape from
// invoice-processing, adapted for MSA + PO data.
//
// Per docs/handoff/spend-analytics/03-screen-specs.md § "Surface 3 detail".
import * as React from "react"

import { Card } from "@/components/neoflo-os/ui/card"
import type {
  MaverickEvent,
  MSA,
  Vendor,
} from "@/lib/neoflo-os/spend-analytics/types"

interface SwitchingAnalysisCardProps {
  maverick: MaverickEvent
  preferredVendor?: Vendor
  preferredMsa?: MSA
}

function fmtDollars(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`
}

function fmtUnitPrice(n: number): string {
  return `$${n.toFixed(2)}`
}

function fmtMonthYear(iso: string): string {
  // ISO date "YYYY-MM-DD" — split to avoid TZ wobble.
  const [y, m] = iso.split("-").map(Number)
  if (!y || !m) return iso
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]
  return `${months[m - 1]} ${y}`
}

function fmtMonthDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return iso
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]
  return `${months[m - 1]} ${d}`
}

export function SwitchingAnalysisCard({
  maverick,
  preferredVendor,
  preferredMsa,
}: SwitchingAnalysisCardProps) {
  const totalUnits = maverick.pos.reduce(
    (sum, p) => sum + (p.unitsOrdered ?? 0),
    0,
  )
  const avgUnitPrice =
    totalUnits > 0
      ? maverick.pos.reduce(
          (sum, p) =>
            sum + (p.unitPrice ?? 0) * (p.unitsOrdered ?? 0),
          0,
        ) / totalUnits
      : 0

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* ── Left: Off-MSA spend ──────────────────────────────────────── */}
      <Card className="bg-card flex flex-col gap-4 p-6">
        <header className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
          Off-MSA spend
        </header>

        <div className="flex flex-col">
          {maverick.pos.map((po) => (
            <div
              key={po.poNumber}
              className="border-border/40 flex flex-col gap-1 border-b py-3 text-sm last:border-b-0"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-foreground font-mono text-xs font-semibold">
                  {po.poNumber}
                </span>
                <span className="text-muted-foreground text-xs">
                  {fmtMonthDay(po.date)}
                </span>
              </div>
              {typeof po.unitPrice === "number" &&
              typeof po.unitsOrdered === "number" ? (
                <div className="text-muted-foreground text-xs">
                  {fmtUnitPrice(po.unitPrice)}/unit &middot;{" "}
                  {po.unitsOrdered.toLocaleString("en-US")} units
                </div>
              ) : null}
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-muted-foreground text-xs">
                  Buyer: {po.buyer}
                </span>
                <span className="text-foreground tabular-nums">
                  {fmtDollars(po.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <dl className="border-border/60 text-muted-foreground grid grid-cols-2 gap-y-1 border-t pt-3 text-xs">
          <dt>Total</dt>
          <dd className="text-foreground text-right tabular-nums font-medium">
            {fmtDollars(maverick.totalSpend)}
          </dd>
          <dt>Avg unit price</dt>
          <dd className="text-foreground text-right tabular-nums">
            {fmtUnitPrice(avgUnitPrice)}
          </dd>
          <dt>Total units</dt>
          <dd className="text-foreground text-right tabular-nums">
            {totalUnits.toLocaleString("en-US")}
          </dd>
        </dl>
      </Card>

      {/* ── Right: Preferred alternative ─────────────────────────────── */}
      <Card className="bg-card flex flex-col gap-4 p-6">
        <header className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
          Preferred alternative
        </header>

        <div className="flex flex-col gap-1">
          <div className="text-foreground text-base font-semibold">
            {preferredVendor?.name ?? maverick.preferredVendorId}
          </div>
          {preferredMsa ? (
            <>
              <div className="text-muted-foreground text-xs">
                MSA effective {fmtMonthYear(preferredMsa.effectiveFrom)}
                {" — "}
                {fmtMonthYear(preferredMsa.effectiveUntil)}
              </div>
              <div className="text-muted-foreground text-xs">
                Signed by: {preferredMsa.signedBy}
              </div>
            </>
          ) : null}
        </div>

        {preferredMsa ? (
          <div className="border-border/60 flex flex-col gap-1 border-t pt-3">
            <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Agreed pricing
            </div>
            <p className="text-foreground/85 text-sm leading-relaxed">
              {preferredMsa.agreedPricingSummary}
            </p>
          </div>
        ) : null}

        <div className="border-border/60 flex flex-col gap-1 border-t pt-3">
          <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Specifications match
          </div>
          <p className="text-foreground/85 text-sm leading-relaxed">
            {maverick.switchingAnalysis.bomMappingNote}
          </p>
        </div>

        {preferredMsa?.sourcingEventId ? (
          <div className="border-border/60 text-muted-foreground border-t pt-3 text-xs">
            Sourcing event:{" "}
            <span className="text-foreground font-mono">
              {preferredMsa.sourcingEventId}
            </span>
          </div>
        ) : null}
      </Card>
    </div>
  )
}
