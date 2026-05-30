// app/neoflo-workspace/spend-analytics/explorer/page.tsx
//
// Spend explorer — pivot the $120M indirect spend by dimension (vendor /
// category / cost center / entity) and period. Click a row to surface the
// invoice-level drilldown placeholder (Phase 2).
//
// Per docs/handoff/spend-analytics/03-screen-specs.md § "Surface 2".
"use client"

import * as React from "react"

import {
  SpendPivotTable,
  type SpendPivotRow,
} from "@/components/neoflo-os/spend-analytics/spend-pivot-table"
import { FilterChip } from "@/components/neoflo-os/filter-chip"
import { PageHeader } from "@/components/neoflo-os/page-header"
import { getSpendByDimension } from "@/lib/neoflo-os/spend-analytics/derive"
import type { RangePreset } from "@/lib/neoflo-os/spend-analytics/types"

// ════════════════════════════════════════════════════════════════════════
// Dimension + period toggles
// ════════════════════════════════════════════════════════════════════════

type Dimension = "vendor" | "category" | "cost-center" | "entity"

const DIMENSIONS: Array<{ id: Dimension; label: string; columnLabel: string }> =
  [
    { id: "vendor", label: "Vendor", columnLabel: "Vendor" },
    { id: "category", label: "Category", columnLabel: "Category" },
    { id: "cost-center", label: "Cost center", columnLabel: "Cost center" },
    { id: "entity", label: "Entity", columnLabel: "Entity" },
  ]

const PERIODS: Array<{ id: RangePreset; label: string }> = [
  { id: "30d", label: "30d" },
  { id: "90d", label: "90d" },
  { id: "ytd", label: "YTD" },
  { id: "ttm", label: "TTM" },
  { id: "custom", label: "Custom" },
]

// ════════════════════════════════════════════════════════════════════════
// Page
// ════════════════════════════════════════════════════════════════════════

export default function SpendExplorerPage() {
  // Local UI state only — neither toggle persists to the spend-analytics
  // store in Phase 1. Period currently doesn't affect data (the derive
  // helper aggregates against YTD totals); the toggle is wired now for
  // forward-compat with the Phase 2 per-period attribution work.
  const [dimension, setDimension] = React.useState<Dimension>("vendor")
  const [period, setPeriod] = React.useState<RangePreset>("ytd")
  const [expandedKey, setExpandedKey] = React.useState<string | null>(null)

  const dimensionMeta =
    DIMENSIONS.find((d) => d.id === dimension) ?? DIMENSIONS[0]

  const rows: SpendPivotRow[] = React.useMemo(
    () => getSpendByDimension(dimension, period),
    [dimension, period],
  )

  function handleDimensionChange(next: Dimension) {
    if (next === dimension) return
    setDimension(next)
    setExpandedKey(null)
  }

  function handlePeriodChange(next: RangePreset) {
    if (next === period) return
    setPeriod(next)
    setExpandedKey(null)
  }

  function handleRowClick(key: string) {
    setExpandedKey((prev) => (prev === key ? null : key))
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <PageHeader
        title="Spend explorer · $120M YTD"
        subtitle="Slice your $120M of indirect spend by dimension and period."
      />

      <div className="flex-1 px-8 py-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          {/* Dimension toggle */}
          <section className="flex flex-col gap-2">
            <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Dimension
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {DIMENSIONS.map((d) => (
                <FilterChip
                  key={d.id}
                  label={d.label}
                  active={dimension === d.id}
                  onClick={() => handleDimensionChange(d.id)}
                />
              ))}
            </div>
          </section>

          {/* Period toggle */}
          <section className="flex flex-col gap-2">
            <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Period
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {PERIODS.map((p) => (
                <FilterChip
                  key={p.id}
                  label={p.label}
                  active={period === p.id}
                  onClick={() => handlePeriodChange(p.id)}
                />
              ))}
            </div>
          </section>

          {/* Pivot table */}
          <SpendPivotTable
            rows={rows}
            dimensionLabel={dimensionMeta.columnLabel}
            showTop5Separator={dimension === "vendor"}
            expandedKey={expandedKey}
            onRowClick={handleRowClick}
          />
        </div>
      </div>
    </div>
  )
}
