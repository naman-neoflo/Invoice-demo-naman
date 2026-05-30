// components/collections/case-list.tsx
//
// Renders the per-customer open-invoice list inside a sub-card on the
// collections customer-detail surface. Each case expands to show its
// invoices with amount, aging days, and a one-line description.
//
// Spec: docs/handoff/collections/03-screen-specs.md § "Surface 3".
import * as React from "react"

import { Card } from "@/components/neoflo-os/ui/card"
import { getOpenInvoice } from "@/lib/neoflo-os/collections/seed-open-invoices"
import type { CollectionsCase } from "@/lib/neoflo-os/collections/types"

interface CaseListProps {
  cases: CollectionsCase[]
}

function fmtDollars(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`
}

function fmtIssueDate(iso?: string): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" })
  return `${month} ${d.getUTCDate()}`
}

export function CaseList({ cases }: CaseListProps) {
  return (
    <div className="flex flex-col gap-3">
      {cases.map((c) => (
        <Card key={c.id} className="bg-card flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">
              {c.invoiceIds.length}{" "}
              {c.invoiceIds.length === 1 ? "invoice" : "invoices"}
            </span>
            <span className="text-foreground text-sm font-semibold tabular-nums">
              Total {fmtDollars(c.totalOverdue)}
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {c.invoiceIds.map((id) => {
              const inv = getOpenInvoice(id)
              if (!inv) {
                return (
                  <li
                    key={id}
                    className="text-muted-foreground font-mono text-xs"
                  >
                    {id} (not found)
                  </li>
                )
              }
              return (
                <li
                  key={id}
                  className="border-border/60 flex flex-col gap-0.5 border-l-2 pl-3"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-foreground font-mono text-xs font-medium">
                      {inv.invoiceNumber}
                      <span className="text-muted-foreground ml-2 font-sans">
                        {fmtIssueDate(inv.issuedAt)}
                      </span>
                    </span>
                    <span className="text-foreground tabular-nums">
                      {fmtDollars(inv.amount)}
                      <span className="text-muted-foreground ml-2 text-xs">
                        · {inv.agingDays}d
                      </span>
                    </span>
                  </div>
                  {inv.description ? (
                    <span className="text-muted-foreground text-xs">
                      {inv.description}
                    </span>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </Card>
      ))}
    </div>
  )
}
