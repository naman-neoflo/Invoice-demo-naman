// components/spend-analytics/spend-pivot-table.tsx
//
// Pivot table for the spend explorer. Renders top-N rows for the selected
// dimension with a horizontal mini-bar visualization on the right. For the
// "vendor" dimension, inserts a separator row after rank 5 callng out the
// 62% top-5 concentration band.
//
// Per docs/handoff/spend-analytics/03-screen-specs.md § "Surface 2".
"use client"

import * as React from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/neoflo-os/ui/table"
import { cn } from "@/lib/neoflo-os/utils"

export type SpendPivotRow = {
  key: string
  label: string
  spend: number
  sharePercent: number
}

interface SpendPivotTableProps {
  rows: SpendPivotRow[]
  /** Dimension label used in the header (e.g., "Vendor", "Category"). */
  dimensionLabel: string
  /** True for vendor dimension — inserts the "Top 5 = 62%" separator after rank 5. */
  showTop5Separator?: boolean
  /** Currently selected/expanded row key — surfaces the Phase 1 drilldown placeholder. */
  expandedKey?: string | null
  onRowClick?: (key: string) => void
}

function fmtCompactDollars(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n.toLocaleString("en-US")}`
}

// The bar track is scaled so the largest spend in the visible set fills 100%
// of the track. Otherwise rank-1 outliers (e.g., Acme at 18%) would visually
// flatten everything below them.
function getMaxSpend(rows: SpendPivotRow[]): number {
  let max = 0
  for (const r of rows) {
    if (r.spend > max) max = r.spend
  }
  return max
}

export function SpendPivotTable({
  rows,
  dimensionLabel,
  showTop5Separator = false,
  expandedKey,
  onRowClick,
}: SpendPivotTableProps) {
  const maxSpend = React.useMemo(() => getMaxSpend(rows), [rows])

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>{dimensionLabel}</TableHead>
            <TableHead className="text-right">YTD spend</TableHead>
            <TableHead className="w-24 text-right">% of total</TableHead>
            <TableHead className="w-[180px]">
              <span className="sr-only">Bar</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, idx) => {
            const rank = idx + 1
            const trackWidthPercent =
              maxSpend > 0 ? Math.max(2, (row.spend / maxSpend) * 100) : 0
            const isExpanded = expandedKey === row.key
            const interactive = typeof onRowClick === "function"

            return (
              <React.Fragment key={row.key}>
                {/* Top-5 separator row — only emitted for the vendor dimension. */}
                {showTop5Separator && rank === 6 ? (
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableCell
                      colSpan={5}
                      className="text-muted-foreground text-center text-xs font-medium uppercase tracking-wider"
                    >
                      ──── Top 5 = 62% ────
                    </TableCell>
                  </TableRow>
                ) : null}

                <TableRow
                  className={cn(
                    interactive && "cursor-pointer",
                    isExpanded && "bg-muted/40",
                  )}
                  onClick={interactive ? () => onRowClick?.(row.key) : undefined}
                >
                  <TableCell className="text-muted-foreground tabular-nums">
                    {rank}
                  </TableCell>
                  <TableCell className="text-foreground font-medium">
                    {row.label}
                  </TableCell>
                  <TableCell className="text-foreground text-right tabular-nums">
                    {fmtCompactDollars(row.spend)}
                  </TableCell>
                  <TableCell className="text-foreground text-right tabular-nums">
                    {row.sharePercent.toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    <div className="bg-muted/60 relative h-2 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-primary/70 h-full rounded-full"
                        style={{ width: `${trackWidthPercent}%` }}
                      />
                    </div>
                  </TableCell>
                </TableRow>

                {/* Expanded drilldown panel — Phase 1 placeholder. */}
                {isExpanded ? (
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableCell />
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground py-3 text-xs italic"
                    >
                      Invoice-level drilldown for{" "}
                      <span className="text-foreground font-medium not-italic">
                        {row.label}
                      </span>{" "}
                      — coming in Phase 2.
                    </TableCell>
                  </TableRow>
                ) : null}
              </React.Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
