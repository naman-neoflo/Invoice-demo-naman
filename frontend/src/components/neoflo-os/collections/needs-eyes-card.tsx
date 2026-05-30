// components/collections/needs-eyes-card.tsx
//
// Horizontal action card for the collections dashboard's "Needs your eyes"
// stack. One variant per case type (quietly-overdue, broken-promise,
// active-dispute, account-hold-rec). Spec: docs/handoff/collections/03-screen-specs.md
// § "Surface 1: Dashboard".
import * as React from "react"
import { Link } from "next-view-transitions"
import {
  ArrowRight,
  Clock,
  HandWaving,
  Lightning,
  ShieldWarning,
} from "@phosphor-icons/react"

import type { NeedsEyesType } from "@/lib/neoflo-os/collections/derive"
import { useRewriteHref } from "@/lib/neoflo-os/workspace/use-base-path"
import { cn } from "@/lib/neoflo-os/utils"

interface NeedsEyesCardProps {
  type: NeedsEyesType
  customerName: string
  amount: number
  agingSummary: string
  summary: string
  routeHref: string
  className?: string
}

function fmtAmount(amount: number): string {
  return `$${Math.round(amount).toLocaleString("en-US")}`
}

const ICON_BY_TYPE: Record<NeedsEyesType, React.ElementType> = {
  "quietly-overdue": Lightning,
  "broken-promise": Clock,
  "active-dispute": ShieldWarning,
  "account-hold-rec": HandWaving,
}

// Status-tone allowances per CLAUDE.md: per-variant attention indicators
// behave like StatusBadge tones.
const ICON_BG_BY_TYPE: Record<NeedsEyesType, string> = {
  "quietly-overdue":
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  "broken-promise":
    "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "active-dispute":
    "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  "account-hold-rec":
    "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
}

const TITLE_SUFFIX_BY_TYPE: Record<NeedsEyesType, string> = {
  "quietly-overdue": "quietly overdue",
  "broken-promise": "promise broken",
  "active-dispute": "active dispute",
  "account-hold-rec": "account hold recommended",
}

export function NeedsEyesCard({
  type,
  customerName,
  amount,
  agingSummary,
  summary,
  routeHref,
  className,
}: NeedsEyesCardProps) {
  const rewriteHref = useRewriteHref()
  const Icon = ICON_BY_TYPE[type]
  const iconBg = ICON_BG_BY_TYPE[type]

  const title = `${customerName} · ${fmtAmount(amount)} · ${TITLE_SUFFIX_BY_TYPE[type]}`
  const subtitle = `${agingSummary} — ${summary}`

  return (
    <Link
      href={rewriteHref(routeHref)}
      className={cn(
        "bg-card hover:border-primary/30 hover:shadow-md flex items-center gap-4 rounded-lg border p-4 transition-all",
        className,
      )}
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-md",
          iconBg,
        )}
      >
        <Icon size={20} weight="regular" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="text-foreground text-sm font-semibold">{title}</div>
        <div className="text-muted-foreground text-xs">{subtitle}</div>
      </div>
      <span className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors">
        Review
        <ArrowRight size={12} weight="bold" />
      </span>
    </Link>
  )
}
