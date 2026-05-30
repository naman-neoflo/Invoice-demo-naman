// app/neoflo-workspace/spend-analytics/cashflow/page.tsx
//
// Cash flow planner — the C hero for spend-analytics Phase 1. Renders the
// full TrendChart (400px) with the May 30 receipt-forecast reference line,
// Neo's $890K deferral-batch recommendation, the 6-invoice deferral table,
// and the approve / edit / reject action row.
//
// Per docs/handoff/spend-analytics/03-screen-specs.md § "Surface 4".
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CheckCircle } from "@phosphor-icons/react"

import { DeferralBatchCard } from "@/components/neoflo-os/spend-analytics/deferral-batch-card"
import {
  TrendChart,
  type TrendChartSeries,
} from "@/components/neoflo-os/spend-analytics/trend-chart"
import { PageHeader } from "@/components/neoflo-os/page-header"
import { Button } from "@/components/neoflo-os/ui/button"
import { Card } from "@/components/neoflo-os/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/neoflo-os/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/neoflo-os/ui/table"
import { getDeferralBatch, getTrendSeries } from "@/lib/neoflo-os/spend-analytics/derive"
import {
  useHydratedSpendAnalyticsStore,
  useSpendAnalyticsStore,
} from "@/lib/neoflo-os/spend-analytics/spend-analytics-store"
import type { RangePreset } from "@/lib/neoflo-os/spend-analytics/types"

// ════════════════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════════════════

const MONTH_NAMES_SHORT = [
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

function formatIsoMonthDay(iso: string): string {
  const m = Number(iso.slice(5, 7))
  const d = Number(iso.slice(8, 10))
  if (!m || !d) return iso
  return `${MONTH_NAMES_SHORT[m - 1]} ${d}`
}

function fmtDollarsFull(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`
}

function fmtCompactDollars(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? "-" : ""
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}K`
  return `${sign}$${abs.toLocaleString("en-US")}`
}

// ════════════════════════════════════════════════════════════════════════
// Page
// ════════════════════════════════════════════════════════════════════════

export default function CashFlowPlannerPage() {
  const router = useRouter()
  const batch = getDeferralBatch()

  const currentRange = useHydratedSpendAnalyticsStore((s) => s.currentRange)
  const customRange = useHydratedSpendAnalyticsStore((s) => s.customRange)
  const setRange = useHydratedSpendAnalyticsStore((s) => s.setRange)
  const deferralBatchApproved = useHydratedSpendAnalyticsStore(
    (s) => s.deferralBatchApproved,
  )

  const trend = React.useMemo(
    () => getTrendSeries({ range: currentRange, customRange }),
    [currentRange, customRange],
  )

  const series: TrendChartSeries[] = React.useMemo(
    () => [
      {
        name: "Payables",
        color: "rose",
        historicalData: trend.historical,
        forwardData: trend.forward,
      },
      {
        name: "Receivables",
        color: "emerald",
        historicalData: trend.historical,
        forwardData: trend.forward,
      },
      {
        name: "Net working capital",
        color: "indigo",
        historicalData: trend.historical,
        forwardData: trend.forward,
      },
    ],
    [trend.historical, trend.forward],
  )

  // Reference lines passed to TrendChart — surface the May 30 customer-
  // receipt anchor so the cash-flow narrative reads directly off the chart.
  // Violet keeps it visually distinct from the indigo net-WC line.
  const referenceLines = React.useMemo(
    () => [
      {
        x: "2026-05-30",
        label: "May 30 receipt forecast",
        stroke: "rgb(139, 92, 246)",
      },
    ],
    [],
  )

  const [confirmation, setConfirmation] = React.useState<string | null>(null)
  const [editOpen, setEditOpen] = React.useState(false)
  const [rejectOpen, setRejectOpen] = React.useState(false)

  function fmtTimeOfDay(): string {
    const d = new Date()
    const hh = String(d.getHours()).padStart(2, "0")
    const mm = String(d.getMinutes()).padStart(2, "0")
    return `${hh}:${mm}`
  }

  function handleApprove() {
    useSpendAnalyticsStore.getState().approveDeferralBatch()
    setConfirmation(
      `6 invoices deferred at ${fmtTimeOfDay()}. Audit log signed. Visible in invoice-processing.`,
    )
    window.setTimeout(() => router.push("/neoflo-workspace/spend-analytics"), 600)
  }

  function handleReject() {
    // Phase 1: no destructive store change — just close the dialog. The
    // rejected state surfaces in the audit log post-M3 once we track the
    // recommendation lifecycle.
    setRejectOpen(false)
  }

  // Action row is hidden once the batch is approved or right after the user
  // approves and the confirmation pulse is on screen.
  const actionsHidden = deferralBatchApproved || confirmation !== null

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <PageHeader
        title="Cash flow planner · 30-day forecast"
        subtitle="Project the next 30 days of working capital and apply Neo's deferral recommendation to align outflows with the May 30 customer receipt window."
      />

      <div className="flex-1 px-8 py-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          {/* Approved-state banner — persists across reloads via the store. */}
          {deferralBatchApproved && !confirmation ? (
            <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              <CheckCircle
                size={20}
                weight="fill"
                className="shrink-0 text-emerald-600 dark:text-emerald-400"
              />
              <span className="font-medium">
                Deferral applied — projected May 30 net position improved from{" "}
                {fmtCompactDollars(batch.preDeferralNetPosition)} to{" "}
                {fmtCompactDollars(batch.postDeferralNetPosition)}.
              </span>
            </div>
          ) : null}

          {/* Pulse on approve — short-lived; redirect fires after 600ms. */}
          {confirmation ? (
            <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 duration-300 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              <CheckCircle
                size={20}
                weight="fill"
                className="shrink-0 text-emerald-600 dark:text-emerald-400"
              />
              <span className="font-medium">{confirmation}</span>
            </div>
          ) : null}

          {/* Full TrendChart — 400px variant with May 30 reference line. */}
          <Card className="px-5">
            <TrendChart
              variant="full"
              series={series}
              range={currentRange}
              customRange={customRange}
              onRangeChange={(r: RangePreset, custom) => setRange(r, custom)}
              referenceLines={referenceLines}
            />
          </Card>

          {/* Neo's deferral recommendation */}
          <DeferralBatchCard batch={batch} />

          {/* Invoices to defer */}
          <section className="flex flex-col gap-3">
            <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Invoices to defer
            </div>
            <Card className="overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Inv #</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Due → New</TableHead>
                    <TableHead>Elasticity rationale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batch.items.map((item, idx) => (
                    <TableRow key={item.invoiceId}>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="text-foreground font-medium">
                          {item.vendorName}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground font-mono text-xs">
                        {item.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-foreground text-right tabular-nums">
                        {fmtDollarsFull(item.amount)}
                      </TableCell>
                      <TableCell className="text-foreground tabular-nums whitespace-nowrap">
                        {formatIsoMonthDay(item.currentDueDate)} →{" "}
                        {formatIsoMonthDay(item.proposedNewDate)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {item.elasticityRationale}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/40">
                    <TableCell />
                    <TableCell className="text-foreground font-semibold">
                      Total
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {batch.itemCount} invoices
                    </TableCell>
                    <TableCell className="text-foreground text-right font-semibold tabular-nums">
                      {fmtDollarsFull(batch.totalDollars)}
                    </TableCell>
                    <TableCell colSpan={2} />
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          </section>

          {/* Action row — hidden once the batch is approved (or during the
              confirmation pulse). */}
          {!actionsHidden ? (
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setRejectOpen(true)}
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10"
              >
                Reject
              </Button>
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                Edit batch
              </Button>
              <Button onClick={handleApprove}>
                <CheckCircle size={14} weight="bold" />
                Approve deferral batch
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Edit batch dialog (Phase 1: read-only) ─────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit deferral batch</DialogTitle>
            <DialogDescription>
              Editing individual invoices in the batch is M3. Phase 1 shows the
              current 6-invoice composition for review.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Inv #</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Due → New</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batch.items.map((item) => (
                  <TableRow key={item.invoiceId}>
                    <TableCell className="text-foreground font-medium">
                      {item.vendorName}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {item.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fmtDollarsFull(item.amount)}
                    </TableCell>
                    <TableCell className="tabular-nums whitespace-nowrap">
                      {formatIsoMonthDay(item.currentDueDate)} →{" "}
                      {formatIsoMonthDay(item.proposedNewDate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reject confirmation dialog ─────────────────────────────────── */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject the deferral recommendation?</DialogTitle>
            <DialogDescription>
              Neo&rsquo;s deferral batch will be dismissed. Working capital
              remains projected at{" "}
              {fmtCompactDollars(batch.preDeferralNetPosition)} on{" "}
              {batch.windowAnchorEvent.toLowerCase()}. You can re-run the
              analysis later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button variant="outline" onClick={handleReject}>
              Reject batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
