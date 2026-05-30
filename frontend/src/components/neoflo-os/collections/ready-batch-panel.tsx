// components/collections/ready-batch-panel.tsx
//
// Dashboard panel summarising the 12-email "Ready to send" batch (Tier 1/2/3).
// Approve & send → confirmation Dialog → store flag flips → panel collapses to
// a sent-confirmation card. Spec: docs/handoff/collections/03-screen-specs.md
// § "Surface 1: Dashboard".
"use client"

import * as React from "react"
import { ArrowRight, CheckCircle, PaperPlaneTilt } from "@phosphor-icons/react"

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
import {
  useCollectionsStore,
  useHydratedCollectionsStore,
} from "@/lib/neoflo-os/collections/collections-store"

interface ReadyBatchPanelProps {
  totalCount: number
  totalDollars: number
  byTier: Array<{ tier: 1 | 2 | 3; count: number; dollars: number }>
}

const TIER_LABEL: Record<1 | 2 | 3, string> = {
  1: "Tier 1 (gentle reminder)",
  2: "Tier 2 (firmer)",
  3: "Tier 3 (escalation)",
}

function fmtCompactDollars(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) {
    const thousands = n / 1_000
    const rounded = thousands.toFixed(1).replace(/\.0$/, "")
    return `$${rounded}K`
  }
  return `$${n.toLocaleString("en-US")}`
}

function formatSentTimestamp(iso?: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const hh = d.getHours()
  const mm = d.getMinutes().toString().padStart(2, "0")
  const ampm = hh >= 12 ? "PM" : "AM"
  const h12 = hh % 12 === 0 ? 12 : hh % 12
  return `${h12}:${mm} ${ampm}`
}

export function ReadyBatchPanel({
  totalCount,
  totalDollars,
  byTier,
}: ReadyBatchPanelProps) {
  const approved = useHydratedCollectionsStore((s) => s.readyBatchApproved)
  const approveBatch = useCollectionsStore((s) => s.approveBulkBatch)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [sentAt, setSentAt] = React.useState<string | undefined>(undefined)

  if (totalCount === 0) return null

  if (approved) {
    const stamp = formatSentTimestamp(sentAt)
    return (
      <Card className="border-emerald-300 bg-emerald-50/60 ring-emerald-200 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:ring-emerald-500/30">
        <div className="flex items-center gap-3 px-5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
            <CheckCircle size={18} weight="fill" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="text-foreground text-sm font-semibold">
              {totalCount} emails sent
              {stamp ? ` at ${stamp}` : ""}
            </div>
            <div className="text-muted-foreground text-xs">
              {fmtCompactDollars(totalDollars)} batch queued for delivery
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <div className="flex flex-col gap-3 px-5">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md">
              <PaperPlaneTilt size={16} weight="fill" />
            </div>
            <h2 className="text-foreground text-sm font-semibold">
              Ready to send · {totalCount} routine drafted emails
            </h2>
          </div>
          <ul className="flex flex-col gap-1.5">
            {byTier.map((row) => (
              <li
                key={row.tier}
                className="text-foreground/85 text-sm leading-relaxed"
              >
                {TIER_LABEL[row.tier]}: {row.count} customer
                {row.count === 1 ? "" : "s"} · {fmtCompactDollars(row.dollars)} total
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-muted-foreground text-xs">
              Total: {fmtCompactDollars(totalDollars)} across {totalCount} customers
            </span>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              Approve &amp; send
              <ArrowRight size={12} weight="bold" />
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve and send {totalCount} emails</DialogTitle>
            <DialogDescription>
              {byTier
                .map(
                  (r) =>
                    `${TIER_LABEL[r.tier].split(" (")[0]}: ${r.count}`,
                )
                .join(", ")}{" "}
              — total {fmtCompactDollars(totalDollars)} across {totalCount}{" "}
              customers. Drafted emails will queue for delivery immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setSentAt(new Date().toISOString())
                approveBatch()
                setDialogOpen(false)
              }}
            >
              Approve &amp; send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
