// components/spend-analytics/quick-insights-panel.tsx
//
// Secondary insights strip on the spend-analytics dashboard. Renders 2-3
// "Neo noticed..." bullet rows from `getQuickInsights()` — informational,
// not actionable in Phase 1.
//
// Per docs/handoff/spend-analytics/03-screen-specs.md § "Surface 1: Dashboard".
import * as React from "react"
import { Lightbulb } from "@phosphor-icons/react/dist/ssr"

import { Card } from "@/components/neoflo-os/ui/card"

interface QuickInsightsPanelProps {
  insights: Array<{ text: string }>
}

export function QuickInsightsPanel({ insights }: QuickInsightsPanelProps) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <Lightbulb size={16} weight="regular" className="text-amber-600 dark:text-amber-400" />
        <span className="text-foreground text-sm font-medium">
          Quick insights
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {insights.map((insight, i) => (
          <li
            key={i}
            className="text-foreground/85 flex gap-2.5 text-sm leading-relaxed"
          >
            <span className="bg-muted-foreground/40 mt-2 size-1 shrink-0 rounded-full" />
            <span>{insight.text}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
