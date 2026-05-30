// app/neoflo-workspace/integrations/layout.tsx
"use client"

import * as React from "react"

import { ChatThread } from "@/components/neoflo-os/workspace/chat-thread"
import { WorkspaceHeader } from "@/components/neoflo-os/workspace/workspace-header"
import { snapshotBriefing } from "@/lib/neoflo-os/workspace/briefing-snapshot"

export default function IntegrationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [chatOpen, setChatOpen] = React.useState(false)

  return (
    <>
      <WorkspaceHeader onOpenChat={() => setChatOpen(true)} />
      <div className="flex-1 overflow-auto">{children}</div>
      <ChatThread
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        context={snapshotBriefing()}
      />
    </>
  )
}
