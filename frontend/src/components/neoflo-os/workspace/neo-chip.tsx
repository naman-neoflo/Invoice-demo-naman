// components/workspace/neo-chip.tsx
import * as React from "react"
import { Sparkle } from "@phosphor-icons/react"
import { cn } from "@/lib/neoflo-os/utils"

interface NeoChipProps {
  tone?: "primary" | "muted"
  className?: string
}

export function NeoChip({ tone = "primary", className }: NeoChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
        tone === "primary"
          ? "bg-primary/10 text-primary border-primary/20 border"
          : "bg-muted text-muted-foreground border-border border",
        className
      )}
    >
      <Sparkle size={10} weight="fill" />
      Neo
    </span>
  )
}
