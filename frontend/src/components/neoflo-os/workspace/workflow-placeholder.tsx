// components/workspace/workflow-placeholder.tsx
"use client"

import * as React from "react"
import { Link } from "next-view-transitions"
import { ArrowRight, Bell, Lightning } from "@phosphor-icons/react"

import { Button } from "@/components/neoflo-os/ui/button"
import { ChatThread } from "@/components/neoflo-os/workspace/chat-thread"
import { WorkspaceHeader } from "@/components/neoflo-os/workspace/workspace-header"
import { useBasePath } from "@/lib/neoflo-os/workspace/use-base-path"

interface WorkflowPlaceholderProps {
  workflowName: string
  description: string
}

/**
 * Generic stub for non-helpdesk workflows that won't ship in Phase 1.
 * Renders the same workspace shell (sidebar + chat header) so the user
 * never feels they've left the product, then explains what's coming and
 * offers a working CTA into the live helpdesk.
 */
export function WorkflowPlaceholder({
  workflowName,
  description,
}: WorkflowPlaceholderProps) {
  const [chatOpen, setChatOpen] = React.useState(false)
  const base = useBasePath()
  return (
    <>
      <WorkspaceHeader onOpenChat={() => setChatOpen(true)} />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 pt-12 text-center">
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            {workflowName} — coming Phase 2
          </h1>
          <p className="text-muted-foreground">{description}</p>
          <div className="flex justify-center gap-2">
            <Button>
              <Bell size={16} />
              Notify me when this is live
            </Button>
            <Button variant="outline" asChild>
              <Link href={`${base}/helpdesk`}>
                <Lightning size={16} />
                See Helpdesk live
                <ArrowRight size={14} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <ChatThread open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  )
}
