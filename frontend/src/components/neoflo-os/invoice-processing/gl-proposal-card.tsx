// components/invoice-processing/gl-proposal-card.tsx
//
// Neo's GL coding proposal — used on Mode A (3-way/2-way) and Mode D (tax)
// match-detail surfaces. Card with header confidence pill, account / cost
// center / entity table, reasoning prose, and a sources line.
//
// Per docs/handoff/invoice-processing/03-screen-specs.md § "Surface 3:
// Match-detail" → Mode A diagram (GL proposal block).
"use client"

import * as React from "react"
import { Lightbulb } from "@phosphor-icons/react"

import { Card } from "@/components/neoflo-os/ui/card"
import type { GLProposal } from "@/lib/neoflo-os/invoice-processing/types"
import { cn } from "@/lib/neoflo-os/utils"

interface GLProposalCardProps {
  glProposal: GLProposal
  /** Override account/cost-center/entity from a user edit (shown if present). */
  editedGL?: { account: string; costCenter: string; entity: string }
  className?: string
}

export function GLProposalCard({
  glProposal,
  editedGL,
  className,
}: GLProposalCardProps) {
  const confidencePct = Math.round(glProposal.confidence * 100)
  const account = editedGL?.account ?? glProposal.account
  const costCenter = editedGL?.costCenter ?? glProposal.costCenter
  const entity = editedGL?.entity ?? glProposal.entity
  const sources = glProposal.sources.join(" · ")

  return (
    <Card
      className={cn(
        "border-primary/20 bg-primary/[0.03] flex flex-col gap-4 p-6",
        className
      )}
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Lightbulb
            size={16}
            weight="fill"
            className="text-primary"
          />
          <h2 className="text-foreground text-sm font-semibold">
            Neo&rsquo;s GL coding proposal
          </h2>
        </div>
        <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold">
          {confidencePct}% confident
        </span>
      </header>

      <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
        <dt className="text-muted-foreground">Account:</dt>
        <dd className="text-foreground font-medium">
          <span className="font-mono text-xs">{account}</span>
          <span className="text-muted-foreground"> — {glProposal.accountLabel}</span>
        </dd>

        <dt className="text-muted-foreground">Cost center:</dt>
        <dd className="text-foreground font-mono text-xs">{costCenter}</dd>

        <dt className="text-muted-foreground">Entity:</dt>
        <dd className="text-foreground">{entity}</dd>
      </dl>

      <blockquote className="text-foreground/85 border-primary/30 border-l-2 pl-4 text-sm italic leading-relaxed">
        {glProposal.reasoning}
      </blockquote>

      <div className="text-muted-foreground text-xs">
        Sources: {sources}
      </div>
    </Card>
  )
}
