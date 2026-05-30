// components/spend-analytics/trend-chart.tsx
//
// First true recharts chart in the codebase. Renders a working-capital
// trend that splits cleanly at today's date:
//   - solid lines for the historical window
//   - dashed lines for the forward projection
//   - a shaded uncertainty ribbon on net working capital forward
//   - a vertical "Today" reference line
//   - optional caller-supplied reference lines (e.g. May 30 receipt anchor)
//
// Source of truth: docs/handoff/spend-analytics/03-screen-specs.md
//   § "Component: <TrendChart>".
//
// Implementation note on the band: recharts 3.x supports functional
// dataKeys on <Area>, so we hand it a single `(d) => [low, high]` getter
// and let recharts draw the ribbon natively. Cleaner than stacking two
// invisible-base areas; also avoids a separate `band_width` pre-compute
// pass over the merged dataset.
"use client"

import * as React from "react"
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Button } from "@/components/neoflo-os/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/neoflo-os/ui/dialog"
import { Input } from "@/components/neoflo-os/ui/input"
import { Label } from "@/components/neoflo-os/ui/label"
import { cn } from "@/lib/neoflo-os/utils"
import type {
  RangePreset,
  TimeSeriesForecastPoint,
  TimeSeriesPoint,
} from "@/lib/neoflo-os/spend-analytics/types"

// ════════════════════════════════════════════════════════════════════════
// Props
// ════════════════════════════════════════════════════════════════════════

export type TrendChartSeries = {
  name: "Payables" | "Receivables" | "Net working capital"
  color: "rose" | "emerald" | "indigo"
  historicalData: TimeSeriesPoint[]
  forwardData: TimeSeriesForecastPoint[]
}

export type TrendChartProps = {
  series: TrendChartSeries[]
  range: RangePreset
  customRange?: { start: string; end: string }
  onRangeChange: (
    range: RangePreset,
    customRange?: { start: string; end: string },
  ) => void
  showUncertaintyBand?: boolean
  todayMarker?: boolean
  variant: "compact" | "full"
  className?: string
  referenceLines?: Array<{ x: string; label: string; stroke?: string }>
}

// ════════════════════════════════════════════════════════════════════════
// Color resolution — raw rgb() strings instead of Tailwind classes because
// recharts wants concrete stroke / fill values it can hand to SVG. Status
// tones inside chart marks are allowed under the same house-style allowance
// that covers <StatusBadge>.
// ════════════════════════════════════════════════════════════════════════

const COLORS = {
  rose: "rgb(244, 63, 94)", // rose-500
  emerald: "rgb(16, 185, 129)", // emerald-500
  indigo: "rgb(99, 102, 241)", // indigo-500
} as const

// Mapping series name → dataKey suffix used in the merged chart dataset.
// Kept in one place so the chart, tooltip, and band stay in sync.
const KEY_BY_NAME = {
  Payables: "payables",
  Receivables: "receivables",
  "Net working capital": "netWc",
} as const

type SeriesKey = (typeof KEY_BY_NAME)[keyof typeof KEY_BY_NAME]

// ════════════════════════════════════════════════════════════════════════
// Today anchor — pinned to the demo date so the reference line lands
// consistently across all surfaces that mount the chart.
// ════════════════════════════════════════════════════════════════════════

const TODAY_ISO = "2026-05-16"

// ════════════════════════════════════════════════════════════════════════
// Chart row — one entry per unique date across all series. Historical and
// forward fields are co-located so recharts can draw both the solid and
// dashed segments off the same row.
// ════════════════════════════════════════════════════════════════════════

type ChartRow = {
  date: string
  // Historical (null on forward dates)
  payables?: number | null
  receivables?: number | null
  netWc?: number | null
  // Forward (null on historical dates)
  payables_forward?: number | null
  receivables_forward?: number | null
  netWc_forward?: number | null
  // 1-sigma bands on the forward projection
  payables_low?: number | null
  payables_high?: number | null
  receivables_low?: number | null
  receivables_high?: number | null
  netWc_low?: number | null
  netWc_high?: number | null
}

// ════════════════════════════════════════════════════════════════════════
// Data merge — combines all series + historical/forward into one row array
// indexed by date. Connects historical → forward at today by duplicating
// today's-date row into both the solid AND dashed segments.
// ════════════════════════════════════════════════════════════════════════

function mergeSeriesIntoRows(series: TrendChartSeries[]): ChartRow[] {
  const rowsByDate = new Map<string, ChartRow>()

  function ensureRow(date: string): ChartRow {
    let row = rowsByDate.get(date)
    if (!row) {
      row = { date }
      rowsByDate.set(date, row)
    }
    return row
  }

  for (const s of series) {
    const key = KEY_BY_NAME[s.name] as SeriesKey
    const forwardKey = `${key}_forward` as const

    for (const pt of s.historicalData) {
      const row = ensureRow(pt.date)
      ;(row as Record<string, unknown>)[key] = valueFor(s.name, pt)
    }

    for (const pt of s.forwardData) {
      const row = ensureRow(pt.date)
      ;(row as Record<string, unknown>)[forwardKey] = valueFor(s.name, pt)
      // Carry the 1-sigma bounds onto the row for this series.
      if (s.name === "Payables") {
        row.payables_low = pt.payablesLow
        row.payables_high = pt.payablesHigh
      } else if (s.name === "Receivables") {
        row.receivables_low = pt.receivablesLow
        row.receivables_high = pt.receivablesHigh
      } else {
        row.netWc_low = pt.netWcLow
        row.netWc_high = pt.netWcHigh
      }
    }
  }

  // Seam: weekly aggregation keys historical rows by the bucket's Monday
  // (e.g. "2026-05-11"), not by TODAY_ISO. Find the latest historical
  // bucket and seed every forward-* field with its value so the dashed
  // line starts where the solid one ends and the bands open from the
  // seam point rather than leaping out of nothing on day 1.
  const sortedDates = Array.from(rowsByDate.keys()).sort()
  let lastHistoricalDate: string | undefined
  for (const date of sortedDates) {
    if (date > TODAY_ISO) break
    const row = rowsByDate.get(date)
    if (
      row &&
      (typeof row.payables === "number" ||
        typeof row.receivables === "number" ||
        typeof row.netWc === "number")
    ) {
      lastHistoricalDate = date
    }
  }
  if (lastHistoricalDate) {
    const seam = rowsByDate.get(lastHistoricalDate)!
    if (typeof seam.payables === "number") {
      seam.payables_forward = seam.payables
      seam.payables_low ??= seam.payables
      seam.payables_high ??= seam.payables
    }
    if (typeof seam.receivables === "number") {
      seam.receivables_forward = seam.receivables
      seam.receivables_low ??= seam.receivables
      seam.receivables_high ??= seam.receivables
    }
    if (typeof seam.netWc === "number") {
      seam.netWc_forward = seam.netWc
      seam.netWc_low ??= seam.netWc
      seam.netWc_high ??= seam.netWc
    }
  }

  return Array.from(rowsByDate.values()).sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  )
}

function valueFor(
  name: TrendChartSeries["name"],
  pt: TimeSeriesPoint | TimeSeriesForecastPoint,
): number {
  if (name === "Payables") return pt.payables
  if (name === "Receivables") return pt.receivables
  return pt.netWorkingCapital
}

// ════════════════════════════════════════════════════════════════════════
// Axis formatters
// ════════════════════════════════════════════════════════════════════════

const MONTH_NAMES = [
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

function formatXAxisDate(iso: string, range: RangePreset): string {
  // ISO is YYYY-MM-DD — parse directly to avoid TZ wobble.
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return iso
  if (range === "ytd" || range === "ttm") {
    return MONTH_NAMES[m - 1]
  }
  return `${MONTH_NAMES[m - 1]} ${d}`
}

function formatTooltipDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return iso
  return `${MONTH_NAMES[m - 1]} ${d}, ${y}`
}

function formatYAxisCurrency(v: number): string {
  const abs = Math.abs(v)
  const sign = v < 0 ? "-" : ""
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  }
  if (abs >= 1_000) {
    return `${sign}$${Math.round(abs / 1_000)}K`
  }
  return `${sign}$${Math.round(abs)}`
}

function formatDollars(v: number): string {
  const abs = Math.abs(v)
  const sign = v < 0 ? "-" : ""
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(2)}M`
  }
  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toFixed(0)}K`
  }
  return `${sign}$${Math.round(abs)}`
}

// ════════════════════════════════════════════════════════════════════════
// Tooltip — combines historical + forward values for the hovered date,
// surfaces the uncertainty range on forward days.
// ════════════════════════════════════════════════════════════════════════

type TooltipPayloadEntry = {
  dataKey?: string
  value?: number | null
  payload?: ChartRow
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
}) {
  if (!active || !payload || payload.length === 0 || !label) return null

  const row = payload[0]?.payload
  if (!row) return null

  const isForward = label > TODAY_ISO
  const payables =
    row.payables_forward ?? row.payables ?? null
  const receivables =
    row.receivables_forward ?? row.receivables ?? null
  const netWc = row.netWc_forward ?? row.netWc ?? null

  return (
    <div className="bg-card border-border rounded-md border px-3 py-2 text-xs shadow-sm">
      <div className="text-foreground font-medium">
        {formatTooltipDate(label)}
        {isForward ? (
          <span className="text-muted-foreground ml-1.5 font-normal">
            · projection
          </span>
        ) : null}
      </div>
      <div className="mt-1.5 flex flex-col gap-1">
        {typeof payables === "number" ? (
          <TooltipRow color={COLORS.rose} label="Payables" value={payables} />
        ) : null}
        {typeof receivables === "number" ? (
          <TooltipRow
            color={COLORS.emerald}
            label="Receivables"
            value={receivables}
          />
        ) : null}
        {typeof netWc === "number" ? (
          <TooltipRow
            color={COLORS.indigo}
            label="Net working capital"
            value={netWc}
          />
        ) : null}
      </div>
      {isForward ? (
        <div className="text-muted-foreground mt-1.5 flex flex-col gap-0.5 border-t pt-1.5 text-[11px]">
          <span className="text-foreground font-medium">1σ band</span>
          {typeof row.payables_low === "number" &&
          typeof row.payables_high === "number" ? (
            <span>
              Payables: {formatDollars(row.payables_low)} –{" "}
              {formatDollars(row.payables_high)}
            </span>
          ) : null}
          {typeof row.receivables_low === "number" &&
          typeof row.receivables_high === "number" ? (
            <span>
              Receivables: {formatDollars(row.receivables_low)} –{" "}
              {formatDollars(row.receivables_high)}
            </span>
          ) : null}
          {typeof row.netWc_low === "number" &&
          typeof row.netWc_high === "number" ? (
            <span>
              Net: {formatDollars(row.netWc_low)} –{" "}
              {formatDollars(row.netWc_high)}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function TooltipRow({
  color,
  label,
  value,
}: {
  color: string
  label: string
  value: number
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground flex items-center gap-1.5">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: color }}
        />
        {label}
      </span>
      <span className="text-foreground tabular-nums font-medium">
        {formatDollars(value)}
      </span>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════
// Range selector chips
// ════════════════════════════════════════════════════════════════════════

const RANGE_OPTIONS: Array<{ key: RangePreset; label: string }> = [
  { key: "30d", label: "30d" },
  { key: "90d", label: "90d" },
  { key: "ytd", label: "YTD" },
  { key: "ttm", label: "TTM" },
  { key: "custom", label: "Custom" },
]

function RangeChips({
  range,
  onSelect,
}: {
  range: RangePreset
  onSelect: (next: RangePreset) => void
}) {
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Time range">
      {RANGE_OPTIONS.map((opt) => {
        const active = range === opt.key
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onSelect(opt.key)}
            aria-pressed={active}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted/60",
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════
// Custom-range modal — two native date inputs + Apply. shadcn Calendar is
// available but a 2-input dialog matches the spec's "Phase 1" fallback and
// keeps the dependency surface small.
// ════════════════════════════════════════════════════════════════════════

function CustomRangeDialog({
  open,
  onOpenChange,
  initialStart,
  initialEnd,
  onApply,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialStart?: string
  initialEnd?: string
  onApply: (range: { start: string; end: string }) => void
}) {
  const [start, setStart] = React.useState(initialStart ?? "2026-01-01")
  const [end, setEnd] = React.useState(initialEnd ?? TODAY_ISO)

  React.useEffect(() => {
    if (open) {
      setStart(initialStart ?? "2026-01-01")
      setEnd(initialEnd ?? TODAY_ISO)
    }
  }, [open, initialStart, initialEnd])

  const valid = start && end && start <= end

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Custom range</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="trend-range-start">Start</Label>
            <Input
              id="trend-range-start"
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="trend-range-end">End</Label>
            <Input
              id="trend-range-end"
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              if (!valid) return
              onApply({ start, end })
              onOpenChange(false)
            }}
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ════════════════════════════════════════════════════════════════════════
// Legend strip (below the chart)
// ════════════════════════════════════════════════════════════════════════

function LegendStrip({
  series,
  showUncertainty,
}: {
  series: TrendChartSeries[]
  showUncertainty: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
      {series.map((s) => (
        <span
          key={s.name}
          className="text-muted-foreground inline-flex items-center gap-1.5"
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ background: COLORS[s.color] }}
          />
          {s.name}
        </span>
      ))}
      <span className="text-muted-foreground text-[11px]">
        Past today = projection.
        {showUncertainty
          ? " Shaded bands = 1σ uncertainty (±5% on 14d, ±12% on 30d)."
          : ""}
      </span>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════
// Main component
// ════════════════════════════════════════════════════════════════════════

export function TrendChart({
  series,
  range,
  customRange,
  onRangeChange,
  showUncertaintyBand = true,
  todayMarker = true,
  variant,
  className,
  referenceLines,
}: TrendChartProps) {
  const [customOpen, setCustomOpen] = React.useState(false)
  const rows = React.useMemo(() => mergeSeriesIntoRows(series), [series])

  function handleRangeSelect(next: RangePreset) {
    if (next === "custom") {
      setCustomOpen(true)
      return
    }
    onRangeChange(next)
  }

  const height = variant === "full" ? 400 : 280
  const hasUncertainty =
    showUncertaintyBand &&
    series.some((s) => s.forwardData.length > 0)
  const hasPayables = series.some((s) => s.name === "Payables")
  const hasReceivables = series.some((s) => s.name === "Receivables")
  const hasNetWc = series.some((s) => s.name === "Net working capital")

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <RangeChips range={range} onSelect={handleRangeSelect} />

      <div
        role="img"
        aria-label="Working capital trend chart, payables in rose, receivables in emerald, net working capital in indigo, with forward projection and uncertainty band"
        style={{ width: "100%", height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={rows}
            margin={{ top: 16, right: 16, left: 0, bottom: 8 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="rgb(228, 228, 231)"
              strokeDasharray="2 4"
            />
            <XAxis
              dataKey="date"
              tickFormatter={(d: string) => formatXAxisDate(d, range)}
              tick={{ fontSize: 11, fill: "rgb(115, 115, 115)" }}
              tickLine={false}
              axisLine={{ stroke: "rgb(228, 228, 231)" }}
              minTickGap={28}
            />
            <YAxis
              tickFormatter={formatYAxisCurrency}
              tick={{ fontSize: 11, fill: "rgb(115, 115, 115)" }}
              tickLine={false}
              axisLine={false}
              width={64}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "rgb(115, 115, 115)", strokeDasharray: "2 4" }}
            />

            {/* 1-sigma bands — drawn before the lines so the strokes
                read on top. Functional dataKey returns [low, high]. */}
            {hasUncertainty && hasPayables ? (
              <Area
                type="monotone"
                dataKey={(d: ChartRow) =>
                  typeof d.payables_low === "number" &&
                  typeof d.payables_high === "number"
                    ? [d.payables_low, d.payables_high]
                    : (null as unknown as [number, number])
                }
                stroke="none"
                fill={COLORS.rose}
                fillOpacity={0.18}
                isAnimationActive={false}
                activeDot={false}
                legendType="none"
              />
            ) : null}
            {hasUncertainty && hasReceivables ? (
              <Area
                type="monotone"
                dataKey={(d: ChartRow) =>
                  typeof d.receivables_low === "number" &&
                  typeof d.receivables_high === "number"
                    ? [d.receivables_low, d.receivables_high]
                    : (null as unknown as [number, number])
                }
                stroke="none"
                fill={COLORS.emerald}
                fillOpacity={0.18}
                isAnimationActive={false}
                activeDot={false}
                legendType="none"
              />
            ) : null}
            {hasUncertainty && hasNetWc ? (
              <Area
                type="monotone"
                dataKey={(d: ChartRow) =>
                  typeof d.netWc_low === "number" &&
                  typeof d.netWc_high === "number"
                    ? [d.netWc_low, d.netWc_high]
                    : (null as unknown as [number, number])
                }
                stroke="none"
                fill={COLORS.indigo}
                fillOpacity={0.18}
                isAnimationActive={false}
                activeDot={false}
                legendType="none"
              />
            ) : null}

            {/* Historical solid lines */}
            {series.map((s) => {
              const key = KEY_BY_NAME[s.name]
              return (
                <Line
                  key={`${s.name}-historical`}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[s.color]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls={false}
                />
              )
            })}

            {/* Forward dashed lines */}
            {series.map((s) => {
              const key = KEY_BY_NAME[s.name]
              return (
                <Line
                  key={`${s.name}-forward`}
                  type="monotone"
                  dataKey={`${key}_forward`}
                  stroke={COLORS[s.color]}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                  connectNulls={false}
                />
              )
            })}

            {todayMarker ? (
              <ReferenceLine
                x={TODAY_ISO}
                stroke="rgb(115, 115, 115)"
                strokeDasharray="2 4"
                label={{
                  value: "Today",
                  position: "top",
                  fontSize: 10,
                  fill: "rgb(115, 115, 115)",
                }}
              />
            ) : null}

            {referenceLines?.map((rl) => (
              <ReferenceLine
                key={`${rl.x}-${rl.label}`}
                x={rl.x}
                stroke={rl.stroke ?? "rgb(99, 102, 241)"}
                strokeDasharray="3 3"
                label={{
                  value: rl.label,
                  position: "top",
                  fontSize: 10,
                  fill: rl.stroke ?? "rgb(99, 102, 241)",
                }}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <LegendStrip series={series} showUncertainty={hasUncertainty} />

      <CustomRangeDialog
        open={customOpen}
        onOpenChange={setCustomOpen}
        initialStart={customRange?.start}
        initialEnd={customRange?.end}
        onApply={(r) => onRangeChange("custom", r)}
      />
    </div>
  )
}
