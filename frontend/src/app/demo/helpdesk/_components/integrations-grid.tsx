"use client"

import * as React from "react"
import { CheckCircle, Clock, Plus } from "@phosphor-icons/react"

import { Button } from "@/components/neoflo-os/ui/button"
import { Card, CardContent } from "@/components/neoflo-os/ui/card"
import { StatusBadge } from "@/components/neoflo-os/status-badge"
import { PageHeader } from "@/components/neoflo-os/page-header"
import { INTEGRATIONS_SEED, type IntegrationSeed } from "@/lib/neoflo-os/demo-data"
import { cn } from "@/lib/neoflo-os/utils"
import { type HelpdeskPrefix } from "@/lib/neoflo-os/workspace/helpdesk-routes"

const GROUPS: IntegrationSeed["group"][] = [
  "AP Systems",
  "Payments",
  "Banks",
]

function IntegrationCard({ integration }: { integration: IntegrationSeed }) {
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

// Accepts a `prefix` for symmetry with the other helpdesk content components,
// even though this view has no internal helpdesk links.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function IntegrationsGrid({ prefix: _prefix = "/demo" }: {
  prefix?: HelpdeskPrefix
} = {}) {
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <PageHeader
          title="Integrations"
          subtitle="Honest by default — only NetSuite, Tipalti and JPMorgan Chase are productized today. The rest are scoped on the M3–M6 roadmap."
        />

        {GROUPS.map((group) => {
          const items = INTEGRATIONS_SEED.filter((i) => i.group === group)
          return (
            <section key={group} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-foreground text-sm font-semibold">
                  {group}
                </h2>
                <span className="text-muted-foreground text-xs">
                  {items.filter((i) => i.status === "active").length} active ·{" "}
                  {items.filter((i) => i.status === "coming").length} on
                  roadmap
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
