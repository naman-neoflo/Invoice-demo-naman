// app/neoflo-workspace/spend-analytics/maverick/page.tsx
//
// Maverick list — every off-MSA spend event, ranked by total spend. Hero
// row (Westpoint Industrial Tools) anchors the list; supporting rows cover
// the other 4 events for the demo period.
//
// Per docs/handoff/spend-analytics/03-screen-specs.md § "Surface 3 list".
import * as React from "react"
import { Link } from "next-view-transitions"
import { ArrowRight } from "@phosphor-icons/react/dist/ssr"

import { StatusBadge } from "@/components/neoflo-os/status-badge"
import { Card } from "@/components/neoflo-os/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/neoflo-os/ui/table"
import { getMaverickList, getVendor } from "@/lib/neoflo-os/spend-analytics/derive"
import type { MaverickEvent, SpendCategory } from "@/lib/neoflo-os/spend-analytics/types"

// ════════════════════════════════════════════════════════════════════════
// Formatters
// ════════════════════════════════════════════════════════════════════════

function fmtDollars(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`
}

function fmtPercent(share: number): string {
  return `${Math.round(share * 100)}%`
}

const CATEGORY_LABEL: Record<SpendCategory, string> = {
  "industrial-tools": "Industrial tools",
  "professional-services": "Professional services",
  IT: "IT",
  facilities: "Facilities",
  marketing: "Marketing",
  logistics: "Logistics",
  "office-supplies": "Office supplies",
  travel: "Travel",
  legal: "Legal",
  other: "Other",
}

const SEVERITY_TONE: Record<
  MaverickEvent["severity"],
  "success" | "warning" | "danger"
> = {
  low: "success",
  medium: "warning",
  high: "danger",
}

// ════════════════════════════════════════════════════════════════════════
// Page
// ════════════════════════════════════════════════════════════════════════

export default function MaverickListPage() {
  const list = getMaverickList()
    .slice()
    .sort((a, b) => b.totalSpend - a.totalSpend)

  const totalSpend = list.reduce((sum, m) => sum + m.totalSpend, 0)

  return (
    <div className="flex-1 overflow-auto px-10 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {/* Heading */}
        <div className="flex flex-col gap-1">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            Maverick spend &middot; {list.length} events &middot;{" "}
            ~{fmtDollars(totalSpend)} last 90 days
          </h1>
          <p className="text-muted-foreground text-sm">
            Spend that bypassed your preferred-vendor MSAs. Switching to
            preferred saves money and tightens process control.
          </p>
        </div>

        {/* Table */}
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Off-MSA spend</TableHead>
                <TableHead>Preferred alternative</TableHead>
                <TableHead className="text-right">Switching savings</TableHead>
                <TableHead className="text-right"># POs</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((m) => {
                const vendor = getVendor(m.vendorId)
                const preferred = getVendor(m.preferredVendorId)
                const savings =
                  m.switchingAnalysis.currentPaceTotal -
                  m.switchingAnalysis.preferredPaceTotal
                return (
                  <TableRow key={m.id} className="hover:bg-muted/40">
                    <TableCell>
                      <Link
                        href={`/neoflo-workspace/spend-analytics/maverick/${m.id}`}
                        className="text-foreground hover:text-primary font-medium transition-colors"
                      >
                        {vendor?.name ?? m.vendorId}
                      </Link>
                      <div className="text-muted-foreground text-xs">
                        {m.timePeriod}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {CATEGORY_LABEL[m.category]}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fmtDollars(m.totalSpend)}
                    </TableCell>
                    <TableCell className="text-foreground text-sm">
                      {preferred?.name ?? m.preferredVendorId}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-foreground tabular-nums">
                        {fmtDollars(savings)}
                      </div>
                      <div className="text-muted-foreground text-xs tabular-nums">
                        {fmtPercent(m.switchingAnalysis.savingsPercent)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {m.pos.length}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        tone={SEVERITY_TONE[m.severity]}
                        showDot={false}
                      >
                        {m.severity.toUpperCase()}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/neoflo-workspace/spend-analytics/maverick/${m.id}`}
                        className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-medium"
                      >
                        Review
                        <ArrowRight size={12} weight="bold" />
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}
