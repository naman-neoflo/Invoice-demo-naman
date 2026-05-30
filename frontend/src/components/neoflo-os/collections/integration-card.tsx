// components/collections/integration-card.tsx
//
// Card for a single integration entry on the collections Integrations
// surface. Active cards open a connection-details dialog; coming cards open a
// "notify me" dialog. Spec: docs/handoff/collections/03-screen-specs.md
// § "Surface 6: Integrations".
//
// TODO Phase 2: extract a shared <IntegrationCard> and refactor cash-app's,
// invoice-processing's, and collections' integrations pages to share one
// component (this would be the third use — the threshold per house-style for
// promoting a pattern). For Phase 1 we keep them duplicated so the prior
// surfaces carry zero regression risk.
"use client"

import * as React from "react"
import { Bell, CheckCircle, Circle } from "@phosphor-icons/react"

import { StatusBadge } from "@/components/neoflo-os/status-badge"
import { Button } from "@/components/neoflo-os/ui/button"
import { Card, CardContent } from "@/components/neoflo-os/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/neoflo-os/ui/dialog"
import { Input } from "@/components/neoflo-os/ui/input"
import { Label } from "@/components/neoflo-os/ui/label"
import type {
  CollectionsIntegrationEntry,
  IntegrationStatus,
} from "@/lib/neoflo-os/collections/integrations"

interface IntegrationCardProps {
  entry: CollectionsIntegrationEntry
}

function comingLabel(status: IntegrationStatus): string {
  switch (status) {
    case "coming-q1":
      return "Coming Q1"
    case "coming-q2":
      return "Coming Q2"
    case "coming-q3":
      return "Coming Q3"
    case "coming-q4":
      return "Coming Q4"
    case "active":
      return "Active"
  }
}

export function IntegrationCard({ entry }: IntegrationCardProps) {
  const isActive = entry.status === "active"
  const [open, setOpen] = React.useState(false)
  const [notifyEmail, setNotifyEmail] = React.useState("sasha@neoflo.com")
  const [notifySent, setNotifySent] = React.useState(false)

  function handleNotify() {
    setNotifySent(true)
    // Phase 1 is intentionally a no-op; we just acknowledge the click. P2
    // would wire this to a marketing-list backend.
    // eslint-disable-next-line no-console
    console.log(
      `[collections] Notify ${notifyEmail} when ${entry.name} ships`
    )
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      // Reset the notify-sent state when closing so re-opening the dialog
      // starts fresh.
      setTimeout(() => setNotifySent(false), 200)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-left w-full"
      >
        <Card className="hover:border-primary/30 hover:shadow-md flex h-full flex-col transition-all">
          <CardContent className="flex flex-1 flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="text-foreground text-base font-semibold">
                {entry.name}
              </span>
              {isActive ? (
                <StatusBadge tone="success">
                  <CheckCircle size={12} weight="fill" />
                  Active
                </StatusBadge>
              ) : (
                <StatusBadge tone="neutral">
                  <Circle size={12} weight="regular" />
                  {comingLabel(entry.status)}
                </StatusBadge>
              )}
            </div>
            {isActive && entry.scopes ? (
              <span className="text-muted-foreground text-xs italic">
                {entry.scopes}
              </span>
            ) : null}
          </CardContent>
        </Card>
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          {isActive ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle
                    size={18}
                    weight="fill"
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                  Connection details
                </DialogTitle>
                <DialogDescription>
                  {entry.name} is connected and syncing.
                </DialogDescription>
              </DialogHeader>
              <dl className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-3 text-sm">
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Last sync
                </dt>
                <dd className="text-foreground">
                  {entry.lastSyncMinutesAgo
                    ? `${entry.lastSyncMinutesAgo}m ago`
                    : "Just now"}
                </dd>
                <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Auth
                </dt>
                <dd className="text-foreground">OAuth2</dd>
                {entry.scopes ? (
                  <>
                    <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                      Scope
                    </dt>
                    <dd className="text-foreground">{entry.scopes}</dd>
                  </>
                ) : null}
              </dl>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bell size={18} className="text-muted-foreground" />
                  Notify me when ready
                </DialogTitle>
                <DialogDescription>
                  {entry.name} ships {comingLabel(entry.status).toLowerCase()}{" "}
                  2026. Get an email when it&apos;s live.
                </DialogDescription>
              </DialogHeader>
              {notifySent ? (
                <div className="border-border bg-emerald-50/50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300 flex items-center gap-2 rounded-md border p-3 text-sm">
                  <CheckCircle size={16} weight="fill" />
                  We&apos;ll email {notifyEmail} when {entry.name} is ready.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`notify-${entry.id}`}>Notify me at</Label>
                  <Input
                    id={`notify-${entry.id}`}
                    type="email"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder="you@company.com"
                  />
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Close
                </Button>
                {!notifySent ? (
                  <Button onClick={handleNotify} disabled={!notifyEmail}>
                    <Bell size={14} weight="regular" />
                    Notify me
                  </Button>
                ) : null}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
