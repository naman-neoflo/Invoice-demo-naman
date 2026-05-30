// components/cash-app/invoice-preview-mount.tsx
//
// Layout-mounted singleton — listens for `neo:preview-cashapp-invoice`
// events and opens the AR-side invoice dialog. Mirrors the invoice-
// processing mount.
"use client"

import * as React from "react"

import { CashAppInvoicePreviewDialog } from "@/components/neoflo-os/cash-app/invoice-preview-dialog"
import { subscribeToCashAppInvoicePreview } from "@/components/neoflo-os/cash-app/invoice-number-link"
import { getInvoice } from "@/lib/neoflo-os/cash-app/seed-invoices"
import type { Invoice } from "@/lib/neoflo-os/cash-app/types"

export function CashAppInvoicePreviewMount() {
  const [invoice, setInvoice] = React.useState<Invoice | null>(null)

  React.useEffect(() => {
    return subscribeToCashAppInvoicePreview((id) => {
      const found = getInvoice(id)
      if (found) setInvoice(found)
    })
  }, [])

  return (
    <CashAppInvoicePreviewDialog
      invoice={invoice}
      open={invoice !== null}
      onOpenChange={(open) => {
        if (!open) setInvoice(null)
      }}
    />
  )
}
