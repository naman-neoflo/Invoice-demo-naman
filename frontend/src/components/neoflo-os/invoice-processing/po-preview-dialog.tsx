// components/invoice-processing/po-preview-dialog.tsx
//
// Source-document preview for a purchase order. Used during 3-way match
// (and anywhere a PO is referenced) so an AP clerk can verify "is this
// invoice billing what was actually authorized?" — same visual language
// as the invoice preview, with PO-specific framing (approver, expected
// delivery, GL default).
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
import { getVendor } from "@/lib/neoflo-os/invoice-processing/seed-vendors"
import type { PurchaseOrder } from "@/lib/neoflo-os/invoice-processing/types"

interface POPreviewDialogProps {
  po: PurchaseOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function fmtMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
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

export function POPreviewDialog({
  po,
  open,
  onOpenChange,
}: POPreviewDialogProps) {
  if (!po) return null
  const vendor = getVendor(po.vendorId)
  const vendorName = vendor?.name ?? po.vendorId

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-3xl gap-0 overflow-hidden p-0"
      >
        <DialogTitle className="sr-only">
          Purchase order {po.poNumber} to {vendorName}
        </DialogTitle>

        {/* Toolbar */}
        <div className="bg-muted/40 flex items-center justify-between border-b px-4 py-2">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Sparkle size={11} weight="fill" className="text-primary" />
            Purchase order · approved by{" "}
            <span className="text-foreground font-medium">{po.approver}</span>
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

        {/* PO paper */}
        <div className="max-h-[78vh] overflow-y-auto bg-white text-zinc-900">
          <div className="mx-auto max-w-[680px] px-10 py-10">
            {/* AcmeCo (issuer) letterhead */}
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
                  <p className="text-[11px] text-zinc-500">
                    Procurement · po@acmeco.com
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                  Purchase order
                </span>
                <span className="text-xl font-semibold tracking-tight text-zinc-900">
                  {po.poNumber}
                </span>
                <span className="text-[11px] text-zinc-500">
                  Status · {po.status}
                </span>
              </div>
            </div>

            {/* Meta */}
            <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-[12px] sm:grid-cols-4">
              <MetaCell label="Issued" value={fmtDate(po.issuedAt)} />
              <MetaCell
                label="Expected"
                value={fmtDate(po.expectedDeliveryAt)}
              />
              <MetaCell label="Approved by" value={po.approver} />
              <MetaCell label="Currency" value={po.currency} />
            </div>

            {/* Ship-to / vendor */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-md border border-zinc-200 px-4 py-3">
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                  Supplier
                </div>
                <div className="mt-1 text-sm font-medium text-zinc-900">
                  {vendorName}
                </div>
                {vendor?.primaryContactEmail ? (
                  <div className="text-[11px] text-zinc-500">
                    {vendor.primaryContactEmail}
                  </div>
                ) : null}
              </div>
              <div className="rounded-md border border-zinc-200 px-4 py-3">
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                  Ship to
                </div>
                <div className="mt-1 text-sm font-medium text-zinc-900">
                  AcmeCo {po.glDefault?.entity ?? ""}
                </div>
                <div className="text-[11px] text-zinc-500">
                  {po.glDefault?.costCenter
                    ? `${po.glDefault.costCenter} · `
                    : ""}
                  Receive against this PO at the named cost center.
                </div>
              </div>
            </div>

            {/* Line items */}
            <table className="mt-6 w-full text-[12px]">
              <thead>
                <tr className="border-b border-zinc-300 text-zinc-500">
                  <th className="py-2 pr-3 text-left text-[10px] font-medium uppercase tracking-wider">
                    Line
                  </th>
                  <th className="py-2 pr-3 text-left text-[10px] font-medium uppercase tracking-wider">
                    Description
                  </th>
                  <th className="py-2 pr-3 text-right text-[10px] font-medium uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="py-2 pr-3 text-right text-[10px] font-medium uppercase tracking-wider">
                    Unit price
                  </th>
                  <th className="py-2 text-right text-[10px] font-medium uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {po.lines.map((line) => (
                  <tr
                    key={line.lineNumber}
                    className="border-b border-zinc-100"
                  >
                    <td className="py-2.5 pr-3 align-top text-zinc-400 tabular-nums">
                      {line.lineNumber}
                    </td>
                    <td className="py-2.5 pr-3 align-top text-zinc-900">
                      {line.description}
                    </td>
                    <td className="py-2.5 pr-3 text-right align-top tabular-nums">
                      {line.quantity} {line.unitOfMeasure}
                    </td>
                    <td className="py-2.5 pr-3 text-right align-top tabular-nums">
                      {fmtMoney(line.unitPrice, po.currency)}
                    </td>
                    <td className="py-2.5 text-right align-top font-medium tabular-nums">
                      {fmtMoney(line.lineTotal, po.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-4 flex justify-end">
              <dl className="w-64 text-[12px]">
                <div className="flex items-baseline justify-between border-t border-zinc-300 pt-2">
                  <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                    Authorised total
                  </dt>
                  <dd className="text-lg font-semibold tabular-nums text-zinc-900">
                    {fmtMoney(po.totalAmount, po.currency)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* GL default */}
            {po.glDefault ? (
              <div className="mt-8 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-[11px] text-zinc-600">
                <div className="font-medium text-zinc-700">
                  Default GL coding
                </div>
                <div className="mt-0.5">
                  Account{" "}
                  <span className="font-mono text-zinc-900">
                    {po.glDefault.account}
                  </span>{" "}
                  · Cost center{" "}
                  <span className="font-mono text-zinc-900">
                    {po.glDefault.costCenter}
                  </span>{" "}
                  · Entity{" "}
                  <span className="font-mono text-zinc-900">
                    {po.glDefault.entity}
                  </span>
                </div>
                <div className="mt-1 text-zinc-500">
                  Inherited by invoices billed against this PO unless overridden.
                </div>
              </div>
            ) : null}

            {/* Footer */}
            <div className="mt-8 border-t border-zinc-200 pt-4 text-[11px] leading-snug text-zinc-500">
              <div>
                Reference{" "}
                <span className="font-medium text-zinc-700">{po.poNumber}</span>{" "}
                on every invoice billed against this order.
              </div>
              <div className="mt-1">
                Questions: po@acmeco.com
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
