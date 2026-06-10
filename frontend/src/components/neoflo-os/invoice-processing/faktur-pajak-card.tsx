"use client"
// Faktur Pajak screen — full-height split pane matching invoice-validator-fe.
//
// Left  → FakturPajakDocumentCard: styled mock Indonesian tax-invoice with
//         zoom/rotate toolbar + row-click field highlighting.
// Right → Extracted Data: status banner, FP No., comparison table.
//
// Exported as both FakturPajakScreen (canonical) and FakturPajakCard (compat).

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowClockwise,
  ArrowCounterClockwise,
  ArrowsLeftRight,
  CheckCircle,
  FileText,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  ShieldCheck,
  Warning,
  X,
} from "@phosphor-icons/react"

import { Button } from "@/components/neoflo-os/ui/button"
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

function formatFpDate(iso: string | null | undefined): string {
  if (!iso) return "-"
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

function getField(fields: FakturPajakField[], name: string): string {
  return fields.find((f) => f.field_name === name)?.fp_value ?? "-"
}

// ════════════════════════════════════════════════════════════════════
// Left panel — FakturPajakDocumentCard
// ════════════════════════════════════════════════════════════════════

interface DocCardProps {
  invoice: Invoice
  selectedFieldName: string | null
}

function FakturPajakDocumentCard({ invoice, selectedFieldName }: DocCardProps) {
  const fp = invoice.fakturPajak!
  const [scale, setScale] = React.useState(1)
  const [rotation, setRotation] = React.useState(0)

  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 2.4))
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.4))
  const rotateLeft = () => setRotation((r) => (r - 90 + 360) % 360)
  const rotateRight = () => setRotation((r) => (r + 90) % 360)

  const hl = (fieldName: string): React.CSSProperties => {
    if (selectedFieldName !== fieldName) return {}
    const field = fp.fields.find((f) => f.field_name === fieldName)
    const isMatch = field?.match_status === "match"
    return isMatch
      ? { background: "rgba(34,197,94,0.10)", borderRadius: 4, outline: "2px solid rgb(34 197 94)" }
      : { background: "rgba(239,68,68,0.10)", borderRadius: 4, outline: "2px solid rgb(239 68 68)" }
  }

  const vendorName = getField(fp.fields, "vendor_name")
  const customerName = getField(fp.fields, "customer_name")
  const taxableAmount = getField(fp.fields, "taxable_amount")
  const vatAmount = getField(fp.fields, "vat_amount")

  const iconBtn =
    "flex h-7 w-7 items-center justify-center rounded border-0 bg-transparent text-[#6B7280] hover:text-[#374151] hover:bg-gray-100 transition-colors"

  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: "#F7F9FD" }}>
      {/* Scrollable document area */}
      <div className="flex flex-1 justify-center overflow-auto px-5 pt-[80px]">
        <div
          style={{
            transformOrigin: "top center",
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: "transform 0.15s ease",
          }}
        >
          {/* Outer document card */}
          <div
            style={{
              width: 480,
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 6,
              fontFamily: "Inter, sans-serif",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              overflow: "hidden",
              marginBottom: 40,
            }}
          >
            {/* Filename row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 20px",
                borderBottom: "1px solid #E5E7EB",
                fontSize: 14,
                color: "#374151",
              }}
            >
              <FileText size={15} weight="fill" style={{ color: "#6B7280", flexShrink: 0 }} />
              <span>{invoice.invoiceNumber}.pdf</span>
            </div>

            {/* Document body */}
            <div style={{ padding: "20px 24px" }}>
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: 0.5 }}>
                  FAKTUR PAJAK
                </div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                  Kode dan Nomor Seri Faktur Pajak
                </div>
              </div>

              {/* FP number + date */}
              <div style={{ marginBottom: 16, fontSize: 13 }}>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ color: "#6B7280" }}>No. FP:</span>
                  <span style={{ fontWeight: 600, marginLeft: 4 }}>{fp.fp_number}</span>
                </div>
                <div>
                  <span style={{ color: "#6B7280" }}>Tanggal:</span>
                  <span style={{ fontWeight: 600, marginLeft: 4 }}>
                    {formatFpDate(fp.fp_date)}
                  </span>
                </div>
              </div>

              <DocDivider />

              {/* Vendor */}
              <div
                style={{ marginBottom: 16, fontSize: 13, padding: 4, ...hl("vendor_name") }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ color: "#6B7280", marginBottom: 3 }}>Penjual (Vendor):</div>
                <div style={{ fontWeight: 600 }}>{vendorName}</div>
              </div>

              <DocDivider />

              {/* Customer */}
              <div
                style={{ marginBottom: 16, fontSize: 13, padding: 4, ...hl("customer_name") }}
              >
                <div style={{ color: "#6B7280", marginBottom: 3 }}>Pembeli (Customer):</div>
                <div style={{ fontWeight: 600 }}>{customerName}</div>
              </div>

              <DocDivider />

              {/* Amounts */}
              <div style={{ fontSize: 13 }}>
                <div style={{ marginBottom: 6, padding: 4, ...hl("taxable_amount") }}>
                  <AmountRow label="DPP (Taxable Amount):" value={taxableAmount} />
                </div>
                <div style={{ padding: 4, ...hl("vat_amount") }}>
                  <AmountRow label="PPN (VAT 11%):" value={vatAmount} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom toolbar — mirrors SourceViewer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          background: "#FFFFFF",
          borderTop: "1px solid #E5E7EB",
          flexShrink: 0,
          height: 48,
        }}
      >
        {/* Left: label */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FileText size={14} style={{ color: "#6B7280" }} />
          <span
            style={{
              fontSize: 14,
              color: "#101828",
              fontWeight: 500,
              fontFamily: "Inter, sans-serif",
            }}
          >
            FP Preview
          </span>
        </div>

        {/* Center: zoom */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button className={iconBtn} onClick={zoomOut} aria-label="Zoom out">
            <MagnifyingGlassMinus size={16} />
          </button>
          <span
            style={{
              minWidth: 44,
              textAlign: "center",
              fontSize: 13,
              color: "#374151",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
            }}
          >
            {Math.round(scale * 100)}%
          </span>
          <button className={iconBtn} onClick={zoomIn} aria-label="Zoom in">
            <MagnifyingGlassPlus size={16} />
          </button>
        </div>

        {/* Right: rotate */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button className={iconBtn} onClick={rotateLeft} aria-label="Rotate left">
            <ArrowCounterClockwise size={16} />
          </button>
          <button className={iconBtn} onClick={rotateRight} aria-label="Rotate right">
            <ArrowClockwise size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

function DocDivider() {
  return <div style={{ height: 1, background: "#F3F4F6", margin: "12px 0" }} />
}

function AmountRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ color: "#6B7280" }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// Status Banner
// ════════════════════════════════════════════════════════════════════

function StatusBanner({ variant, message }: { variant: "success" | "error"; message?: string }) {
  const isSuccess = variant === "success"
  const defaultMsg = isSuccess
    ? "All fields matched, ready to proceed."
    : "Mismatch detected. Please review the Faktur Pajak document."
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
      <span className="font-semibold">{message ?? defaultMsg}</span>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════
// Comparison Table
// ════════════════════════════════════════════════════════════════════

interface ComparisonTableProps {
  fields: (FakturPajakField & { is_acknowledged?: boolean })[]
  localEdits: Record<string, string>
  selectedFieldName: string | null
  onRowClick: (fieldName: string) => void
  onAcknowledge: (fieldName: string) => void
  onQuickCopy: (fieldName: string, value: string) => void
}

function ComparisonTable({
  fields,
  localEdits,
  selectedFieldName,
  onRowClick,
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

          const isSelected = selectedFieldName === field.field_name

          const rowClass = cn(
            "cursor-pointer transition-colors",
            isSelected
              ? "bg-blue-50/80 dark:bg-blue-500/10"
              : isMismatch && !isResolved && field.required
                ? "bg-red-50/60 dark:bg-red-500/5 hover:bg-red-50 dark:hover:bg-red-500/10"
                : isMismatch && !isResolved
                  ? "bg-amber-50/60 dark:bg-amber-500/5 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                  : "hover:bg-muted/40",
          )

          const fpValueClass = cn(
            "text-sm",
            isMismatch && !isResolved && field.required
              ? "font-medium text-red-700 dark:text-red-400"
              : isMismatch && !isResolved
                ? "font-medium text-amber-700 dark:text-amber-400"
                : "text-foreground",
          )

          const showAckButton = isAckField && isMismatch && !field.is_acknowledged
          const showCopyButton =
            !isAckField && isMismatch && !isResolved && !!field.invoice_value

          return (
            <TableRow
              key={field.field_name}
              className={rowClass}
              onClick={() => onRowClick(field.field_name)}
            >
              {/* Field */}
              <TableCell className="bg-muted/30 py-3 align-middle">
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
              <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <span className={fpValueClass}>{currentFpValue || "—"}</span>

                  {field.is_acknowledged && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <CheckCircle size={11} weight="fill" />
                      Acknowledged
                    </span>
                  )}

                  {/* Auto-approved badge for matches */}
                  {!isMismatch && field.match_status === "match" && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                      <CheckCircle size={11} weight="fill" />
                      Auto-approved
                    </span>
                  )}

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

                  {localEdits[field.field_name] !== undefined && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                      copied
                    </span>
                  )}
                </div>
              </TableCell>

              {/* Invoice value */}
              <TableCell className="py-3">
                <span className="text-sm text-foreground/80">{field.invoice_value || "—"}</span>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

// ════════════════════════════════════════════════════════════════════
// Main export — FakturPajakScreen
// ════════════════════════════════════════════════════════════════════

interface FakturPajakScreenProps {
  invoice: Invoice
  /** Called when Approve & Post is clicked — defaults to store approve + redirect */
  onApprove?: () => void
  /** Called when Reject is clicked — defaults to store reject + redirect to exceptions */
  onReject?: () => void
}

export function FakturPajakScreen({ invoice, onApprove, onReject }: FakturPajakScreenProps) {
  const router = useRouter()
  const base = useBasePath()
  const fp = invoice.fakturPajak!

  const [selectedFieldName, setSelectedFieldName] = React.useState<string | null>(null)
  const [confirmation, setConfirmation] = React.useState<string | null>(null)

  // Persisted FP state from Zustand store
  const localEdits = useHydratedInvoiceProcessingStore(
    (s) => s.fakturPajakEdits[invoice.id] ?? {},
  )
  const acknowledgedNames: string[] = useHydratedInvoiceProcessingStore(
    (s) => s.fakturPajakAcknowledgements[invoice.id] ?? [],
  )
  const runtimeStatus = useHydratedInvoiceProcessingStore(
    (s) => s.applications[invoice.id]?.status,
  )
  const isApproved = runtimeStatus === "user-approved" || runtimeStatus === "user-edited-tax"

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

  const canProceed = unacknowledgedMismatches.length === 0 && uncopiedAmounts.length === 0

  const bannerVariant: "success" | "error" = canProceed ? "success" : "error"
  const bannerMessage = isApproved ? "This validation has been approved." : undefined

  const disabledReasons = React.useMemo(() => {
    const r: string[] = []
    if (unacknowledgedMismatches.length > 0)
      r.push(`${unacknowledgedMismatches.length} field${unacknowledgedMismatches.length > 1 ? "s" : ""} require acknowledgement`)
    if (uncopiedAmounts.length > 0)
      r.push(`${uncopiedAmounts.length} amount mismatch${uncopiedAmounts.length > 1 ? "es" : ""} — use the copy button to resolve`)
    return r
  }, [unacknowledgedMismatches, uncopiedAmounts])

  function handleAcknowledge(fieldName: string) {
    useInvoiceProcessingStore.getState().acknowledgeFakturPajakField(invoice.id, fieldName)
  }

  function handleQuickCopy(fieldName: string, value: string) {
    useInvoiceProcessingStore.getState().editFakturPajakField(invoice.id, fieldName, value)
  }

  function handleRowClick(fieldName: string) {
    setSelectedFieldName((prev) => (prev === fieldName ? null : fieldName))
  }

  function handleApproveClick() {
    if (onApprove) {
      onApprove()
      return
    }
    useInvoiceProcessingStore.getState().approveInvoice(invoice.id)
    setConfirmation("Posted to ERP. Faktur Pajak validated and audit log generated.")
    window.setTimeout(() => router.push(`${base}/invoice-processing`), 700)
  }

  function handleRejectClick() {
    if (onReject) {
      onReject()
      return
    }
    useInvoiceProcessingStore.getState().rejectInvoice(invoice.id)
    router.push(`${base}/invoice-processing/exceptions`)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Confirmation toast */}
      {confirmation ? (
        <div className="animate-in fade-in slide-in-from-top-2 z-10 mx-6 mt-3 flex shrink-0 items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 duration-300 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          <CheckCircle size={18} weight="fill" className="shrink-0 text-emerald-600" />
          <span className="font-medium">{confirmation}</span>
        </div>
      ) : null}

      {/* Split pane */}
      <div
        className="flex flex-1 overflow-hidden"
        onClick={() => setSelectedFieldName(null)}
      >
        {/* LEFT — document card (50%) */}
        <div className="w-1/2 shrink-0 overflow-hidden border-r border-gray-200">
          <FakturPajakDocumentCard invoice={invoice} selectedFieldName={selectedFieldName} />
        </div>

        {/* RIGHT — extracted data (50%) */}
        <div
          className="flex w-1/2 flex-col gap-3 overflow-auto p-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Heading */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Extracted Data
            </span>
          </div>

          {/* Already-approved banner */}
          {isApproved ? (
            <StatusBanner variant="success" message="This validation has been approved." />
          ) : (
            <StatusBanner variant={bannerVariant} message={bannerMessage} />
          )}

          {/* FP No. */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              FP No. <span className="text-red-500">*</span>
            </label>
            <div className="flex h-9 items-center rounded-md border border-gray-200 bg-gray-50 px-3 font-mono text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
              {fp.fp_number}
            </div>
          </div>

          {/* Comparison table */}
          <div className="rounded-md border">
            <ComparisonTable
              fields={fieldsWithState}
              localEdits={localEdits}
              selectedFieldName={selectedFieldName}
              onRowClick={handleRowClick}
              onAcknowledge={handleAcknowledge}
              onQuickCopy={handleQuickCopy}
            />
          </div>

          {/* Action row */}
          {!isApproved && !confirmation ? (
            <div className="mt-auto flex flex-wrap items-center justify-end gap-3 pt-4">
              <Button
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
                onClick={handleRejectClick}
              >
                Reject
              </Button>

              {canProceed ? (
                <Button onClick={handleApproveClick}>
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
          <div className="mt-2 flex items-center gap-2 border-t border-gray-100 pt-3 text-xs text-gray-400">
            <ShieldCheck size={13} className="shrink-0 text-primary" />
            <span>
              Audit trail: ingest &rarr; OCR &rarr; Faktur Pajak match &rarr; GL code &rarr; PPN
              check &rarr; post. SHA-256 on commit.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Backward-compat alias
export const FakturPajakCard = FakturPajakScreen
