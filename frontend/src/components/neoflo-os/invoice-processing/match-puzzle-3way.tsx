// components/invoice-processing/match-puzzle-3way.tsx
//
// Side-by-side cards for the Mode A (3-way / 2-way) match-detail surface.
//   Left  — INVOICE (PARSED)   : invoice metadata + line items + totals
//   Right — NEO'S MATCH         : PO row, GRN row (if 3-way), variance summary
//
// Per docs/handoff/invoice-processing/03-screen-specs.md § "Surface 3:
// Match-detail" — Mode A diagram.
"use client"

import * as React from "react"
import { format } from "date-fns"
import { CheckCircle, Warning } from "@phosphor-icons/react"

import { PONumberLink } from "@/components/neoflo-os/invoice-processing/po-number-link"
import type {
  GoodsReceiptNote,
  Invoice,
  PurchaseOrder,
} from "@/lib/neoflo-os/invoice-processing/types"
import { cn } from "@/lib/neoflo-os/utils"

// ════════════════════════════════════════════════════════════════════
// Formatting helpers
// ════════════════════════════════════════════════════════════════════

function fmtMoney(amount: number, currency: string): string {
  const rounded = amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  if (currency === "USD") return `$${rounded}`
  return `${currency} ${rounded}`
}

function fmtDate(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy")
}

function fmtDateShort(iso: string): string {
  return format(new Date(iso), "MMM d")
}

// ════════════════════════════════════════════════════════════════════
// Component
// ════════════════════════════════════════════════════════════════════

interface MatchPuzzle3WayProps {
  invoice: Invoice
  po?: PurchaseOrder
  grn?: GoodsReceiptNote
  className?: string
}

export function MatchPuzzle3Way({
  invoice,
  po,
  grn,
  className,
}: MatchPuzzle3WayProps) {
  const proposal = invoice.matchProposal
  const subtotal = invoice.lines.reduce((s, l) => s + l.lineTotal, 0)
  const taxAmount = invoice.taxLine?.amount ?? 0
  const total = invoice.amount
  const variance = proposal?.totalVariance ?? 0
  const matchPct =
    typeof proposal?.confidence === "number"
      ? Math.round(proposal.confidence * 100)
      : undefined

  return (
    <div className={cn("grid gap-4 lg:grid-cols-2", className)}>
      {/* ── Invoice (parsed) ─────────────────────────────────────── */}
      <section className="bg-card flex flex-col gap-4 rounded-lg border p-6">
        <header className="flex items-center justify-between gap-3">
          <h2 className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            Invoice (parsed)
          </h2>
          <span className="text-muted-foreground font-mono text-xs">
            {invoice.invoiceNumber}
          </span>
        </header>

        <dl className="grid grid-cols-[7rem_1fr] gap-y-2 text-sm">
          <dt className="text-muted-foreground">Issued:</dt>
          <dd className="text-foreground">{fmtDate(invoice.issuedAt)}</dd>

          <dt className="text-muted-foreground">Due:</dt>
          <dd className="text-foreground">
            {fmtDate(invoice.dueAt)}{" "}
            <span className="text-muted-foreground">
              ({invoice.termsLabel.toLowerCase()})
            </span>
          </dd>
        </dl>

        <div className="border-border/60 flex flex-col border-t pt-4">
          <div className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
            Lines
          </div>
          {invoice.lines.map((line) => {
            const hasVariance = Boolean(line.variance)
            const LineIcon = hasVariance ? Warning : CheckCircle
            return (
              <div
                key={line.lineNumber}
                className="border-border/40 flex items-start gap-3 border-b py-2 text-sm last:border-b-0"
              >
                <LineIcon
                  size={14}
                  weight="fill"
                  className={cn(
                    "mt-0.5 shrink-0",
                    hasVariance
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  )}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-foreground">{line.description}</span>
                  <span className="text-muted-foreground text-xs">
                    {line.quantity} × {fmtMoney(line.unitPrice, invoice.currency)}{" "}
                    {line.unitOfMeasure}
                  </span>
                  {line.variance?.explanation ? (
                    <span className="text-amber-700 text-xs dark:text-amber-300">
                      Variance: {line.variance.explanation}
                    </span>
                  ) : null}
                </div>
                <span className="text-foreground shrink-0 tabular-nums">
                  {fmtMoney(line.lineTotal, invoice.currency)}
                </span>
              </div>
            )
          })}
        </div>

        <div className="ml-auto flex w-56 flex-col gap-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="text-foreground tabular-nums">
              {fmtMoney(subtotal, invoice.currency)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tax:</span>
            <span className="text-foreground tabular-nums">
              {taxAmount > 0
                ? fmtMoney(taxAmount, invoice.currency)
                : `${fmtMoney(0, invoice.currency)} (svc)`}
            </span>
          </div>
          <div className="border-border flex items-center justify-between border-t pt-1">
            <span className="text-foreground font-semibold">Total:</span>
            <span className="text-foreground font-semibold tabular-nums">
              {fmtMoney(total, invoice.currency)}
            </span>
          </div>
        </div>
      </section>

      {/* ── Neo's match ──────────────────────────────────────────── */}
      <section className="bg-card flex flex-col gap-4 rounded-lg border p-6">
        <header className="flex items-center gap-2">
          <h2 className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            Neo&rsquo;s match
          </h2>
        </header>

        {po ? (
          <div className="flex items-start gap-3">
            <CheckCircle
              size={18}
              weight="fill"
              className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
            />
            <div className="flex flex-col gap-1 text-sm">
              <div className="text-foreground inline-flex items-baseline gap-1.5 font-semibold">
                <PONumberLink
                  poId={po.id}
                  label={po.poNumber}
                  className="text-foreground hover:text-primary font-semibold"
                  mono={false}
                />
                <span className="text-muted-foreground font-normal">
                  · {po.lines[0]?.description ?? "Purchase order"}
                </span>
              </div>
              {po.expectedDeliveryAt ? (
                <div className="text-muted-foreground text-xs">
                  Expected delivery: {fmtDate(po.expectedDeliveryAt)}
                </div>
              ) : null}
              <div className="text-muted-foreground text-xs">
                Approved by: {po.approver}
              </div>
            </div>
          </div>
        ) : null}

        {grn ? (
          <div className="flex items-start gap-3">
            <CheckCircle
              size={18}
              weight="fill"
              className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
            />
            <div className="flex flex-col gap-1 text-sm">
              <div className="text-foreground font-semibold">
                {grn.grnNumber}{" "}
                <span className="text-muted-foreground font-normal">
                  ·{" "}
                  {grn.isServiceConfirmation
                    ? "Service confirmed"
                    : "Goods received"}
                </span>
              </div>
              {grn.serviceperiod ? (
                <div className="text-muted-foreground text-xs">
                  Performed: {fmtDateShort(grn.serviceperiod.start)}–
                  {fmtDateShort(grn.serviceperiod.end)}
                </div>
              ) : (
                <div className="text-muted-foreground text-xs">
                  Received: {fmtDate(grn.receivedAt)}
                </div>
              )}
              <div className="text-muted-foreground text-xs">
                Verified: {grn.verifiedBy} ({fmtDateShort(grn.verifiedAt)})
              </div>
            </div>
          </div>
        ) : null}

        {proposal ? (
          <div className="border-border/60 mt-2 flex items-center justify-between border-t pt-4 text-sm">
            <span className="text-muted-foreground">Variance:</span>
            <span
              className={cn(
                "font-semibold tabular-nums",
                variance === 0
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-amber-700 dark:text-amber-300"
              )}
            >
              {fmtMoney(variance, invoice.currency)}
              {matchPct !== undefined ? (
                <span className="text-muted-foreground font-normal">
                  {" "}
                  · {matchPct}% match
                </span>
              ) : null}
            </span>
          </div>
        ) : null}

        {proposal?.reasoning ? (
          <p className="text-foreground/80 text-xs leading-relaxed">
            {proposal.reasoning}
          </p>
        ) : null}
      </section>
    </div>
  )
}
