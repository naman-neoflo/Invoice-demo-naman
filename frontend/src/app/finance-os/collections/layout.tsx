// app/neoflo-workspace/collections/layout.tsx
"use client"

import * as React from "react"

import { CollectionsTabs } from "@/components/neoflo-os/collections/collections-tabs"
import { ChatThread } from "@/components/neoflo-os/workspace/chat-thread"
import { WorkspaceHeader } from "@/components/neoflo-os/workspace/workspace-header"
import { snapshotBriefing } from "@/lib/neoflo-os/workspace/briefing-snapshot"
import { snapshotCollections } from "@/lib/neoflo-os/collections/collections-snapshot"

export default function WorkspaceCollectionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [chatOpen, setChatOpen] = React.useState(false)

  // Compose the briefing snapshot with collections context so Neo gets both
  // the briefing AND the collections numbers from any collections route —
  // mirrors how cash-app + invoice-processing are wired.
  const context = React.useMemo(() => {
    const briefing = snapshotBriefing()
    return { ...briefing, collections: snapshotCollections() }
  }, [])

  // Inline "Ask Neo a follow-up" inputs on the dashboard surface fire this
  // window event to open the chat — keeps the page a static client component
  // without prop-drilling. ⌘K from the WorkspaceHeader still works the same.
  React.useEffect(() => {
    function onOpen() {
      setChatOpen(true)
    }
    window.addEventListener("neo:open-chat", onOpen)
    return () => window.removeEventListener("neo:open-chat", onOpen)
  }, [])

  return (
    <>
      <WorkspaceHeader onOpenChat={() => setChatOpen(true)} />
      <CollectionsTabs />
      {children}
      <ChatThread
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        context={context}
      />
    </>
  )
}
