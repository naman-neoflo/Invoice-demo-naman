// components/collections/worklist-row.tsx
//
// One row in the collections worklist table. Renders a `<TableRow>` whose
// entire surface navigates to either the customer-detail surface (default)
// or the dispute-detail surface (when the case has an `activeDispute` flag).
//
// Status badge derivation per docs/handoff/collections/03-screen-specs.md
// § "Surface 2: Worklist" — driven off `case.caseFlags`, `recommendedTier`,
// `ranking.rank`, and `status`.
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  CheckCircle,
  Clock,
  HandWaving,
  Lightning,
  PaperPlaneTilt,
  ShieldWarning,
  Warning,
} from "@phosphor-icons/react"

import { StatusBadge } from "@/components/neoflo-os/status-badge"
import { TableCell, TableRow } from "@/components/neoflo-os/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/neoflo-os/ui/tooltip"
import { getCustomer } from "@/lib/neoflo-os/collections/seed-customers"
import type { CollectionsCase } from "@/lib/neoflo-os/collections/types"
import { useBasePath } from "@/lib/neoflo-os/workspace/use-base-path"

// ════════════════════════════════════════════════════════════════════
// Status badge derivation — tone, icon, and label per the spec
// ════════════════════════════════════════════════════════════════════

type BadgeSpec = {
  tone: "success" | "warning" | "danger" | "neutral" | "info"
  Icon: React.ElementType
  label: string
}

function deriveStatusBadge(c: CollectionsCase): BadgeSpec {
  // Rank 1 always wins — top-priority signal.
  if (c.ranking.rank === 1) {
    return { tone: "info", Icon: Lightning, label: "Top" }
  }
  // Account-hold candidate (or recommended hold tier) → danger.
  if (
    c.caseFlags.accountHoldCandidate ||
    c.recommendedTier === "hold" ||
    c.recommendedTier === 4
  ) {
    return { tone: "danger", Icon: HandWaving, label: "Hold" }
  }
  // Broken promise → warning "Late".
  if (c.caseFlags.promiseBroken) {
    return { tone: "warning", Icon: Clock, label: "Late" }
  }
  // Active dispute → info "Dispute".
  if (c.caseFlags.activeDispute) {
    return { tone: "info", Icon: ShieldWarning, label: "Dispute" }
  }
  // Tier badges (numeric only — `"investigate"` falls through to default).
  if (c.recommendedTier === 2) {
    return { tone: "warning", Icon: Warning, label: "Tier2" }
  }
  if (c.recommendedTier === 3) {
    return { tone: "warning", Icon: Warning, label: "Tier3" }
  }
  // Status-driven badges.
  if (c.status === "in-batch") {
    return { tone: "success", Icon: CheckCircle, label: "Ready" }
  }
  if (c.status === "sent") {
    return { tone: "neutral", Icon: PaperPlaneTilt, label: "Sent" }
  }
  return { tone: "neutral", Icon: Warning, label: "Open" }
}

// ════════════════════════════════════════════════════════════════════
// Formatters
// ════════════════════════════════════════════════════════════════════

function fmtDollars(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`
}

// Render an aging summary. Single-invoice cases show just "Nd"; multi-invoice
// cases that span a range show the min-max ("31-42d"). Sourced from the
// invoiceIds on the case (we read aging via the lookup).
function fmtAging(c: CollectionsCase, perInvoiceAging: number[]): string {
  if (perInvoiceAging.length === 0) {
    return `${c.oldestAgingDays}d`
  }
  const min = Math.min(...perInvoiceAging)
  const max = Math.max(...perInvoiceAging)
  if (min === max) return `${max}d`
  return `${min}-${max}d`
}

// ════════════════════════════════════════════════════════════════════
// WorklistRow
// ════════════════════════════════════════════════════════════════════

interface WorklistRowProps {
  case: CollectionsCase
  agingDaysByInvoice: number[]
}

export function WorklistRow({
  case: c,
  agingDaysByInvoice,
}: WorklistRowProps) {
  const router = useRouter()
  const base = useBasePath()
  const customer = getCustomer(c.customerId)
  const customerName = customer?.name ?? c.customerId
  const badge = deriveStatusBadge(c)
  const { Icon } = badge

  function handleNavigate() {
    if (c.caseFlags.activeDispute) {
      router.push(`${base}/collections/dispute/${c.caseFlags.activeDispute}`)
      return
    }
    router.push(`${base}/collections/customer/${c.customerId}`)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTableRowElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleNavigate()
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <TableRow
          tabIndex={0}
          role="link"
          onClick={handleNavigate}
          onKeyDown={handleKeyDown}
          className="hover:bg-muted/40 focus-visible:bg-muted/40 cursor-pointer focus-visible:outline-none"
        >
          <TableCell className="text-muted-foreground tabular-nums">
            {c.ranking.rank}
          </TableCell>
          <TableCell className="text-foreground font-medium">
            {customerName}
          </TableCell>
          <TableCell className="text-muted-foreground tabular-nums">
            {c.invoiceIds.length}
          </TableCell>
          <TableCell className="text-foreground tabular-nums">
            {fmtDollars(c.totalOverdue)}
          </TableCell>
          <TableCell className="text-muted-foreground tabular-nums">
            {fmtAging(c, agingDaysByInvoice)}
          </TableCell>
          <TableCell>
            <StatusBadge tone={badge.tone} showDot={false}>
              <Icon className="h-3 w-3" weight="regular" />
              {badge.label}
            </StatusBadge>
          </TableCell>
          <TableCell className="text-muted-foreground w-10 text-right">
            <ArrowRight size={14} weight="regular" />
          </TableCell>
        </TableRow>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="start" className="max-w-sm">
        {c.ranking.reasoning}
      </TooltipContent>
    </Tooltip>
  )
}
