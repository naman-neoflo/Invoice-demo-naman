// components/neoflo-workspace/observation-cluster-card.tsx
//
// A cluster of observations sharing a patternHint. Default collapsed
// to a single card; click expands the list of compact event rows
// underneath. Each event row itself click-to-expands inline into the
// full ObservationCard.
//
// Per design doc 2026-05-19-observation-clustering-design.md.
"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import {
  CaretDown,
  CaretRight,
  CheckCircle,
  Lightning,
  Repeat,
  Sparkle,
} from "@phosphor-icons/react"

import { Card } from "@/components/neoflo-os/ui/card"
import { ObservationCompactRow } from "@/components/neoflo-os/neoflo-workspace/observation-compact-row"
import { StatusBadge } from "@/components/neoflo-os/status-badge"
import {
  SOURCE_META,
  type ObservationCluster,
} from "@/lib/neoflo-os/neoflo-workspace/cognitive-ledger"
import { useHydratedLedgerRules } from "@/lib/neoflo-os/neoflo-workspace/cognitive-ledger-store"
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

interface ObservationClusterCardProps {
  cluster: ObservationCluster
}

export function ObservationClusterCard({
  cluster,
}: ObservationClusterCardProps) {
  const [expanded, setExpanded] = React.useState(false)
  const [expandedEventIds, setExpandedEventIds] = React.useState<
    Set<string>
  >(new Set())

  function toggleEvent(id: string) {
    setExpandedEventIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Resolve the rule (if any) the pattern was promoted into, so we can
  // show its current status in the cluster header.
  const allRules = useHydratedLedgerRules()
  const promotedRule = cluster.rulePromoted
    ? allRules.find((r) => r.id === cluster.rulePromoted)
    : undefined

  const actorLabel = formatActors(cluster.actors)
  const dateRangeLabel = formatDateRange(cluster.earliestAt, cluster.latestAt)
  const isAllInTool = cluster.sources.every((s) => s === "in-tool")
  const hasExternal = cluster.sources.some((s) => s !== "in-tool")

  return (
    <Card className="bg-card border-primary/15 overflow-hidden border-l-4 p-0">
      {/* Cluster header — clickable */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="hover:bg-muted/30 flex w-full items-start gap-3 px-4 py-3 text-left transition-colors"
      >
        <div className="bg-primary/10 text-primary mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md">
          <Sparkle size={14} weight="fill" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {/* Headline row — count + pattern */}
          <div className="flex items-start gap-2">
            <h3 className="text-foreground min-w-0 flex-1 text-sm font-semibold leading-snug">
              <span className="text-primary mr-1.5 inline-flex items-center gap-0.5 tabular-nums">
                <Repeat size={11} weight="bold" />
                {cluster.events.length}×
              </span>
              {cluster.patternHint}
            </h3>
            {expanded ? (
              <CaretDown
                size={14}
                weight="bold"
                className="text-muted-foreground mt-0.5 shrink-0"
              />
            ) : (
              <CaretRight
                size={14}
                weight="bold"
                className="text-muted-foreground mt-0.5 shrink-0"
              />
            )}
          </div>

          {/* Meta row */}
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
            <span className="text-foreground/80 font-medium">{actorLabel}</span>
            <span>·</span>
            <span>{WORKFLOW_LABEL[cluster.workflow] ?? cluster.workflow}</span>
            <span>·</span>
            <span>{dateRangeLabel}</span>
            <span>·</span>
            {/* Source chips */}
            <span className="inline-flex flex-wrap items-center gap-1">
              {isAllInTool ? (
                <span className="bg-primary/10 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                  in Neoflo
                </span>
              ) : cluster.sources.length === 1 ? (
                <SourceChip source={cluster.sources[0]} />
              ) : (
                <>
                  {cluster.sources.slice(0, 2).map((s) => (
                    <SourceChip key={s} source={s} />
                  ))}
                  {cluster.sources.length > 2 ? (
                    <span className="text-muted-foreground text-[10px]">
                      +{cluster.sources.length - 2}
                    </span>
                  ) : null}
                </>
              )}
              {hasExternal && !isAllInTool ? (
                <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                  desktop agent
                </span>
              ) : null}
            </span>
          </div>

          {/* Promoted-rule status chip */}
          {promotedRule ? (
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
                Promoted to rule
              </span>
              {promotedRule.status === "active" ? (
                <StatusBadge tone="success">
                  <CheckCircle size={11} weight="fill" />
                  Rule active
                </StatusBadge>
              ) : promotedRule.status === "drafted" ? (
                <StatusBadge tone="warning">
                  <Lightning size={11} weight="fill" />
                  Rule drafted
                </StatusBadge>
              ) : (
                <StatusBadge tone="neutral">Rule refused</StatusBadge>
              )}
              <span className="text-muted-foreground italic">
                &ldquo;{promotedRule.statement}&rdquo;
              </span>
            </div>
          ) : null}
        </div>
      </button>

      {/* Expanded events — one-line rows that themselves expand */}
      {expanded ? (
        <div className="border-border/40 border-t">
          {cluster.events.map((event) => (
            <ObservationCompactRow
              key={event.id}
              observation={event}
              expanded={expandedEventIds.has(event.id)}
              onToggle={() => toggleEvent(event.id)}
              variant="cluster-event"
            />
          ))}
        </div>
      ) : null}
    </Card>
  )
}

function SourceChip({ source }: { source: ObservationCluster["sources"][number] }) {
  const meta = SOURCE_META[source]
  return (
    <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium">
      <span
        className={cn(
          "flex size-3 shrink-0 items-center justify-center rounded text-white text-[6px] font-semibold",
          meta.logoBg,
        )}
      >
        {meta.initials}
      </span>
      {meta.label}
    </span>
  )
}

function formatActors(actors: string[]): string {
  if (actors.length === 0) return ""
  if (actors.length === 1) return actors[0]
  if (actors.length === 2) return `${actors[0]} + ${actors[1].split(" ")[0]}`
  return `${actors[0]} + ${actors.length - 1} others`
}

function formatDateRange(earliest: string, latest: string): string {
  try {
    const e = parseISO(earliest)
    const l = parseISO(latest)
    const eFmt = format(e, "MMM d")
    const lFmt = format(l, "MMM d")
    if (eFmt === lFmt) return eFmt
    return `${eFmt} – ${lFmt}`
  } catch {
    return ""
  }
}
