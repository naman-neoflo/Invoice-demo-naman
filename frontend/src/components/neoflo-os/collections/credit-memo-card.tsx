// components/collections/credit-memo-card.tsx
//
// Renders the drafted credit memo summary on the dispute-detail surface
// — memo ID, customer, amount, linked invoice, reason, approval status.
//
// Spec: docs/handoff/collections/03-screen-specs.md § "Surface 4 — C hero".
import * as React from "react"
import { Receipt } from "@phosphor-icons/react"

import { StatusBadge } from "@/components/neoflo-os/status-badge"
import { Card } from "@/components/neoflo-os/ui/card"
import { getCustomer } from "@/lib/neoflo-os/collections/seed-customers"
import { getOpenInvoice } from "@/lib/neoflo-os/collections/seed-open-invoices"
import type { CreditMemo } from "@/lib/neoflo-os/collections/types"

interface CreditMemoCardProps {
  creditMemo: CreditMemo
}

function fmtDollars(n: number): string {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

export function CreditMemoCard({ creditMemo }: CreditMemoCardProps) {
  const customer = getCustomer(creditMemo.customerId)
  const invoice = getOpenInvoice(creditMemo.linkedInvoiceId)

  const approvalLabel = creditMemo.approvalRequired
    ? creditMemo.status === "approved"
      ? "Approved"
      : "Pending approval"
    : "Auto-approved (under $100 threshold)"

  const approvalTone: React.ComponentProps<typeof StatusBadge>["tone"] =
    creditMemo.approvalRequired
      ? creditMemo.status === "approved"
        ? "success"
        : "warning"
      : "success"

  return (
    <Card className="bg-card flex flex-col gap-4 p-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Receipt size={16} weight="regular" className="text-primary" />
          <h2 className="text-foreground text-sm font-semibold">
            Drafted credit memo
          </h2>
        </div>
        <span className="text-muted-foreground font-mono text-xs">
          {creditMemo.id}
        </span>
      </header>

      <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
        <dt className="text-muted-foreground">Customer:</dt>
        <dd className="text-foreground">
          {customer?.name ?? creditMemo.customerId}
        </dd>

        <dt className="text-muted-foreground">Amount:</dt>
        <dd className="text-foreground font-semibold tabular-nums">
          {fmtDollars(creditMemo.amount)}
        </dd>

        <dt className="text-muted-foreground">Linked invoice:</dt>
        <dd className="text-foreground font-mono text-xs">
          {invoice?.invoiceNumber ?? creditMemo.linkedInvoiceId}
        </dd>

        <dt className="text-muted-foreground">Reason:</dt>
        <dd className="text-foreground">{creditMemo.reasonLabel}</dd>

        <dt className="text-muted-foreground">Accounting:</dt>
        <dd className="text-foreground/85 text-xs">
          {creditMemo.accountingTreatment}
        </dd>

        <dt className="text-muted-foreground">Approval status:</dt>
        <dd>
          <StatusBadge tone={approvalTone} showDot={false}>
            {approvalLabel}
          </StatusBadge>
        </dd>
      </dl>
    </Card>
  )
}
