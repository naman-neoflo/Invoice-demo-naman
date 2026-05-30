// app/neoflo-workspace/cash-app/integrations/page.tsx
//
// Cash-app integrations panel — 3-section grid (ERP / Payments / Banks).
// Per docs/handoff/cash-app/03-screen-specs.md § "Surface 6: Integrations panel".
//
// The card visual mirrors app/demo/helpdesk/_components/integrations-grid.tsx
// (second use of the same shape per house-style — duplicated inline; promote
// at the third use).
"use client"

import * as React from "react"
import { CheckCircle, Clock, Plus } from "@phosphor-icons/react"

import { PageHeader } from "@/components/neoflo-os/page-header"
import { StatusBadge } from "@/components/neoflo-os/status-badge"
import { Button } from "@/components/neoflo-os/ui/button"
import { Card, CardContent } from "@/components/neoflo-os/ui/card"
import { cn } from "@/lib/neoflo-os/utils"

type IntegrationStatus = "active" | "coming"

type GroupKey = "ERP" | "Payments" | "Banks"

type CashIntegration = {
  name: string
  initials: string
  category: string
  group: GroupKey
  logoBg: string
  status: IntegrationStatus
  comingLabel?: string
}

const GROUPS: { key: GroupKey; label: string }[] = [
  { key: "ERP", label: "ERP" },
  { key: "Payments", label: "Payments" },
  { key: "Banks", label: "Banks" },
]

const CASH_INTEGRATIONS: CashIntegration[] = [
  // ── ERP ──────────────────────────────────────────────────────────
  {
    name: "Oracle NetSuite",
    initials: "NS",
    category: "ERP",
    group: "ERP",
    logoBg: "bg-cyan-600",
    status: "active",
  },
  {
    name: "Sage Intacct",
    initials: "SI",
    category: "ERP",
    group: "ERP",
    logoBg: "bg-emerald-600",
    status: "coming",
    comingLabel: "Coming Q1 2026",
  },
  {
    name: "QuickBooks Online",
    initials: "QB",
    category: "ERP",
    group: "ERP",
    logoBg: "bg-emerald-500",
    status: "coming",
    comingLabel: "Coming Q1 2026",
  },
  // ── Payments ─────────────────────────────────────────────────────
  {
    name: "Tipalti",
    initials: "Ti",
    category: "Payments",
    group: "Payments",
    logoBg: "bg-violet-600",
    status: "active",
  },
  {
    name: "Bill.com",
    initials: "Bc",
    category: "Payments",
    group: "Payments",
    logoBg: "bg-sky-600",
    status: "active",
  },
  {
    name: "Stripe",
    initials: "St",
    category: "Payments",
    group: "Payments",
    logoBg: "bg-indigo-600",
    status: "coming",
    comingLabel: "Coming Q2 2026",
  },
  // ── Banks ────────────────────────────────────────────────────────
  {
    name: "JPMorgan Chase",
    initials: "JP",
    category: "Bank",
    group: "Banks",
    logoBg: "bg-blue-700",
    status: "active",
  },
  {
    name: "Bank of America",
    initials: "BA",
    category: "Bank",
    group: "Banks",
    logoBg: "bg-rose-700",
    status: "coming",
    comingLabel: "Coming Q1 2026",
  },
  {
    name: "Mercury",
    initials: "Mc",
    category: "Bank",
    group: "Banks",
    logoBg: "bg-zinc-800",
    status: "coming",
    comingLabel: "Coming Q2 2026",
  },
]

function IntegrationCard({ integration }: { integration: CashIntegration }) {
  const isActive = integration.status === "active"
  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-lg text-sm font-semibold text-white shadow-sm",
              integration.logoBg
            )}
          >
            {integration.initials}
          </div>
          {isActive ? (
            <StatusBadge tone="success">
              <CheckCircle size={12} weight="fill" />
              Active
            </StatusBadge>
          ) : (
            <StatusBadge tone="neutral">
              <Clock size={12} weight="regular" />
              {integration.comingLabel ?? "Coming soon"}
            </StatusBadge>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-foreground text-sm font-semibold">
            {integration.name}
          </span>
          <span className="text-muted-foreground text-xs">
            {integration.category}
          </span>
        </div>
        <div className="mt-auto">
          {isActive ? (
            <Button variant="outline" size="sm" disabled>
              <CheckCircle size={16} weight="fill" />
              Connected
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <Plus size={16} />
              On the roadmap
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function CashAppIntegrationsPage() {
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <PageHeader
          title="Integrations"
          subtitle="Honest by default — only NetSuite, Tipalti, Bill.com and JPMorgan Chase are productized today. The rest are scoped on the M3-M6 roadmap."
        />

        {GROUPS.map((group) => {
          const items = CASH_INTEGRATIONS.filter((i) => i.group === group.key)
          const activeCount = items.filter((i) => i.status === "active").length
          const comingCount = items.filter((i) => i.status === "coming").length
          return (
            <section key={group.key} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-foreground text-sm font-semibold">
                  {group.label}
                </h2>
                <span className="text-muted-foreground text-xs">
                  {activeCount} active · {comingCount} on roadmap
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((i) => (
                  <IntegrationCard key={i.name} integration={i} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
