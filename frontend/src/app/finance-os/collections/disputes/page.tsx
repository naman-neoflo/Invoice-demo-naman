// app/neoflo-workspace/collections/disputes/page.tsx
//
// Disputes list — the destination the Disputes tab has always pointed
// at but never had. Shows all 12 disputes from SEED_DISPUTES with their
// customer, invoice, amount, reason, age, and status. Click a row →
// existing /collections/dispute/[id] detail page.
//
// Chrome (WorkspaceHeader, CollectionsTabs, ChatThread) is owned by
// app/neoflo-workspace/collections/layout.tsx — this page renders only
// the body.

"use client"

import { Link } from "next-view-transitions"

import { StatusBadge } from "@/components/neoflo-os/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/neoflo-os/ui/table"
import { getCustomer } from "@/lib/neoflo-os/collections/seed-customers"
import { SEED_DISPUTES } from "@/lib/neoflo-os/collections/seed-disputes"
import type { Dispute } from "@/lib/neoflo-os/collections/types"

// "Open" = needs active work. Matches the count predicate in
// components/collections/collections-tabs.tsx so the tab badge and the
// page header report identical numbers. credit-memo-approved is treated
// as closed-out (memo's been authorized; remaining work is bookkeeping).
const OPEN_STATUSES: ReadonlySet<Dispute["status"]> = new Set([
  "filed",
  "investigating",
  "evidence-pulled",
  "credit-memo-proposed",
])

function isOpen(status: Dispute["status"]): boolean {
  return OPEN_STATUSES.has(status)
}

// Map the 7 dispute statuses to the 5 badge tones. Resolution-favorable
// → success; resolution-unfavorable → danger; in-flight evidence/work
// → info; freshly-filed / mid-investigation → neutral.
function statusTone(
  status: Dispute["status"],
): "success" | "warning" | "danger" | "neutral" | "info" {
  switch (status) {
    case "credit-memo-approved":
    case "resolved-paid":
      return "success"
    case "resolved-refused":
      return "warning"
    case "evidence-pulled":
    case "credit-memo-proposed":
      return "info"
    case "filed":
    case "investigating":
    default:
      return "neutral"
  }
}

function statusLabel(status: Dispute["status"]): string {
  switch (status) {
    case "filed":
      return "Filed"
    case "investigating":
      return "Investigating"
    case "evidence-pulled":
      return "Evidence pulled"
    case "credit-memo-proposed":
      return "Credit memo proposed"
    case "credit-memo-approved":
      return "Credit memo approved"
    case "resolved-refused":
      return "Refused — evidence supports invoice"
    case "resolved-paid":
      return "Resolved — paid"
    default:
      return status
  }
}

function fmtMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function CollectionsDisputesPage() {
  // Sort: open (needs work) first, then closed-out at the bottom.
  // Within each group, oldest first so aged risk surfaces.
  const sorted = [...SEED_DISPUTES].sort((a, b) => {
    const aOpen = isOpen(a.status) ? 0 : 1
    const bOpen = isOpen(b.status) ? 0 : 1
    if (aOpen !== bOpen) return aOpen - bOpen
    return b.agingDays - a.agingDays
  })

  const open = sorted.filter((d) => isOpen(d.status))
  const openCount = open.length
  const totalAtRisk = open.reduce((sum, d) => sum + d.disputeAmount, 0)
  const closedOutCount = sorted.length - openCount

  return (
    <div className="px-10 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {/* Page header — inline pattern matching other workspace pages */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              Disputes
            </h1>
            <p className="text-muted-foreground text-sm">
              {openCount} open · {fmtMoney(totalAtRisk)} at risk ·{" "}
              {closedOutCount} closed
            </p>
          </div>
        </div>

        <div className="bg-card overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Customer</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead className="text-right">Disputed</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((d) => {
                const customer = getCustomer(d.customerId)
                const href = `/neoflo-workspace/collections/dispute/${d.id}`
                return (
                  <TableRow
                    key={d.id}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <Link
                        href={href}
                        className="text-foreground hover:text-primary font-medium"
                      >
                        {customer?.name ?? d.customerId}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {d.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-foreground text-right tabular-nums font-medium">
                      {fmtMoney(d.disputeAmount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {d.reasonLabel}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {d.agingDays}d
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={statusTone(d.status)} showDot>
                        {statusLabel(d.status)}
                      </StatusBadge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
