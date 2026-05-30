// app/neoflo-workspace/spend-analytics/integrations/page.tsx
//
// Spend-analytics integrations panel — 4-section grid (ERP / Procurement /
// Banking & payments / CRM), 12 cards total. Per
// docs/handoff/spend-analytics/03-screen-specs.md § "Surface 6: Integrations".
//
// The card visual is in components/spend-analytics/integration-card.tsx.
// Mirrors the collections + invoice-processing Integrations page pattern.
"use client"

import * as React from "react"

import { IntegrationCard } from "@/components/neoflo-os/spend-analytics/integration-card"
import { PageHeader } from "@/components/neoflo-os/page-header"
import { getSpendAnalyticsIntegrationsByCategory } from "@/lib/neoflo-os/spend-analytics/integrations"
import type { IntegrationCategory } from "@/lib/neoflo-os/spend-analytics/types"

const SECTIONS: { key: IntegrationCategory; label: string }[] = [
  { key: "erp", label: "ERP" },
  { key: "procurement", label: "Procurement" },
  { key: "banking-payments", label: "Banking & payments" },
  { key: "crm", label: "CRM" },
]

export default function SpendAnalyticsIntegrationsPage() {
  const grouped = React.useMemo(
    () => getSpendAnalyticsIntegrationsByCategory(),
    [],
  )

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader
        title="Integrations"
        subtitle="Neo reads from your existing stack and posts back. No data moves outside your tenancy."
      />

      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          {SECTIONS.map((section) => {
            const items = grouped[section.key] ?? []
            const activeCount = items.filter((i) => i.status === "active").length
            const comingCount = items.length - activeCount
            return (
              <section key={section.key} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-foreground text-sm font-semibold">
                    {section.label}
                  </h2>
                  <span className="text-muted-foreground text-xs">
                    {activeCount} active · {comingCount} on roadmap
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((entry) => (
                    <IntegrationCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
