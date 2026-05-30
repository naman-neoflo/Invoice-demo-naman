// components/invoice-processing/tax-coding-card.tsx
//
// Mode D — tax-coding hero for the match-detail surface. Renders the parsed
// invoice on the left, Neo's tax-analysis card on the right, then reuses the
// GL proposal card, then a distinct tax-recommendation card with reasoning
// citing IRAS, then a Mode-D-specific action row.
//
// Per docs/handoff/invoice-processing/03-screen-specs.md § "Surface 3:
// Match-detail" → Mode D diagram. Voice rules per
// docs/handoff/08-voice-and-tone.md.
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  CheckCircle,
  CaretDown,
  CurrencyCircleDollar,
  Lightbulb,
  ShieldCheck,
} from "@phosphor-icons/react"

import { GLProposalCard } from "@/components/neoflo-os/invoice-processing/gl-proposal-card"
import { InvoiceNumberLink } from "@/components/neoflo-os/invoice-processing/invoice-number-link"
import { Button } from "@/components/neoflo-os/ui/button"
import { Card } from "@/components/neoflo-os/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/neoflo-os/ui/dropdown-menu"
import {
  useHydratedInvoiceProcessingStore,
  useInvoiceProcessingStore,
} from "@/lib/neoflo-os/invoice-processing/invoice-processing-store"
import { getVendor } from "@/lib/neoflo-os/invoice-processing/seed-vendors"
import type { Invoice, TaxProposal } from "@/lib/neoflo-os/invoice-processing/types"
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

function fmtDate(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy")
}

// Alternate tax treatments the user can pick from the [Edit tax ▾] dropdown.
// Excludes INPUT_TAX_CREDIT_ELIGIBLE since that's the recommendation already.
const ALTERNATE_TREATMENTS: {
  treatment: TaxProposal["treatment"]
  label: string
}[] = [
  {
    treatment: "INPUT_TAX_CREDIT_INELIGIBLE",
    label: "Mark ineligible — no input tax credit",
  },
  {
    treatment: "USE_TAX_ACCRUAL",
    label: "Accrue use tax",
  },
  {
    treatment: "EXEMPT",
    label: "Exempt — no tax applies",
  },
  {
    treatment: "NEEDS_HUMAN_REVIEW",
    label: "Flag for human review",
  },
]

// ════════════════════════════════════════════════════════════════════
// Sub: parsed invoice card (left)
// ════════════════════════════════════════════════════════════════════

function ParsedInvoiceColumn({ invoice }: { invoice: Invoice }) {
  const subtotal = invoice.lines.reduce((s, l) => s + l.lineTotal, 0)
  const taxAmount = invoice.taxLine?.amount ?? 0
  const taxRatePct = invoice.taxLine
    ? Math.round(invoice.taxLine.rate * 100)
    : 0

  return (
    <section className="bg-card flex flex-col gap-4 rounded-lg border p-6">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
          Invoice (parsed)
        </h2>
        <InvoiceNumberLink
          invoiceId={invoice.id}
          label={invoice.invoiceNumber}
          className="text-xs"
        />
      </header>

      <dl className="grid grid-cols-[7rem_1fr] gap-y-2 text-sm">
        <dt className="text-muted-foreground">Issued:</dt>
        <dd className="text-foreground">{fmtDate(invoice.issuedAt)}</dd>

        <dt className="text-muted-foreground">Due:</dt>
        <dd className="text-foreground">
          {fmtDate(invoice.dueAt)}{" "}
          <span className="text-muted-foreground">
            ({invoice.termsLabel.toLowerCase()})
          </span>
        </dd>
      </dl>

      <div className="border-border/60 flex flex-col border-t pt-4">
        <div className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
          Lines
        </div>
        {invoice.lines.map((line) => (
          <div
            key={line.lineNumber}
            className="border-border/40 flex items-start justify-between gap-3 border-b py-2 text-sm last:border-b-0"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-foreground">{line.description}</span>
              <span className="text-muted-foreground text-xs">
                {line.quantity} × {fmtMoney(line.unitPrice, invoice.currency)}{" "}
                {line.unitOfMeasure}
              </span>
            </div>
            <span className="text-foreground shrink-0 tabular-nums">
              {fmtMoney(line.lineTotal, invoice.currency)}
            </span>
          </div>
        ))}
      </div>

      <div className="ml-auto flex w-56 flex-col gap-1 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="text-foreground tabular-nums">
            {fmtMoney(subtotal, invoice.currency)}
          </span>
        </div>
        {invoice.taxLine ? (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {invoice.taxLine.type} {taxRatePct}%:
            </span>
            <span className="text-foreground tabular-nums">
              {fmtMoney(taxAmount, invoice.currency)}
            </span>
          </div>
        ) : null}
        <div className="border-border flex items-center justify-between border-t pt-1">
          <span className="text-foreground font-semibold">Total:</span>
          <span className="text-foreground font-semibold tabular-nums">
            {fmtMoney(invoice.amount, invoice.currency)}
          </span>
        </div>
      </div>
    </section>
  )
}

// ════════════════════════════════════════════════════════════════════
// Sub: tax analysis card (right)
// ════════════════════════════════════════════════════════════════════

function TaxAnalysisColumn({ invoice }: { invoice: Invoice }) {
  const vendor = getVendor(invoice.vendorId)
  const taxProposal = invoice.taxProposal
  const isEligible = taxProposal?.treatment === "INPUT_TAX_CREDIT_ELIGIBLE"
  const jurisdiction = vendor?.jurisdiction
  const jurisdictionLabel =
    jurisdiction === "SG"
      ? "Singapore"
      : jurisdiction === "GB"
        ? "United Kingdom"
        : jurisdiction === "AU"
          ? "Australia"
          : jurisdiction === "EU"
            ? "European Union"
            : jurisdiction === "US"
              ? "United States"
              : "Other"
  const today = format(new Date(), "MMM d, yyyy")

  return (
    <section className="bg-card flex flex-col gap-4 rounded-lg border p-6">
      <header className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
        Neo&rsquo;s tax analysis
      </header>

      <dl className="grid grid-cols-[10rem_1fr] gap-y-2 text-sm">
        <dt className="text-muted-foreground">Vendor jurisdiction:</dt>
        <dd className="text-foreground">{jurisdictionLabel}</dd>

        {vendor?.taxRegistration ? (
          <>
            <dt className="text-muted-foreground">
              Vendor {vendor.taxRegistration.type} registration:
            </dt>
            <dd className="text-foreground font-mono text-xs">
              {vendor.taxRegistration.id}
            </dd>
          </>
        ) : null}
      </dl>

      <ul className="flex flex-col gap-1.5 text-sm">
        <li className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
          <CheckCircle size={14} weight="fill" className="shrink-0" />
          <span>Validated against IRAS</span>
        </li>
        <li className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
          <CheckCircle size={14} weight="fill" className="shrink-0" />
          <span>Active as of {today}</span>
        </li>
      </ul>

      {invoice.taxLine ? (
        <div className="border-border/60 flex flex-col gap-1 border-t pt-4 text-sm">
          <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Tax line
          </div>
          <div className="text-foreground">
            {invoice.taxLine.type} {Math.round(invoice.taxLine.rate * 100)}% on{" "}
            {fmtMoney(invoice.taxLine.base, invoice.currency)} ={" "}
            <span className="font-semibold tabular-nums">
              {fmtMoney(invoice.taxLine.amount, invoice.currency)}
            </span>
          </div>
        </div>
      ) : null}

      {taxProposal?.eligibilityChecks?.length ? (
        <div className="border-border/60 flex flex-col gap-2 border-t pt-4">
          <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Input tax credit eligibility
          </div>
          <ul className="flex flex-col gap-1.5 text-sm">
            {taxProposal.eligibilityChecks.map((check) => (
              <li
                key={check.label}
                className={cn(
                  "flex items-start gap-2",
                  check.passed
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-amber-700 dark:text-amber-300",
                )}
              >
                <CheckCircle
                  size={14}
                  weight="fill"
                  className="mt-0.5 shrink-0"
                />
                <span>{check.label}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {taxProposal ? (
        <div
          className={cn(
            "mt-2 flex items-center gap-2 rounded-md border p-3 text-sm",
            isEligible
              ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
              : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
          )}
        >
          <ShieldCheck size={16} weight="fill" className="shrink-0" />
          <span className="font-semibold uppercase tracking-wider text-xs">
            {isEligible ? "Eligible" : "Review"}
          </span>
          <span className="text-foreground/85">
            {isEligible
              ? `claim ${fmtMoney(taxProposal.amount, invoice.currency)} input tax credit`
              : `${taxProposal.treatment.replace(/_/g, " ").toLowerCase()}`}
          </span>
        </div>
      ) : null}
    </section>
  )
}

// ════════════════════════════════════════════════════════════════════
// Component
// ════════════════════════════════════════════════════════════════════

interface TaxCodingCardProps {
  invoice: Invoice
  className?: string
}

export function TaxCodingCard({ invoice, className }: TaxCodingCardProps) {
  const router = useRouter()
  const base = useBasePath()
  const taxProposal = invoice.taxProposal

  const runtimeState = useHydratedInvoiceProcessingStore(
    (s) => s.applications[invoice.id],
  )
  const isApproved =
    runtimeState?.status === "user-approved" ||
    runtimeState?.status === "user-edited-tax"

  const [confirmation, setConfirmation] = React.useState<string | null>(null)

  function showToastAndRedirect(message: string, path: string) {
    setConfirmation(message)
    window.setTimeout(() => router.push(path), 600)
  }

  function handleApprove() {
    useInvoiceProcessingStore.getState().approveInvoice(invoice.id)
    const amountLabel = taxProposal
      ? fmtMoney(taxProposal.amount, invoice.currency)
      : ""
    showToastAndRedirect(
      `Posted to NetSuite with ${amountLabel} input tax credit claimed.`,
      `${base}/invoice-processing`,
    )
  }

  function handleEditTax(treatment: TaxProposal["treatment"]) {
    useInvoiceProcessingStore
      .getState()
      .editTaxTreatment(invoice.id, treatment)
  }

  function handleTaxTeamReview() {
    useInvoiceProcessingStore
      .getState()
      .markExceptionInvestigating(invoice.id)
    showToastAndRedirect(
      "Queued for tax-team review.",
      `${base}/invoice-processing/exceptions`,
    )
  }

  const confidencePct = taxProposal
    ? Math.round(taxProposal.confidence * 100)
    : undefined
  const taxAmountLabel = taxProposal
    ? fmtMoney(taxProposal.amount, invoice.currency)
    : ""

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Confirmation toast */}
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

      {/* Side-by-side parsed invoice + tax analysis */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ParsedInvoiceColumn invoice={invoice} />
        <TaxAnalysisColumn invoice={invoice} />
      </div>

      {/* GL proposal (reused from Mode A) */}
      {invoice.glProposal ? (
        <GLProposalCard
          glProposal={invoice.glProposal}
          editedGL={runtimeState?.editedGL}
        />
      ) : null}

      {/* Tax recommendation card */}
      {taxProposal ? (
        <Card className="border-primary/20 bg-primary/[0.03] flex flex-col gap-4 p-6">
          <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CurrencyCircleDollar
                size={16}
                weight="fill"
                className="text-primary"
              />
              <h2 className="text-foreground text-sm font-semibold">
                Tax: {taxAmountLabel} input tax credit
              </h2>
            </div>
            {confidencePct !== undefined ? (
              <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold">
                {confidencePct}% confidence
              </span>
            ) : null}
          </header>

          <blockquote className="text-foreground/85 border-primary/30 border-l-2 pl-4 text-sm italic leading-relaxed">
            {taxProposal.reasoning}
          </blockquote>

          <div className="text-muted-foreground text-xs">
            Sources: {taxProposal.sources.join(" · ")}
          </div>
        </Card>
      ) : null}

      {/* Action row */}
      {!isApproved && !confirmation ? (
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={handleTaxTeamReview}>
            Tax-team review
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Edit tax
                <CaretDown size={12} weight="bold" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              {ALTERNATE_TREATMENTS.map((opt) => (
                <DropdownMenuItem
                  key={opt.treatment}
                  onSelect={() => handleEditTax(opt.treatment)}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleApprove}>
            <CheckCircle size={14} weight="bold" />
            Approve &amp; Post (with ITC)
          </Button>
        </div>
      ) : null}
    </div>
  )
}
