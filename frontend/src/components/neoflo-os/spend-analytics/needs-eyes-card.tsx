// components/spend-analytics/needs-eyes-card.tsx
//
// Horizontal action card for the spend-analytics dashboard's "Needs your
// eyes" stack. One variant per dashboard insight type: working-capital,
// maverick, deferral, concentration. Working-capital + concentration open
// inline dialogs; maverick + deferral link to dedicated surfaces.
//
// Per docs/handoff/spend-analytics/03-screen-specs.md § "Surface 1: Dashboard".
"use client"

import * as React from "react"
import { Link } from "next-view-transitions"
import {
  ArrowRight,
  ChartLineUp,
  CurrencyDollar,
  ShieldWarning,
  Warning,
} from "@phosphor-icons/react"

import type { NeedsEyesType } from "@/lib/neoflo-os/spend-analytics/derive"
import { useRewriteHref } from "@/lib/neoflo-os/workspace/use-base-path"
import { cn } from "@/lib/neoflo-os/utils"

interface NeedsEyesCardProps {
  type: NeedsEyesType
  title: string
  meta: string
  routeHref: string
  cta: string
  /** If provided, the card behaves as a button and opens an inline dialog. */
  onClick?: () => void
  className?: string
}

const ICON_BY_TYPE: Record<NeedsEyesType, React.ElementType> = {
  "working-capital": ChartLineUp,
  maverick: Warning,
  deferral: CurrencyDollar,
  concentration: ShieldWarning,
}

// Status-tone allowances per CLAUDE.md: per-variant attention indicators
// behave like StatusBadge tones.
const ICON_BG_BY_TYPE: Record<NeedsEyesType, string> = {
  "working-capital":
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  maverick:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  deferral:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  concentration:
    "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
}

export function NeedsEyesCard({
  type,
  title,
  meta,
  routeHref,
  cta,
  onClick,
  className,
}: NeedsEyesCardProps) {
  const rewriteHref = useRewriteHref()
  const Icon = ICON_BY_TYPE[type]
  const iconBg = ICON_BG_BY_TYPE[type]

  const inner = (
    <>
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-md",
          iconBg,
        )}
      >
        <Icon size={20} weight="regular" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <div className="text-foreground text-sm font-semibold">{title}</div>
        <div className="text-muted-foreground text-xs">{meta}</div>
      </div>
      <span className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex shrink-0 items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors">
        {cta}
        <ArrowRight size={12} weight="bold" />
      </span>
    </>
  )

  const shellClass = cn(
    "bg-card hover:border-primary/30 hover:shadow-md flex w-full items-center gap-4 rounded-lg border p-4 transition-all",
    className,
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={shellClass}>
        {inner}
      </button>
    )
  }

  return (
    <Link href={rewriteHref(routeHref)} className={shellClass}>
      {inner}
    </Link>
  )
}
