// app/neoflo-workspace/integrations/page.tsx
//
// Company-level integrations dashboard. Replaces the per-workflow
// integrations panels (which were removed from the workflow tab strips).
// Pulls from lib/neoflo-workspace/integrations-catalog.ts — single source of truth.

"use client"

import * as React from "react"
import { Plus, Plug } from "@phosphor-icons/react"

import { Button } from "@/components/neoflo-os/ui/button"
import { Card } from "@/components/neoflo-os/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/neoflo-os/ui/dialog"
import { Input } from "@/components/neoflo-os/ui/input"
import {
  CATEGORY_LABELS,
  type IntegrationEntry,
  WORKFLOW_LABELS,
  getIntegrationsByCategory,
} from "@/lib/neoflo-os/workspace/integrations-catalog"
import { RequestIntegrationDialog } from "@/components/neoflo-os/workspace/request-integration-dialog"
import { useGuardedSurface } from "@/lib/neoflo-os/users/permissions"
import { cn } from "@/lib/neoflo-os/utils"

function IntegrationCard({ entry }: { entry: IntegrationEntry }) {
  const [open, setOpen] = React.useState(false)
  const isActive = entry.status === "active"

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl"
      >
        <Card
          className={cn(
            "group hover:border-primary/30 hover:shadow-sm transition-all h-full rounded-xl border-border/60",
            !isActive && "opacity-70 hover:opacity-100"
          )}
        >
          <div className="flex h-full flex-col gap-3 p-4">
            {/* Header: logo + name + active dot */}
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg text-white text-[11px] font-semibold tracking-wide shadow-sm",
                  entry.logoBg
                )}
              >
                {entry.initials}
              </div>
              <div className="flex flex-1 min-w-0 flex-col">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-foreground truncate text-sm font-semibold tracking-tight">
                    {entry.name}
                  </h3>
                  {isActive && (
                    <span
                      className="size-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.15)]"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <p
                  className={cn(
                    "text-xs",
                    isActive ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"
                  )}
                >
                  {isActive ? "Connected" : "Coming soon"}
                </p>
              </div>
            </div>

            {/* Scopes — only when active */}
            {isActive && entry.scopes && (
              <p className="text-muted-foreground/80 line-clamp-2 text-xs leading-relaxed">
                {entry.scopes}
              </p>
            )}

            {/* Used-by chips */}
            <div className="mt-auto flex flex-wrap gap-1 pt-1">
              {entry.usedBy.map((slug) => (
                <span
                  key={slug}
                  className="border-border/60 text-muted-foreground inline-flex items-center rounded-md border bg-transparent px-1.5 py-0.5 text-[10px] font-medium leading-tight"
                >
                  {WORKFLOW_LABELS[slug]}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg text-white text-[11px] font-semibold tracking-wide shadow-sm",
                  entry.logoBg
                )}
              >
                {entry.initials}
              </div>
              <DialogTitle>{entry.name}</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              {isActive
                ? `Connected · last sync ${entry.lastSyncMinutesAgo ?? 0} min ago · Auth: OAuth2 · Scope: ${entry.scopes ?? "—"}`
                : "Coming soon. Drop your email and we'll let you know when this integration ships."}
            </DialogDescription>
          </DialogHeader>
          {isActive ? (
            <div className="text-muted-foreground text-sm">
              <div className="text-foreground mb-1.5 font-medium">Used by</div>
              <div className="flex flex-wrap gap-1.5">
                {entry.usedBy.map((slug) => (
                  <span
                    key={slug}
                    className="bg-muted text-foreground inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                  >
                    {WORKFLOW_LABELS[slug]}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <Input
              type="email"
              placeholder="you@acmeco.com"
              aria-label="Email for integration availability notification"
            />
          )}
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>
              {isActive ? "Close" : "Notify me"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function IntegrationsPage() {
  const byCategory = getIntegrationsByCategory()
  const [requestOpen, setRequestOpen] = React.useState(false)

  const allowed = useGuardedSurface("integrations")
  if (!allowed) return null

  return (
    <div className="px-10 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              Integrations
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setRequestOpen(true)}
          >
            <Plus size={14} weight="bold" />
            Request integration
          </Button>
        </div>
        <RequestIntegrationDialog
          open={requestOpen}
          onOpenChange={setRequestOpen}
        />

        {Object.entries(byCategory).map(([categoryKey, entries]) => {
          if (entries.length === 0) return null
          const category = categoryKey as keyof typeof CATEGORY_LABELS
          return (
            <section key={category} className="flex flex-col gap-3">
              <div className="flex items-baseline gap-2">
                <Plug size={14} weight="regular" className="text-muted-foreground" />
                <h2 className="text-foreground text-base font-semibold tracking-tight">
                  {CATEGORY_LABELS[category]}
                </h2>
                <span className="text-muted-foreground text-xs">
                  {entries.filter((e) => e.status === "active").length} active ·{" "}
                  {entries.filter((e) => e.status !== "active").length} coming
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {entries.map((entry) => (
                  <IntegrationCard key={entry.id} entry={entry} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
