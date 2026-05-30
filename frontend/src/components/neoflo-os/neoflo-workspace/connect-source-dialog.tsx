// components/neoflo-workspace/connect-source-dialog.tsx
//
// Connector picker behind the "Connect a source" CTA on the Knowledge
// page. Shows a grid of source types — file uploads (PDF, DOCX, XLSX,
// CSV) and cloud connectors (Google Drive, SharePoint, OneDrive, Notion,
// Slack, S3, Dropbox, Confluence).
//
// Demo-quality: every card mock-connects with a Sonner toast. The intent
// is to communicate "Neoflo ingests from anywhere you keep your docs."
"use client"

import * as React from "react"
import {
  CheckCircle,
  CloudArrowUp,
  FileDoc,
  FilePdf,
  FileXls,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/neoflo-os/ui/dialog"
import { Separator } from "@/components/neoflo-os/ui/separator"
import { cn } from "@/lib/neoflo-os/utils"

interface ConnectSourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ConnectorKind = "upload" | "cloud"

interface ConnectorEntry {
  id: string
  kind: ConnectorKind
  name: string
  description: string
  /** Logo tile colour */
  logoBg: string
  /** Phosphor icon for upload kinds */
  icon?: PhosphorIcon
  /** Two-letter initials for cloud connectors */
  initials?: string
}

const UPLOAD_CONNECTORS: ConnectorEntry[] = [
  {
    id: "pdf",
    kind: "upload",
    name: "PDF upload",
    description: "Drag in contracts, SOPs, audit reports. We OCR + index.",
    logoBg: "bg-rose-600",
    icon: FilePdf,
  },
  {
    id: "docx",
    kind: "upload",
    name: "Word (DOCX)",
    description: "Drop your AP / AR playbooks. Headings + tables preserved.",
    logoBg: "bg-blue-600",
    icon: FileDoc,
  },
  {
    id: "xlsx",
    kind: "upload",
    name: "Excel (XLSX / CSV)",
    description: "Approval matrices, GL chart, vendor master exports.",
    logoBg: "bg-emerald-600",
    icon: FileXls,
  },
]

const CLOUD_CONNECTORS: ConnectorEntry[] = [
  {
    id: "google-drive",
    kind: "cloud",
    name: "Google Drive",
    description: "Sync folders or specific docs. Permissions respected.",
    logoBg: "bg-amber-500",
    initials: "GD",
  },
  {
    id: "sharepoint",
    kind: "cloud",
    name: "SharePoint",
    description: "Connect a site collection or document library.",
    logoBg: "bg-indigo-600",
    initials: "SP",
  },
  {
    id: "onedrive",
    kind: "cloud",
    name: "OneDrive",
    description: "Personal + business OneDrive folders.",
    logoBg: "bg-sky-600",
    initials: "OD",
  },
  {
    id: "notion",
    kind: "cloud",
    name: "Notion",
    description: "Workspaces, pages, databases. Indexed nightly.",
    logoBg: "bg-stone-800",
    initials: "Nt",
  },
  {
    id: "confluence",
    kind: "cloud",
    name: "Confluence",
    description: "Spaces + pages. SOPs and runbooks stay in sync.",
    logoBg: "bg-blue-700",
    initials: "Cf",
  },
  {
    id: "dropbox",
    kind: "cloud",
    name: "Dropbox",
    description: "Team folders. File-version history preserved.",
    logoBg: "bg-blue-500",
    initials: "Db",
  },
  {
    id: "s3",
    kind: "cloud",
    name: "Amazon S3",
    description: "Point us at a bucket + prefix. Indexed on PUT.",
    logoBg: "bg-orange-600",
    initials: "S3",
  },
  {
    id: "slack",
    kind: "cloud",
    name: "Slack",
    description: "Index pinned messages + canvases from chosen channels.",
    logoBg: "bg-purple-600",
    initials: "Sl",
  },
]

export function ConnectSourceDialog({
  open,
  onOpenChange,
}: ConnectSourceDialogProps) {
  function handleConnect(entry: ConnectorEntry) {
    const verb = entry.kind === "upload" ? "Ready to upload" : "Authorize"
    const description =
      entry.kind === "upload"
        ? "Drop files into Neoflo and we'll OCR, index, and route to the right workflows within ~30 seconds per doc."
        : `OAuth flow opens to ${entry.name}. After authorization, Neoflo indexes the folders / sites you choose — your permissions are respected end-to-end.`
    toast.success(`${verb} · ${entry.name}`, {
      description,
      icon: <CheckCircle size={16} weight="fill" className="text-emerald-500" />,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CloudArrowUp size={18} weight="regular" className="text-primary" />
            Connect a knowledge source
          </DialogTitle>
          <DialogDescription>
            Point Neoflo at where your documents already live, or upload
            files directly. Anything you connect is parsed, OCR&apos;d, and
            indexed against your workflows in under a minute.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {/* Upload section */}
          <section className="flex flex-col gap-2.5">
            <div className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
              Upload files
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {UPLOAD_CONNECTORS.map((c) => (
                <ConnectorCard
                  key={c.id}
                  entry={c}
                  onClick={() => handleConnect(c)}
                />
              ))}
            </div>
          </section>

          <Separator />

          {/* Cloud connectors */}
          <section className="flex flex-col gap-2.5">
            <div className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
              Connect a system
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {CLOUD_CONNECTORS.map((c) => (
                <ConnectorCard
                  key={c.id}
                  entry={c}
                  onClick={() => handleConnect(c)}
                />
              ))}
            </div>
          </section>

          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Don&apos;t see your source? Tell your CSM — we add new connectors
            ~every other week.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ConnectorCard({
  entry,
  onClick,
}: {
  entry: ConnectorEntry
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "bg-card border-border/60 hover:border-primary/30 hover:shadow-sm group flex flex-col gap-2 rounded-lg border p-3 text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-md text-white shadow-sm",
            entry.logoBg,
          )}
        >
          {entry.icon ? (
            <entry.icon size={18} weight="regular" />
          ) : (
            <span className="text-[11px] font-semibold tracking-wide">
              {entry.initials}
            </span>
          )}
        </div>
        <span className="text-foreground text-sm font-medium leading-tight">
          {entry.name}
        </span>
      </div>
      <p className="text-muted-foreground text-[11px] leading-snug">
        {entry.description}
      </p>
    </button>
  )
}
