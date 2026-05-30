// components/neoflo-workspace/observation-compact-row.tsx
//
// One-line collapsed form of an observation. Renders inside a cluster
// (when expanded) and in the singletons section. Click → expand inline
// into the full ObservationCard for rationale + detail.
//
// Per design doc 2026-05-19-observation-clustering-design.md.
"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { CaretDown, CaretRight } from "@phosphor-icons/react"

import { ObservationCard } from "@/components/neoflo-os/neoflo-workspace/observation-card"
import {
  SOURCE_META,
  type Observation,
} from "@/lib/neoflo-os/neoflo-workspace/cognitive-ledger"
import { cn } from "@/lib/neoflo-os/utils"

interface ObservationCompactRowProps {
  observation: Observation
  /** When true, the row expands inline into the full card. */
  expanded: boolean
  onToggle: () => void
  /**
   * Visually denser variant for use inside a cluster (smaller padding,
   * no extra border). Default false renders the standalone singleton.
   */
  variant?: "singleton" | "cluster-event"
}

export function ObservationCompactRow({
  observation,
  expanded,
  onToggle,
  variant = "singleton",
}: ObservationCompactRowProps) {
  const sourceMeta = SOURCE_META[observation.source]
  const isExternal = observation.source !== "in-tool"

  return (
    <div
      className={cn(
        variant === "singleton" &&
          "bg-card border-border/60 rounded-lg border",
        variant === "cluster-event" &&
          "border-border/30 border-t first:border-t-0",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={cn(
          "hover:bg-muted/40 flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
          variant === "singleton" && "rounded-lg",
        )}
      >
        {expanded ? (
          <CaretDown
            size={11}
            weight="bold"
            className="text-muted-foreground shrink-0"
          />
        ) : (
          <CaretRight
            size={11}
            weight="bold"
            className="text-muted-foreground shrink-0"
          />
        )}
        <span className="text-muted-foreground w-20 shrink-0 text-[11px] tabular-nums">
          {fmtShort(observation.occurredAt)}
        </span>
        <span
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded text-white text-[7px] font-semibold",
            sourceMeta.logoBg,
          )}
          title={`Observed in ${sourceMeta.label}`}
        >
          {sourceMeta.initials}
        </span>
        <span className="text-foreground w-28 shrink-0 truncate text-xs font-medium">
          {observation.actor}
        </span>
        <span className="text-foreground/85 min-w-0 flex-1 truncate text-xs">
          {observation.headline}
        </span>
        {isExternal ? (
          <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium">
            external
          </span>
        ) : null}
        {observation.decisionRationale ? (
          <span
            className="text-amber-700 dark:text-amber-400 shrink-0 text-[10px] font-medium uppercase tracking-wider"
            title="Has decision rationale"
          >
            rationale
          </span>
        ) : null}
      </button>

      {expanded ? (
        <div
          className={cn(
            "px-2 pb-3",
            variant === "cluster-event" && "border-border/30 border-t",
            variant === "singleton" && "border-border/60 border-t",
          )}
        >
          <ObservationCard observation={observation} />
        </div>
      ) : null}
    </div>
  )
}

function fmtShort(iso: string): string {
  try {
    return format(parseISO(iso), "MMM d HH:mm")
  } catch {
    return iso
  }
}
