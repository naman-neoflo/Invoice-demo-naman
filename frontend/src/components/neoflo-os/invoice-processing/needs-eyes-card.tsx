// components/invoice-processing/needs-eyes-card.tsx
//
// Horizontal action card for the invoice-processing dashboard's "Needs your
// eyes" stack. One variant per review type (duplicate, variance, missing-grn,
// tax, gl-ambiguous). Spec: docs/handoff/invoice-processing/03-screen-specs.md
// § "Surface 1: Dashboard".
import * as React from "react"
import { Link } from "next-view-transitions"
import {
  ArrowRight,
  Briefcase,
  FilePdf,
  Question,
  ShieldWarning,
  Warning,
} from "@phosphor-icons/react"

import { openInvoicePreview } from "@/components/neoflo-os/invoice-processing/invoice-number-link"
import type { NeedsEyesType } from "@/lib/neoflo-os/invoice-processing/derive"
import { useBasePath } from "@/lib/neoflo-os/workspace/use-base-path"
import { cn } from "@/lib/neoflo-os/utils"

interface NeedsEyesCardProps {
  type: NeedsEyesType
  invoiceId: string
  vendorName: string
  amount: number
  currency: string
  summary: string
  confidence?: number
  className?: string
}

function fmtAmount(amount: number, currency: string): string {
  const rounded = Math.round(amount).toLocaleString("en-US")
  if (currency === "USD") return `$${rounded}`
  return `${currency} ${rounded}`
}

const ICON_BY_TYPE: Record<NeedsEyesType, React.ElementType> = {
  duplicate: ShieldWarning,
  variance: Warning,
  "missing-grn": Warning,
  tax: Briefcase,
  "gl-ambiguous": Question,
}

const ICON_BG_BY_TYPE: Record<NeedsEyesType, string> = {
  duplicate: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  variance: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "missing-grn": "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  tax: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  "gl-ambiguous": "bg-muted text-muted-foreground",
}

const TITLE_SUFFIX_BY_TYPE: Record<NeedsEyesType, string> = {
  duplicate: "likely duplicate",
  variance: "price variance",
  "missing-grn": "no GRN on file",
  tax: "GST review",
  "gl-ambiguous": "GL coding ambiguous",
}

export function NeedsEyesCard({
  type,
  invoiceId,
  vendorName,
  amount,
  currency,
  summary,
  confidence,
  className,
}: NeedsEyesCardProps) {
  const base = useBasePath()
  const Icon = ICON_BY_TYPE[type]
  const iconBg = ICON_BG_BY_TYPE[type]

  const confidencePct =
    typeof confidence === "number" ? Math.round(confidence * 100) : undefined
  const subtitle =
    confidencePct !== undefined
      ? `${summary} (${confidencePct}% confidence)`
      : summary

  const title = `${vendorName} · ${fmtAmount(amount, currency)} · ${TITLE_SUFFIX_BY_TYPE[type]}`

  return (
    <Link
      href={`${base}/invoice-processing/match/${invoiceId}`}
      className={cn(
        "bg-card hover:border-primary/30 hover:shadow-md flex items-center gap-4 rounded-lg border p-4 transition-all",
        className
      )}
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-md",
          iconBg
        )}
      >
        <Icon size={20} weight="regular" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="text-foreground text-sm font-semibold">{title}</div>
        <div className="text-muted-foreground text-xs">{subtitle}</div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            openInvoicePreview(invoiceId)
          }}
          aria-label="View invoice"
          title="Open the source document"
          className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-xs font-medium transition-colors hover:border-border"
        >
          <FilePdf size={12} weight="regular" />
          View
        </button>
        <span className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors">
          Review
          <ArrowRight size={12} weight="bold" />
        </span>
      </div>
    </Link>
  )
}
