// components/cash-app/unapplied-row.tsx
//
// Card-style row for the unapplied queue surface. Per
// docs/handoff/cash-app/03-screen-specs.md § "Surface 4: Unapplied queue".
"use client"

import * as React from "react"
import { format } from "date-fns"
import { CheckCircle, EnvelopeSimple, MagnifyingGlass } from "@phosphor-icons/react"

import { CashAppInvoiceNumberLink } from "@/components/neoflo-os/cash-app/invoice-number-link"
import { Button } from "@/components/neoflo-os/ui/button"
import type { Invoice, Payment, UnappliedItem } from "@/lib/neoflo-os/cash-app/types"
import { cn } from "@/lib/neoflo-os/utils"

interface UnappliedRowProps {
  payment: Payment
  customerName: string
  item: UnappliedItem
  proposedInvoices?: Invoice[]
  proposedConfidence?: number
  matched: boolean // true after user clicks "Confirm match"
  onConfirmMatch: () => void
  onDraftEmail: () => void
  className?: string
}

function fmtAmount(n: number): string {
  return `$${Math.round(n).toLocaleString()}`
}

function fmtAmountHeadline(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 100_000) return `$${(n / 1_000).toFixed(0)}K`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toLocaleString()}`
}

export function UnappliedRow({
  payment,
  customerName,
  item,
  proposedInvoices,
  proposedConfidence,
  matched,
  onConfirmMatch,
  onDraftEmail,
  className,
}: UnappliedRowProps) {
  const hasProposedMatch =
    proposedInvoices !== undefined && proposedInvoices.length > 0
  const confidencePct =
    typeof proposedConfidence === "number"
      ? Math.round(proposedConfidence * 100)
      : undefined

  return (
    <div
      className={cn(
        "bg-card flex flex-col gap-4 rounded-lg border p-5",
        matched && "border-emerald-200 bg-emerald-50/40 dark:border-emerald-500/30 dark:bg-emerald-500/5",
        className
      )}
    >
      {/* Header — name + amount + diagnostic */}
      <div className="flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
          {matched ? (
            <CheckCircle size={20} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
          ) : (
            <MagnifyingGlass size={20} weight="regular" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-foreground truncate text-sm font-semibold">
              {customerName}
            </span>
            <span className="text-foreground shrink-0 text-sm font-semibold tabular-nums">
              {fmtAmountHeadline(payment.amount)}
            </span>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            <span className="text-foreground font-medium">Diagnostic: </span>
            {item.diagnostic}
          </p>
        </div>
      </div>

      {/* Proposed match table (only when Neo has invoice candidates) */}
      {hasProposedMatch ? (
        <div className="border-border flex flex-col gap-2 rounded-md border p-4">
          <div className="text-muted-foreground flex items-baseline justify-between text-xs">
            <span className="font-medium uppercase tracking-wider">
              Neo&apos;s proposed match
            </span>
            {confidencePct !== undefined ? (
              <span className="tabular-nums">{confidencePct}% confidence</span>
            ) : null}
          </div>
          <div className="flex flex-col">
            {proposedInvoices!.map((inv) => (
              <div
                key={inv.id}
                className="border-border/60 grid grid-cols-[6rem_5rem_1fr_auto] items-center gap-3 border-b py-2 text-sm last:border-b-0"
              >
                <CashAppInvoiceNumberLink
                  invoiceId={inv.id}
                  label={inv.invoiceNumber}
                  className="text-foreground hover:text-primary font-medium self-start"
                />
                <span className="text-muted-foreground text-xs">
                  {format(new Date(inv.issuedAt), "MMM d")}
                </span>
                <span className="text-foreground tabular-nums">
                  {fmtAmount(inv.amount)}
                </span>
                <span className="text-muted-foreground text-xs">
                  {inv.lineSummary?.split("—")[0]?.trim() ?? ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Action row */}
      <div className="flex items-center justify-end gap-2">
        {matched ? (
          <span className="text-emerald-700 inline-flex items-center gap-1.5 text-sm font-medium dark:text-emerald-300">
            <CheckCircle size={14} weight="fill" />
            Match confirmed
          </span>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={onDraftEmail}>
              <EnvelopeSimple size={14} weight="regular" />
              Draft customer email
            </Button>
            <Button
              size="sm"
              onClick={onConfirmMatch}
              disabled={!hasProposedMatch}
              title={
                hasProposedMatch
                  ? undefined
                  : "Neo doesn't have a proposed match yet — draft an email to gather details first."
              }
            >
              <CheckCircle size={14} weight="bold" />
              Confirm match
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
