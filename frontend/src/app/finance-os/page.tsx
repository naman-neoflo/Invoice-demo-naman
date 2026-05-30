// app/neoflo-workspace/page.tsx
"use client"

import * as React from "react"
import { Link } from "next-view-transitions"
import {
  ArrowRight,
  CheckCircle,
  CornersOut,
  PaperPlaneTilt,
  Sparkle,
} from "@phosphor-icons/react"

import { BriefingActionCard } from "@/components/neoflo-os/workspace/briefing-action-card"
import { ChatThread } from "@/components/neoflo-os/workspace/chat-thread"
import { JumpChip } from "@/components/neoflo-os/workspace/jump-chip"
import { NeoChip } from "@/components/neoflo-os/workspace/neo-chip"
import { PageTabs } from "@/components/neoflo-os/workspace/page-tabs"
import { WorkspaceHeader } from "@/components/neoflo-os/workspace/workspace-header"
import { Button } from "@/components/neoflo-os/ui/button"
import { SEED_BRIEFING } from "@/lib/neoflo-os/workspace/seed-briefing"
import { SEED_FEED } from "@/lib/neoflo-os/workspace/seed-feed"
import {
  SEED_BRIEFING_PERSONA_AWARE,
  filterBriefingByPersona,
} from "@/lib/neoflo-os/neoflo-workspace/seed-briefing"
import { filterFeedByPersona, SEED_FEED_PERSONA_AWARE } from "@/lib/neoflo-os/neoflo-workspace/seed-feed"
import { getPersona } from "@/lib/neoflo-os/neoflo-workspace/personas"
import { useActivePersona } from "@/lib/neoflo-os/neoflo-workspace/persona-store"
import { snapshotBriefing } from "@/lib/neoflo-os/workspace/briefing-snapshot"
import { useRewriteHref } from "@/lib/neoflo-os/workspace/use-base-path"
import { getIcon } from "@/lib/neoflo-os/workspace/workflow-icons"

export default function BriefingPage() {
  const [chatOpen, setChatOpen] = React.useState(false)
  const [followUp, setFollowUp] = React.useState("")
  const rewriteHref = useRewriteHref()
  const activePersonaId = useActivePersona()
  const persona = getPersona(activePersonaId)
  const visibleActionItems = React.useMemo(
    () =>
      filterBriefingByPersona(
        SEED_BRIEFING_PERSONA_AWARE.actionItems,
        activePersonaId,
      ),
    [activePersonaId],
  )
  const visibleFeedCount = React.useMemo(
    () => filterFeedByPersona(SEED_FEED_PERSONA_AWARE, activePersonaId).length,
    [activePersonaId],
  )

  // "Ask Neo a follow-up" — opens the chat thread.
  // The chat thread has its own input/state; this inline input is a hint that
  // Neo is the "what's next" target. Submitting it just opens the chat.
  function handleFollowUpSubmit(e: React.FormEvent) {
    e.preventDefault()
    setChatOpen(true)
  }

  return (
    <>
      <WorkspaceHeader onOpenChat={() => setChatOpen(true)} />
      <div className="bg-background border-b px-10 pt-3">
        <PageTabs
          active="briefing"
          briefingCount={visibleActionItems.length}
          feedCount={visibleFeedCount}
        />
      </div>

      {/* Briefing body */}
      <div className="flex-1 overflow-auto px-10 py-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-7">
          {/* Greeting */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <NeoChip />
              <span className="text-muted-foreground text-xs">
                {SEED_BRIEFING.timeRange}
              </span>
            </div>
            <h1 className="text-foreground text-3xl font-semibold leading-tight tracking-tight">
              {persona.greeting}
            </h1>
          </div>

          {/* Prose paragraph — swapped per persona */}
          <p className="text-foreground/85 text-base leading-relaxed">
            {persona.proseLead}
          </p>

          {/* Inline actionable cards */}
          <div className="flex flex-col gap-3">
            <div className="text-muted-foreground flex items-center justify-between text-xs font-medium uppercase tracking-wider">
              <span>Needs you</span>
              {activePersonaId !== "all" ? (
                <span className="text-muted-foreground/70 text-[10px] normal-case tracking-normal">
                  {visibleActionItems.length} of{" "}
                  {SEED_BRIEFING_PERSONA_AWARE.actionItems.length} items shown
                  for {persona.title}
                </span>
              ) : null}
            </div>
            {visibleActionItems.length === 0 ? (
              <div className="text-muted-foreground bg-card rounded-lg border border-dashed px-6 py-10 text-center text-sm">
                Nothing in this queue right now for {persona.title}. The team
                across other personas still has work — switch the persona to see
                their queue.
              </div>
            ) : null}
            {visibleActionItems.map((item) => {
              const Icon = getIcon(item.icon)
              return (
                <BriefingActionCard
                  key={item.id}
                  icon={Icon}
                  iconBg={item.iconBg}
                  iconText={item.iconText}
                  title={item.title}
                  meta={item.meta}
                  cta={item.cta}
                  ctaTone={item.ctaTone}
                  href={rewriteHref(item.href)}
                />
              )
            })}
          </div>

          {/* What I handled */}
          <div className="bg-card border-border flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <CheckCircle
                size={14}
                weight="fill"
                className="text-emerald-600"
              />
              <span className="text-foreground text-sm font-medium">
                What I handled
              </span>
              <span className="text-muted-foreground text-xs">
                · 12 minutes saved you ~14 hours
              </span>
            </div>
            <ul className="text-foreground/80 flex flex-col gap-1.5 text-sm">
              {SEED_BRIEFING.handled.map((h, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-muted-foreground/40 mt-2 size-1 shrink-0 rounded-full bg-current" />
                  <span>
                    <BoldText text={h.text} />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* See all → All work CTA */}
          <Link
            href={rewriteHref(SEED_BRIEFING.moreHref)}
            className="bg-primary/5 border-primary/20 hover:bg-primary/10 group flex items-center justify-between gap-3 rounded-lg border border-dashed px-4 py-3 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-md">
                <CornersOut size={16} weight="regular" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-foreground text-sm font-semibold">
                  {visibleFeedCount} items also need attention
                </span>
                <span className="text-muted-foreground text-xs">
                  Switch to{" "}
                  <span className="text-primary font-medium">All work</span>{" "}
                  view to scan everything ranked by urgency
                </span>
              </div>
            </div>
            <ArrowRight
              size={16}
              weight="bold"
              className="text-primary shrink-0 transition-transform group-hover:translate-x-0.5"
            />
          </Link>

          {/* Jump-to chips */}
          <div className="flex flex-col gap-2">
            <div className="text-muted-foreground text-xs">
              Or jump to a specific workflow:
            </div>
            <div className="flex flex-wrap gap-2">
              {SEED_BRIEFING.jumps.map((j) => {
                const Icon = getIcon(j.icon)
                return (
                  <JumpChip
                    key={j.label}
                    icon={Icon}
                    label={j.label}
                    iconText={j.iconText}
                    href={rewriteHref(j.href)}
                  />
                )
              })}
            </div>
          </div>

          {/* Inline ask Neo input */}
          <form
            onSubmit={handleFollowUpSubmit}
            className="bg-card border-border focus-within:border-primary/40 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-sm"
          >
            <Sparkle size={16} weight="fill" className="text-primary" />
            <input
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              placeholder="Ask Neo a follow-up… e.g. 'why is bank rec stuck?'"
              aria-label="Ask Neo a follow-up"
              className="text-foreground placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
            />
            <Button
              type="submit"
              size="sm"
              className="h-8 px-3 text-xs"
              disabled={followUp.trim().length === 0}
            >
              <PaperPlaneTilt size={12} weight="bold" />
              Ask
            </Button>
          </form>
        </div>
      </div>

      <ChatThread
        open={chatOpen}
        onClose={() => {
          setChatOpen(false)
          setFollowUp("")
        }}
        context={snapshotBriefing()}
      />
    </>
  )
}

/**
 * Tiny `**bold**`-only markdown renderer for the "What I handled" bullets.
 * The seed data only uses `**bold**` tokens — anything more would warrant
 * lifting the full inline renderer out of chat-thread.tsx.
 */
function BoldText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <span key={i} className="text-foreground font-medium">
              {part.slice(2, -2)}
            </span>
          )
        }
        return <React.Fragment key={i}>{part}</React.Fragment>
      })}
    </>
  )
}

