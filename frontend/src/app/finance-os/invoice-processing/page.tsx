// app/neoflo-workspace/invoice-processing/page.tsx
//
// Invoice-processing dashboard surface — the B hero entry point
// (the $42.8K duplicate spotlight + the path to the A and D heroes).
// Layout source-of-truth: docs/handoff/invoice-processing/03-screen-specs.md
// § "Surface 1: Dashboard".
//
// Chrome (WorkspaceHeader, InvoiceProcessingTabs, ChatThread) is owned by
// app/neoflo-workspace/invoice-processing/layout.tsx — this page renders only the body.
"use client"

import * as React from "react"
import { PaperPlaneTilt, Sparkle } from "@phosphor-icons/react"

import { DuplicateSpotlight } from "@/components/neoflo-os/invoice-processing/duplicate-spotlight"
import { EarlyPayPanel } from "@/components/neoflo-os/invoice-processing/early-pay-panel"
import { NeedsEyesCard } from "@/components/neoflo-os/invoice-processing/needs-eyes-card"
import { KpiCard } from "@/components/neoflo-os/kpi-card"
import { Button } from "@/components/neoflo-os/ui/button"
import { Card } from "@/components/neoflo-os/ui/card"
import { Input } from "@/components/neoflo-os/ui/input"
import { NeoChip } from "@/components/neoflo-os/workspace/neo-chip"
import {
  getEarlyPayItems,
  getInvoiceKpiSnapshot,
  getNeedsEyesCards,
} from "@/lib/neoflo-os/invoice-processing/derive"
import { useCanSee, useGuardedSurface } from "@/lib/neoflo-os/users/permissions"

const DEMO_TODAY_LABEL = "May 15"

// Spec-pinned headline: the dialog reads "$46,000 paid today saves $1,840" —
// the $46,000 is the atlantic-industrial invoice amount that ships today.
const EARLY_PAY_BATCH_PAID_TODAY = 46_000

function fmtDollarsHeadline(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`
  return `$${n.toLocaleString("en-US")}`
}

function openChat() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent("neo:open-chat"))
}

export default function InvoiceProcessingDashboardPage() {
  // URL guard: if the active role can't see the dashboard, redirect to the
  // inbox (the most common clerk fallback) or back to workspace home.
  const canInbox = useCanSee("invoice-processing:inbox")
  const fallback = canInbox
    ? "/neoflo-workspace/invoice-processing/inbox"
    : "/neoflo-workspace"
  const allowed = useGuardedSurface("invoice-processing:dashboard", fallback)

  const kpis = getInvoiceKpiSnapshot()
  const cards = getNeedsEyesCards()
  const earlyPay = getEarlyPayItems()

  const [draft, setDraft] = React.useState("")

  if (!allowed) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    openChat()
    setDraft("")
  }

  return (
    <div className="flex-1 overflow-auto px-10 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        {/* Page header bar */}
        <div className="flex items-baseline justify-between">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            AP this morning
          </h1>
          <span className="text-muted-foreground text-sm">
            {DEMO_TODAY_LABEL}
          </span>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <KpiCard
            label="STP rate"
            value={`${kpis.stpRatePercent}%`}
            delta="+3.4pp"
            direction="up"
            intent="good"
            hint="vs April"
          />
          <KpiCard
            label="Duplicates prevented"
            value={fmtDollarsHeadline(kpis.duplicatesPreventedDollarsMtd)}
            delta="+$108K"
            direction="up"
            intent="good"
            hint="MTD vs April MTD"
          />
          <KpiCard
            label="Posted today"
            value={String(kpis.postedTodayCount)}
            delta="+12%"
            direction="up"
            intent="good"
            hint="vs daily avg"
          />
          <KpiCard
            label="Need your eyes"
            value={String(kpis.needsEyesCount)}
            delta="-2"
            direction="down"
            intent="good"
            hint="vs yesterday"
          />
        </div>

        {/* Duplicate spotlight — B hero entry */}
        <DuplicateSpotlight
          href="/neoflo-workspace/invoice-processing/match/inv-998123-b"
          heading="Likely duplicate — $42,800 · Acme Cleaning Services"
          body="INV-998123-B billed May 14 has identical line items to INV-998123-A — paid Apr 18 via Tipalti TIP-77492. 99% confidence. Stop the payment before the next run."
          cta="Review duplicate"
        />

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
              Posted 24 of 32 invoices straight-through overnight. Caught a
              likely duplicate from Acme Cleaning Services — $42,800 saved if
              you confirm. Coded a Singapore Stationery invoice with GST input
              tax credit at 96% confidence. {kpis.needsEyesCount} invoices need
              your eyes — start with the duplicate?
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
              key={c.invoiceId}
              type={c.type}
              invoiceId={c.invoiceId}
              vendorName={c.vendorName}
              amount={c.amount}
              currency={c.currency}
              summary={c.summary}
              confidence={c.confidence}
            />
          ))}
        </section>

        {/* Early-pay panel */}
        <EarlyPayPanel
          items={earlyPay}
          batchPaidTodayDollars={EARLY_PAY_BATCH_PAID_TODAY}
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
