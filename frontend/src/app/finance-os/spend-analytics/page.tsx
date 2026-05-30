// app/neoflo-workspace/spend-analytics/page.tsx
//
// Spend-analytics dashboard surface — the A-hero entry (working-capital
// reveal via TrendChart + DPO opportunity dialog) and entry points to the
// B + C heroes via the "Needs your eyes" stack.
//
// Layout per docs/handoff/spend-analytics/03-screen-specs.md § "Surface 1".
// Chrome (WorkspaceHeader, SpendAnalyticsTabs, ChatThread) is owned by
// app/neoflo-workspace/spend-analytics/layout.tsx — this page renders only the body.
"use client"

import * as React from "react"
import { PaperPlaneTilt, Sparkle } from "@phosphor-icons/react"

import { NeedsEyesCard } from "@/components/neoflo-os/spend-analytics/needs-eyes-card"
import { QuickInsightsPanel } from "@/components/neoflo-os/spend-analytics/quick-insights-panel"
import {
  TrendChart,
  type TrendChartSeries,
} from "@/components/neoflo-os/spend-analytics/trend-chart"
import { KpiCard } from "@/components/neoflo-os/kpi-card"
import { StatusBadge } from "@/components/neoflo-os/status-badge"
import { Button } from "@/components/neoflo-os/ui/button"
import { Card } from "@/components/neoflo-os/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/neoflo-os/ui/dialog"
import { Input } from "@/components/neoflo-os/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/neoflo-os/ui/table"
import { NeoChip } from "@/components/neoflo-os/workspace/neo-chip"
import {
  getConcentrationRanking,
  getDPOOpportunity,
  getNeedsEyesCards,
  getQuickInsights,
  getSpendKpiSnapshot,
  getTrendSeries,
  getVendor,
} from "@/lib/neoflo-os/spend-analytics/derive"
import { useHydratedSpendAnalyticsStore } from "@/lib/neoflo-os/spend-analytics/spend-analytics-store"
import type { RangePreset } from "@/lib/neoflo-os/spend-analytics/types"
import { useCanSee, useGuardedSurface } from "@/lib/neoflo-os/users/permissions"

// Hardcoded to the seed-anchor date so KPI / chat / prose stay coherent with
// the spend-analytics narrative. Don't use new Date() — that would drift
// away from the seed.
const DEMO_TODAY_LABEL = "May 16"

function fmtCompactDollars(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n.toLocaleString("en-US")}`
}

function fmtDollarsFull(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`
}

function fmtPercentFromShare(share: number): string {
  return `${(share * 100).toFixed(1)}%`
}

export default function SpendAnalyticsDashboardPage() {
  // URL guard: if the active role can't see the dashboard, redirect to the
  // cashflow page (the most common analyst fallback) or back to workspace home.
  const canCashflow = useCanSee("spend-analytics:cashflow")
  const fallback = canCashflow
    ? "/neoflo-workspace/spend-analytics/cashflow"
    : "/neoflo-workspace"
  const allowed = useGuardedSurface("spend-analytics:dashboard", fallback)

  const kpis = getSpendKpiSnapshot()
  const cards = getNeedsEyesCards()
  const insights = getQuickInsights()

  const currentRange = useHydratedSpendAnalyticsStore((s) => s.currentRange)
  const customRange = useHydratedSpendAnalyticsStore((s) => s.customRange)
  const setRange = useHydratedSpendAnalyticsStore((s) => s.setRange)

  const trend = React.useMemo(
    () => getTrendSeries({ range: currentRange, customRange }),
    [currentRange, customRange],
  )

  // TrendChart's `valueFor()` picks the right field (payables / receivables /
  // netWorkingCapital) per series name, so the same arrays can be shared across
  // all three series.
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

  // Dialogs: working-capital opportunity + concentration ranking.
  const [wcOpen, setWcOpen] = React.useState(false)
  const [concentrationOpen, setConcentrationOpen] = React.useState(false)
  const dpo = getDPOOpportunity()
  const concentration = getConcentrationRanking()

  // Ask Neo inline input
  const [draft, setDraft] = React.useState("")

  function openChat() {
    if (typeof window === "undefined") return
    window.dispatchEvent(new CustomEvent("neo:open-chat"))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("neo:open-chat", { detail: { prompt: draft } }),
      )
    }
    setDraft("")
  }

  if (!allowed) return null

  return (
    <div className="flex-1 overflow-auto px-10 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        {/* Page header bar */}
        <div className="flex items-baseline justify-between">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Working capital this morning
          </h1>
          <span className="text-muted-foreground text-sm">
            {DEMO_TODAY_LABEL}
          </span>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <KpiCard
            label="DPO"
            value={`${kpis.dpoCurrent} days`}
            delta="+1.2"
            direction="up"
            intent="good"
            hint={`QoQ · target ${kpis.dpoTarget}`}
          />
          <KpiCard
            label="AP committed"
            value={fmtCompactDollars(kpis.apCommittedNext30d)}
            delta="+11%"
            direction="up"
            intent="bad"
            hint="vs prior 30d"
          />
          <KpiCard
            label="Working capital"
            value={fmtCompactDollars(kpis.workingCapitalTrapped)}
            delta="-$240K"
            direction="down"
            intent="good"
            hint="QoQ · trapped"
          />
          <KpiCard
            label="Top-5 concentration"
            value={`${kpis.top5ConcentrationPercent}%`}
            delta="-2.1pp"
            direction="down"
            intent="good"
            hint="vs Q1 · target <50%"
          />
        </div>

        {/* TrendChart */}
        <section className="flex flex-col gap-3">
          <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Working capital position
          </div>
          <Card className="px-5">
            <TrendChart
              variant="compact"
              series={series}
              range={currentRange}
              customRange={customRange}
              onRangeChange={(r: RangePreset, custom) => setRange(r, custom)}
            />
          </Card>
        </section>

        {/* Neo today prose */}
        <section className="flex items-start gap-3">
          <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
            <Sparkle size={16} weight="fill" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-center gap-2">
              <NeoChip />
              <span className="text-muted-foreground text-xs">
                {DEMO_TODAY_LABEL}
              </span>
            </div>
            <p className="text-foreground/85 text-base leading-relaxed">
              Working capital trapped: $1.8M of cycle headroom recoverable
              from a 4-day DPO stretch &mdash; 12 vendors absorb the shift
              based on payment history and concentration. $84K of Q2 maverick
              spend flagged on Westpoint Industrial &mdash; your preferred MSA
              with Northeast saves 12%. Next 30 days: $4.7M committed, $890K
              can defer 4-7 days within terms to land in your May 30 receipt
              window. Want to start with the deferral batch?
            </p>
          </div>
        </section>

        {/* Needs your eyes */}
        <section className="flex flex-col gap-3">
          <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Needs your eyes
          </div>
          {cards.map((c) => {
            const opensDialog =
              c.type === "working-capital" || c.type === "concentration"
            return (
              <NeedsEyesCard
                key={c.type}
                type={c.type}
                title={c.title}
                meta={c.meta}
                routeHref={c.routeHref}
                cta={c.cta}
                onClick={
                  opensDialog
                    ? c.type === "working-capital"
                      ? () => setWcOpen(true)
                      : () => setConcentrationOpen(true)
                    : undefined
                }
              />
            )
          })}
        </section>

        {/* Quick insights */}
        <section className="flex flex-col gap-3">
          <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Quick insights
          </div>
          <QuickInsightsPanel insights={insights} />
        </section>

        {/* Inline "Ask Neo a follow-up..." */}
        <Card className="bg-muted/40">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-4"
          >
            <Sparkle
              size={16}
              weight="fill"
              className="text-primary shrink-0"
            />
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onFocus={openChat}
              placeholder="Ask Neo a follow-up..."
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              aria-label="Open chat"
            >
              <PaperPlaneTilt size={14} weight="fill" />
            </Button>
          </form>
        </Card>
      </div>

      {/* ── DPO opportunity dialog (12-vendor breakdown) ──────────────── */}
      <Dialog open={wcOpen} onOpenChange={setWcOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Working capital opportunity &middot;{" "}
              {fmtCompactDollars(dpo.totalFreedDollars)} &middot;{" "}
              {dpo.perVendor.length} vendors
            </DialogTitle>
            <DialogDescription>
              {dpo.globalReasoning}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Current days</TableHead>
                  <TableHead className="text-right">Stretch</TableHead>
                  <TableHead className="text-right">Freed</TableHead>
                  <TableHead>Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dpo.perVendor.map((v) => {
                  const vendor = getVendor(v.vendorId)
                  return (
                    <TableRow key={v.vendorId}>
                      <TableCell>
                        <div className="text-foreground font-medium">
                          {vendor?.name ?? v.vendorId}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {v.elasticityReasoning}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {v.currentDaysToPay}d
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        +{v.recommendedStretchDays}d
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {fmtCompactDollars(v.freedDollars)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          tone={
                            v.riskScore === "low"
                              ? "success"
                              : v.riskScore === "medium"
                                ? "warning"
                                : "danger"
                          }
                          showDot={false}
                        >
                          {v.riskScore}
                        </StatusBadge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Concentration ranking dialog (top 20) ────────────────────── */}
      <Dialog open={concentrationOpen} onOpenChange={setConcentrationOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Concentration ranking &middot; top {concentration.length}
            </DialogTitle>
            <DialogDescription>
              Top 5 vendors = {kpis.top5ConcentrationPercent}% of YTD spend.
              Industry benchmark is 8% per vendor; entries above that line
              warrant a supply-chain review.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">YTD spend</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                  <TableHead>Single-source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {concentration.map((c) => {
                  const vendor = getVendor(c.vendorId)
                  return (
                    <TableRow key={c.vendorId}>
                      <TableCell className="text-muted-foreground tabular-nums">
                        {c.rank}
                      </TableCell>
                      <TableCell>
                        <div className="text-foreground font-medium">
                          {vendor?.name ?? c.vendorId}
                        </div>
                        {c.alertNote ? (
                          <div className="text-muted-foreground text-xs">
                            {c.alertNote}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {fmtDollarsFull(c.spendYtd)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {fmtPercentFromShare(c.share)}
                      </TableCell>
                      <TableCell>
                        {c.isSingleSource ? (
                          <StatusBadge tone="danger" showDot={false}>
                            Yes
                          </StatusBadge>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            &mdash;
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

