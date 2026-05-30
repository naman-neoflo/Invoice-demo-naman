// app/neoflo-workspace/invoice-processing/exceptions/page.tsx
//
// Invoice-processing exceptions queue — the 6 items Neo couldn't auto-post.
// Per docs/handoff/invoice-processing/03-screen-specs.md § "Surface 4:
// Exceptions queue".
//
// Chrome (WorkspaceHeader, InvoiceProcessingTabs, ChatThread) is owned by
// app/neoflo-workspace/invoice-processing/layout.tsx — this page renders only the
// body.
"use client"

import * as React from "react"
import { format } from "date-fns"
import { CaretDown, EnvelopeSimple } from "@phosphor-icons/react"

import { ExceptionRow } from "@/components/neoflo-os/invoice-processing/exception-row"
import { FilterChip } from "@/components/neoflo-os/filter-chip"
import { PageHeader } from "@/components/neoflo-os/page-header"
import { Button } from "@/components/neoflo-os/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/neoflo-os/ui/dropdown-menu"
import {
  getExceptionItems,
} from "@/lib/neoflo-os/invoice-processing/derive"
import { SEED_INVOICES, getInvoice } from "@/lib/neoflo-os/invoice-processing/seed-invoices"
import { getVendor } from "@/lib/neoflo-os/invoice-processing/seed-vendors"
import {
  useHydratedInvoiceProcessingStore,
  useInvoiceProcessingStore,
} from "@/lib/neoflo-os/invoice-processing/invoice-processing-store"
import type { ExceptionReasonCode, Invoice } from "@/lib/neoflo-os/invoice-processing/types"

type FilterId =
  | "all"
  | "match-variance"
  | "missing-grn"
  | "duplicate"
  | "gl-ambiguous"
  | "tax-review"

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "match-variance", label: "Match variance" },
  { id: "missing-grn", label: "Missing GRN" },
  { id: "duplicate", label: "Duplicate" },
  { id: "gl-ambiguous", label: "GL ambiguous" },
  { id: "tax-review", label: "Tax review" },
]

function categorize(invoice: Invoice): FilterId {
  if (invoice.status === "duplicate-suspected") return "duplicate"
  const code: ExceptionReasonCode | undefined = invoice.exception?.reasonCode
  switch (code) {
    case "DUPLICATE_DETECTED":
      return "duplicate"
    case "PRICE_VARIANCE":
    case "MASTER_AGREEMENT_REVIEW":
      return "match-variance"
    case "MISSING_GRN":
      return "missing-grn"
    case "GL_AMBIGUOUS":
      return "gl-ambiguous"
    case "TAX_AMBIGUOUS":
    case "TAX_INELIGIBLE":
      return "tax-review"
    default:
      return "all"
  }
}

export default function InvoiceProcessingExceptionsPage() {
  // Exception items from the seed: invoices with status "exception".
  // Plus the duplicate-suspected hero (inv-998123-b), which belongs in this
  // queue conceptually (and the spec's "Duplicate 1" filter expects to see it).
  const items = React.useMemo<Invoice[]>(() => {
    const base = getExceptionItems()
    const duplicates = SEED_INVOICES.filter(
      (i) => i.status === "duplicate-suspected"
    )
    return [...duplicates, ...base]
  }, [])

  const reviewState = useHydratedInvoiceProcessingStore((s) => s.exceptionReviews)

  const [activeFilter, setActiveFilter] = React.useState<FilterId>("all")

  // Build rows enriched with vendor + category.
  const rows = React.useMemo(() => {
    return items.map((invoice) => ({
      invoice,
      vendorName: getVendor(invoice.vendorId)?.name ?? invoice.vendorId,
      category: categorize(invoice),
    }))
  }, [items])

  const counts = React.useMemo(() => {
    const map: Record<FilterId, number> = {
      all: rows.length,
      "match-variance": 0,
      "missing-grn": 0,
      duplicate: 0,
      "gl-ambiguous": 0,
      "tax-review": 0,
    }
    for (const r of rows) {
      if (r.category !== "all") map[r.category] += 1
    }
    return map
  }, [rows])

  const visibleRows = React.useMemo(() => {
    if (activeFilter === "all") return rows
    return rows.filter((r) => r.category === activeFilter)
  }, [rows, activeFilter])

  // Action handlers — bind to the store.
  const store = useInvoiceProcessingStore.getState

  function handleConfirmDuplicate(invoiceId: string) {
    store().confirmDuplicate(invoiceId)
  }
  function handleApprove(invoiceId: string) {
    store().approveInvoice(invoiceId)
  }
  function handleInvestigate(invoiceId: string) {
    store().markExceptionInvestigating(invoiceId)
  }
  function handleSendGrnRequest(invoiceId: string) {
    store().draftVendorEmail(invoiceId)
  }
  function handlePickGL(
    invoiceId: string,
    account: string,
    accountLabel: string,
    costCenter: string,
    entity: string
  ) {
    store().editGLCoding(invoiceId, { account, costCenter, entity })
    // eslint-disable-next-line no-console
    console.log(
      `[invoice-processing] Picked GL ${account} ${accountLabel} for ${invoiceId}`
    )
  }
  function handleAskVendor() {
    // Open the chat thread — same pattern as the inline "Ask Neo" inputs on
    // the dashboard. Phase 1 doesn't prefill a prompt (P2 enhancement).
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("neo:open-chat"))
    }
  }

  function handleBulkEmailVendors() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("neo:open-chat"))
    }
  }

  function handleBulkApproveAll() {
    for (const r of visibleRows) {
      // Skip duplicate-suspected — bulk approve is for variance / GL / tax.
      if (r.invoice.status === "duplicate-suspected") continue
      store().approveInvoice(r.invoice.id)
    }
  }

  // For the duplicate hero subline: "INV-998123-B identical to INV-998123-A
  // paid Apr 18".
  function duplicateMeta(invoice: Invoice): {
    duplicateOfInvoiceNumber?: string
    duplicateOfPaidAt?: string
  } {
    if (invoice.status !== "duplicate-suspected") return {}
    const orig = invoice.duplicateFinding
      ? getInvoice(invoice.duplicateFinding.duplicateOfInvoiceId)
      : undefined
    if (!orig) return {}
    return {
      duplicateOfInvoiceNumber: orig.invoiceNumber,
      // We don't have a paidAt on the invoice — use the issuedAt as a reasonable
      // proxy ("paid Apr 18" appears in the hero seed via the duplicate spotlight).
      duplicateOfPaidAt: format(new Date(orig.issuedAt), "MMM d"),
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader
        title={`Exceptions · ${counts.all}`}
        subtitle="Hold these until resolved. Bulk actions on the right."
      />

      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          {/* Filter chips */}
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <FilterChip
                key={f.id}
                label={f.label}
                count={counts[f.id]}
                active={activeFilter === f.id}
                onClick={() => setActiveFilter(f.id)}
              />
            ))}
          </div>

          {/* Rows */}
          <section className="flex flex-col gap-4">
            {visibleRows.length === 0 ? (
              <div className="bg-card text-muted-foreground rounded-lg border p-10 text-center text-sm">
                No exceptions match those filters.
              </div>
            ) : (
              visibleRows.map(({ invoice, vendorName }) => {
                const dup = duplicateMeta(invoice)
                const state = reviewState[invoice.id] ?? "pending"
                const firstAlt =
                  invoice.glProposal?.alternatives?.[0]
                return (
                  <ExceptionRow
                    key={invoice.id}
                    invoice={invoice}
                    vendorName={vendorName}
                    reviewState={state}
                    duplicateOfInvoiceNumber={dup.duplicateOfInvoiceNumber}
                    duplicateOfPaidAt={dup.duplicateOfPaidAt}
                    onReviewHref={`/neoflo-workspace/invoice-processing/match/${invoice.id}`}
                    onConfirmDuplicate={() => handleConfirmDuplicate(invoice.id)}
                    onApprove={() => handleApprove(invoice.id)}
                    onInvestigate={() => handleInvestigate(invoice.id)}
                    onSendGrnRequest={() => handleSendGrnRequest(invoice.id)}
                    onPickGL={(account) =>
                      handlePickGL(
                        invoice.id,
                        account,
                        firstAlt?.accountLabel ??
                          invoice.glProposal?.accountLabel ??
                          "",
                        invoice.glProposal?.costCenter ?? "CORP",
                        invoice.glProposal?.entity ?? "AcmeCo US"
                      )
                    }
                    onAskVendor={handleAskVendor}
                  />
                )
              })
            )}
          </section>

          {/* Bulk action strip */}
          {visibleRows.length > 0 ? (
            <div className="border-border bg-muted/30 flex items-center justify-end gap-3 rounded-md border px-4 py-3">
              <span className="text-muted-foreground text-xs">Bulk actions:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Approve all
                    <CaretDown size={14} weight="regular" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={handleBulkApproveAll}>
                    Approve {visibleRows.length} visible item
                    {visibleRows.length === 1 ? "" : "s"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkEmailVendors}
              >
                <EnvelopeSimple size={14} weight="regular" />
                Email vendors batch
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
