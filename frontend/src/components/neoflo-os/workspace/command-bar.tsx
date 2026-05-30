// components/workspace/command-bar.tsx
"use client"

import * as React from "react"
import { Sparkle, Command } from "@phosphor-icons/react"
import { SEED_COMMAND_BAR_EXAMPLES } from "@/lib/neoflo-os/workspace/seed-prompts"
import { cn } from "@/lib/neoflo-os/utils"

interface CommandBarProps {
  onOpen: () => void
  variant?: "default" | "highlighted"
  examples?: readonly string[]
  className?: string
}

export function CommandBar({
  onOpen,
  variant = "default",
  examples = SEED_COMMAND_BAR_EXAMPLES,
  className,
}: CommandBarProps) {
  const [exampleIdx, setExampleIdx] = React.useState(0)
  React.useEffect(() => {
    if (examples.length <= 1) return
    setExampleIdx(0)
    const t = setInterval(
      () => setExampleIdx((i) => (i + 1) % examples.length),
      2800
    )
    return () => clearInterval(t)
  }, [examples])
  const example = examples[exampleIdx]

  return (
    <button
      type="button"
      aria-label="Open Neo chat"
      onClick={onOpen}
      className={cn(
        "group bg-background hover:border-primary/40 flex h-14 w-full items-center justify-between gap-3 rounded-xl border px-5 text-left text-sm transition-all",
        variant === "highlighted"
          ? "border-primary/40 ring-primary/20 shadow-md ring-4"
          : "border-border shadow-sm hover:shadow-md",
        className
      )}
    >
      <div className="text-foreground/80 flex min-w-0 items-center gap-3">
        <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
          <Sparkle size={16} weight="fill" />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="text-foreground/90 text-[13px] font-medium leading-tight">
            Ask Neo
          </span>
          <span
            key={exampleIdx}
            className="text-muted-foreground motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-bottom-1 truncate text-xs italic leading-tight"
          >
            Try: &ldquo;{example}&rdquo;
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-muted-foreground hidden text-xs font-medium md:inline">
          Press
        </span>
        <kbd className="border-border bg-muted text-foreground/80 inline-flex items-center gap-0.5 rounded-md border px-2 py-1 font-sans text-[11px] font-semibold">
          <Command size={11} weight="bold" className="inline-block" />K
        </kbd>
        <span className="text-muted-foreground hidden text-xs md:inline">
          to ask anything
        </span>
      </div>
    </button>
  )
}
