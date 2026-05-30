// components/collections/account-hold-card.tsx
//
// Financial-impact summary for the account-hold variant on the
// collections customer-detail surface. Renders the recovery-probability
// math + the projected order-volume block-rate so the human can weigh
// hold vs no-hold before approving.
//
// Spec: docs/handoff/collections/03-screen-specs.md § "Surface 3 Variant C".
import * as React from "react"
import { HandWaving } from "@phosphor-icons/react"

import { Card } from "@/components/neoflo-os/ui/card"

interface AccountHoldCardProps {
  customerName: string
  overdueAmount: number
  last6MonthsOrderVolume: number
  estimatedHoldImpactPerMonth: number
  /** 0-1 probability the balance is recovered if no action is taken. */
  recoveryProbabilityWithoutAction: number
  /** 0-1 probability if the hold + Sales conversation lands. */
  recoveryProbabilityWithAction: number
}

function fmtDollars(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toLocaleString("en-US")}`
}

function fmtPct(p: number): string {
  return `${Math.round(p * 100)}%`
}

export function AccountHoldCard({
  customerName,
  overdueAmount,
  last6MonthsOrderVolume,
  estimatedHoldImpactPerMonth,
  recoveryProbabilityWithoutAction,
  recoveryProbabilityWithAction,
}: AccountHoldCardProps) {
  const uplift =
    recoveryProbabilityWithAction - recoveryProbabilityWithoutAction
  const expectedDollarUplift = Math.round(overdueAmount * uplift)

  return (
    <Card className="border-amber-200 bg-amber-50/60 flex flex-col gap-4 p-6 dark:border-amber-500/30 dark:bg-amber-500/10">
      <header className="flex items-center gap-2">
        <HandWaving
          size={16}
          weight="fill"
          className="text-amber-700 dark:text-amber-300"
        />
        <h2 className="text-foreground text-sm font-semibold">
          Account hold recommendation
        </h2>
      </header>

      <div className="text-foreground/85 text-sm leading-relaxed">
        {customerName} — {fmtDollars(overdueAmount)} overdue, last 6 months
        order volume {fmtDollars(last6MonthsOrderVolume)}.
      </div>

      <ul className="text-foreground/90 flex flex-col gap-1.5 text-sm">
        <li>
          • Holding will block ~
          <span className="font-semibold tabular-nums">
            {fmtDollars(estimatedHoldImpactPerMonth)}
          </span>
          /mo of new orders
        </li>
        <li>
          • Recovery probability without hold:{" "}
          <span className="font-semibold tabular-nums">
            {fmtPct(recoveryProbabilityWithoutAction)}
          </span>
        </li>
        <li>
          • Recovery probability with hold + Sales conversation:{" "}
          <span className="font-semibold tabular-nums">
            {fmtPct(recoveryProbabilityWithAction)}
          </span>
        </li>
      </ul>

      <div className="text-muted-foreground border-amber-200/60 border-t pt-3 text-xs dark:border-amber-500/30">
        Expected uplift if approved:{" "}
        <span className="text-foreground font-medium tabular-nums">
          ~{fmtDollars(expectedDollarUplift)}
        </span>{" "}
        ({fmtPct(uplift)} of {fmtDollars(overdueAmount)}).
      </div>
    </Card>
  )
}
