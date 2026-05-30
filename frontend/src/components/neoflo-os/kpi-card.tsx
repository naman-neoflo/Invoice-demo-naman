"use client"

import * as React from "react"
import { TrendUp, TrendDown } from "@phosphor-icons/react"

import { Card, CardContent } from "@/components/neoflo-os/ui/card"
import { cn } from "@/lib/neoflo-os/utils"

export interface KpiCardProps {
  label: string
  value: string
  delta?: string
  direction?: "up" | "down"
  intent?: "good" | "bad"
  hint?: string
  className?: string
}

export function KpiCard({
  label,
  value,
  delta,
  direction,
  intent = "good",
  hint,
  className,
}: KpiCardProps) {
  const TrendIcon = direction === "down" ? TrendDown : TrendUp
  const intentClass =
    intent === "good"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400"

  return (
    <Card className={cn("p-5", className)}>
      <CardContent className="flex flex-col gap-1.5 p-0">
        <span className="text-muted-foreground text-xs font-medium">
          {label}
        </span>
        <span className="text-foreground text-2xl font-semibold tracking-tight">
          {value}
        </span>
        {(delta || hint) && (
          <div className="flex items-center gap-2 text-xs">
            {delta && (
              <span
                className={cn(
                  "flex items-center gap-1 font-medium",
                  intentClass
                )}
              >
                <TrendIcon size={12} weight="bold" />
                {delta}
              </span>
            )}
            {hint && (
              <span className="text-muted-foreground">{hint}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
