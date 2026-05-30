// app/neoflo-workspace/collections/page.tsx
//
// Collections dashboard surface — the entry to the worklist (A hero), the
// dispute resolver (C hero), the account-hold escalation (D hero), and the
// 12-email ready batch (E hero).
// Layout source-of-truth: docs/handoff/collections/03-screen-specs.md
// § "Surface 1: Dashboard".
//
// Chrome (WorkspaceHeader, CollectionsTabs, ChatThread) is owned by
// app/neoflo-workspace/collections/layout.tsx — this page renders only the body.
"use client"

import * as React from "react"
import { PaperPlaneTilt, Sparkle } from "@phosphor-icons/react"

import { AgingMixChart } from "@/components/neoflo-os/collections/aging-mix-chart"
import { NeedsEyesCard } from "@/components/neoflo-os/collections/needs-eyes-card"
import { ReadyBatchPanel } from "@/components/neoflo-os/collections/ready-batch-panel"
import { KpiCard } from "@/components/neoflo-os/kpi-card"
import { Button } from "@/components/neoflo-os/ui/button"
import { Card } from "@/components/neoflo-os/ui/card"
import { Input } from "@/components/neoflo-os/ui/input"
import { NeoChip } from "@/components/neoflo-os/workspace/neo-chip"
import {
  getAgingMix,
  getCollectionsKpiSnapshot,
  getNeedsEyesCards,
  getReadyBatchSummary,
} from "@/lib/neoflo-os/collections/derive"
import { useCanSee, useGuardedSurface } from "@/lib/neoflo-os/users/permissions"

// Hardcoded to the seed-anchor date so KPI / chat / prose stay coherent with
// the PRD's Sasha day-in-life narrative. Don't use new Date() — that would
// drift away from the seed.
const DEMO_TODAY_LABEL = "May 15"

function fmtCompactDollars(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`
  return `$${n.toLocaleString("en-US")}`
}

function openChat() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent("neo:open-chat"))
}

export default function CollectionsDashboardPage() {
  // URL guard: if the active role can't see the dashboard, redirect to the
  // worklist (the most common clerk fallback) or back to workspace home.
  const canWorklist = useCanSee("collections:worklist")
  const fallback = canWorklist
    ? "/neoflo-workspace/collections/worklist"
    : "/neoflo-workspace"
  const allowed = useGuardedSurface("collections:dashboard", fallback)

  const kpis = getCollectionsKpiSnapshot()
  const aging = getAgingMix()
  const cards = getNeedsEyesCards()
  const batch = getReadyBatchSummary()

  const [draft, setDraft] = React.useState("")

  if (!allowed) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("neo:open-chat", { detail: { prompt: draft } }),
      )
    }
    setDraft("")
  }

  return (
    <div className="flex-1 overflow-auto px-10 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        {/* Page header bar */}
        <div className="flex items-baseline justify-between">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Collections this morning
          </h1>
          <span className="text-muted-foreground text-sm">
            {DEMO_TODAY_LABEL}
          </span>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <KpiCard
            label="DSO"
            value={`${kpis.dsoCurrent} days`}
            delta={`+${kpis.dsoCurrent - kpis.dsoTarget}`}
            direction="up"
            intent="bad"
            hint={`(target ${kpis.dsoTarget})`}
          />
          <KpiCard
            label="Overdue"
            value={fmtCompactDollars(kpis.totalOverdueDollars)}
            delta="-$84K"
            direction="down"
            intent="good"
            hint="vs last Mon · 120 customers"
          />
          <KpiCard
            label="At risk"
            value={fmtCompactDollars(kpis.atRisk60PlusDollars)}
            delta="+$32K"
            direction="up"
            intent="bad"
            hint="WoW · 60+ aging"
          />
          <KpiCard
            label="Need your eyes"
            value={String(kpis.needsEyesCount)}
            delta="+1"
            direction="up"
            intent="bad"
            hint="vs yesterday"
          />
        </div>

        {/* Aging mix */}
        <section className="flex flex-col gap-3">
          <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Aging mix
          </div>
          <Card className="px-5">
            <AgingMixChart buckets={aging} />
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
              Drafted 18 dunning emails for your batch — 12 routine ready to
              send, 4 need your eyes. Resolved a $4,200 dispute from Atlantic
              Industrial — credit memo for $63 short-shipment ready. Recommend
              account hold on Pacific Distribution (95d, $120K, 3 ignored
              emails). Want to start with the broken promise?
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
              key={c.caseId}
              type={c.type}
              customerName={c.customerName}
              amount={c.amount}
              agingSummary={c.agingSummary}
              summary={c.summary}
              routeHref={c.routeHref}
            />
          ))}
        </section>

        {/* Ready to send */}
        <ReadyBatchPanel
          totalCount={batch.totalCount}
          totalDollars={batch.totalDollars}
          byTier={batch.byTier}
        />

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
    </div>
  )
}
