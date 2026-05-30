// components/invoice-processing/duplicate-finding-card.tsx
//
// Mode B — duplicate detection hero for the match-detail surface. Renders the
// "stop this payment" banner, side-by-side incoming vs already-paid invoice
// cards (with verbatim line items aligned), Neo's reasoning panel, the drafted
// vendor email, and a Mode-B-specific action row.
//
// Per docs/handoff/invoice-processing/03-screen-specs.md § "Surface 3:
// Match-detail" → Mode B diagram. Voice rules per
// docs/handoff/08-voice-and-tone.md.
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  CheckCircle,
  Envelope,
  Lightbulb,
  ShieldWarning,
} from "@phosphor-icons/react"

import { InvoiceNumberLink } from "@/components/neoflo-os/invoice-processing/invoice-number-link"
import { Button } from "@/components/neoflo-os/ui/button"
import { Card } from "@/components/neoflo-os/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/neoflo-os/ui/dialog"
import {
  useHydratedInvoiceProcessingStore,
  useInvoiceProcessingStore,
} from "@/lib/neoflo-os/invoice-processing/invoice-processing-store"
import { getApplicationByInvoiceId } from "@/lib/neoflo-os/invoice-processing/seed-applications"
import { getInvoice } from "@/lib/neoflo-os/invoice-processing/seed-invoices"
import { getVendor } from "@/lib/neoflo-os/invoice-processing/seed-vendors"
import type { Invoice } from "@/lib/neoflo-os/invoice-processing/types"
import { useBasePath } from "@/lib/neoflo-os/workspace/use-base-path"
import { cn } from "@/lib/neoflo-os/utils"

// ════════════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════════════

function fmtMoney(amount: number, currency: string): string {
  const rounded = amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  if (currency === "USD") return `$${rounded}`
  return `${currency} ${rounded}`
}

function fmtMonthDay(iso: string): string {
  return format(new Date(iso), "MMM d")
}

// ════════════════════════════════════════════════════════════════════
// Sub: side-by-side invoice cards
// ════════════════════════════════════════════════════════════════════

interface InvoiceColumnProps {
  label: string
  invoice: Invoice
  vendorName: string
  /** Right-card-only: Tipalti / NetSuite payment trail line. */
  paymentRef?: string
  /** Subtitle under the line items (right card uses this). */
  lineItemsSubtitle?: string
}

function InvoiceColumn({
  label,
  invoice,
  vendorName,
  paymentRef,
  lineItemsSubtitle,
}: InvoiceColumnProps) {
  return (
    <section className="bg-card flex flex-col gap-4 rounded-lg border p-6">
      <header className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
        {label}
      </header>

      <div className="flex flex-col gap-1">
        <InvoiceNumberLink
          invoiceId={invoice.id}
          label={invoice.invoiceNumber}
          className="text-foreground hover:text-primary text-sm font-semibold self-start"
        />
        <div className="text-foreground text-lg font-semibold tabular-nums">
          {fmtMoney(invoice.amount, invoice.currency)}
        </div>
        <div className="text-muted-foreground text-sm">{vendorName}</div>
        {paymentRef ? (
          <div className="text-muted-foreground text-xs">{paymentRef}</div>
        ) : null}
      </div>

      <div className="border-border/60 flex flex-col border-t pt-4">
        <div className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
          Lines
        </div>
        {invoice.lines.map((line) => (
          <div
            key={line.lineNumber}
            className="border-border/40 flex items-start justify-between gap-3 border-b py-2 text-sm last:border-b-0"
          >
            <span className="text-foreground min-w-0 flex-1">
              {line.description}
            </span>
            <span className="text-foreground shrink-0 tabular-nums">
              {fmtMoney(line.lineTotal, invoice.currency)}
            </span>
          </div>
        ))}
        {lineItemsSubtitle ? (
          <div className="text-muted-foreground mt-2 text-xs italic">
            {lineItemsSubtitle}
          </div>
        ) : null}
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════════
// Component
// ════════════════════════════════════════════════════════════════════

interface DuplicateFindingCardProps {
  invoice: Invoice
  className?: string
}

export function DuplicateFindingCard({
  invoice,
  className,
}: DuplicateFindingCardProps) {
  const router = useRouter()
  const base = useBasePath()
  const finding = invoice.duplicateFinding
  const vendor = getVendor(invoice.vendorId)
  const vendorName = vendor?.name ?? invoice.vendorId

  const originalInvoice = finding
    ? getInvoice(finding.duplicateOfInvoiceId)
    : undefined
  const originalApplication = finding
    ? getApplicationByInvoiceId(finding.duplicateOfInvoiceId)
    : undefined
  const originalVendorName = originalInvoice
    ? getVendor(originalInvoice.vendorId)?.name ?? originalInvoice.vendorId
    : vendorName

  // Tipalti / payment trail — pull from the audit trail if present; the spec
  // calls for "Paid via Tipalti TIP-77492" and the application's audit log
  // names that reference explicitly for `app-998123-a`.
  const tipaltiRef = React.useMemo(() => {
    if (!originalApplication) return undefined
    const event = originalApplication.auditTrail.find(
      (e) => e.description?.includes("Tipalti") || e.payload?.tipaltiRef,
    )
    const fromPayload = event?.payload?.tipaltiRef as string | undefined
    if (fromPayload) return `Paid via Tipalti ${fromPayload}`
    // Extract a TIP-##### token from description as a fallback.
    const match = event?.description?.match(/TIP-\d+/)
    if (match) return `Paid via Tipalti ${match[0]}`
    return undefined
  }, [originalApplication])

  // Runtime state — once user confirms or overrides, swap actions for a banner.
  const runtimeState = useHydratedInvoiceProcessingStore(
    (s) => s.applications[invoice.id],
  )
  const isConfirmed = runtimeState?.status === "duplicate-confirmed"
  const isOverridden = runtimeState?.status === "duplicate-overridden"
  const isResolved = isConfirmed || isOverridden

  const [confirmation, setConfirmation] = React.useState<string | null>(null)
  const [overrideOpen, setOverrideOpen] = React.useState(false)

  function showToastAndRedirect(message: string, path: string) {
    setConfirmation(message)
    window.setTimeout(() => router.push(path), 600)
  }

  function handleConfirm() {
    useInvoiceProcessingStore.getState().confirmDuplicate(invoice.id)
    showToastAndRedirect(
      `Duplicate confirmed. Vendor email queued. ${fmtMoney(
        invoice.amount,
        invoice.currency,
      )} saved.`,
      `${base}/invoice-processing`,
    )
  }

  function handleOverride() {
    useInvoiceProcessingStore.getState().overrideDuplicateAndPost(invoice.id)
    setOverrideOpen(false)
    showToastAndRedirect(
      "Posted with duplicate override flag in audit trail.",
      `${base}/invoice-processing`,
    )
  }

  function handleInvestigate() {
    if (typeof window === "undefined") return
    window.dispatchEvent(
      new CustomEvent("neo:open-chat", {
        detail: {
          prompt: `What else should I check on the ${vendorName} duplicate?`,
        },
      }),
    )
  }

  const draftedEmail = finding?.draftedVendorEmail

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* ── Stop-the-payment banner ─────────────────────────────────── */}
      <Card className="border-rose-300 bg-rose-50/60 dark:border-rose-500/40 dark:bg-rose-500/10">
        <div className="flex items-start gap-4 px-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
            <ShieldWarning size={20} weight="fill" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="text-foreground text-sm font-semibold uppercase tracking-wider">
              Likely duplicate &mdash;{" "}
              {Math.round((finding?.similarityScore ?? 0) * 100)}% confidence
            </div>
            <p className="text-foreground/85 text-sm leading-relaxed">
              Stop this payment. Neo found an identical invoice already paid{" "}
              {finding?.matchSignals.daysApart ?? 26} days ago. Probable vendor
              billing-system bug.
            </p>
          </div>
        </div>
      </Card>

      {/* ── Confirmation toast / resolved state ─────────────────────── */}
      {confirmation ? (
        <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 duration-300 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          <CheckCircle
            size={20}
            weight="fill"
            className="shrink-0 text-emerald-600 dark:text-emerald-400"
          />
          <span className="font-medium">{confirmation}</span>
        </div>
      ) : null}
      {isResolved && !confirmation ? (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          <CheckCircle
            size={20}
            weight="fill"
            className="shrink-0 text-emerald-600 dark:text-emerald-400"
          />
          <span className="font-medium">
            {isConfirmed
              ? "Duplicate confirmed. Vendor email queued."
              : "Posted with duplicate override flag in audit trail."}
          </span>
        </div>
      ) : null}

      {/* ── Side-by-side incoming vs already paid ───────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <InvoiceColumn
          label={`Incoming (${fmtMonthDay(invoice.receivedAt)})`}
          invoice={invoice}
          vendorName={vendorName}
        />
        {originalInvoice ? (
          <InvoiceColumn
            label={`Already paid (${fmtMonthDay(originalApplication?.postedToErpAt ?? originalInvoice.receivedAt)})`}
            invoice={originalInvoice}
            vendorName={originalVendorName}
            paymentRef={tipaltiRef ?? "Paid via Tipalti TIP-77492"}
            lineItemsSubtitle="identical line items"
          />
        ) : null}
      </div>

      {/* ── Neo's reasoning panel ───────────────────────────────────── */}
      {finding ? (
        <Card className="border-primary/20 bg-primary/[0.03] flex flex-col gap-4 p-6">
          <header className="flex items-center gap-2">
            <Lightbulb size={16} weight="fill" className="text-primary" />
            <h2 className="text-foreground text-sm font-semibold">
              Neo&rsquo;s reasoning
            </h2>
          </header>

          <ul className="flex flex-col gap-1.5 text-sm">
            <li className="text-foreground/85">
              Same vendor ({vendorName}, {invoice.vendorId})
            </li>
            <li className="text-foreground/85">
              Same amount ({fmtMoney(invoice.amount, invoice.currency)})
            </li>
            <li className="text-foreground/85">
              Same line items ({invoice.lines.length} of {invoice.lines.length}{" "}
              verbatim)
            </li>
            <li className="text-foreground/85">
              Different invoice number ({invoice.invoiceNumber.replace(/^INV-/, "")}{" "}
              vs{" "}
              {(originalInvoice?.invoiceNumber ?? "").replace(/^INV-/, "")})
            </li>
            <li className="text-foreground/85">
              {finding.matchSignals.daysApart} days apart
            </li>
            <li className="text-foreground/85">
              Vendor pattern: monthly cleaning ($4,200) + quarterly deep-clean
              ($42,800) &mdash; they&rsquo;ve already billed Q2 once.
            </li>
          </ul>

          <blockquote className="text-foreground/85 border-primary/30 border-l-2 pl-4 text-sm italic leading-relaxed">
            Recommended: do not post. Draft confirmation email to Tom at Acme
            Cleaning AP.
          </blockquote>

          <div className="text-muted-foreground text-xs">
            Sources: vendor invoice history &middot; Tipalti payment record
          </div>
        </Card>
      ) : null}

      {/* ── Drafted vendor email ────────────────────────────────────── */}
      {draftedEmail ? (
        <Card className="bg-card flex flex-col gap-4 p-6">
          <header className="flex items-center gap-2">
            <Envelope size={16} weight="fill" className="text-primary" />
            <h2 className="text-foreground text-sm font-semibold">
              Drafted vendor email
            </h2>
          </header>

          <dl className="border-border/60 grid grid-cols-[5rem_1fr] gap-y-1 border-b pb-3 text-sm">
            <dt className="text-muted-foreground">To:</dt>
            <dd className="text-foreground font-mono text-xs">
              {draftedEmail.to}
            </dd>
            {draftedEmail.cc ? (
              <>
                <dt className="text-muted-foreground">Cc:</dt>
                <dd className="text-foreground font-mono text-xs">
                  {draftedEmail.cc}
                </dd>
              </>
            ) : null}
            <dt className="text-muted-foreground">Subject:</dt>
            <dd className="text-foreground">{draftedEmail.subject}</dd>
          </dl>

          <div className="text-foreground/90 whitespace-pre-wrap text-sm leading-relaxed">
            {draftedEmail.body}
          </div>
        </Card>
      ) : null}

      {/* ── Action button row ───────────────────────────────────────── */}
      {!isResolved && !confirmation ? (
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={handleInvestigate}>
            Investigate
          </Button>
          <Button variant="outline" onClick={() => setOverrideOpen(true)}>
            Override and post
          </Button>
          <Button onClick={handleConfirm}>
            <CheckCircle size={14} weight="bold" />
            Confirm duplicate + Send email
          </Button>
        </div>
      ) : null}

      {/* ── Override confirmation dialog ────────────────────────────── */}
      <Dialog open={overrideOpen} onOpenChange={setOverrideOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override the duplicate flag?</DialogTitle>
            <DialogDescription>
              You&rsquo;re about to post a payment Neo flagged as a duplicate.
              An override note will be added to the audit trail.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 border-border/60 rounded-md border p-4 text-sm">
            <div className="text-foreground font-semibold">{vendorName}</div>
            <div className="text-foreground tabular-nums">
              {fmtMoney(invoice.amount, invoice.currency)} &middot;{" "}
              {invoice.invoiceNumber}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleOverride}>
              Override and post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
