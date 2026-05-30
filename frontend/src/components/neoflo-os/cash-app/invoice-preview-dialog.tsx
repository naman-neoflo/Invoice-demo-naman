// components/cash-app/invoice-preview-dialog.tsx
//
// AR-side invoice preview — AcmeCo is the issuer, the customer is the
// bill-to. Used from the cash-app match page so an AR clerk can see
// what they actually sent the customer before approving the
// application.
//
// Mirrors the structure of components/invoice-processing/
// invoice-preview-dialog.tsx but uses the cash-app domain types
// (simpler — single lineSummary instead of full line items).
"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import {
  Buildings,
  DownloadSimple,
  Printer,
  Sparkle,
  X,
} from "@phosphor-icons/react"

import { Button } from "@/components/neoflo-os/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/neoflo-os/ui/dialog"
import { getCustomer } from "@/lib/neoflo-os/cash-app/seed-customers"
import type { Invoice } from "@/lib/neoflo-os/cash-app/types"

interface CashAppInvoicePreviewDialogProps {
  invoice: Invoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function fmtMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function fmtDate(iso: string | undefined): string {
  if (!iso) return "—"
  try {
    return format(parseISO(iso), "MMM d, yyyy")
  } catch {
    return iso
  }
}

export function CashAppInvoicePreviewDialog({
  invoice,
  open,
  onOpenChange,
}: CashAppInvoicePreviewDialogProps) {
  if (!invoice) return null
  const customer = getCustomer(invoice.customerId)
  const customerName = customer?.name ?? invoice.customerId

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-3xl gap-0 overflow-hidden p-0"
      >
        <DialogTitle className="sr-only">
          Invoice {invoice.invoiceNumber} to {customerName}
        </DialogTitle>

        {/* Toolbar */}
        <div className="bg-muted/40 flex items-center justify-between border-b px-4 py-2">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Sparkle size={11} weight="fill" className="text-primary" />
            Source document · issued by AcmeCo
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => typeof window !== "undefined" && window.print()}
            >
              <Printer size={12} weight="regular" />
              Print
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onOpenChange(false)}
            >
              <DownloadSimple size={12} weight="regular" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-1.5"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
            >
              <X size={14} />
            </Button>
          </div>
        </div>

        {/* Invoice paper */}
        <div className="max-h-[78vh] overflow-y-auto bg-white text-zinc-900">
          <div className="mx-auto max-w-[680px] px-10 py-10">
            {/* AcmeCo letterhead — we're the seller */}
            <div className="flex items-start justify-between gap-6 border-b border-zinc-200 pb-5">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-white">
                  <Buildings size={20} weight="regular" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-base font-semibold tracking-tight text-zinc-900">
                    AcmeCo, Inc.
                  </h2>
                  <p className="text-[11px] leading-snug text-zinc-500">
                    340 Mercer Street
                    <br />
                    San Francisco, CA 94110
                  </p>
                  <p className="text-[11px] text-zinc-500">acmeco.com</p>
                  <p className="text-[11px] text-zinc-500">
                    EIN 88-3214567
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                  Invoice
                </span>
                <span className="text-xl font-semibold tracking-tight text-zinc-900">
                  {invoice.invoiceNumber}
                </span>
              </div>
            </div>

            {/* Meta */}
            <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-[12px] sm:grid-cols-4">
              <MetaCell label="Issued" value={fmtDate(invoice.issuedAt)} />
              <MetaCell label="Due" value={fmtDate(invoice.dueAt)} />
              <MetaCell label="Terms" value={invoice.termsLabel} />
              <MetaCell label="Currency" value="USD" />
            </div>

            {/* Bill-to — customer */}
            <div className="mt-6 rounded-md border border-zinc-200 px-4 py-3">
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                Bill to
              </div>
              <div className="mt-1 text-sm font-medium text-zinc-900">
                {customerName}
              </div>
              <div className="text-[11px] leading-snug text-zinc-500">
                AP department
              </div>
            </div>

            {/* Line item — single summary line for cash-app's invoice shape */}
            <table className="mt-6 w-full text-[12px]">
              <thead>
                <tr className="border-b border-zinc-300 text-zinc-500">
                  <th className="py-2 pr-3 text-left text-[10px] font-medium uppercase tracking-wider">
                    Description
                  </th>
                  <th className="py-2 text-right text-[10px] font-medium uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-100">
                  <td className="py-2.5 pr-3 align-top text-zinc-900">
                    {invoice.lineSummary}
                  </td>
                  <td className="py-2.5 text-right align-top font-medium tabular-nums">
                    {fmtMoney(invoice.amount)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-4 flex justify-end">
              <dl className="w-64 text-[12px]">
                <div className="flex items-baseline justify-between border-t border-zinc-300 pt-2">
                  <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                    Total due
                  </dt>
                  <dd className="text-lg font-semibold tabular-nums text-zinc-900">
                    {fmtMoney(invoice.amount)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Footer — remittance instructions */}
            <div className="mt-10 border-t border-zinc-200 pt-4 text-[11px] leading-snug text-zinc-500">
              <div>
                Remit by {fmtDate(invoice.dueAt)} per {invoice.termsLabel} terms.
                Reference{" "}
                <span className="font-medium text-zinc-700">
                  {invoice.invoiceNumber}
                </span>{" "}
                on payment.
              </div>
              <div className="mt-1">
                Wire: Citibank · routing 021000089 · account ********4392
                <br />
                ACH: same · or via supplier portal at billing.acmeco.com
              </div>
              <div className="mt-3 text-[10px] text-zinc-400">
                Questions: ar@acmeco.com
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">
        {label}
      </span>
      <span className="font-medium text-zinc-900">{value}</span>
    </div>
  )
}
