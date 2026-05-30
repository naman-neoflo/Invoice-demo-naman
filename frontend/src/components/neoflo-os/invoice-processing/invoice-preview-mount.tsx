// components/invoice-processing/invoice-preview-mount.tsx
//
// Layout-level singleton that owns the InvoicePreviewDialog state and
// listens for the `neo:preview-invoice` window event. Lets any component
// anywhere in invoice-processing open the source-document preview
// without prop-drilling. Mirrors the ChatThread + neo:open-chat pattern
// used by spend-analytics / collections / cash-app layouts.
"use client"

import * as React from "react"

import { InvoicePreviewDialog } from "@/components/neoflo-os/invoice-processing/invoice-preview-dialog"
import { subscribeToInvoicePreview } from "@/components/neoflo-os/invoice-processing/invoice-number-link"
import { getInvoice } from "@/lib/neoflo-os/invoice-processing/seed-invoices"
import type { Invoice } from "@/lib/neoflo-os/invoice-processing/types"

export function InvoicePreviewMount() {
  const [invoice, setInvoice] = React.useState<Invoice | null>(null)

  React.useEffect(() => {
    return subscribeToInvoicePreview((invoiceId) => {
      const found = getInvoice(invoiceId)
      if (found) setInvoice(found)
    })
  }, [])

  return (
    <InvoicePreviewDialog
      invoice={invoice}
      open={invoice !== null}
      onOpenChange={(open) => {
        if (!open) setInvoice(null)
      }}
    />
  )
}
