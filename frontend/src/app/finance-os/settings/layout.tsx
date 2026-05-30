// app/neoflo-workspace/settings/layout.tsx
//
// Settings section chrome. Lighter than the per-workflow layouts (no tab
// strip, no preview mounts) — just WorkspaceHeader + ChatThread so
// "Ask Neo" works from Settings the same as anywhere else.

"use client"

import * as React from "react"

import { ChatThread } from "@/components/neoflo-os/workspace/chat-thread"
import { WorkspaceHeader } from "@/components/neoflo-os/workspace/workspace-header"
import { snapshotBriefing } from "@/lib/neoflo-os/workspace/briefing-snapshot"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [chatOpen, setChatOpen] = React.useState(false)
  const context = React.useMemo(() => snapshotBriefing(), [])
  return (
    <>
      <WorkspaceHeader onOpenChat={() => setChatOpen(true)} />
      {children}
      <ChatThread
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        context={context}
      />
    </>
  )
}
