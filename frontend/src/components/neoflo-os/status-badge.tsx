import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Badge } from "@/components/neoflo-os/ui/badge"
import { cn } from "@/lib/neoflo-os/utils"

const statusBadgeVariants = cva("border font-medium gap-1.5", {
  variants: {
    tone: {
      success:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400",
      warning:
        "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400",
      danger:
        "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400",
      neutral: "border-border bg-muted text-muted-foreground",
      info: "border-primary/20 bg-primary/10 text-primary",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
})

const dotColors: Record<
  NonNullable<VariantProps<typeof statusBadgeVariants>["tone"]>,
  string
> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  neutral: "bg-muted-foreground/40",
  info: "bg-primary",
}

export interface StatusBadgeProps
  extends VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode
  showDot?: boolean
  className?: string
}

export function StatusBadge({
  tone,
  showDot = true,
  children,
  className,
}: StatusBadgeProps) {
  const resolvedTone = tone ?? "neutral"
  return (
    <Badge
      variant="outline"
      className={cn(statusBadgeVariants({ tone }), className)}
    >
      {showDot && (
        <span className={cn("size-1.5 rounded-full", dotColors[resolvedTone])} />
      )}
      {children}
    </Badge>
  )
}
