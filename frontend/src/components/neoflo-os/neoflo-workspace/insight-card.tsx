// components/neoflo-workspace/insight-card.tsx
//
// One Neo-iconed strategic insight card. Renders headline + 2-3 line
// analysis + data-source chips + impact callout + "Explore with Neo →"
// button. Clicking the button calls onExplore so the page can open
// ChatThread pre-seeded with the insight's chatPrompt.
"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Sparkle } from "@phosphor-icons/react"

import {
  INSIGHT_CATEGORY_LABEL,
  type Insight,
} from "@/lib/neoflo-os/neoflo-workspace/insights"
import { resolveDataSourceToId } from "@/lib/neoflo-os/neoflo-workspace/knowledge"
import { cn } from "@/lib/neoflo-os/utils"

interface InsightCardProps {
  insight: Insight
  onExplore: (insight: Insight) => void
  className?: string
}

// Status-tone allowances per CLAUDE.md: per-variant attention indicators
// behave like StatusBadge tones.
const IMPACT_TONE_CLASS: Record<
  NonNullable<Insight["impact"]>["tone"],
  string
> = {
  positive:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  negative:
    "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  neutral:
    "bg-muted text-muted-foreground",
}

export function InsightCard({ insight, onExplore, className }: InsightCardProps) {
  return (
    <article
      className={cn(
        "bg-card hover:border-primary/30 group flex flex-col gap-4 rounded-xl border p-5 transition-all hover:shadow-md",
        className,
      )}
    >
      {/* Header row — Neo chip + category */}
      <header className="flex items-center justify-between gap-3">
        <div className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold">
          <Sparkle size={11} weight="fill" />
          <span>Neo noticed</span>
        </div>
        <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
          {INSIGHT_CATEGORY_LABEL[insight.category]}
        </span>
      </header>

      {/* Headline + body */}
      <div className="flex flex-col gap-2">
        <h3 className="text-foreground text-base font-semibold leading-snug">
          {insight.headline}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {insight.analysis}
        </p>
      </div>

      {/* Data sources — chips that resolve to a knowledge source link to
          /knowledge?source=<id> so the user can see what Neoflo read. */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
          Sourced from
        </span>
        {insight.dataSources.map((src) => {
          const id = resolveDataSourceToId(src)
          if (id) {
            return (
              <Link
                key={src}
                href={`/neoflo-workspace/knowledge?source=${id}`}
                onClick={(e) => e.stopPropagation()}
                className="bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-md px-1.5 py-0.5 text-[11px] transition-colors"
              >
                {src}
              </Link>
            )
          }
          return (
            <span
              key={src}
              className="bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-[11px]"
            >
              {src}
            </span>
          )
        })}
      </div>

      {/* Footer — impact + CTA */}
      <footer className="border-border/60 flex items-center justify-between gap-3 border-t pt-4">
        {insight.impact ? (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-baseline gap-1 rounded-md px-2 py-1 text-sm font-semibold",
                IMPACT_TONE_CLASS[insight.impact.tone],
              )}
            >
              {insight.impact.value}
            </span>
            <span className="text-muted-foreground text-xs">
              {insight.impact.label}
            </span>
          </div>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => onExplore(insight)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
        >
          Explore with Neo
          <ArrowRight size={12} weight="bold" />
        </button>
      </footer>
    </article>
  )
}
