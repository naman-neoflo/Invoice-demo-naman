// components/invoice-processing/exception-row.tsx
//
// Card-style row for the exceptions queue. One variant of the action cluster
// per reason code (DUPLICATE_DETECTED, PRICE_VARIANCE, MISSING_GRN, etc.).
// Spec: docs/handoff/invoice-processing/03-screen-specs.md § "Surface 4:
// Exceptions queue".
//
// The row reads runtime disposition from
// `useHydratedInvoiceProcessingStore.exceptionReviews[invoiceId]` and surfaces
// the current state as a small badge above the action cluster.
"use client"

import * as React from "react"
import { Link } from "next-view-transitions"
import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  CurrencyDollar,
  EnvelopeSimple,
  MagnifyingGlass,
  Question,
  ShieldWarning,
  Warning,
} from "@phosphor-icons/react"

import { InvoiceNumberLink } from "@/components/neoflo-os/invoice-processing/invoice-number-link"
import { StatusBadge } from "@/components/neoflo-os/status-badge"
import { Button } from "@/components/neoflo-os/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/neoflo-os/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/neoflo-os/ui/dropdown-menu"
import { getReasonCode } from "@/lib/neoflo-os/invoice-processing/reason-codes"
import type { ExceptionReasonCode, Invoice } from "@/lib/neoflo-os/invoice-processing/types"
import { cn } from "@/lib/neoflo-os/utils"

export type ExceptionReviewState =
  | "pending"
  | "investigating"
  | "approved"
  | "rejected"
  | "vendor-emailed"

interface ExceptionRowProps {
  invoice: Invoice
  vendorName: string
  reviewState: ExceptionReviewState
  // The invoice the duplicate hero collides with (for the "identical to" subline).
  duplicateOfInvoiceNumber?: string
  duplicateOfPaidAt?: string
  // Actions wired from the page (all bound to store mutations).
  onReviewHref: string
  onConfirmDuplicate: () => void
  onApprove: () => void
  onInvestigate: () => void
  onSendGrnRequest: () => void
  onPickGL: (account: string) => void
  onAskVendor: () => void
  className?: string
}

const REASON_ICON: Record<ExceptionReasonCode, React.ElementType> = {
  DUPLICATE_DETECTED: ShieldWarning,
  PRICE_VARIANCE: Warning,
  QTY_SHORT_RECEIVED: Warning,
  QTY_OVER_RECEIVED: Warning,
  NO_MATCHING_PO: Warning,
  MISSING_GRN: Warning,
  TAX_INELIGIBLE: Briefcase,
  TAX_AMBIGUOUS: Briefcase,
  GL_AMBIGUOUS: Question,
  VENDOR_NOT_REGISTERED: Warning,
  MASTER_AGREEMENT_REVIEW: CurrencyDollar,
  EARLY_PAY_FLAGGED: CurrencyDollar,
  OCR_LOW_CONFIDENCE: MagnifyingGlass,
  MULTI_CURRENCY_REVIEW: CurrencyDollar,
}

const REASON_ICON_BG: Record<ExceptionReasonCode, string> = {
  DUPLICATE_DETECTED: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  PRICE_VARIANCE: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  QTY_SHORT_RECEIVED: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  QTY_OVER_RECEIVED: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  NO_MATCHING_PO: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  MISSING_GRN: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  TAX_INELIGIBLE: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  TAX_AMBIGUOUS: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  GL_AMBIGUOUS: "bg-muted text-muted-foreground",
  VENDOR_NOT_REGISTERED: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  MASTER_AGREEMENT_REVIEW: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  EARLY_PAY_FLAGGED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  OCR_LOW_CONFIDENCE: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  MULTI_CURRENCY_REVIEW: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
}

function fmtAmount(amount: number, currency: string): string {
  const rounded = Math.round(amount).toLocaleString("en-US")
  if (currency === "USD") return `$${rounded}`
  return `${currency} ${rounded}`
}

function reviewStateBadge(state: ExceptionReviewState) {
  switch (state) {
    case "investigating":
      return (
        <StatusBadge tone="warning">
          <MagnifyingGlass size={12} weight="regular" />
          Investigating
        </StatusBadge>
      )
    case "vendor-emailed":
      return (
        <StatusBadge tone="info">
          <EnvelopeSimple size={12} weight="regular" />
          Vendor emailed
        </StatusBadge>
      )
    case "approved":
      return (
        <StatusBadge tone="success">
          <CheckCircle size={12} weight="fill" />
          Approved
        </StatusBadge>
      )
    case "rejected":
      return (
        <StatusBadge tone="danger">
          <ShieldWarning size={12} weight="regular" />
          Rejected
        </StatusBadge>
      )
    default:
      return null
  }
}

export function ExceptionRow({
  invoice,
  vendorName,
  reviewState,
  duplicateOfInvoiceNumber,
  duplicateOfPaidAt,
  onReviewHref,
  onConfirmDuplicate,
  onApprove,
  onInvestigate,
  onSendGrnRequest,
  onPickGL,
  onAskVendor,
  className,
}: ExceptionRowProps) {
  const reasonCode: ExceptionReasonCode =
    invoice.exception?.reasonCode ??
    (invoice.status === "duplicate-suspected"
      ? "DUPLICATE_DETECTED"
      : "GL_AMBIGUOUS")
  const reasonDef = getReasonCode(reasonCode)
  const Icon = REASON_ICON[reasonCode]
  const iconBg = REASON_ICON_BG[reasonCode]

  // Investigation prose — for the duplicate hero we prefer the duplicateFinding
  // reasoning (richer than what would live in `exception`).
  const investigation =
    invoice.status === "duplicate-suspected"
      ? invoice.duplicateFinding?.reasoning
      : invoice.exception?.neoInvestigation
  const subline =
    invoice.status === "duplicate-suspected" && duplicateOfInvoiceNumber
      ? `${invoice.invoiceNumber} identical to ${duplicateOfInvoiceNumber}${
          duplicateOfPaidAt ? ` paid ${duplicateOfPaidAt}` : ""
        }`
      : invoice.exception?.proposedAction ?? invoice.invoiceNumber

  // GRN-request dialog state — opens the drafted email if present.
  const [grnDialogOpen, setGrnDialogOpen] = React.useState(false)
  const draftedEmail = invoice.exception?.draftedEmail

  function handleGrnConfirm() {
    onSendGrnRequest()
    setGrnDialogOpen(false)
  }

  return (
    <div
      className={cn(
        "bg-card flex flex-col gap-4 rounded-lg border p-5",
        className
      )}
    >
      {/* Header — icon + vendor + amount + reason badge */}
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-md",
            iconBg
          )}
        >
          <Icon size={20} weight="regular" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3">
            <div className="flex min-w-0 items-baseline gap-2">
              <span className="text-foreground truncate text-sm font-semibold">
                {vendorName}
              </span>
              <span className="text-muted-foreground shrink-0 text-xs">
                ·
              </span>
              <InvoiceNumberLink
                invoiceId={invoice.id}
                label={invoice.invoiceNumber}
                className="text-xs shrink-0"
                mono={false}
              />
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                · {fmtAmount(invoice.amount, invoice.currency)}
              </span>
            </div>
            <StatusBadge tone={reasonDef.tone}>{reasonDef.label}</StatusBadge>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {subline}
          </p>
        </div>
      </div>

      {/* Neo's investigation prose */}
      {investigation ? (
        <div className="border-border bg-muted/30 rounded-md border-l-2 px-4 py-2.5">
          <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
            Neo
          </span>
          <p className="text-foreground/80 mt-1 text-sm italic leading-relaxed">
            {investigation}
          </p>
        </div>
      ) : null}

      {/* Disposition badge (only when user has touched this row) */}
      {reviewState !== "pending" ? (
        <div className="flex justify-end">{reviewStateBadge(reviewState)}</div>
      ) : null}

      {/* Action cluster — varies per reason code */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={onReviewHref}>
            Review
            <ArrowRight size={14} weight="bold" />
          </Link>
        </Button>

        {reasonCode === "DUPLICATE_DETECTED" ? (
          <>
            <Button size="sm" onClick={onConfirmDuplicate}>
              <ShieldWarning size={14} weight="bold" />
              Confirm duplicate
            </Button>
            <Button variant="outline" size="sm" onClick={onInvestigate}>
              <MagnifyingGlass size={14} weight="regular" />
              Mark investigated
            </Button>
          </>
        ) : null}

        {reasonCode === "PRICE_VARIANCE" || reasonCode === "MASTER_AGREEMENT_REVIEW" ? (
          <>
            <Button size="sm" onClick={onApprove}>
              <CheckCircle size={14} weight="bold" />
              Approve at invoice price
            </Button>
            <Button variant="outline" size="sm" onClick={onInvestigate}>
              <MagnifyingGlass size={14} weight="regular" />
              Investigate
            </Button>
          </>
        ) : null}

        {reasonCode === "MISSING_GRN" ? (
          <>
            <Button size="sm" onClick={() => setGrnDialogOpen(true)}>
              <EnvelopeSimple size={14} weight="regular" />
              Send GRN request
            </Button>
            <Button variant="outline" size="sm" onClick={onApprove}>
              Override
            </Button>
          </>
        ) : null}

        {reasonCode === "TAX_AMBIGUOUS" || reasonCode === "TAX_INELIGIBLE" ? (
          <>
            <Button variant="outline" size="sm" onClick={onInvestigate}>
              <Briefcase size={14} weight="regular" />
              Tax team queue
            </Button>
            <Button size="sm" onClick={onApprove}>
              <CheckCircle size={14} weight="bold" />
              Approve with ITC
            </Button>
          </>
        ) : null}

        {reasonCode === "GL_AMBIGUOUS" ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Question size={14} weight="regular" />
                  Pick GL
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {invoice.glProposal ? (
                  <DropdownMenuItem
                    onSelect={() => onPickGL(invoice.glProposal!.account)}
                  >
                    <span className="font-mono text-xs">
                      {invoice.glProposal.account}
                    </span>
                    <span>{invoice.glProposal.accountLabel}</span>
                  </DropdownMenuItem>
                ) : null}
                {invoice.glProposal?.alternatives?.map((alt) => (
                  <DropdownMenuItem
                    key={alt.account}
                    onSelect={() => onPickGL(alt.account)}
                  >
                    <span className="font-mono text-xs">{alt.account}</span>
                    <span>{alt.accountLabel}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={onAskVendor}>
              <EnvelopeSimple size={14} weight="regular" />
              Ask vendor
            </Button>
          </>
        ) : null}

        {reasonCode === "OCR_LOW_CONFIDENCE" ||
        reasonCode === "MULTI_CURRENCY_REVIEW" ||
        reasonCode === "VENDOR_NOT_REGISTERED" ||
        reasonCode === "NO_MATCHING_PO" ||
        reasonCode === "QTY_SHORT_RECEIVED" ||
        reasonCode === "QTY_OVER_RECEIVED" ||
        reasonCode === "EARLY_PAY_FLAGGED" ? (
          <>
            <Button variant="outline" size="sm" onClick={onInvestigate}>
              <MagnifyingGlass size={14} weight="regular" />
              Investigate
            </Button>
            <Button size="sm" onClick={onApprove}>
              Override
            </Button>
          </>
        ) : null}
      </div>

      {/* GRN-request dialog — only used by MISSING_GRN rows */}
      <Dialog open={grnDialogOpen} onOpenChange={setGrnDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Send GRN request</DialogTitle>
            <DialogDescription>
              Neo has drafted an email to receiving and the vendor. Review and
              send.
            </DialogDescription>
          </DialogHeader>
          {draftedEmail ? (
            <div className="border-border bg-muted/30 flex flex-col gap-2 rounded-md border p-4 text-sm">
              <div className="grid grid-cols-[60px_1fr] gap-x-3 gap-y-1">
                <span className="text-muted-foreground text-xs font-medium">
                  To
                </span>
                <span className="text-foreground font-mono text-xs">
                  {draftedEmail.to}
                </span>
                {draftedEmail.cc ? (
                  <>
                    <span className="text-muted-foreground text-xs font-medium">
                      Cc
                    </span>
                    <span className="text-foreground font-mono text-xs">
                      {draftedEmail.cc}
                    </span>
                  </>
                ) : null}
                <span className="text-muted-foreground text-xs font-medium">
                  Subject
                </span>
                <span className="text-foreground text-xs">
                  {draftedEmail.subject}
                </span>
              </div>
              <pre className="text-foreground/80 mt-2 whitespace-pre-wrap text-xs leading-relaxed font-sans">
                {draftedEmail.body}
              </pre>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No drafted email on file for this invoice.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setGrnDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGrnConfirm}>
              <EnvelopeSimple size={14} weight="regular" />
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
