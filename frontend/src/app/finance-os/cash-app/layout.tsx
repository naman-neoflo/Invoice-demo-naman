// app/neoflo-workspace/cash-app/layout.tsx
"use client"

import * as React from "react"

import { CashAppTabs } from "@/components/neoflo-os/cash-app/cash-app-tabs"
import { CashAppInvoicePreviewMount } from "@/components/neoflo-os/cash-app/invoice-preview-mount"
import { ChatThread } from "@/components/neoflo-os/workspace/chat-thread"
import { WorkspaceHeader } from "@/components/neoflo-os/workspace/workspace-header"
import { snapshotBriefing } from "@/lib/neoflo-os/workspace/briefing-snapshot"

export default function WorkspaceCashAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [chatOpen, setChatOpen] = React.useState(false)

  return (
    <>
      <WorkspaceHeader onOpenChat={() => setChatOpen(true)} />
      <CashAppTabs />
      {children}
      <ChatThread
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        // snapshotBriefing() now includes cash-app context, so Neo gets both
        // the briefing and the cash-app numbers from any cash-app route.
        context={snapshotBriefing()}
      />
      <CashAppInvoicePreviewMount />
    </>
  )
}
