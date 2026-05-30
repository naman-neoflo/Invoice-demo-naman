// components/invoice-processing/invoice-number-link.tsx
//
// Reusable "invoice number with view-source affordance" used everywhere
// an invoice is mentioned (inbox row, needs-eyes cards, exception row,
// duplicate / tax cards, match detail header, audit detail). Clicking
// dispatches a window event that the invoice-processing layout's
// InvoicePreviewMount listens for — opens the source-document dialog
// without prop-drilling through 6 layers of components.
"use client"

import * as React from "react"
import { FilePdf } from "@phosphor-icons/react"

import { cn } from "@/lib/neoflo-os/utils"

const PREVIEW_EVENT = "neo:preview-invoice"

export interface InvoicePreviewEvent extends CustomEvent<{ invoiceId: string }> {}

/**
 * Dispatch from anywhere to open the source-document dialog.
 * Mounted listener lives in InvoicePreviewMount (in the IP layout).
 */
export function openInvoicePreview(invoiceId: string): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent(PREVIEW_EVENT, { detail: { invoiceId } }),
  )
}

export function subscribeToInvoicePreview(
  handler: (invoiceId: string) => void,
): () => void {
  if (typeof window === "undefined") return () => {}
  function onEvent(ev: Event) {
    const ce = ev as InvoicePreviewEvent
    if (ce?.detail?.invoiceId) handler(ce.detail.invoiceId)
  }
  window.addEventListener(PREVIEW_EVENT, onEvent)
  return () => window.removeEventListener(PREVIEW_EVENT, onEvent)
}

interface InvoiceNumberLinkProps {
  invoiceId: string
  /** Human-readable label rendered next to the icon. Usually invoiceNumber. */
  label: string
  /** Override the default monospace styling. */
  className?: string
  /** Hide the leading icon (e.g. when it would visually duplicate). */
  iconHidden?: boolean
  /** Render the label monospaced — default true. */
  mono?: boolean
}

export function InvoiceNumberLink({
  invoiceId,
  label,
  className,
  iconHidden,
  mono = true,
}: InvoiceNumberLinkProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        openInvoicePreview(invoiceId)
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
