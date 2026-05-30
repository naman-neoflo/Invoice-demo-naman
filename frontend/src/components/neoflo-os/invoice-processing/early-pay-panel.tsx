// components/invoice-processing/early-pay-panel.tsx
//
// Dashboard panel listing eligible early-pay discount invoices, with an
// "Approve →" CTA that opens a confirmation dialog. On approve the panel
// collapses to a "Approved" state read from the invoice-processing store.
// Spec: docs/handoff/invoice-processing/03-screen-specs.md § "Surface 1: Dashboard".
"use client"

import * as React from "react"
import { ArrowRight, CheckCircle, CurrencyDollar } from "@phosphor-icons/react"

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
import type { EarlyPayItem } from "@/lib/neoflo-os/invoice-processing/derive"
import {
  useHydratedInvoiceProcessingStore,
  useInvoiceProcessingStore,
} from "@/lib/neoflo-os/invoice-processing/invoice-processing-store"

interface EarlyPayPanelProps {
  items: EarlyPayItem[]
  /** Total dollars that would be paid today across the batch — used in the dialog copy. */
  batchPaidTodayDollars: number
}

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

function formatPayBy(iso: string): string {
  const [, mm, dd] = iso.split("-")
  const monthIdx = Number.parseInt(mm, 10) - 1
  const day = Number.parseInt(dd, 10)
  if (!Number.isFinite(monthIdx) || monthIdx < 0 || monthIdx > 11) return iso
  return `${MONTH_SHORT[monthIdx]} ${day}`
}

function fmtDollars(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`
}

export function EarlyPayPanel({ items, batchPaidTodayDollars }: EarlyPayPanelProps) {
  const approved = useHydratedInvoiceProcessingStore((s) => s.earlyPayBatchApproved)
  const approveBatch = useInvoiceProcessingStore((s) => s.approveEarlyPayBatch)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  if (items.length === 0) return null

  const totalSavings = items.reduce((sum, i) => sum + i.discountDollars, 0)
  const soonestDeadline = items.reduce(
    (min, i) => Math.min(min, i.deadlineDays),
    Number.POSITIVE_INFINITY
  )

  if (approved) {
    return (
      <Card className="border-emerald-300 bg-emerald-50/60 ring-emerald-200 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:ring-emerald-500/30">
        <div className="flex items-center gap-3 px-5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
            <CheckCircle size={18} weight="fill" />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="text-foreground text-sm font-semibold">
              Approved — early-pay batch queued for Tipalti
            </div>
            <div className="text-muted-foreground text-xs">
              {fmtDollars(batchPaidTodayDollars)} paid today saves {fmtDollars(totalSavings)}
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
              <CurrencyDollar size={16} weight="fill" />
            </div>
            <h2 className="text-foreground text-sm font-semibold">
              Early-pay discounts available
            </h2>
          </div>
          <ul className="flex flex-col gap-1.5">
            {items.map((item) => (
              <li
                key={item.invoiceId}
                className="text-foreground/85 text-sm leading-relaxed"
              >
                {item.vendorName} · {fmtDollars(item.discountDollars)} if paid by{" "}
                {formatPayBy(item.payByDate)} (2/10 net 30)
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-muted-foreground text-xs">
              Total: {fmtDollars(totalSavings)} · {soonestDeadline} days left
            </span>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              Approve
              <ArrowRight size={12} weight="bold" />
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve early-pay batch</DialogTitle>
            <DialogDescription>
              {fmtDollars(batchPaidTodayDollars)} paid today saves{" "}
              {fmtDollars(totalSavings)} across {items.length} invoice
              {items.length === 1 ? "" : "s"}. Funds release via Tipalti on the
              next run.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                approveBatch()
                setDialogOpen(false)
              }}
            >
              Approve batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
