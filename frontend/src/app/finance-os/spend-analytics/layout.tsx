// app/neoflo-workspace/spend-analytics/layout.tsx
//
// Layout shell for every spend-analytics route. Mirrors
// app/neoflo-workspace/collections/layout.tsx exactly — WorkspaceHeader,
// tab strip, page content, then the ChatThread overlay seeded
// with both the briefing snapshot AND the spend-analytics context
// so Neo answers questions like "what's our DPO?" without a
// per-page snapshot call.
"use client"

import * as React from "react"

import { SpendAnalyticsTabs } from "@/components/neoflo-os/spend-analytics/spend-analytics-tabs"
import { ChatThread } from "@/components/neoflo-os/workspace/chat-thread"
import { WorkspaceHeader } from "@/components/neoflo-os/workspace/workspace-header"
import { snapshotBriefing } from "@/lib/neoflo-os/workspace/briefing-snapshot"
import { snapshotSpendAnalytics } from "@/lib/neoflo-os/spend-analytics/spend-analytics-snapshot"

export default function WorkspaceSpendAnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [chatOpen, setChatOpen] = React.useState(false)

  // Compose the briefing snapshot with spend-analytics context so Neo
  // gets both the briefing AND the spend numbers from any spend-analytics
  // route — mirrors how cash-app + invoice-processing + collections are wired.
  const context = React.useMemo(() => {
    const briefing = snapshotBriefing()
    return { ...briefing, spendAnalytics: snapshotSpendAnalytics() }
  }, [])

  // Inline "Ask Neo a follow-up" inputs on dashboard surfaces fire this
  // window event to open the chat — keeps pages as static client components
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
      <SpendAnalyticsTabs />
      {children}
      <ChatThread
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        context={context}
      />
    </>
  )
}
