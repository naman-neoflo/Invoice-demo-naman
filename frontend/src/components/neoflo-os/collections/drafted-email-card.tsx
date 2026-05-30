// components/collections/drafted-email-card.tsx
//
// Renders Neo's drafted dunning email with To/Cc/Subject metadata, the
// full body (whitespace-pre-wrap to preserve `\n` from bodyMarkdown), and
// a footer line describing the tone calibration.
//
// Spec: docs/handoff/collections/03-screen-specs.md § "Surface 3 Variant A".
import * as React from "react"
import { Envelope } from "@phosphor-icons/react"

import { StatusBadge } from "@/components/neoflo-os/status-badge"
import { Card } from "@/components/neoflo-os/ui/card"
import type { DunningEmail } from "@/lib/neoflo-os/collections/types"

interface DraftedEmailCardProps {
  email: DunningEmail
  /** If the user edited the body in-place, render the edited version. */
  editedBody?: string
}

export function DraftedEmailCard({
  email,
  editedBody,
}: DraftedEmailCardProps) {
  const body = editedBody ?? email.bodyMarkdown
  return (
    <Card className="bg-card flex flex-col gap-4 p-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Envelope size={16} weight="regular" className="text-primary" />
          <h2 className="text-foreground text-sm font-semibold">
            Drafted dunning email
          </h2>
        </div>
        <StatusBadge tone="info" showDot={false}>
          Tier {email.tier}
        </StatusBadge>
      </header>

      <dl className="text-muted-foreground grid grid-cols-[5rem_1fr] gap-y-1 text-sm">
        <dt>To:</dt>
        <dd className="text-foreground">{email.to}</dd>
        {email.cc ? (
          <>
            <dt>Cc:</dt>
            <dd className="text-foreground">{email.cc}</dd>
          </>
        ) : null}
        <dt>Subject:</dt>
        <dd className="text-foreground font-medium">{email.subject}</dd>
      </dl>

      <div className="bg-muted/40 text-foreground/90 whitespace-pre-wrap rounded-md border p-4 text-sm leading-relaxed">
        {body}
      </div>

      <div className="text-muted-foreground border-border/60 border-t pt-3 text-xs">
        Tone calibration: {email.toneLabel} · {email.toneCalibrationNotes}
      </div>
    </Card>
  )
}
