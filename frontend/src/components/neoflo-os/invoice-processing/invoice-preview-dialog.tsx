// components/invoice-processing/invoice-preview-dialog.tsx
//
// "Open the invoice" — renders the source document as a styled HTML
// invoice paper. Used from the invoice row's view button + the match
// detail page so users can see exactly what landed in the inbox before
// Neo's reasoning lays on top. Pure DOM (no PDF library); the styling
// mimics a real vendor invoice closely enough for demo purposes.
"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import {
  Buildings,
  Camera,
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
import type { Invoice } from "@/lib/neoflo-os/invoice-processing/types"
import { cn } from "@/lib/neoflo-os/utils"

interface InvoicePreviewDialogProps {
  invoice: Invoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ─────────────────────────────────────────────────────────────────────────
// Faux vendor addresses (US/SG/UK). Synthesised from the vendor jurisdiction
// since the seed doesn't carry addresses — enough for the visual mock.
// ─────────────────────────────────────────────────────────────────────────

const FAUX_ADDRESS: Record<string, { street: string; city: string }> = {
  US: { street: "1200 Industrial Pkwy, Suite 400", city: "Newark, NJ 07102" },
  SG: { street: "78 Shenton Way, #15-02", city: "Singapore 079120" },
  UK: { street: "55 Old Broad Street", city: "London EC2M 1RX" },
  AU: { street: "Level 18, 1 Bligh Street", city: "Sydney NSW 2000" },
  EU: { street: "Rue du Commerce 14", city: "1000 Brussels, Belgium" },
}

// ─────────────────────────────────────────────────────────────────────────
// Currency formatter
// ─────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────
// Main dialog
// ─────────────────────────────────────────────────────────────────────────

export function InvoicePreviewDialog({
  invoice,
  open,
  onOpenChange,
}: InvoicePreviewDialogProps) {
  if (!invoice) return null
  const vendor = getVendor(invoice.vendorId)
  const vendorName = vendor?.name ?? invoice.vendorId
  const vendorContact = vendor?.primaryContactName ?? ""
  const vendorEmail = vendor?.primaryContactEmail ?? ""
  const jurisdiction = vendor?.jurisdiction ?? "US"
  const addr = FAUX_ADDRESS[jurisdiction] ?? FAUX_ADDRESS.US
  // Photo-channel invoices were snapped on someone's phone — the "paper" should
  // read as a mobile capture (soft focus, slight tilt, sitting on a surface)
  // rather than a clean PDF. Sells the realism that Neo handles low-quality
  // OCR inputs, not just bank-perfect emailed invoices.
  const isMobilePhoto = invoice.channel === "photo"
  const taxRegLabel =
    vendor?.taxRegistration?.type && vendor?.taxRegistration?.id
      ? `${vendor.taxRegistration.type} reg: ${vendor.taxRegistration.id}`
      : undefined

  const subtotal = invoice.lines.reduce((sum, l) => sum + l.lineTotal, 0)
  const taxAmount = invoice.taxLine?.amount ?? 0
  const total = subtotal + taxAmount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-3xl p-0 overflow-hidden gap-0"
      >
        {/* a11y title — visually hidden via DialogTitle styling */}
        <DialogTitle className="sr-only">
          Invoice {invoice.invoiceNumber} from {vendorName}
        </DialogTitle>

        {/* Chrome bar — looks like a document viewer toolbar */}
        <div className="bg-muted/40 border-b flex items-center justify-between px-4 py-2">
          <div className="text-muted-foreground text-xs flex items-center gap-1.5">
            {isMobilePhoto ? (
              <Camera
                size={11}
                weight="fill"
                className="text-amber-600 dark:text-amber-500"
              />
            ) : (
              <Sparkle size={11} weight="fill" className="text-primary" />
            )}
            {isMobilePhoto ? "Mobile capture" : "Source document"} · OCR
            confidence{" "}
            <span className="text-foreground font-medium">
              {Math.round(invoice.ocrConfidence * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() =>
                typeof window !== "undefined" && window.print()
              }
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

        {/* The "invoice paper" — wrapped in a darker surface and tilted/blurred
            when the source channel was a mobile photo. */}
        <div
          className={cn(
            "text-zinc-900 max-h-[78vh] overflow-y-auto",
            isMobilePhoto ? "bg-zinc-200 py-8 px-6" : "bg-white",
          )}
        >
          <div
            className={cn(
              "mx-auto max-w-[680px] px-10 py-10",
              isMobilePhoto
                ? [
                    "bg-white",
                    // Heavier drop shadow + an inset vignette to mimic phone
                    // camera fall-off at the edges.
                    "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.5),0_12px_24px_-12px_rgba(0,0,0,0.35),inset_0_0_120px_rgba(0,0,0,0.12)]",
                    "rotate-[-2.4deg]",
                    // Aggressive but still-readable: ~1.4px blur kills the
                    // OCR-perfect crispness; contrast/saturation drop + warm
                    // cast read as indoor lighting; slight brightness drop
                    // suggests the paper is shaded.
                    "[filter:blur(1.4px)_contrast(0.86)_saturate(0.82)_sepia(0.1)_brightness(0.96)]",
                    "ring-1 ring-zinc-400/40",
                  ].join(" ")
                : "",
            )}
          >
            {/* Vendor letterhead */}
            <div className="flex items-start justify-between gap-6 border-b border-zinc-200 pb-5">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-white">
                  <Buildings size={20} weight="regular" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-zinc-900 text-base font-semibold tracking-tight">
                    {vendorName}
                  </h2>
                  <p className="text-zinc-500 text-[11px] leading-snug">
                    {addr.street}
                    <br />
                    {addr.city}
                  </p>
                  {vendor?.domain ? (
                    <p className="text-zinc-500 text-[11px]">
                      {vendor.domain}
                    </p>
                  ) : null}
                  {taxRegLabel ? (
                    <p className="text-zinc-500 text-[11px]">{taxRegLabel}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col items-end gap-0.5">
                <span className="text-zinc-400 text-[10px] font-medium uppercase tracking-[0.18em]">
                  Invoice
                </span>
                <span className="text-zinc-900 text-xl font-semibold tracking-tight">
                  {invoice.invoiceNumber}
                </span>
                {invoice.poRef ? (
                  <span className="text-zinc-500 text-[11px]">
                    PO Ref · {invoice.poRef}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Meta grid */}
            <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-[12px] sm:grid-cols-4">
              <MetaCell label="Issued" value={fmtDate(invoice.issuedAt)} />
              <MetaCell label="Due" value={fmtDate(invoice.dueAt)} />
              <MetaCell label="Terms" value={invoice.termsLabel} />
              <MetaCell label="Currency" value={invoice.currency} />
            </div>

            {/* Bill-to */}
            <div className="mt-6 rounded-md border border-zinc-200 px-4 py-3">
              <div className="text-zinc-400 text-[10px] font-medium uppercase tracking-[0.18em]">
                Bill to
              </div>
              <div className="text-zinc-900 mt-1 text-sm font-medium">
                AcmeCo, Inc.
              </div>
              <div className="text-zinc-500 text-[11px] leading-snug">
                AP department · ap@acmeco.com
                <br />
                340 Mercer Street, San Francisco, CA 94110
              </div>
            </div>

            {/* Line items */}
            <table className="mt-6 w-full text-[12px]">
              <thead>
                <tr className="border-b border-zinc-300 text-zinc-500">
                  <th className="py-2 pr-3 text-left font-medium uppercase tracking-wider text-[10px]">
                    Line
                  </th>
                  <th className="py-2 pr-3 text-left font-medium uppercase tracking-wider text-[10px]">
                    Description
                  </th>
                  <th className="py-2 pr-3 text-right font-medium uppercase tracking-wider text-[10px]">
                    Qty
                  </th>
                  <th className="py-2 pr-3 text-right font-medium uppercase tracking-wider text-[10px]">
                    Unit price
                  </th>
                  <th className="py-2 text-right font-medium uppercase tracking-wider text-[10px]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((line) => (
                  <tr
                    key={line.lineNumber}
                    className="border-b border-zinc-100"
                  >
                    <td className="py-2.5 pr-3 align-top text-zinc-400 tabular-nums">
                      {line.lineNumber}
                    </td>
                    <td className="py-2.5 pr-3 align-top">
                      <div className="text-zinc-900">{line.description}</div>
                      {line.sku ? (
                        <div className="text-zinc-400 mt-0.5 text-[11px]">
                          SKU {line.sku}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-2.5 pr-3 text-right align-top tabular-nums">
                      {line.quantity} {line.unitOfMeasure}
                    </td>
                    <td className="py-2.5 pr-3 text-right align-top tabular-nums">
                      {fmtMoney(line.unitPrice, invoice.currency)}
                    </td>
                    <td className="py-2.5 text-right align-top font-medium tabular-nums">
                      {fmtMoney(line.lineTotal, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-4 flex justify-end">
              <dl className="w-64 text-[12px]">
                <TotalsRow
                  label="Subtotal"
                  value={fmtMoney(subtotal, invoice.currency)}
                />
                {invoice.taxLine ? (
                  <TotalsRow
                    label={`${invoice.taxLine.type} (${(invoice.taxLine.rate * 100).toFixed(1)}%, ${invoice.taxLine.jurisdiction})`}
                    value={fmtMoney(invoice.taxLine.amount, invoice.currency)}
                  />
                ) : null}
                <div className="mt-2 flex items-baseline justify-between border-t border-zinc-300 pt-2">
                  <dt className="text-zinc-500 text-[10px] font-medium uppercase tracking-[0.18em]">
                    Total due
                  </dt>
                  <dd className="text-zinc-900 text-lg font-semibold tabular-nums">
                    {fmtMoney(total, invoice.currency)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Footer */}
            <div className="mt-10 border-t border-zinc-200 pt-4 text-[11px] text-zinc-500 leading-snug">
              <div>
                Remit by {fmtDate(invoice.dueAt)} per {invoice.termsLabel}{" "}
                terms.
              </div>
              <div className="mt-1">
                Questions:{" "}
                {vendorContact && vendorEmail
                  ? `${vendorContact} · ${vendorEmail}`
                  : (vendorEmail ?? "Contact vendor")}
              </div>
              <div className="text-zinc-400 mt-3 text-[10px]">
                Received by Neoflo via {invoice.channel} ·{" "}
                {fmtDate(invoice.receivedAt)} · OCR confidence{" "}
                {Math.round(invoice.ocrConfidence * 100)}%
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
      <span className="text-zinc-400 text-[10px] font-medium uppercase tracking-[0.18em]">
        {label}
      </span>
      <span className="text-zinc-900 font-medium">{value}</span>
    </div>
  )
}

function TotalsRow({
  label,
  value,
  emphasised,
}: {
  label: string
  value: string
  emphasised?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between py-1">
      <dt className="text-zinc-500">{label}</dt>
      <dd
        className={cn(
          "text-zinc-900 tabular-nums",
          emphasised && "font-semibold",
        )}
      >
        {value}
      </dd>
    </div>
  )
}
