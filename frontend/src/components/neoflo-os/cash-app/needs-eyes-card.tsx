// components/cash-app/needs-eyes-card.tsx
//
// Horizontal action card for the dashboard's "Needs your eyes" section. Same
// shape as <BriefingActionCard /> for visual continuity with the briefing —
// see docs/handoff/cash-app/03-screen-specs.md § "Surface 1: Dashboard".
import * as React from "react"
import { Link } from "next-view-transitions"
import { ArrowRight, MagnifyingGlass, Warning } from "@phosphor-icons/react"

import { getReasonCode } from "@/lib/neoflo-os/cash-app/reason-codes"
import type { ReasonCode } from "@/lib/neoflo-os/cash-app/types"
import { useRewriteHref } from "@/lib/neoflo-os/workspace/use-base-path"
import { cn } from "@/lib/neoflo-os/utils"

interface NeedsEyesCardProps {
  type: "short-pay" | "unapplied"
  customerName: string
  amount: number // dollars
  proposedReason?: string // for short-pays — the reason code (e.g. FREIGHT_DISCOUNT)
  diagnostic?: string // for unapplied — short dashboard-line text
  confidence?: number // 0-1
  cta: string // "Review" | "Investigate" | "Draft email"
  href: string
  className?: string
}

function fmtAmount(n: number): string {
  // Whole dollars with thousands separators — matches the dashboard mock
  // ("$700 short-pay", "$48,500", "$12,400").
  return `$${Math.round(n).toLocaleString()}`
}

function reasonLabel(code: string): string {
  const def = getReasonCode(code as ReasonCode)
  return def?.label ?? code
}

export function NeedsEyesCard({
  type,
  customerName,
  amount,
  proposedReason,
  diagnostic,
  confidence,
  cta,
  href,
  className,
}: NeedsEyesCardProps) {
  const rewriteHref = useRewriteHref()
  const Icon = type === "short-pay" ? Warning : MagnifyingGlass
  const iconBg =
    type === "short-pay"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
      : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"

  // Title format per spec § "Surface 1: Dashboard":
  //   short-pay: "{customer} · {classification} · ${amount} short-pay"
  //   unapplied: "{customer} · ${amount}"
  const title =
    type === "short-pay"
      ? `${customerName} · ${fmtAmount(amount)} short-pay`
      : `${customerName} · ${fmtAmount(amount)}`

  // Subtitle:
  //   short-pay: "Proposed: {reason} ({confidence}% confidence)"
  //   unapplied: diagnostic line
  const confidencePct =
    typeof confidence === "number" ? Math.round(confidence * 100) : undefined
  const subtitle =
    type === "short-pay"
      ? `Proposed: ${proposedReason ? reasonLabel(proposedReason) : "—"}${
          confidencePct !== undefined ? ` (${confidencePct}% confidence)` : ""
        }`
      : diagnostic ?? ""

  return (
    <Link
      href={rewriteHref(href)}
      className={cn(
        "bg-card hover:border-primary/30 hover:shadow-md flex items-center gap-4 rounded-lg border p-4 transition-all",
        className
      )}
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-md",
          iconBg
        )}
      >
        <Icon size={20} weight="regular" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="text-foreground text-sm font-semibold">{title}</div>
        <div className="text-muted-foreground text-xs">{subtitle}</div>
      </div>
      <span className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors">
        {cta}
        <ArrowRight size={12} weight="bold" />
      </span>
    </Link>
  )
}
