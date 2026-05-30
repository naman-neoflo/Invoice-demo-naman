// app/neoflo-workspace/cognitive-ledger/page.tsx
//
// The Cognitive Ledger surface — Neoflo's operational reasoning layer.
// Two top-level sections:
//
//   1. Observations — chronological stream of things Neo captured, both
//      in-tool (classifier re-labels, override approvals) and via the
//      desktop agent (NetSuite vendor lookups, SAP FBL3N pulls, Slack
//      escalations, Excel exports). Each observation surfaces the
//      pattern hint that may eventually become a rule.
//
//   2. Rules — synthesised institutional knowledge. Active rules run
//      automatically; drafted rules await approval; refused rules are
//      kept for transparency.
//
// The framing references the GL/cognitive ledger duality from the
// Neoflo CFO-gathering thesis: GL records what happened financially,
// cognitive ledger records why decisions were made.
"use client"

import * as React from "react"
import {
  CalendarBlank,
  Eye,
  Funnel,
  Lightning,
} from "@phosphor-icons/react"

import { CaptureMonitor } from "@/components/neoflo-os/neoflo-workspace/capture-monitor"
import { ObservationClusterCard } from "@/components/neoflo-os/neoflo-workspace/observation-cluster-card"
import { ObservationCompactRow } from "@/components/neoflo-os/neoflo-workspace/observation-compact-row"
import { RuleCard } from "@/components/neoflo-os/neoflo-workspace/rule-card"
import { NeoChip } from "@/components/neoflo-os/workspace/neo-chip"
import { WorkspaceHeader } from "@/components/neoflo-os/workspace/workspace-header"
import { ChatThread } from "@/components/neoflo-os/workspace/chat-thread"
import { snapshotBriefing } from "@/lib/neoflo-os/workspace/briefing-snapshot"
import {
  SEED_OBSERVATIONS,
  SOURCE_META,
  clusterObservations,
  filterObservationsByPersona,
  filterRulesByPersona,
  type ObservationSource,
} from "@/lib/neoflo-os/neoflo-workspace/cognitive-ledger"
import { useHydratedLedgerRules } from "@/lib/neoflo-os/neoflo-workspace/cognitive-ledger-store"
import { getPersona } from "@/lib/neoflo-os/neoflo-workspace/personas"
import {
  useActivePersona,
  usePersonaStore,
} from "@/lib/neoflo-os/neoflo-workspace/persona-store"
import { useGuardedSurface } from "@/lib/neoflo-os/users/permissions"
import { cn } from "@/lib/neoflo-os/utils"

type SourceFilter = "all" | "in-tool" | "external"
type TimeWindow = "7d" | "1mo" | "3mo" | "1y" | "all"

// "Today" anchor for window-based filtering. Matches the demo date.
const TODAY_ISO = "2026-05-19"
const WINDOW_DAYS: Record<TimeWindow, number | "all"> = {
  "7d": 7,
  "1mo": 30,
  "3mo": 90,
  "1y": 365,
  all: "all",
}
const WINDOW_LABEL: Record<TimeWindow, string> = {
  "7d": "Last 7 days",
  "1mo": "Last month",
  "3mo": "Last 3 months",
  "1y": "Last year",
  all: "All time",
}

export default function CognitiveLedgerPage() {
  const [chatOpen, setChatOpen] = React.useState(false)
  const [sourceFilter, setSourceFilter] = React.useState<SourceFilter>("all")
  const [timeWindow, setTimeWindow] = React.useState<TimeWindow>("7d")

  const activePersonaId = useActivePersona()
  const setPersona = usePersonaStore((s) => s.setPersona)
  const persona = getPersona(activePersonaId)

  // Effective rules = seed merged with the user's approve/refuse actions
  // from the cognitive-ledger store. This is what drives the
  // re-partition into Drafted / Active / Refused sections.
  const effectiveRules = useHydratedLedgerRules()

  // Persona-narrow first
  const personaObservations = React.useMemo(
    () => filterObservationsByPersona(SEED_OBSERVATIONS, activePersonaId),
    [activePersonaId],
  )
  const personaRules = React.useMemo(
    () => filterRulesByPersona(effectiveRules, activePersonaId),
    [effectiveRules, activePersonaId],
  )

  // Apply time window first — the "default 7d" makes the feed scale.
  const timeWindowed = React.useMemo(() => {
    const days = WINDOW_DAYS[timeWindow]
    if (days === "all") return personaObservations
    const cutoffMs = new Date(TODAY_ISO).getTime() - days * 86_400_000
    return personaObservations.filter(
      (o) => new Date(o.occurredAt).getTime() >= cutoffMs,
    )
  }, [personaObservations, timeWindow])

  // Then source-narrow the observation feed
  const visibleObservations = React.useMemo(() => {
    if (sourceFilter === "all") return timeWindowed
    if (sourceFilter === "in-tool")
      return timeWindowed.filter((o) => o.source === "in-tool")
    return timeWindowed.filter((o) => o.source !== "in-tool")
  }, [timeWindowed, sourceFilter])

  // Count of observations beyond the current window (informational)
  const olderHidden = personaObservations.length - timeWindowed.length

  // Distinct external sources observed for this persona — for the chip strip
  const observedSources = React.useMemo(() => {
    const set = new Set<ObservationSource>()
    for (const o of personaObservations) set.add(o.source)
    return Array.from(set)
  }, [personaObservations])

  const allowed = useGuardedSurface("cognitive-ledger")
  if (!allowed) return null

  // Source counts — relative to the time-windowed slice so the chip
  // counts match what the user actually sees.
  const inToolCount = timeWindowed.filter((o) => o.source === "in-tool").length
  const externalCount = timeWindowed.length - inToolCount

  // Lifetime counts for the stat ribbon (independent of the window)
  const lifetimeInTool = personaObservations.filter(
    (o) => o.source === "in-tool",
  ).length
  const lifetimeExternal = personaObservations.length - lifetimeInTool

  // Split rules
  const draftedRules = personaRules.filter((r) => r.status === "drafted")
  const activeRules = personaRules.filter((r) => r.status === "active")
  const refusedRules = personaRules.filter((r) => r.status === "refused")

  return (
    <>
      <WorkspaceHeader onOpenChat={() => setChatOpen(true)} />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          {/* Page header */}
          <header className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <NeoChip />
              <span className="text-muted-foreground text-xs">
                operational reasoning — captured, structured, learned from
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-1">
                <h1 className="text-foreground text-2xl font-semibold tracking-tight">
                  Cognitive Ledger
                </h1>
              </div>
            </div>
            {activePersonaId !== "all" ? (
              <button
                type="button"
                onClick={() => setPersona("all")}
                className="text-primary self-start text-xs font-medium hover:underline"
              >
                Show all (currently filtered to {persona.title})
              </button>
            ) : null}
          </header>

          {/* Capture monitor — live ticker of active observation sources */}
          <CaptureMonitor />

          {/* Stat strip */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile
              label="Observations captured"
              value={`${personaObservations.length}`}
              hint={`${lifetimeInTool} in Neoflo · ${lifetimeExternal} external`}
            />
            <StatTile
              label="Active rules"
              value={`${activeRules.length}`}
              hint="auto-applied today"
            />
            <StatTile
              label="Drafted rules"
              value={`${draftedRules.length}`}
              hint="awaiting your review"
              accent
            />
            <StatTile
              label="Systems observed"
              value={`${observedSources.length}`}
              hint="incl. desktop agent"
            />
          </div>

          {/* Section A — Drafted rules first (needs your review) */}
          {draftedRules.length > 0 ? (
            <section className="flex flex-col gap-3">
              <SectionHeader
                title="Drafted rules · needs your review"
                count={draftedRules.length}
              />
              <div className="flex flex-col gap-3">
                {draftedRules.map((rule) => (
                  <RuleCard key={rule.id} rule={rule} />
                ))}
              </div>
            </section>
          ) : null}

          {/* Section B — Active rules */}
          {activeRules.length > 0 ? (
            <section className="flex flex-col gap-3">
              <SectionHeader
                title="Active rules"
                count={activeRules.length}
              />
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {activeRules.map((rule) => (
                  <RuleCard key={rule.id} rule={rule} />
                ))}
              </div>
            </section>
          ) : null}

          {/* Section C — Observation feed */}
          <section className="flex flex-col gap-3">
            <SectionHeader
              title="Observation feed"
              count={visibleObservations.length}
            />

            {/* Time-window chooser */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground inline-flex items-center gap-1 text-[11px]">
                <CalendarBlank size={12} weight="regular" /> Time window
              </span>
              {(Object.keys(WINDOW_DAYS) as TimeWindow[]).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setTimeWindow(w)}
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                    timeWindow === w
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  {WINDOW_LABEL[w]}
                </button>
              ))}
              {olderHidden > 0 ? (
                <span className="text-muted-foreground ml-1 text-[11px]">
                  · {olderHidden} older observation
                  {olderHidden === 1 ? "" : "s"} not shown — widen window
                  to surface
                </span>
              ) : null}
            </div>

            {/* Source filter */}
            <div className="flex flex-wrap items-center gap-2">
              <Funnel size={12} className="text-muted-foreground" />
              <SourcePill
                label="All sources"
                count={timeWindowed.length}
                active={sourceFilter === "all"}
                onClick={() => setSourceFilter("all")}
              />
              <SourcePill
                label="In Neoflo"
                count={inToolCount}
                active={sourceFilter === "in-tool"}
                onClick={() => setSourceFilter("in-tool")}
              />
              <SourcePill
                label="External (desktop agent)"
                count={externalCount}
                active={sourceFilter === "external"}
                onClick={() => setSourceFilter("external")}
              />
              <span className="text-muted-foreground ml-2 text-[11px]">
                ·{" "}
                {observedSources
                  .filter((s) => s !== "in-tool")
                  .slice(0, 6)
                  .map((s) => SOURCE_META[s].label)
                  .join(" · ")}
              </span>
            </div>

            <ObservationFeedClustered
              observations={visibleObservations}
              persona={persona.title}
              personaActive={activePersonaId !== "all"}
              onResetPersona={() => setPersona("all")}
            />
          </section>

          {/* Refused — small footer for transparency */}
          {refusedRules.length > 0 ? (
            <section className="flex flex-col gap-3">
              <SectionHeader
                title="Refused candidates"
                count={refusedRules.length}
              />
              <div className="flex flex-col gap-3">
                {refusedRules.map((rule) => (
                  <RuleCard key={rule.id} rule={rule} />
                ))}
              </div>
            </section>
          ) : null}

          {/* Footer note */}
          <div className="bg-primary/5 border-primary/20 mt-2 rounded-xl border border-dashed px-5 py-4 text-xs leading-relaxed text-muted-foreground">
            <div className="flex items-start gap-2">
              <Eye
                size={14}
                weight="regular"
                className="text-primary mt-0.5 shrink-0"
              />
              <div>
                <span className="text-foreground font-semibold">
                  How observations are captured
                </span>{" "}
                — In-tool actions come from every workflow event (classifier
                re-labels, override approvals, GL re-codes, dunning tone
                choices, etc.). External observations come from the Neoflo
                desktop agent — a small daemon that watches the systems you
                already use (NetSuite, SAP, Slack, Outlook, Excel, Coupa,
                Workday, Concur, Oracle) and structures what it sees. You
                control which apps it observes and which fields are captured.
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChatThread
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        context={snapshotBriefing()}
      />
    </>
  )
}

/**
 * Renders the observation feed with two-level disclosure:
 *   - Clusters (patterns with ≥2 events in the current slice) first
 *   - "Single events" section below for the rest
 *
 * Per design doc 2026-05-19-observation-clustering-design.md.
 */
function ObservationFeedClustered({
  observations,
  persona,
  personaActive,
  onResetPersona,
}: {
  observations: import("@/lib/neoflo-os/neoflo-workspace/cognitive-ledger").Observation[]
  persona: string
  personaActive: boolean
  onResetPersona: () => void
}) {
  const [expandedSingletonIds, setExpandedSingletonIds] = React.useState<
    Set<string>
  >(new Set())
  const { clusters, singletons } = React.useMemo(
    () => clusterObservations(observations),
    [observations],
  )

  function toggleSingleton(id: string) {
    setExpandedSingletonIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (observations.length === 0) {
    return (
      <EmptyState
        onReset={onResetPersona}
        personaActive={personaActive}
        persona={persona}
      />
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Pattern clusters */}
      {clusters.length > 0 ? (
        <div className="flex flex-col gap-3">
          <div className="text-muted-foreground flex items-baseline gap-2 text-[11px] font-medium uppercase tracking-wider">
            <span>Patterns</span>
            <span className="text-muted-foreground/70 normal-case tracking-normal">
              {clusters.length} cluster
              {clusters.length === 1 ? "" : "s"} · click to expand
            </span>
          </div>
          {clusters.map((cluster) => (
            <ObservationClusterCard
              key={cluster.patternHint}
              cluster={cluster}
            />
          ))}
        </div>
      ) : null}

      {/* Singletons */}
      {singletons.length > 0 ? (
        <div className="flex flex-col gap-2">
          <div className="text-muted-foreground flex items-baseline gap-2 text-[11px] font-medium uppercase tracking-wider">
            <span>Single events</span>
            <span className="text-muted-foreground/70 normal-case tracking-normal">
              {singletons.length} event{singletons.length === 1 ? "" : "s"}{" "}
              · click any row to expand
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {singletons.map((event) => (
              <ObservationCompactRow
                key={event.id}
                observation={event}
                expanded={expandedSingletonIds.has(event.id)}
                onToggle={() => toggleSingleton(event.id)}
                variant="singleton"
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function SectionHeader({
  title,
  count,
}: {
  title: string
  count: number
}) {
  return (
    <div className="flex items-baseline gap-2">
      <h2 className="text-foreground text-base font-semibold tracking-tight">
        {title}
      </h2>
      <span className="text-muted-foreground text-xs">{count}</span>
    </div>
  )
}

function StatTile({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: string
  hint?: string
  accent?: boolean
}) {
  return (
    <div
      className={cn(
        "bg-card border-border/60 flex flex-col gap-0.5 rounded-lg border p-4",
        accent && "border-primary/30 bg-primary/5",
      )}
    >
      <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
        {label}
      </span>
      <span className="text-foreground text-xl font-semibold tabular-nums">
        {value}
      </span>
      {hint ? (
        <span className="text-muted-foreground text-[11px]">{hint}</span>
      ) : null}
    </div>
  )
}

function SourcePill({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted",
      )}
    >
      {label}
      <span
        className={cn(
          "inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0 text-[10px] font-semibold",
          active
            ? "bg-primary/20 text-primary"
            : "bg-muted text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  )
}

function EmptyState({
  persona,
  personaActive,
  onReset,
}: {
  persona: string
  personaActive: boolean
  onReset: () => void
}) {
  return (
    <div className="text-muted-foreground bg-card flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center text-sm">
      <Lightning
        size={24}
        weight="regular"
        className="text-muted-foreground/50"
      />
      <div>
        No observations match this filter for{" "}
        <span className="text-foreground font-medium">{persona}</span>.
      </div>
      {personaActive ? (
        <button
          type="button"
          onClick={onReset}
          className="text-primary font-medium hover:underline"
        >
          Switch to Vibs (see all)
        </button>
      ) : null}
    </div>
  )
}
