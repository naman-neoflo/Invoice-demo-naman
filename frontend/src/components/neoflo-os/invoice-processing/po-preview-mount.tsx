// components/invoice-processing/po-preview-mount.tsx
//
// Layout-mounted singleton that owns the PO preview dialog state.
"use client"

import * as React from "react"

import { POPreviewDialog } from "@/components/neoflo-os/invoice-processing/po-preview-dialog"
import { subscribeToPOPreview } from "@/components/neoflo-os/invoice-processing/po-number-link"
import { getPO } from "@/lib/neoflo-os/invoice-processing/seed-purchase-orders"
import type { PurchaseOrder } from "@/lib/neoflo-os/invoice-processing/types"

export function POPreviewMount() {
  const [po, setPO] = React.useState<PurchaseOrder | null>(null)

  React.useEffect(() => {
    return subscribeToPOPreview((id) => {
      const found = getPO(id)
      if (found) setPO(found)
    })
  }, [])

  return (
    <POPreviewDialog
      po={po}
      open={po !== null}
      onOpenChange={(open) => {
        if (!open) setPO(null)
      }}
    />
  )
}
