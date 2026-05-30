// components/invoice-processing/invoice-row.tsx
//
// One row in the invoice-processing inbox table. Renders a `<TableRow>` whose
// entire surface navigates to the match-detail surface for the invoice.
//
// Per docs/handoff/invoice-processing/03-screen-specs.md § "Surface 2: Inbox"
// — status column uses `<StatusBadge>` with a tone+icon map driven off
// `invoice.matchMode` + `invoice.status` + `invoice.exception?.reasonCode`.
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Briefcase,
  CheckCircle,
  Question,
  ShieldWarning,
  Warning,
} from "@phosphor-icons/react"

import { InvoiceNumberLink } from "@/components/neoflo-os/invoice-processing/invoice-number-link"
import { PONumberLink } from "@/components/neoflo-os/invoice-processing/po-number-link"
import { StatusBadge } from "@/components/neoflo-os/status-badge"
import { TableCell, TableRow } from "@/components/neoflo-os/ui/table"
import { getVendor } from "@/lib/neoflo-os/invoice-processing/seed-vendors"
import type { Invoice, InvoiceChannel } from "@/lib/neoflo-os/invoice-processing/types"
import {
  getDeferredDueDate,
  isInMaverickSwitchedBatch,
} from "@/lib/neoflo-os/spend-analytics/cross-workflow-tie"
import { useHydratedSpendAnalyticsStore } from "@/lib/neoflo-os/spend-analytics/spend-analytics-store"
import { useBasePath } from "@/lib/neoflo-os/workspace/use-base-path"

// ════════════════════════════════════════════════════════════════════
// Channel pill labels
// ════════════════════════════════════════════════════════════════════

const CHANNEL_LABEL: Record<InvoiceChannel, string> = {
  email: "Email",
  "edi-810": "EDI",
  billcom: "Bill.com",
  coupa: "Coupa",
  ariba: "Ariba",
  photo: "Photo",
  manual: "Manual",
}

// ════════════════════════════════════════════════════════════════════
// Status badge derivation — tone, icon, and label per the spec
// ════════════════════════════════════════════════════════════════════

type BadgeSpec = {
  tone: "success" | "warning" | "danger" | "neutral" | "info"
  Icon: React.ElementType
  label: string
}

function deriveStatusBadge(invoice: Invoice): BadgeSpec {
  // Auto-posted is its own row regardless of matchMode.
  if (invoice.status === "auto-posted") {
    return { tone: "success", Icon: CheckCircle, label: "Auto" }
  }

  // Duplicate-suspected always takes precedence on its mode.
  if (invoice.status === "duplicate-suspected") {
    return { tone: "danger", Icon: ShieldWarning, label: "Dup" }
  }

  // Tax mode (e.g., Singapore GST hero) lights up the tax pill.
  if (invoice.matchMode === "tax") {
    return { tone: "info", Icon: Briefcase, label: "Tax" }
  }

  // 3-way / 2-way needs-review = clean match.
  if (
    invoice.status === "needs-review" &&
    (invoice.matchMode === "3way" || invoice.matchMode === "2way")
  ) {
    return { tone: "success", Icon: CheckCircle, label: "Match" }
  }

  // Exception rows: tone + label varies by reasonCode.
  if (invoice.status === "exception" && invoice.exception) {
    switch (invoice.exception.reasonCode) {
      case "PRICE_VARIANCE":
        return { tone: "warning", Icon: Warning, label: "Variance" }
      case "MISSING_GRN":
        return { tone: "warning", Icon: Warning, label: "GRN" }
      case "GL_AMBIGUOUS":
        return { tone: "neutral", Icon: Question, label: "GL" }
      case "OCR_LOW_CONFIDENCE":
        return { tone: "warning", Icon: Warning, label: "OCR" }
      case "MULTI_CURRENCY_REVIEW":
        return { tone: "info", Icon: Briefcase, label: "FX" }
      case "MASTER_AGREEMENT_REVIEW":
        return { tone: "warning", Icon: Warning, label: "Agreement" }
      default:
        return { tone: "warning", Icon: Warning, label: "Review" }
    }
  }

  // Fallback for anything else (human-approved, rejected, etc).
  return { tone: "neutral", Icon: Warning, label: "Review" }
}

// ════════════════════════════════════════════════════════════════════
// Amount formatter — single-currency aware
// ════════════════════════════════════════════════════════════════════

function fmtAmount(amount: number, currency: string): string {
  const rounded = Math.round(amount).toLocaleString("en-US")
  if (currency === "USD") return `$${rounded}`
  return `${currency} ${rounded}`
}

// ════════════════════════════════════════════════════════════════════
// Cross-workflow date formatting — short "Jun 2" for the deferral badge
// ════════════════════════════════════════════════════════════════════

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

function fmtShortDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number)
  if (!m || !d) return iso
  return `${SHORT_MONTHS[m - 1]} ${d}`
}

// ════════════════════════════════════════════════════════════════════
// InvoiceRow
// ════════════════════════════════════════════════════════════════════

interface InvoiceRowProps {
  invoice: Invoice
}

export function InvoiceRow({ invoice }: InvoiceRowProps) {
  const router = useRouter()
  const base = useBasePath()
  const vendor = getVendor(invoice.vendorId)
  const vendorName = vendor?.name ?? invoice.vendorId
  const badge = deriveStatusBadge(invoice)
  const { Icon } = badge

  // Cross-workflow badges. Only render once the corresponding
  // spend-analytics action has fired — pre-approval, the inbox stays
  // unchanged. The store hook is hydration-safe so SSR + first paint match.
  const deferralApproved = useHydratedSpendAnalyticsStore(
    (s) => s.deferralBatchApproved,
  )
  const maverickFlagged = useHydratedSpendAnalyticsStore(
    (s) => s.maverickFlagged["maverick-westpoint-q2-2026"],
  )
  const deferredTo = deferralApproved
    ? getDeferredDueDate(invoice.id)
    : undefined
  const isMaverickSwitched =
    maverickFlagged === "notified" && isInMaverickSwitchedBatch(invoice.id)

  function handleNavigate() {
    router.push(`${base}/invoice-processing/match/${invoice.id}`)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTableRowElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleNavigate()
    }
  }

  return (
    <TableRow
      tabIndex={0}
      role="link"
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      className="hover:bg-muted/40 focus-visible:bg-muted/40 cursor-pointer focus-visible:outline-none"
    >
      <TableCell className="text-foreground font-medium">{vendorName}</TableCell>
      <TableCell className="text-xs">
        <InvoiceNumberLink
          invoiceId={invoice.id}
          label={invoice.invoiceNumber}
        />
      </TableCell>
      <TableCell className="text-foreground tabular-nums">
        {fmtAmount(invoice.amount, invoice.currency)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {CHANNEL_LABEL[invoice.channel]}
      </TableCell>
      <TableCell className="text-xs">
        {invoice.poRef && invoice.poId ? (
          <PONumberLink poId={invoice.poId} label={invoice.poRef} />
        ) : invoice.poRef ? (
          <span className="text-muted-foreground font-mono">
            {invoice.poRef}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge tone={badge.tone} showDot={false}>
            <Icon className="h-3 w-3" weight="regular" />
            {badge.label}
          </StatusBadge>
          {deferredTo ? (
            <StatusBadge tone="info" showDot={false}>
              Deferred to {fmtShortDate(deferredTo)}
            </StatusBadge>
          ) : null}
          {isMaverickSwitched ? (
            <StatusBadge tone="warning" showDot={false}>
              Switched to Northeast
            </StatusBadge>
          ) : null}
        </div>
      </TableCell>
      <TableCell className="text-primary text-xs font-medium">
        Review
      </TableCell>
    </TableRow>
  )
}
