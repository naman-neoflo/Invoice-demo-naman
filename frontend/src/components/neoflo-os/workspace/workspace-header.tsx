// components/workspace/workspace-header.tsx
"use client"

import * as React from "react"
import { CommandBar } from "@/components/neoflo-os/workspace/command-bar"
import { UserPickerChip } from "@/components/neoflo-os/workspace/user-picker-chip"
import { StatusBadge } from "@/components/neoflo-os/status-badge"
import {
  NEOFLO_WORKSPACE_BASE,
  useBasePath,
} from "@/lib/neoflo-os/workspace/use-base-path"

interface WorkspaceHeaderProps {
  onOpenChat: () => void
}

export function WorkspaceHeader({ onOpenChat }: WorkspaceHeaderProps) {
  const base = useBasePath()
  const isNeofloTree = base === NEOFLO_WORKSPACE_BASE

  // Global ⌘K (Mac) / Ctrl+K (Windows) opens chat from anywhere on the page.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        onOpenChat()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onOpenChat])

  return (
    <div className="bg-background/80 flex shrink-0 items-center gap-3 border-b px-6 py-4 backdrop-blur-sm">
      <div className="flex flex-1 items-center gap-3">
        <CommandBar onOpen={onOpenChat} />
      </div>
      {isNeofloTree ? <UserPickerChip /> : null}
      <div className="hidden lg:block">
        <StatusBadge tone="success">All systems healthy</StatusBadge>
      </div>
    </div>
  )
}
