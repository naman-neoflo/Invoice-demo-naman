// components/workspace/page-tabs.tsx
"use client"

import * as React from "react"
import { Link } from "next-view-transitions"
import { Sparkle, CornersOut } from "@phosphor-icons/react"
import { cn } from "@/lib/neoflo-os/utils"
import { SEED_BRIEFING } from "@/lib/neoflo-os/workspace/seed-briefing"
import { SEED_FEED } from "@/lib/neoflo-os/workspace/seed-feed"
import { useBasePath } from "@/lib/neoflo-os/workspace/use-base-path"

interface PageTabsProps {
  active: "briefing" | "feed"
  /** Override the derived count (rare — both default to seed length so all callers stay in sync) */
  briefingCount?: number
  feedCount?: number
  className?: string
}

export function PageTabs({
  active,
  briefingCount = SEED_BRIEFING.actionItems.length,
  feedCount = SEED_FEED.length,
  className,
}: PageTabsProps) {
  const base = useBasePath()
  return (
    <div
      className={cn(
        "border-border -mb-px flex items-end gap-1 border-b",
        className
      )}
    >
      <Link
        href={base}
        aria-current={active === "briefing" ? "page" : undefined}
        className={cn(
          "inline-flex items-center gap-2 border-b-2 px-3 pb-3 pt-1 text-sm font-medium transition-colors",
          active === "briefing"
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <Sparkle
          size={14}
          weight="fill"
          className={
            active === "briefing" ? "text-primary" : "text-muted-foreground"
          }
        />
        Briefing
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
            active === "briefing"
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          {briefingCount}
        </span>
      </Link>
      <Link
        href={`${base}/all-work`}
        aria-current={active === "feed" ? "page" : undefined}
        className={cn(
          "inline-flex items-center gap-2 border-b-2 px-3 pb-3 pt-1 text-sm font-medium transition-colors",
          active === "feed"
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        <CornersOut
          size={14}
          className={
            active === "feed" ? "text-primary" : "text-muted-foreground"
          }
        />
        All work
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
            active === "feed"
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          {feedCount}
        </span>
      </Link>
    </div>
  )
}
