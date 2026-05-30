// components/workspace/feed-row.tsx
import * as React from "react"
import { Link } from "next-view-transitions"
import { ArrowRight } from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/neoflo-os/utils"

interface FeedRowProps {
  icon: PhosphorIcon
  iconBg: string
  iconText: string
  workflow: string
  title: string
  meta: string
  urgency: string
  urgencyTone: "rose" | "amber" | "emerald" | "primary"
  persona: string
  cta: string
  ctaTone?: "primary" | "neutral"
  href: string
  className?: string
}

export function FeedRow({
  icon: Icon,
  iconBg,
  iconText,
  workflow,
  title,
  meta,
  urgency,
  urgencyTone,
  persona,
  cta,
  ctaTone = "primary",
  href,
  className,
}: FeedRowProps) {
  const urgencyClasses = {
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    primary: "border-primary/20 bg-primary/10 text-primary",
  }[urgencyTone]
  return (
    <Link
      href={href}
      className={cn(
        "bg-card hover:border-primary/30 flex items-center gap-4 border-b border-l border-r px-5 py-3 transition-colors first:rounded-t-lg first:border-t last:rounded-b-lg",
        className
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md",
          iconBg,
          iconText
        )}
      >
        <Icon size={18} weight="regular" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
            {workflow}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold",
              urgencyClasses
            )}
          >
            {urgency}
          </span>
        </div>
        <div className="text-foreground text-sm font-semibold">{title}</div>
        <div className="text-muted-foreground text-xs">{meta}</div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-muted-foreground hidden text-xs lg:inline">
          {persona}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            ctaTone === "primary"
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-foreground hover:bg-muted/80"
          )}
        >
          {cta}
          <ArrowRight size={12} weight="bold" />
        </span>
      </div>
    </Link>
  )
}
