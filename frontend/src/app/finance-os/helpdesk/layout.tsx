// app/neoflo-workspace/helpdesk/layout.tsx
"use client"

import * as React from "react"
import { Link } from "next-view-transitions"
import { usePathname } from "next/navigation"
import { Tray, ShieldCheck } from "@phosphor-icons/react"

import { ChatThread } from "@/components/neoflo-os/workspace/chat-thread"
import { WorkspaceHeader } from "@/components/neoflo-os/workspace/workspace-header"
import { snapshotBriefing } from "@/lib/neoflo-os/workspace/briefing-snapshot"
import { cn } from "@/lib/neoflo-os/utils"

const TABS = [
  {
    key: "inbox",
    icon: Tray,
    label: "Inbox",
    href: "/neoflo-workspace/helpdesk",
    matchPrefix: "/neoflo-workspace/helpdesk/inbox",
  },
  {
    key: "audit",
    icon: ShieldCheck,
    label: "Audit log",
    href: "/neoflo-workspace/helpdesk/audit/inv-4521",
    matchPrefix: "/neoflo-workspace/helpdesk/audit",
  },
] as const

function HelpdeskTabs() {
  const pathname = usePathname() ?? ""
  return (
    <div className="bg-background border-b px-6">
      <nav className="-mb-px flex items-center gap-1 pt-2">
        {TABS.map((tab) => {
          const Icon = tab.icon
          // The "Inbox" tab is active on the helpdesk root and any inbox subroute.
          const isInboxRoot =
            tab.key === "inbox" &&
            (pathname === "/neoflo-workspace/helpdesk" ||
              pathname.startsWith("/neoflo-workspace/helpdesk/inbox"))
          const active = isInboxRoot || pathname.startsWith(tab.matchPrefix)
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-t-md border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={14} weight="regular" />
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default function WorkspaceHelpdeskLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [chatOpen, setChatOpen] = React.useState(false)

  return (
    <>
      <WorkspaceHeader onOpenChat={() => setChatOpen(true)} />
      <HelpdeskTabs />
      {children}
      <ChatThread
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        context={snapshotBriefing()}
      />
    </>
  )
}
