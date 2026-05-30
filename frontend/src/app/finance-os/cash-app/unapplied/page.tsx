// app/neoflo-workspace/cash-app/unapplied/page.tsx
//
// Cash-app unapplied queue — investigation surface. Per
// docs/handoff/cash-app/03-screen-specs.md § "Surface 4: Unapplied queue".
"use client"

import * as React from "react"

import { UnappliedRow } from "@/components/neoflo-os/cash-app/unapplied-row"
import { FilterChip } from "@/components/neoflo-os/filter-chip"
import {
  useCashAppStore,
  useHydratedCashAppStore,
} from "@/lib/neoflo-os/cash-app/cash-app-store"
import { getUnappliedItems } from "@/lib/neoflo-os/cash-app/derive"
import { getCustomer } from "@/lib/neoflo-os/cash-app/seed-customers"
import { getInvoice } from "@/lib/neoflo-os/cash-app/seed-invoices"
import { getPayment } from "@/lib/neoflo-os/cash-app/seed-payments"
import type { Payment, UnappliedItem } from "@/lib/neoflo-os/cash-app/types"

type FilterId = "all" | "name-mismatch" | "missing-remittance" | "unknown-payer"

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "name-mismatch", label: "Name mismatch" },
  { id: "missing-remittance", label: "Missing remittance" },
  { id: "unknown-payer", label: "Unknown payer" },
]

// Categorize each unapplied item per the filter chips.
function categorize(p: Payment): FilterId {
  const matchedId = p.extractedPayer.matchedCustomerId
  const matchConfidence = p.extractedPayer.matchConfidence ?? 0
  const hasRemittance =
    !!p.remittance?.parsedInvoiceIds && p.remittance.parsedInvoiceIds.length > 0

  if (!matchedId && matchConfidence === 0) return "unknown-payer"
  if (!matchedId && matchConfidence > 0) return "name-mismatch"
  if (matchedId && !hasRemittance) return "missing-remittance"
  return "missing-remittance"
}

function fmtTotal(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${Math.round(n / 1_000).toLocaleString()}K`
  return `$${n.toLocaleString()}`
}

export default function CashAppUnappliedPage() {
  const items = React.useMemo(() => getUnappliedItems(), [])
  const reviewState = useHydratedCashAppStore((s) => s.unappliedReviews)

  const [activeFilter, setActiveFilter] = React.useState<FilterId>("all")

  // Build display rows enriched with payment + categorization.
  const rows = React.useMemo(() => {
    return items
      .map((item) => {
        const payment = getPayment(item.paymentId)
        if (!payment) return null
        return { item, payment, category: categorize(payment) }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
  }, [items])

  const counts = React.useMemo(() => {
    const map: Record<FilterId, number> = {
      all: rows.length,
      "name-mismatch": 0,
      "missing-remittance": 0,
      "unknown-payer": 0,
    }
    for (const r of rows) {
      if (r.category === "name-mismatch") map["name-mismatch"] += 1
      else if (r.category === "missing-remittance") map["missing-remittance"] += 1
      else if (r.category === "unknown-payer") map["unknown-payer"] += 1
    }
    return map
  }, [rows])

  const totalDollars = React.useMemo(
    () => rows.reduce((s, r) => s + r.payment.amount, 0),
    [rows]
  )

  const visibleRows = React.useMemo(() => {
    if (activeFilter === "all") return rows
    return rows.filter((r) => r.category === activeFilter)
  }, [rows, activeFilter])

  function handleConfirmMatch(paymentId: string) {
    useCashAppStore.getState().markUnappliedInvestigated(paymentId, "matched")
  }

  function handleDraftEmail(paymentId: string, customerName: string) {
    // For P1, this is a no-op routing hook. The chat thread isn't yet
    // wired to accept a prefilled prompt from this surface — see Task 18 / P2.
    // Logging the intent so it's discoverable in the dev console.
    // eslint-disable-next-line no-console
    console.log(
      `[cash-app] Draft customer email for ${customerName} (payment ${paymentId})`
    )
  }

  function getProposedInvoicesFor(item: UnappliedItem) {
    if (!item.proposedMatch) return undefined
    const invs = item.proposedMatch.invoiceIds
      .map((id) => getInvoice(id))
      .filter((inv): inv is NonNullable<typeof inv> => Boolean(inv))
    return invs.length > 0 ? invs : undefined
  }

  return (
    <div className="flex-1 overflow-auto px-10 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        {/* Page header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Unapplied cash · {fmtTotal(totalDollars)} across {counts.all}{" "}
            payment{counts.all === 1 ? "" : "s"}
          </h1>
          <p className="text-muted-foreground text-sm">
            Each item needs identification before Neo can post to NetSuite.
          </p>
        </div>

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
              No unapplied payments matching this filter.
            </div>
          ) : (
            visibleRows.map(({ item, payment }) => {
              const matchedCustomer = payment.extractedPayer.matchedCustomerId
                ? getCustomer(payment.extractedPayer.matchedCustomerId)
                : undefined
              const customerName =
                matchedCustomer?.name ?? payment.extractedPayer.name
              const proposedInvoices = getProposedInvoicesFor(item)
              const matched = reviewState[payment.id] === "matched"

              return (
                <UnappliedRow
                  key={payment.id}
                  payment={payment}
                  customerName={customerName}
                  item={item}
                  proposedInvoices={proposedInvoices}
                  proposedConfidence={item.proposedMatch?.confidence}
                  matched={matched}
                  onConfirmMatch={() => handleConfirmMatch(payment.id)}
                  onDraftEmail={() => handleDraftEmail(payment.id, customerName)}
                />
              )
            })
          )}
        </section>
      </div>
    </div>
  )
}
