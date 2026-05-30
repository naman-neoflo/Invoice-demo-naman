import * as React from "react"
import { cn } from "@/lib/neoflo-os/utils"

export function PageHeader({
  title,
  subtitle,
  action,
  breadcrumb,
  className,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  action?: React.ReactNode
  breadcrumb?: React.ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        "bg-background flex shrink-0 flex-col gap-2 border-b px-8 py-6",
        className
      )}
    >
      {breadcrumb && (
        <div className="text-muted-foreground text-xs">{breadcrumb}</div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
          )}
        </div>
        {action && (
          <div className="flex shrink-0 items-center gap-2">{action}</div>
        )}
      </div>
    </header>
  )
}
