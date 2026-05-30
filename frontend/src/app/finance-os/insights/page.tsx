// app/neoflo-workspace/insights/page.tsx
//
// "Insights" surface for the persona-aware workspace. A vertical feed of
// strategic insights Neo found by cross-referencing systems (NetSuite,
// bank feeds, contracts, vendor master, customer health, FX positions).
// Filtered by the active persona — the CFO sees board-room strategy,
// the AP Manager sees operational pattern catches, etc.
//
// Each card hands off into ChatThread with a pre-seeded prompt — the
// "Neo noticed this — what do you want to do about it?" moment.
"use client"

import * as React from "react"
import { Funnel, Sparkle } from "@phosphor-icons/react"

import { InsightCard } from "@/components/neoflo-os/neoflo-workspace/insight-card"
import { ChatThread } from "@/components/neoflo-os/workspace/chat-thread"
import { NeoChip } from "@/components/neoflo-os/workspace/neo-chip"
import { WorkspaceHeader } from "@/components/neoflo-os/workspace/workspace-header"
import {
  filterInsightsByPersona,
  INSIGHT_CATEGORY_LABEL,
  SEED_INSIGHTS,
  type Insight,
  type InsightCategory,
} from "@/lib/neoflo-os/neoflo-workspace/insights"
import { getPersona } from "@/lib/neoflo-os/neoflo-workspace/personas"
import {
  useActivePersona,
  usePersonaStore,
} from "@/lib/neoflo-os/neoflo-workspace/persona-store"
import { useGuardedSurface } from "@/lib/neoflo-os/users/permissions"
import { snapshotBriefing } from "@/lib/neoflo-os/workspace/briefing-snapshot"
import { cn } from "@/lib/neoflo-os/utils"

type CategoryFilter = "all" | InsightCategory

export default function InsightsPage() {
  const [chatOpen, setChatOpen] = React.useState(false)
  const [chatSeed, setChatSeed] = React.useState<string | undefined>(undefined)
  const [categoryFilter, setCategoryFilter] = React.useState<CategoryFilter>("all")

  const activePersonaId = useActivePersona()
  const setPersona = usePersonaStore((s) => s.setPersona)
  const persona = getPersona(activePersonaId)

  // Persona filter applies first; category chip narrows further.
  const personaScoped = React.useMemo(
    () => filterInsightsByPersona(SEED_INSIGHTS, activePersonaId),
    [activePersonaId],
  )
  const visible = React.useMemo(
    () =>
      categoryFilter === "all"
        ? personaScoped
        : personaScoped.filter((i) => i.category === categoryFilter),
    [personaScoped, categoryFilter],
  )

  // Build category chip list — only show categories that actually appear
  // for this persona so the filter row stays clean.
  const availableCategories = React.useMemo(() => {
    const set = new Set<InsightCategory>()
    for (const i of personaScoped) set.add(i.category)
    return Array.from(set)
  }, [personaScoped])

  function handleExplore(insight: Insight) {
    setChatSeed(insight.chatPrompt)
    setChatOpen(true)
  }

  // Distinct data-source count — proxy for "how many systems Neo is reading"
  const distinctSources = React.useMemo(() => {
    const set = new Set<string>()
    for (const i of personaScoped) for (const s of i.dataSources) set.add(s)
    return set.size
  }, [personaScoped])

  const allowed = useGuardedSurface("insights")
  if (!allowed) return null

  return (
    <>
      <WorkspaceHeader onOpenChat={() => setChatOpen(true)} />

      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-7">
          {/* Page header */}
          <header className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <NeoChip />
              <span className="text-muted-foreground text-xs">
                strategic patterns across {distinctSources} connected systems
              </span>
            </div>
            <h1 className="text-foreground text-2xl font-semibold tracking-tight">
              {activePersonaId === "all"
                ? "Insights across the operation"
                : `Insights for ${persona.title}`}
            </h1>
            {activePersonaId !== "all" ? (
              <button
                type="button"
                onClick={() => setPersona("all")}
                className="text-primary self-start text-xs font-medium hover:underline"
              >
                Show all {SEED_INSIGHTS.length} ({persona.title} view filters{" "}
                {SEED_INSIGHTS.length - personaScoped.length} out)
              </button>
            ) : null}
          </header>

          {/* Category filter chips */}
          {availableCategories.length > 1 ? (
            <div className="flex flex-wrap items-center gap-2">
              <Funnel size={12} className="text-muted-foreground" />
              <CategoryChip
                label="All categories"
                count={personaScoped.length}
                active={categoryFilter === "all"}
                onClick={() => setCategoryFilter("all")}
              />
              {availableCategories.map((cat) => {
                const count = personaScoped.filter((i) => i.category === cat).length
                return (
                  <CategoryChip
                    key={cat}
                    label={INSIGHT_CATEGORY_LABEL[cat]}
                    count={count}
                    active={categoryFilter === cat}
                    onClick={() => setCategoryFilter(cat)}
                  />
                )
              })}
            </div>
          ) : null}

          {/* Insight feed */}
          {visible.length === 0 ? (
            <div className="text-muted-foreground bg-card flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center text-sm">
              <Sparkle size={24} className="text-muted-foreground/50" weight="regular" />
              <div>
                No insights match this filter for{" "}
                <span className="text-foreground font-medium">{persona.title}</span>.
              </div>
              <div className="flex gap-3">
                {categoryFilter !== "all" ? (
                  <button
                    type="button"
                    onClick={() => setCategoryFilter("all")}
                    className="text-primary font-medium hover:underline"
                  >
                    Clear category filter
                  </button>
                ) : null}
                {activePersonaId !== "all" ? (
                  <button
                    type="button"
                    onClick={() => setPersona("all")}
                    className="text-primary font-medium hover:underline"
                  >
                    Switch to Vibs (see all)
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {visible.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onExplore={handleExplore}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ChatThread
        open={chatOpen}
        onClose={() => {
          setChatOpen(false)
          // Clear the seed so the next manual open doesn't re-fill the input.
          setChatSeed(undefined)
        }}
        context={snapshotBriefing()}
        initialDraft={chatSeed}
      />
    </>
  )
}

function CategoryChip({
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
