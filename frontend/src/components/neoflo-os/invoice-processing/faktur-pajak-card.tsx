// components/invoice-processing/faktur-pajak-card.tsx
//
// Faktur Pajak validation card — rendered for `matchMode === "faktur-pajak"`
// (IDR invoices only). Mirrors the production FakturPajakScreen layout:
//   left  → FP document card (mock, no real PDF in demo)
//   right → "Extracted Data" + status banner + comparison table
//
// Table columns: Field | Faktur Pajak | Invoice
// Acknowledgeable fields: vendor_name, customer_name  (Acknowledge button)
// Amount fields: taxable_amount, vat_amount           (Copy-from-invoice button)
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowsLeftRight,
  CheckCircle,
  FileText,
  Seal,
  ShieldCheck,
  Warning,
  X,
} from "@phosphor-icons/react"

import { Button } from "@/components/neoflo-os/ui/button"
import { Card } from "@/components/neoflo-os/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/neoflo-os/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/neoflo-os/ui/tooltip"
import {
  useHydratedInvoiceProcessingStore,
  useInvoiceProcessingStore,
} from "@/lib/neoflo-os/invoice-processing/invoice-processing-store"
import type { FakturPajakField, Invoice } from "@/lib/neoflo-os/invoice-processing/types"
import { useBasePath } from "@/lib/neoflo-os/workspace/use-base-path"
import { cn } from "@/lib/neoflo-os/utils"

// ════════════════════════════════════════════════════════════════════
// Constants
// ════════════════════════════════════════════════════════════════════

const ACKNOWLEDGEABLE_FIELDS = new Set(["vendor_name", "customer_name"])

// ════════════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════════════

function fmtIDR(amount: number): string {
  return `Rp ${Math.round(amount).toLocaleString("id-ID")}`
}

// ════════════════════════════════════════════════════════════════════
// Sub: FP Document Card (left panel)
// ════════════════════════════════════════════════════════════════════

function FpDocumentCard({ invoice }: { invoice: Invoice }) {
  const fp = invoice.fakturPajak!
  return (
    <Card className="bg-card flex flex-col gap-0 overflow-hidden">
      {/* Header strip */}
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
        <FileText size={15} weight="fill" className="text-muted-foreground shrink-0" />
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
          Faktur Pajak
        </span>
        <span className="text-muted-foreground ml-auto font-mono text-xs">
          {fp.fp_date}
        </span>
      </div>

      {/* Mock document body */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* FP Number badge */}
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
            Nomor Faktur Pajak
          </span>
          <div className="flex items-center gap-2">
            <Seal size={16} weight="fill" className="text-primary shrink-0" />
            <span className="text-foreground font-mono text-base font-semibold tracking-wide">
              {fp.fp_number}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-border/50 border-t" />

        {/* Extracted fields summary */}
        <div className="flex flex-col gap-3">
          <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
            Extracted fields
          </span>
          {fp.fields.map((field) => {
            const isMatch = field.match_status === "match"
            return (
              <div key={field.field_name} className="flex flex-col gap-0.5">
                <span className="text-muted-foreground text-xs">{field.display_name}</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isMatch ? "text-foreground" : "text-amber-700 dark:text-amber-400",
                    )}
                  >
                    {field.fp_value ?? "—"}
                  </span>
                  {isMatch ? (
                    <CheckCircle size={13} weight="fill" className="shrink-0 text-emerald-500" />
                  ) : (
                    <Warning size={13} weight="fill" className="shrink-0 text-amber-500" />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Tax amounts */}
        <div className="border-border/50 mt-auto border-t pt-3">
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">DPP:</span>
              <span className="text-foreground tabular-nums">
                Rp {invoice.fakturPajak?.fields
                  .find((f) => f.field_name === "taxable_amount")
                  ?.fp_value ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">PPN 11%:</span>
              <span className="text-foreground tabular-nums">
                Rp {invoice.fakturPajak?.fields
                  .find((f) => f.field_name === "vat_amount")
                  ?.fp_value ?? "—"}
              </span>
            </div>
            <div className="border-border flex items-center justify-between border-t pt-1 font-semibold">
              <span className="text-foreground">Total:</span>
              <span className="text-foreground tabular-nums">{fmtIDR(invoice.amount)}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ════════════════════════════════════════════════════════════════════
// Sub: Status Banner
// ════════════════════════════════════════════════════════════════════

function StatusBanner({ variant }: { variant: "success" | "error" }) {
  const isSuccess = variant === "success"
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-2 rounded-lg border px-4 py-3 text-sm",
        isSuccess
          ? "border-dashed border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "border-dashed border-red-300 bg-red-50 text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300",
      )}
    >
      {isSuccess ? (
        <CheckCircle size={15} weight="fill" className="shrink-0" />
      ) : (
        <Warning size={15} weight="fill" className="shrink-0" />
      )}
      <span className="font-semibold">
        {isSuccess
          ? "All fields matched, ready to proceed."
          : "Mismatch detected. Please review the Faktur Pajak document."}
      </span>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// Sub: Comparison Table
// ════════════════════════════════════════════════════════════════════

interface ComparisonTableProps {
  fields: (FakturPajakField & { is_acknowledged?: boolean })[]
  localEdits: Record<string, string>
  onAcknowledge: (fieldName: string) => void
  onQuickCopy: (fieldName: string, value: string) => void
}

function ComparisonTable({
  fields,
  localEdits,
  onAcknowledge,
  onQuickCopy,
}: ComparisonTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/60 hover:bg-muted/60">
          <TableHead className="w-[30%] text-xs font-semibold text-foreground">Field</TableHead>
          <TableHead className="w-[35%] text-xs font-semibold text-foreground">
            Faktur Pajak
          </TableHead>
          <TableHead className="w-[35%] text-xs font-semibold text-foreground">Invoice</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fields.map((field) => {
          const isAckField = ACKNOWLEDGEABLE_FIELDS.has(field.field_name)
          const currentFpValue = localEdits[field.field_name] ?? field.fp_value ?? ""
          const isMismatch =
            field.match_status === "mismatch" ||
            (field.match_status == null &&
              currentFpValue !== "" &&
              field.invoice_value != null &&
              currentFpValue !== field.invoice_value)
          const isResolved = isAckField
            ? !!field.is_acknowledged
            : currentFpValue === (field.invoice_value ?? "")

          const rowClass = cn(
            field.field_name && isMismatch && !isResolved && field.required
              ? "bg-red-50/60 dark:bg-red-500/5"
              : isMismatch && !isResolved
                ? "bg-amber-50/60 dark:bg-amber-500/5"
                : "",
          )

          const fpValueClass = cn(
            "text-sm",
            isMismatch && !isResolved && field.required
              ? "font-medium text-red-700 dark:text-red-400"
              : isMismatch && !isResolved
                ? "font-medium text-amber-700 dark:text-amber-400"
                : "text-foreground",
          )

          const showAckButton =
            isAckField && isMismatch && !field.is_acknowledged
          const showCopyButton =
            !isAckField && isMismatch && !isResolved && !!field.invoice_value

          return (
            <TableRow key={field.field_name} className={rowClass}>
              {/* Field */}
              <TableCell className="align-middle bg-muted/30 py-3">
                <span className="text-sm font-medium text-foreground">
                  {field.display_name}
                  {field.required && (
                    <span className="ml-0.5 text-red-500" aria-label="required">
                      *
                    </span>
                  )}
                </span>
              </TableCell>

              {/* Faktur Pajak value + action */}
              <TableCell className="py-3">
                <div className="flex items-center gap-2">
                  <span className={fpValueClass}>{currentFpValue || "—"}</span>

                  {/* Acknowledged badge */}
                  {field.is_acknowledged && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <CheckCircle size={11} weight="fill" />
                      Acknowledged
                    </span>
                  )}

                  {/* Acknowledge button */}
                  {showAckButton && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 shrink-0 gap-1 px-2 text-xs"
                            onClick={() => onAcknowledge(field.field_name)}
                          >
                            <CheckCircle size={11} weight="bold" />
                            Acknowledge
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          Confirm this discrepancy is acceptable
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {/* Copy-from-invoice button */}
                  {showCopyButton && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onQuickCopy(field.field_name, field.invoice_value!)}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-gray-300 bg-white text-gray-700 transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                            aria-label={`Copy invoice value: ${field.invoice_value}`}
                          >
                            <ArrowsLeftRight size={12} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          Copy from invoice: &ldquo;{field.invoice_value}&rdquo;
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {/* Edited badge */}
                  {localEdits[field.field_name] !== undefined && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                      copied
                    </span>
                  )}
                </div>
              </TableCell>

              {/* Invoice value */}
              <TableCell className="py-3">
                <span className="text-sm text-foreground/80">
                  {field.invoice_value || "—"}
                </span>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

// ════════════════════════════════════════════════════════════════════
// Main component
// ════════════════════════════════════════════════════════════════════

interface FakturPajakCardProps {
  invoice: Invoice
  className?: string
}

export function FakturPajakCard({ invoice, className }: FakturPajakCardProps) {
  const router = useRouter()
  const base = useBasePath()
  const fp = invoice.fakturPajak!

  // Persisted per-invoice FP state from the store
  const localEdits = useHydratedInvoiceProcessingStore(
    (s) => s.fakturPajakEdits[invoice.id] ?? {},
  )
  const acknowledgedNames: string[] = useHydratedInvoiceProcessingStore(
    (s) => s.fakturPajakAcknowledgements[invoice.id] ?? [],
  )

  const runtimeStatus = useHydratedInvoiceProcessingStore(
    (s) => s.applications[invoice.id]?.status,
  )
  const isApproved =
    runtimeStatus === "user-approved" || runtimeStatus === "user-edited-tax"

  const [confirmation, setConfirmation] = React.useState<string | null>(null)

  // Merge local state into fields
  const fieldsWithState = React.useMemo(
    () =>
      fp.fields.map((f) => ({
        ...f,
        fp_value: localEdits[f.field_name] ?? f.fp_value,
        is_acknowledged: acknowledgedNames.includes(f.field_name),
      })),
    [fp.fields, localEdits, acknowledgedNames],
  )

  // Unresolved blocking mismatches
  const unacknowledgedMismatches = React.useMemo(
    () =>
      fieldsWithState.filter(
        (f) =>
          f.required &&
          f.match_status === "mismatch" &&
          ACKNOWLEDGEABLE_FIELDS.has(f.field_name) &&
          !f.is_acknowledged,
      ),
    [fieldsWithState],
  )

  const uncopiedAmounts = React.useMemo(
    () =>
      fieldsWithState.filter(
        (f) =>
          f.required &&
          f.match_status === "mismatch" &&
          !ACKNOWLEDGEABLE_FIELDS.has(f.field_name) &&
          localEdits[f.field_name] === undefined,
      ),
    [fieldsWithState, localEdits],
  )

  const canProceed =
    unacknowledgedMismatches.length === 0 && uncopiedAmounts.length === 0
  const bannerVariant: "success" | "error" = canProceed ? "success" : "error"

  // Disabled reasons for the proceed button tooltip
  const disabledReasons = React.useMemo(() => {
    const r: string[] = []
    if (unacknowledgedMismatches.length > 0)
      r.push(
        `${unacknowledgedMismatches.length} field${unacknowledgedMismatches.length > 1 ? "s" : ""} require acknowledgement`,
      )
    if (uncopiedAmounts.length > 0)
      r.push(
        `${uncopiedAmounts.length} amount mismatch${uncopiedAmounts.length > 1 ? "es" : ""} — use the copy button to resolve`,
      )
    return r
  }, [unacknowledgedMismatches, uncopiedAmounts])

  // Handlers
  function handleAcknowledge(fieldName: string) {
    useInvoiceProcessingStore
      .getState()
      .acknowledgeFakturPajakField(invoice.id, fieldName)
  }

  function handleQuickCopy(fieldName: string, value: string) {
    useInvoiceProcessingStore
      .getState()
      .editFakturPajakField(invoice.id, fieldName, value)
  }

  function handleApprove() {
    useInvoiceProcessingStore.getState().approveInvoice(invoice.id)
    setConfirmation("Posted to ERP. Faktur Pajak validated and audit log generated.")
    window.setTimeout(() => router.push(`${base}/invoice-processing`), 700)
  }

  function handleReject() {
    useInvoiceProcessingStore.getState().rejectInvoice(invoice.id)
    router.push(`${base}/invoice-processing/exceptions`)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Confirmation toast */}
      {confirmation ? (
        <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 duration-300 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          <CheckCircle size={20} weight="fill" className="shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium">{confirmation}</span>
        </div>
      ) : null}

      {/* Already-approved banner */}
      {isApproved && !confirmation ? (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          <CheckCircle size={20} weight="fill" className="shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium">
            Posted to ERP. Faktur Pajak validated and audit log generated.
          </span>
        </div>
      ) : null}

      {/* Two-column layout: FP doc left, extracted data right */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* LEFT: FP document card */}
        <FpDocumentCard invoice={invoice} />

        {/* RIGHT: Extracted data + comparison table */}
        <Card className="bg-card flex flex-col gap-4 p-5">
          <header className="flex items-center justify-between gap-3">
            <h2 className="text-foreground text-base font-semibold">Extracted Data</h2>
            <span className="text-muted-foreground font-mono text-xs">{fp.fp_number}</span>
          </header>

          <StatusBanner variant={bannerVariant} />

          <ComparisonTable
            fields={fieldsWithState}
            localEdits={localEdits}
            onAcknowledge={handleAcknowledge}
            onQuickCopy={handleQuickCopy}
          />
        </Card>
      </div>

      {/* GL proposal card (reused from Mode A) */}
      {invoice.glProposal ? (
        <Card className="bg-card flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-foreground text-sm font-semibold">GL Proposal</h2>
            <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold">
              {Math.round(invoice.glProposal.confidence * 100)}% confidence
            </span>
          </div>
          <div className="grid grid-cols-[8rem_1fr] gap-y-1.5 text-sm">
            <span className="text-muted-foreground">Account:</span>
            <span className="text-foreground font-mono text-xs">
              {invoice.glProposal.account} — {invoice.glProposal.accountLabel}
            </span>
            <span className="text-muted-foreground">Cost center:</span>
            <span className="text-foreground">{invoice.glProposal.costCenter}</span>
            <span className="text-muted-foreground">Entity:</span>
            <span className="text-foreground">{invoice.glProposal.entity}</span>
          </div>
          <blockquote className="text-foreground/80 border-primary/30 border-l-2 pl-3 text-xs italic leading-relaxed">
            {invoice.glProposal.reasoning}
          </blockquote>
        </Card>
      ) : null}

      {/* Tax line */}
      {invoice.taxLine ? (
        <Card className="bg-card flex items-center justify-between gap-3 p-4 text-sm">
          <span className="text-foreground font-medium">PPN (VAT)</span>
          <span className="text-muted-foreground">
            {Math.round(invoice.taxLine.rate * 100)}% on {fmtIDR(invoice.taxLine.base)} ={" "}
            <span className="text-foreground font-semibold tabular-nums">
              {fmtIDR(invoice.taxLine.amount)}
            </span>
          </span>
        </Card>
      ) : null}

      {/* Action row */}
      {!isApproved && !confirmation ? (
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <Button
            variant="outline"
            className="border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
            onClick={handleReject}
          >
            Reject + queue for human
          </Button>

          {canProceed ? (
            <Button onClick={handleApprove}>
              <ShieldCheck size={14} weight="bold" />
              Approve &amp; Post
            </Button>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button disabled>
                      <ShieldCheck size={14} weight="bold" />
                      Approve &amp; Post
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">
                  <ul className="list-disc pl-3">
                    {disabledReasons.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      ) : null}

      {/* Audit footer */}
      <div className="text-muted-foreground border-border/60 flex items-center gap-2 border-t pt-4 text-xs">
        <ShieldCheck size={14} weight="regular" className="text-primary" />
        <span>
          Audit trail will record: ingest &rarr; OCR &rarr; Faktur Pajak match &rarr; GL code
          &rarr; PPN check &rarr; post. SHA-256 hash on commit.
        </span>
      </div>
    </div>
  )
}
