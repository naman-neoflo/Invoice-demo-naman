// components/cash-app/match-puzzle.tsx
//
// Two stacked cards for the match-detail hero screen:
//   1. INCOMING PAYMENT — table-like rows (Customer, Amount, Channel, Reference,
//      Bank, Received, Remittance note)
//   2. ✨ Proposed match — list of invoice rows + subtotal/payment/diff
//
// Per docs/handoff/cash-app/03-screen-specs.md § "Surface 3: Match-detail".
"use client"

import * as React from "react"
import { Sparkle } from "@phosphor-icons/react"
import { format, formatDistanceToNowStrict } from "date-fns"

import { CashAppInvoiceNumberLink } from "@/components/neoflo-os/cash-app/invoice-number-link"
import type {
  Application,
  Customer,
  Invoice,
  Payment,
  PaymentChannel,
} from "@/lib/neoflo-os/cash-app/types"
import { cn } from "@/lib/neoflo-os/utils"

const CHANNEL_LABEL: Record<PaymentChannel, string> = {
  "ach-email": "ACH · email remittance",
  "ach-edi-820": "ACH · EDI 820",
  "ach-portal": "ACH · portal",
  "ach-bank-stmt-only": "ACH · bank-stmt-only",
  "wire-portal": "Wire · portal",
}

function fmtUsd(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function fmtUsdSimple(n: number): string {
  return `$${Math.round(n).toLocaleString()}`
}

interface MatchPuzzleProps {
  payment: Payment
  application: Application
  customer: Customer | undefined
  invoices: Invoice[]
  className?: string
}

export function MatchPuzzle({
  payment,
  application,
  customer,
  invoices,
  className,
}: MatchPuzzleProps) {
  const customerName = customer?.name ?? payment.extractedPayer.name

  // Derived totals for the proposed-match block.
  const subtotal = invoices.reduce((s, inv) => s + inv.amount, 0)
  const diff = subtotal - payment.amount

  // Received-at relative
  const receivedDate = new Date(payment.receivedAt)
  const receivedRel = formatDistanceToNowStrict(receivedDate, { addSuffix: true })
  const receivedLocal = format(receivedDate, "h:mm a 'EST'")

  const confidencePct = Math.round(payment.classification.confidence * 100)

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* ── Incoming payment card ────────────────────────────── */}
      <section className="bg-card flex flex-col gap-4 rounded-lg border p-6">
        <h2 className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
          Incoming payment
        </h2>
        <dl className="grid grid-cols-[10rem_1fr] gap-y-3 text-sm">
          <dt className="text-muted-foreground">Customer:</dt>
          <dd className="text-foreground font-medium">{customerName}</dd>

          <dt className="text-muted-foreground">Amount:</dt>
          <dd className="text-foreground font-semibold tabular-nums">
            {fmtUsd(payment.amount)}
          </dd>

          <dt className="text-muted-foreground">Channel:</dt>
          <dd className="text-foreground">{CHANNEL_LABEL[payment.channel]}</dd>

          <dt className="text-muted-foreground">Reference:</dt>
          <dd className="text-foreground font-mono text-xs">
            {payment.bankReference}
          </dd>

          <dt className="text-muted-foreground">Bank:</dt>
          <dd className="text-foreground">{payment.bank}</dd>

          <dt className="text-muted-foreground">Received:</dt>
          <dd className="text-foreground" suppressHydrationWarning>
            {receivedLocal} · {receivedRel}
          </dd>

          {payment.remittance?.rawText ? (
            <>
              <dt className="text-muted-foreground">Remittance note:</dt>
              <dd className="text-foreground italic">
                &ldquo;{payment.remittance.rawText}&rdquo;
              </dd>
            </>
          ) : null}
        </dl>
      </section>

      {/* ── Proposed match card ──────────────────────────────── */}
      <section className="bg-card flex flex-col gap-4 rounded-lg border p-6">
        <div className="flex items-center gap-2">
          <Sparkle size={16} weight="fill" className="text-primary" />
          <h2 className="text-foreground text-sm font-semibold">
            Proposed match ({confidencePct}% confidence)
          </h2>
        </div>

        <div className="flex flex-col">
          <div className="border-border text-muted-foreground grid grid-cols-[7rem_5rem_1fr_auto] gap-3 border-b pb-2 text-xs font-medium uppercase tracking-wider">
            <span>Invoice</span>
            <span>Issued</span>
            <span>Amount</span>
            <span className="text-right">Status</span>
          </div>
          {invoices.map((inv) => {
            const applied = application.invoiceAmounts.find(
              (a) => a.invoiceId === inv.id
            )
            const isPartial =
              applied !== undefined && applied.appliedAmount < inv.amount
            return (
              <div
                key={inv.id}
                className="border-border/60 grid grid-cols-[7rem_5rem_1fr_auto] gap-3 border-b py-3 text-sm last:border-b-0"
              >
                <CashAppInvoiceNumberLink
                  invoiceId={inv.id}
                  label={inv.invoiceNumber}
                  className="text-foreground hover:text-primary font-medium self-start"
                />
                <span className="text-muted-foreground">
                  {format(new Date(inv.issuedAt), "MMM d")}
                </span>
                <span className="text-foreground tabular-nums">
                  {fmtUsd(inv.amount)} ·{" "}
                  <span className="text-muted-foreground">
                    {inv.termsLabel}
                  </span>
                </span>
                <span
                  className={cn(
                    "text-right text-xs font-medium",
                    isPartial ? "text-amber-700" : "text-emerald-700"
                  )}
                >
                  {isPartial ? "partial" : inv.status}
                </span>
              </div>
            )
          })}
        </div>

        {/* Subtotal / Payment / Diff */}
        <div className="border-border ml-auto flex w-72 flex-col gap-1 border-t pt-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="text-foreground tabular-nums">
              {fmtUsd(subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Payment:</span>
            <span className="text-foreground tabular-nums">
              {fmtUsd(payment.amount)}
            </span>
          </div>
          <div className="border-border flex items-center justify-between border-t pt-1">
            <span className="text-foreground font-semibold">Diff:</span>
            <span
              className={cn(
                "font-semibold tabular-nums",
                diff > 0
                  ? "text-amber-700"
                  : diff < 0
                    ? "text-blue-700"
                    : "text-emerald-700"
              )}
            >
              {diff === 0 ? fmtUsd(0) : `${diff > 0 ? "" : "-"}${fmtUsdSimple(Math.abs(diff))}`}
              {diff > 0 ? " short" : diff < 0 ? " over" : ""}
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
