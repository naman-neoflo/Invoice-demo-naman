// components/invoice-processing/duplicate-spotlight.tsx
//
// The B hero — Phase-1's headline duplicate catch. Renders as a danger-toned
// banner above the "Neo today" prose on the invoice-processing dashboard.
// Spec: docs/handoff/invoice-processing/03-screen-specs.md § "Surface 1: Dashboard".
import * as React from "react"
import { Link } from "next-view-transitions"
import { ArrowRight, ShieldWarning } from "@phosphor-icons/react"

import { Card } from "@/components/neoflo-os/ui/card"
import { cn } from "@/lib/neoflo-os/utils"

interface DuplicateSpotlightProps {
  href: string
  heading: string
  body: string
  cta: string
  className?: string
}

export function DuplicateSpotlight({
  href,
  heading,
  body,
  cta,
  className,
}: DuplicateSpotlightProps) {
  return (
    <Link
      href={href}
      className={cn(
        "block transition-all hover:-translate-y-0.5",
        className
      )}
    >
      <Card className="border-rose-300 bg-rose-50/60 ring-rose-200 hover:ring-rose-300 dark:border-rose-500/40 dark:bg-rose-500/10 dark:ring-rose-500/30">
        <div className="flex items-start gap-4 px-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
            <ShieldWarning size={20} weight="fill" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="text-foreground text-sm font-semibold">
              {heading}
            </div>
            <p className="text-foreground/80 text-sm leading-relaxed">
              {body}
            </p>
            <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {cta}
              <ArrowRight size={12} weight="bold" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
