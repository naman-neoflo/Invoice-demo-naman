// components/invoice-processing/po-number-link.tsx
//
// Reusable PO number affordance — clicking opens the PO source-document
// dialog. Same shape as InvoiceNumberLink, separate event channel.
"use client"

import * as React from "react"
import { ClipboardText } from "@phosphor-icons/react"

import { cn } from "@/lib/neoflo-os/utils"

const PREVIEW_EVENT = "neo:preview-po"

export interface POPreviewEvent extends CustomEvent<{ poId: string }> {}

export function openPOPreview(poId: string): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(PREVIEW_EVENT, { detail: { poId } }))
}

export function subscribeToPOPreview(
  handler: (poId: string) => void,
): () => void {
  if (typeof window === "undefined") return () => {}
  function onEvent(ev: Event) {
    const ce = ev as POPreviewEvent
    if (ce?.detail?.poId) handler(ce.detail.poId)
  }
  window.addEventListener(PREVIEW_EVENT, onEvent)
  return () => window.removeEventListener(PREVIEW_EVENT, onEvent)
}

interface POLinkProps {
  poId: string
  label: string
  className?: string
  iconHidden?: boolean
  mono?: boolean
}

export function PONumberLink({
  poId,
  label,
  className,
  iconHidden,
  mono = true,
}: POLinkProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        openPOPreview(poId)
      }}
      aria-label={`View purchase order ${label}`}
      title="Open the purchase order"
      className={cn(
        "group/po text-muted-foreground hover:text-primary focus-visible:text-primary inline-flex items-center gap-1 rounded-sm outline-none transition-colors",
        mono && "font-mono",
        className,
      )}
    >
      {iconHidden ? null : (
        <ClipboardText
          size={12}
          weight="regular"
          className="opacity-60 group-hover/po:opacity-100"
        />
      )}
      <span className="underline-offset-2 group-hover/po:underline">
        {label}
      </span>
    </button>
  )
}
