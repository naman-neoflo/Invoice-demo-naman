// components/workspace/feed-filter-chip.tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/neoflo-os/utils"

interface FeedFilterChipProps {
  label: string
  count?: number
  active?: boolean
  onClick?: () => void
  className?: string
}

export function FeedFilterChip({
  label,
  count,
  active,
  onClick,
  className,
}: FeedFilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={!!active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary/20 bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <span>{label}</span>
      {typeof count === "number" && (
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
            active
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}
