// app/neoflo-workspace/invoice-processing/layout.tsx
"use client"

import * as React from "react"

import { InvoicePreviewMount } from "@/components/neoflo-os/invoice-processing/invoice-preview-mount"
import { InvoiceProcessingTabs } from "@/components/neoflo-os/invoice-processing/invoice-processing-tabs"
import { POPreviewMount } from "@/components/neoflo-os/invoice-processing/po-preview-mount"
import { ChatThread } from "@/components/neoflo-os/workspace/chat-thread"
import { WorkspaceHeader } from "@/components/neoflo-os/workspace/workspace-header"
import { snapshotBriefing } from "@/lib/neoflo-os/workspace/briefing-snapshot"
import { snapshotInvoiceProcessing } from "@/lib/neoflo-os/invoice-processing/invoice-processing-snapshot"

export default function WorkspaceInvoiceProcessingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [chatOpen, setChatOpen] = React.useState(false)

  // Compose the briefing snapshot with invoice-processing context so Neo
  // gets both the briefing AND the invoice-processing numbers from any
  // invoice-processing route — mirrors how cash-app is wired.
  const context = React.useMemo(() => {
    const briefing = snapshotBriefing()
    return { ...briefing, invoiceProcessing: snapshotInvoiceProcessing() }
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
      <InvoiceProcessingTabs />
      {children}
      <ChatThread
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        context={context}
      />
      <InvoicePreviewMount />
      <POPreviewMount />
    </>
  )
}
