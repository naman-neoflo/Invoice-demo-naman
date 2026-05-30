"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle, Clock } from "@phosphor-icons/react"

import { Card, CardContent } from "@/components/neoflo-os/ui/card"
import { StatusBadge } from "@/components/neoflo-os/status-badge"
import {
  type Workflow,
  getWorkflowHomeRoute,
  getWorkflowTransitionName,
} from "@/lib/neoflo-os/workflow-catalog"
import { getWorkflowIcon } from "@/lib/neoflo-os/workflow-icons"
import { cn } from "@/lib/neoflo-os/utils"

export function WorkflowTile({ workflow }: { workflow: Workflow }) {
  const Icon = getWorkflowIcon(workflow.iconKey)
  const isLive = workflow.status.kind === "live"
  const transitionName = getWorkflowTransitionName(workflow.slug)

  return (
    <Link
      href={getWorkflowHomeRoute(workflow)}
      aria-label={`Open ${workflow.name}`}
      className="group block focus-visible:outline-none"
    >
      <Card
        className="hover:border-primary/30 hover:shadow-md group-focus-visible:ring-ring/50 relative h-full overflow-hidden p-0 transition-all duration-200 group-focus-visible:ring-2"
        style={{ viewTransitionName: transitionName }}
      >
        {/* Accent band — morphs into the workflow header strip */}
        <div
          className={cn(
            "h-1.5 w-full transition-opacity",
            workflow.accent.band,
            isLive ? "opacity-100" : "opacity-60 group-hover:opacity-90"
          )}
        />

        <CardContent className="flex flex-1 flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-md",
                workflow.accent.chipBg,
                workflow.accent.chipText
              )}
            >
              <Icon size={20} weight="regular" />
            </div>
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

          <div className="flex flex-col gap-1.5">
            <h3 className="text-foreground text-base font-semibold tracking-tight">
              {workflow.name}
            </h3>
            <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
              {workflow.valueProp}
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                workflow.accent.chipBg,
                workflow.accent.chipText
              )}
            >
              {workflow.persona}
            </span>
            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs font-medium opacity-60 transition-opacity group-hover:opacity-100">
              {isLive ? "Open demo" : "View scope"}
              <ArrowRight
                size={12}
                weight="bold"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
