// app/neoflo-workspace/cash-app/page.tsx
//
// Cash-app dashboard surface — the B hero moment ($2.4M unapplied cash mountain).
// Layout source-of-truth: docs/handoff/cash-app/03-screen-specs.md § "Surface 1: Dashboard".
//
// Chrome (WorkspaceHeader, CashAppTabs, ChatThread) is owned by
// app/neoflo-workspace/cash-app/layout.tsx — this page renders only the body.
"use client"

import * as React from "react"
import { Sparkle } from "@phosphor-icons/react"

import { AgingBarChart } from "@/components/neoflo-os/cash-app/aging-bar-chart"
import { NeedsEyesCard } from "@/components/neoflo-os/cash-app/needs-eyes-card"
import { NeoChip } from "@/components/neoflo-os/workspace/neo-chip"
import { KpiCard } from "@/components/neoflo-os/kpi-card"
import {
  getAgingBuckets,
  getAppliedTodayDollars,
  getKpiSnapshot,
  getNeedsEyesCards,
} from "@/lib/neoflo-os/cash-app/derive"
import { SEED_APPLICATIONS } from "@/lib/neoflo-os/cash-app/seed-applications"
import { useCanSee, useGuardedSurface } from "@/lib/neoflo-os/users/permissions"

const DEMO_TODAY_LABEL = "May 15"
const DEMO_TODAY_ISO = "2026-05-15"

function fmtDollarsHeadline(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n.toLocaleString()}`
}

export default function CashAppDashboardPage() {
  // URL guard: if the active role can't see the dashboard, redirect to the
  // inbox (the most common clerk fallback) or back to workspace home.
  const canInbox = useCanSee("cash-app:inbox")
  const fallback = canInbox
    ? "/neoflo-workspace/cash-app/inbox"
    : "/neoflo-workspace"
  const allowed = useGuardedSurface("cash-app:dashboard", fallback)

  const kpis = getKpiSnapshot()
  const buckets = getAgingBuckets()
  const cards = getNeedsEyesCards()
  const appliedToday = getAppliedTodayDollars()

  // Count of payments auto-applied today — feeds the "Neo today" prose
  // ("Applied $X across N incoming payments overnight"). Derived from seed,
  // never hardcoded.
  const autoAppliedTodayCount = React.useMemo(
    () =>
      SEED_APPLICATIONS.filter(
        (a) => a.status === "auto-applied" && a.postedToErpAt?.startsWith(DEMO_TODAY_ISO)
      ).length,
    []
  )

  // Split needs-eyes counts for the prose copy.
  const shortPayCount = cards.filter((c) => c.type === "short-pay").length
  const unappliedCount = cards.filter((c) => c.type === "unapplied").length

  if (!allowed) return null

  return (
    <div className="flex-1 overflow-auto px-10 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        {/* Page header bar */}
        <div className="flex items-baseline justify-between">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Cash position
          </h1>
          <span className="text-muted-foreground text-sm">
            {DEMO_TODAY_LABEL}
          </span>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <KpiCard
            label="Unapplied cash"
            value={fmtDollarsHeadline(kpis.unapplied)}
            delta="-32%"
            direction="down"
            intent="good"
            hint="vs last Mon"
          />
          <KpiCard
            label="Auto-match rate"
            value={`${Math.round(kpis.autoMatchRate * 100)}%`}
            delta="+4.2pp"
            direction="up"
            intent="good"
            hint="30-day avg"
          />
          <KpiCard
            label="Applied today"
            value={fmtDollarsHeadline(kpis.appliedToday)}
            delta="+18%"
            direction="up"
            intent="good"
            hint="vs daily avg"
          />
          <KpiCard
            label="Need your eyes"
            value={String(kpis.needsEyes)}
            delta="-23%"
            direction="down"
            intent="good"
            hint="vs last Fri"
          />
        </div>

        {/* Aging bar chart */}
        <section className="bg-card flex flex-col gap-4 rounded-lg border p-5">
          <h2 className="text-foreground text-sm font-semibold">
            Unapplied cash by aging
          </h2>
          <AgingBarChart buckets={buckets} />
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
              Applied {fmtDollarsHeadline(appliedToday)} of cash across{" "}
              {autoAppliedTodayCount} incoming payments overnight.{" "}
              {kpis.needsEyes} need your eyes — {shortPayCount} short-pays
              with proposed reason codes, and {unappliedCount} with no
              remittance that need customer follow-up. Want to start with the
              short-pays?
            </p>
          </div>
        </section>

        {/* Needs your eyes */}
        <section className="flex flex-col gap-3">
          <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Needs your eyes
          </div>
          {cards.map((c) => (
            <NeedsEyesCard
              key={c.paymentId}
              type={c.type}
              customerName={c.customerName}
              amount={c.amount}
              proposedReason={c.proposedReason}
              diagnostic={c.diagnostic}
              confidence={c.confidence}
              cta={c.cta}
              href={c.href}
            />
          ))}
        </section>
      </div>
    </div>
  )
}
