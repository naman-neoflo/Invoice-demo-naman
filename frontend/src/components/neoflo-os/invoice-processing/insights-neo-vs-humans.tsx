// components/invoice-processing/insights-neo-vs-humans.tsx
//
// On-thesis hero card for the Insights page. The single number that
// proves the demo claim — "Neo handled 80%, humans intervened on the
// rest." Split horizontally with a vertical divider.

"use client"

import { Sparkle, User } from "@phosphor-icons/react"

import { Card } from "@/components/neoflo-os/ui/card"
import { NeoChip } from "@/components/neoflo-os/workspace/neo-chip"
import { getNeoVsHumansSplit } from "@/lib/neoflo-os/invoice-processing/derive"

export function InsightsNeoVsHumans({
  dateFrom,
  dateTo,
}: {
  dateFrom: string
  dateTo: string
}) {
  const split = getNeoVsHumansSplit({ dateFrom, dateTo })
  const total = split.neoCount + split.humansCount
  const stpPercent = total === 0 ? 0 : (split.neoCount / total) * 100

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:divide-x sm:divide-border">
        {/* Neo half */}
        <div className="flex flex-1 items-center gap-3 sm:pr-6">
          <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
            <Sparkle size={20} weight="fill" />
          </div>
          <div className="flex flex-col">
            <span className="text-foreground text-xl font-semibold">
              {split.neoCount} auto-posted
            </span>
            <span className="text-muted-foreground text-xs">
              by Neo · STP {stpPercent.toFixed(1)}% · avg cycle{" "}
              {split.neoAvgCycleSeconds}s
            </span>
          </div>
        </div>

        {/* Humans half */}
        <div className="flex flex-1 items-center gap-3 sm:pl-6">
          <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-full">
            <User size={20} weight="regular" />
          </div>
          <div className="flex flex-col">
            <span className="text-foreground text-xl font-semibold">
              {split.humansCount} touched
            </span>
            <span className="text-muted-foreground text-xs">
              by humans · {split.humansPercentOfVolume.toFixed(1)}% of volume ·
              avg cycle {split.humansAvgCycleMinutes.toFixed(1)} min
            </span>
          </div>
        </div>
      </div>

      <div className="border-border flex items-start gap-2 border-t pt-3">
        <NeoChip />
        <p className="text-foreground/85 text-sm leading-relaxed">
          {split.proseSummary}
        </p>
      </div>
    </Card>
  )
}
