// components/workspace/briefing-action-card.tsx
import * as React from "react"
import { Link } from "next-view-transitions"
import { ArrowRight } from "@phosphor-icons/react"
import type { Icon as PhosphorIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/neoflo-os/utils"

interface BriefingActionCardProps {
  icon: PhosphorIcon
  iconBg: string
  iconText: string
  title: string
  meta: string
  cta: string
  ctaTone?: "primary" | "neutral"
  href: string
  className?: string
}

export function BriefingActionCard({
  icon: Icon,
  iconBg,
  iconText,
  title,
  meta,
  cta,
  ctaTone = "primary",
  href,
  className,
}: BriefingActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "bg-card hover:border-primary/30 hover:shadow-md flex items-center gap-4 rounded-lg border p-4 transition-all",
        className
      )}
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-md",
          iconBg,
          iconText
        )}
      >
        <Icon size={20} weight="regular" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="text-foreground text-sm font-semibold">{title}</div>
        <div className="text-muted-foreground text-xs">{meta}</div>
      </div>
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
    </Link>
  )
}
