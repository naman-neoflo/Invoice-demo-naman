// components/cash-app/payment-row.tsx
//
// One row in the cash-app inbox table. Per docs/handoff/cash-app/03-screen-specs.md
// § "Surface 2: Inbox" → status icon + customer name + amount + channel pill +
// status text + reason (if short-pay) + Action button. The whole row is a Link
// that navigates to /workspace/cash-app/match/[paymentId].
"use client"

import * as React from "react"
import { Link } from "next-view-transitions"
import {
  ArrowRight,
  CheckCircle,
  MagnifyingGlass,
  Warning,
} from "@phosphor-icons/react"

import { getReasonCode } from "@/lib/neoflo-os/cash-app/reason-codes"
import type { Application, Payment, PaymentChannel } from "@/lib/neoflo-os/cash-app/types"
import { useBasePath } from "@/lib/neoflo-os/workspace/use-base-path"
import { cn } from "@/lib/neoflo-os/utils"

// ════════════════════════════════════════════════════════════════════
// Row "kind" derived from the payment + (optional) application
// ════════════════════════════════════════════════════════════════════

type RowKind = "auto-applied" | "short-pay" | "unapplied"

function deriveKind(payment: Payment, application?: Application): RowKind {
  if (payment.classification.label === "unapplied") return "unapplied"
  if (application?.shortPay) return "short-pay"
  if (application?.status === "needs-review") return "short-pay"
  return "auto-applied"
}

// ════════════════════════════════════════════════════════════════════
// Channel pill labels
// ════════════════════════════════════════════════════════════════════

const CHANNEL_LABEL: Record<PaymentChannel, string> = {
  "ach-email": "ACH email",
  "ach-edi-820": "ACH EDI 820",
  "ach-portal": "ACH portal",
  "ach-bank-stmt-only": "ACH bank-stmt-only",
  "wire-portal": "Wire portal",
}

// ════════════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════════════

function fmtAmount(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 100_000) return `$${(n / 1_000).toFixed(0)}K`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toLocaleString()}`
}

function fmtAmountFull(n: number): string {
  return `$${Math.round(n).toLocaleString()}`
}

// ════════════════════════════════════════════════════════════════════
// PaymentRow
// ════════════════════════════════════════════════════════════════════

interface PaymentRowProps {
  payment: Payment
  customerName: string
  application?: Application
  className?: string
}

export function PaymentRow({
  payment,
  customerName,
  application,
  className,
}: PaymentRowProps) {
  const base = useBasePath()
  const kind = deriveKind(payment, application)

  // Status icon block
  const Icon =
    kind === "auto-applied"
      ? CheckCircle
      : kind === "short-pay"
        ? Warning
        : MagnifyingGlass
  const iconBg =
    kind === "auto-applied"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
      : kind === "short-pay"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
        : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"

  // Subline: channel pill + invoice count + confidence + (optional) short-pay reason
  const invoiceCount = payment.remittance?.parsedInvoiceIds?.length ?? 0
  const confidencePct = Math.round(payment.classification.confidence * 100)

  const reasonLabel = application?.shortPay
    ? (getReasonCode(application.shortPay.reasonCode)?.label ??
      application.shortPay.reasonCode)
    : undefined

  const cta =
    kind === "auto-applied"
      ? "View"
      : kind === "short-pay"
        ? "Review"
        : "Investigate"

  return (
    <Link
      href={`${base}/cash-app/match/${payment.id}`}
      className={cn(
        "bg-card hover:border-primary/30 hover:shadow-md flex items-center gap-4 rounded-lg border p-4 transition-all",
        className
      )}
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-md",
          iconBg
        )}
      >
        <Icon size={20} weight="regular" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-foreground truncate text-sm font-semibold">
            {customerName}
          </span>
          <span className="text-foreground shrink-0 text-sm font-semibold tabular-nums">
            {fmtAmount(payment.amount)}
          </span>
        </div>

        <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className="border-border bg-muted text-muted-foreground inline-flex items-center rounded-full border px-2 py-0.5 font-medium">
            {CHANNEL_LABEL[payment.channel]}
          </span>

          {invoiceCount > 0 ? (
            <span>
              · {invoiceCount} invoice{invoiceCount === 1 ? "" : "s"}
            </span>
          ) : (
            <span>· no remittance</span>
          )}
          <span>· {confidencePct}%</span>

          {kind === "short-pay" && application?.shortPay ? (
            <span className="ml-1 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
              {reasonLabel} short-pay {fmtAmountFull(application.shortPay.amount)}
            </span>
          ) : null}

          {kind === "unapplied" ? (
            <span className="ml-1 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
              proposed match
            </span>
          ) : null}
        </div>
      </div>

      <span className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors">
        {cta}
        <ArrowRight size={12} weight="bold" />
      </span>
    </Link>
  )
}
