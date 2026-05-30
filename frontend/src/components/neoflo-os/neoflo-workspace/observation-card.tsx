// components/neoflo-workspace/observation-card.tsx
//
// One row in the Cognitive Ledger observation feed. Renders the source
// (Neoflo / NetSuite / SAP / etc.) + actor + a plain-English summary
// of what Neo observed + the pattern hint that may eventually become a
// rule.
"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { Eye, Lightning, Quotes, Repeat } from "@phosphor-icons/react"

import { Card } from "@/components/neoflo-os/ui/card"
import { StatusBadge } from "@/components/neoflo-os/status-badge"
import {
  KIND_LABEL,
  SOURCE_META,
  type Observation,
} from "@/lib/neoflo-os/neoflo-workspace/cognitive-ledger"
import { cn } from "@/lib/neoflo-os/utils"

const WORKFLOW_LABEL: Record<string, string> = {
  helpdesk: "Helpdesk",
  "cash-app": "Cash app",
  "invoice-processing": "Invoice processing",
  collections: "Collections",
  "spend-analytics": "Spend analytics",
  close: "Close",
  ar: "AR",
  ap: "AP",
}

function fmtTime(iso: string): string {
  try {
    return format(parseISO(iso), "MMM d · h:mma")
  } catch {
    return iso
  }
}

interface ObservationCardProps {
  observation: Observation
}

export function ObservationCard({ observation }: ObservationCardProps) {
  const source = SOURCE_META[observation.source]
  const isExternal = observation.source !== "in-tool"

  return (
    <Card className="bg-card border-border/60 p-5">
      <div className="flex items-start gap-4">
        {/* Source tile */}
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-md text-white text-[11px] font-semibold shadow-sm",
            source.logoBg,
          )}
          title={`Observed in ${source.label}`}
        >
          {source.initials}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
            <span className="text-foreground font-medium">
              {observation.actor}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">
              {fmtTime(observation.occurredAt)}
            </span>
            <span className="text-muted-foreground">·</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 font-medium",
                isExternal
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                  : "bg-primary/10 text-primary",
              )}
            >
              {isExternal ? `via ${source.label} (desktop agent)` : "in Neoflo"}
            </span>
            <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5">
              {KIND_LABEL[observation.kind]}
            </span>
            <span className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5">
              {WORKFLOW_LABEL[observation.workflow] ?? observation.workflow}
            </span>
            {observation.recurrenceCount && observation.recurrenceCount > 1 ? (
              <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-md px-1.5 py-0.5">
                <Repeat size={10} weight="bold" />
                {observation.recurrenceCount}× this period
              </span>
            ) : null}
          </div>

          {/* Headline */}
          <h3 className="text-foreground text-sm font-semibold leading-snug">
            {observation.headline}
          </h3>

          {/* Detail */}
          <p className="text-muted-foreground text-xs leading-relaxed">
            {observation.detail}
          </p>

          {/* Decision rationale — the human-supplied "why" that gets
              distilled into rule reasoning. Only present on decision-class
              observations. */}
          {observation.decisionRationale ? (
            <div className="border-l-2 border-l-amber-400/60 bg-amber-50/60 dark:bg-amber-500/10 mt-1 flex items-start gap-2 rounded-md px-3 py-2 text-xs">
              <Quotes
                size={12}
                weight="fill"
                className="text-amber-700 dark:text-amber-300 mt-0.5 shrink-0"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
                  {observation.actor}&apos;s rationale
                </span>
                <span className="text-foreground/85 leading-relaxed italic">
                  &ldquo;{observation.decisionRationale}&rdquo;
                </span>
              </div>
            </div>
          ) : null}

          {/* Pattern hint + status */}
          {observation.patternHint ? (
            <div className="border-border/60 bg-primary/5 mt-1 flex items-start gap-2 rounded-md border-l-2 border-l-primary/40 px-3 py-2 text-xs">
              <Lightning
                size={12}
                weight="fill"
                className="text-primary mt-0.5 shrink-0"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
                  Pattern Neo extracted
                </span>
                <span className="text-foreground/85 leading-relaxed">
                  {observation.patternHint}
                </span>
              </div>
              {observation.rulePromoted ? (
                <StatusBadge tone="success">
                  <Eye size={10} weight="fill" />
                  Rule active
                </StatusBadge>
              ) : observation.recurrenceCount &&
                observation.recurrenceCount >= 3 ? (
                <StatusBadge tone="info">Rule drafted</StatusBadge>
              ) : (
                <StatusBadge tone="neutral">Captured</StatusBadge>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
