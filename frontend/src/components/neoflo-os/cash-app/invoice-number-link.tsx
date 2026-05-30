// components/cash-app/invoice-number-link.tsx
//
// Cash-app's equivalent of components/invoice-processing/invoice-
// number-link.tsx — but for AR invoices. Different domain type, hence a
// separate event channel.
"use client"

import * as React from "react"
import { FilePdf } from "@phosphor-icons/react"

import { cn } from "@/lib/neoflo-os/utils"

const PREVIEW_EVENT = "neo:preview-cashapp-invoice"

export interface CashAppInvoicePreviewEvent
  extends CustomEvent<{ invoiceId: string }> {}

export function openCashAppInvoicePreview(invoiceId: string): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent(PREVIEW_EVENT, { detail: { invoiceId } }),
  )
}

export function subscribeToCashAppInvoicePreview(
  handler: (invoiceId: string) => void,
): () => void {
  if (typeof window === "undefined") return () => {}
  function onEvent(ev: Event) {
    const ce = ev as CashAppInvoicePreviewEvent
    if (ce?.detail?.invoiceId) handler(ce.detail.invoiceId)
  }
  window.addEventListener(PREVIEW_EVENT, onEvent)
  return () => window.removeEventListener(PREVIEW_EVENT, onEvent)
}

interface InvoiceNumberLinkProps {
  invoiceId: string
  label: string
  className?: string
  iconHidden?: boolean
  mono?: boolean
}

export function CashAppInvoiceNumberLink({
  invoiceId,
  label,
  className,
  iconHidden,
  mono = false,
}: InvoiceNumberLinkProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        openCashAppInvoicePreview(invoiceId)
      }}
      aria-label={`View invoice ${label}`}
      title="Open the source document"
      className={cn(
        "group/inv text-muted-foreground hover:text-primary focus-visible:text-primary inline-flex items-center gap-1 rounded-sm outline-none transition-colors",
        mono && "font-mono",
        className,
      )}
    >
      {iconHidden ? null : (
        <FilePdf
          size={12}
          weight="regular"
          className="opacity-60 group-hover/inv:opacity-100"
        />
      )}
      <span className="underline-offset-2 group-hover/inv:underline">
        {label}
      </span>
    </button>
  )
}
