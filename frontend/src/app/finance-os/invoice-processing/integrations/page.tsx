// app/neoflo-workspace/invoice-processing/integrations/page.tsx
//
// Invoice-processing integrations panel — 4-section grid (ERP / Payments /
// Supplier portals / Tax compliance), 14 cards total. Per
// docs/handoff/invoice-processing/03-screen-specs.md § "Surface 6:
// Integrations".
//
// The card visual is implemented in components/invoice-processing/integration-card.tsx.
// The shape mirrors cash-app and helpdesk's IntegrationCard — see the
// component file for the P2-extraction note.
"use client"

import * as React from "react"

import { IntegrationCard } from "@/components/neoflo-os/invoice-processing/integration-card"
import { PageHeader } from "@/components/neoflo-os/page-header"
import { getIntegrationsByCategory } from "@/lib/neoflo-os/invoice-processing/integrations"
import type { IntegrationCategory } from "@/lib/neoflo-os/invoice-processing/types"

const SECTIONS: { key: IntegrationCategory; label: string }[] = [
  { key: "erp", label: "ERP" },
  { key: "payments", label: "Payments" },
  { key: "supplier-portals", label: "Supplier portals" },
  { key: "tax-compliance", label: "Tax / compliance" },
]

export default function InvoiceProcessingIntegrationsPage() {
  const grouped = React.useMemo(() => getIntegrationsByCategory(), [])

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
                    <IntegrationCard key={entry.id} integration={entry} />
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
