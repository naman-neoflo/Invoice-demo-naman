"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle, Clock } from "@phosphor-icons/react"

import { Button } from "@/components/neoflo-os/ui/button"
import { StatusBadge } from "@/components/neoflo-os/status-badge"
import { type Workflow, getWorkflowTransitionName } from "@/lib/neoflo-os/workflow-catalog"
import { getWorkflowIcon } from "@/lib/neoflo-os/workflow-icons"
import { cn } from "@/lib/neoflo-os/utils"

/**
 * Persistent header rendered at the top of every workflow page (helpdesk + every stub).
 * Shares its viewTransitionName with the dashboard tile so the browser morphs the
 * accent strip + chrome from tile to header on navigation.
 *
 * `extraNav` lets a sub-layout slot in workflow-specific navigation (e.g. helpdesk's
 * Inbox / Audit / Integrations row) underneath the header proper.
 */
export function WorkflowHeader({
  workflow,
  extraNav,
}: {
  workflow: Workflow
  extraNav?: React.ReactNode
}) {
  const Icon = getWorkflowIcon(workflow.iconKey)
  const isLive = workflow.status.kind === "live"
  const transitionName = getWorkflowTransitionName(workflow.slug)

  return (
    <div
      className={cn("border-b", workflow.accent.header)}
      style={{ viewTransitionName: transitionName }}
    >
      {/* Accent band — direct continuation of the tile's top strip */}
      <div className={cn("h-1.5 w-full", workflow.accent.band)} />

      <header className="bg-background/80 flex flex-col gap-3 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground -ml-2 h-7 gap-1.5 px-2"
          >
            <Link href="/demo">
              <ArrowLeft size={14} />
              Workspace
            </Link>
          </Button>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-muted-foreground">{workflow.domain}</span>
          <span className="text-muted-foreground/60">/</span>
          <span className="text-foreground font-medium">{workflow.name}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-md",
                workflow.accent.chipBg,
                workflow.accent.chipText
              )}
            >
              <Icon size={20} weight="regular" />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <h1 className="text-foreground text-xl font-semibold tracking-tight">
                {workflow.name}
              </h1>
              <p className="text-muted-foreground text-sm">
                {workflow.valueProp}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                workflow.accent.chipBg,
                workflow.accent.chipText
              )}
            >
              {workflow.persona}
            </span>
            {isLive ? (
              <StatusBadge tone="success">
                <CheckCircle size={12} weight="fill" />
                {workflow.status.label}
              </StatusBadge>
            ) : (
              <StatusBadge tone="neutral">
                <Clock size={12} weight="regular" />
                {workflow.status.label}
              </StatusBadge>
            )}
          </div>
        </div>

        {extraNav}
      </header>
    </div>
  )
}
