// components/cash-app/short-pay-reason-card.tsx
//
// Amber-toned analysis card for the match-detail hero. Shows the proposed
// reason code, confidence, accounting treatment, and Neo's prose reasoning.
//
// Per docs/handoff/cash-app/03-screen-specs.md § "Surface 3: Match-detail"
// → "Short-pay analysis" card.
"use client"

import * as React from "react"
import { CaretDown, CaretRight, Warning } from "@phosphor-icons/react"

import { getReasonCode } from "@/lib/neoflo-os/cash-app/reason-codes"
import type { Application, Customer, ReasonCode } from "@/lib/neoflo-os/cash-app/types"
import { cn } from "@/lib/neoflo-os/utils"

interface ShortPayReasonCardProps {
  shortPay: NonNullable<Application["shortPay"]>
  customer?: Customer
  effectiveReasonCode?: ReasonCode // overrides shortPay.reasonCode after user edits
  paymentConfidencePct: number
  className?: string
}

function fmtAmount(n: number): string {
  return `$${Math.round(n).toLocaleString()}`
}

export function ShortPayReasonCard({
  shortPay,
  effectiveReasonCode,
  paymentConfidencePct,
  className,
}: ShortPayReasonCardProps) {
  const [expanded, setExpanded] = React.useState(true)

  const code = effectiveReasonCode ?? shortPay.reasonCode
  const def = getReasonCode(code)
  const codeLabel = def?.label ?? code
  const accounting =
    code === shortPay.reasonCode
      ? shortPay.accountingTreatment
      : (def?.accountingTreatment ?? shortPay.accountingTreatment)

  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-amber-200 bg-amber-50/60 p-6 dark:border-amber-500/30 dark:bg-amber-500/5",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Warning size={16} weight="fill" className="text-amber-700 dark:text-amber-300" />
        <h2 className="text-foreground text-sm font-semibold">
          Short-pay analysis
        </h2>
      </div>

      <dl className="grid grid-cols-[10rem_1fr] gap-y-3 text-sm">
        <dt className="text-muted-foreground">Proposed code:</dt>
        <dd className="text-foreground font-medium">
          <span className="font-mono text-xs">{code}</span>
          <span className="text-muted-foreground"> · {codeLabel}</span>
        </dd>

        <dt className="text-muted-foreground">Short-pay amount:</dt>
        <dd className="text-foreground font-semibold tabular-nums">
          {fmtAmount(shortPay.amount)}
        </dd>

        <dt className="text-muted-foreground">Confidence:</dt>
        <dd className="text-foreground tabular-nums">{paymentConfidencePct}%</dd>

        <dt className="text-muted-foreground">Accounting:</dt>
        <dd className="text-foreground">{accounting}</dd>
      </dl>

      <div className="border-border/60 flex flex-col gap-2 border-t border-amber-200/60 pt-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-foreground hover:text-primary inline-flex items-center gap-1 text-sm font-semibold transition-colors"
        >
          {expanded ? (
            <CaretDown size={14} weight="bold" />
          ) : (
            <CaretRight size={14} weight="bold" />
          )}
          Why Neo proposes this
        </button>
        {expanded ? (
          <p className="text-foreground/85 text-sm leading-relaxed">
            {shortPay.reasoning}
          </p>
        ) : null}
      </div>
    </section>
  )
}
