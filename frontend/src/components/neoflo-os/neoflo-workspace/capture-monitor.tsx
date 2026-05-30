// components/neoflo-workspace/capture-monitor.tsx
//
// Live-ticker strip for the top of the Cognitive Ledger page. Shows
// what the Neoflo desktop agent is currently observing across the
// connected systems, with a soft pulse animation on the dot to signal
// active capture.
//
// The "Manage capture sources" button opens a dialog where the user can
// see exactly which apps are connected and toggle each on/off — meant
// to make the agent feel opt-in + transparent rather than surveillance.
"use client"

import * as React from "react"
import {
  CheckCircle,
  Eye,
  EyeSlash,
  Gear,
  type Icon as PhosphorIcon,
  Pulse,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/components/neoflo-os/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/neoflo-os/ui/dialog"
import { Separator } from "@/components/neoflo-os/ui/separator"
import { Switch } from "@/components/neoflo-os/ui/switch"
import { SOURCE_META } from "@/lib/neoflo-os/neoflo-workspace/cognitive-ledger"
import type { ObservationSource } from "@/lib/neoflo-os/neoflo-workspace/cognitive-ledger"
import { cn } from "@/lib/neoflo-os/utils"

// Order of sources in the ticker — Neoflo first, then external apps
// sorted by "how often they appear in the demo seed".
const ACTIVE_CAPTURE_SOURCES: Array<{
  source: ObservationSource
  status: "active" | "idle"
  detail: string
}> = [
  { source: "in-tool", status: "active", detail: "all sessions · 24 users" },
  { source: "netsuite", status: "active", detail: "Sarah, Lena · 3 hours ago" },
  { source: "sap", status: "active", detail: "Marcus, Daniel · 18 min ago" },
  { source: "slack", status: "active", detail: "#collections-daily · 2 min ago" },
  { source: "outlook", status: "active", detail: "AP team · 8 min ago" },
  { source: "excel", status: "active", detail: "4 active workbooks" },
  { source: "coupa", status: "idle", detail: "no activity in 2h" },
  { source: "workday", status: "idle", detail: "no activity today" },
  { source: "concur", status: "idle", detail: "no activity today" },
]

export function CaptureMonitor() {
  const [manageOpen, setManageOpen] = React.useState(false)
  const activeCount = ACTIVE_CAPTURE_SOURCES.filter(
    (s) => s.status === "active",
  ).length

  return (
    <div className="border-primary/20 bg-primary/5 flex flex-col gap-3 rounded-xl border px-4 py-3">
      {/* Strip header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="relative inline-flex size-2 items-center justify-center">
            <span className="bg-emerald-500 absolute inline-flex size-2 animate-ping rounded-full opacity-60" />
            <span className="bg-emerald-500 relative inline-flex size-1.5 rounded-full" />
          </span>
          <span className="text-foreground font-semibold">
            Capture monitor
          </span>
          <span className="text-muted-foreground">
            · {activeCount} active sources · desktop agent + in-tool events
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-[11px]"
          onClick={() => setManageOpen(true)}
        >
          <Gear size={12} weight="regular" />
          Manage capture sources
        </Button>
      </div>

      {/* Source pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {ACTIVE_CAPTURE_SOURCES.map(({ source, status, detail }) => {
          const meta = SOURCE_META[source]
          const isActive = status === "active"
          return (
            <span
              key={source}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px]",
                isActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-700/40 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "border-border bg-card text-muted-foreground",
              )}
              title={detail}
            >
              <span
                className={cn(
                  "flex size-3.5 shrink-0 items-center justify-center rounded text-white text-[7px] font-semibold",
                  meta.logoBg,
                )}
              >
                {meta.initials}
              </span>
              <span className="font-medium">{meta.label}</span>
              {isActive ? (
                <Pulse
                  size={10}
                  weight="bold"
                  className="text-emerald-600 dark:text-emerald-400"
                />
              ) : null}
              <span className="text-muted-foreground/80">· {detail}</span>
            </span>
          )
        })}
      </div>

      <ManageCaptureSourcesDialog
        open={manageOpen}
        onOpenChange={setManageOpen}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Manage capture sources dialog
// ─────────────────────────────────────────────────────────────────────────

interface ManageProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface CaptureToggleEntry {
  source: ObservationSource
  enabled: boolean
  fields: string
  audit: string
}

const INITIAL_TOGGLES: CaptureToggleEntry[] = [
  {
    source: "in-tool",
    enabled: true,
    fields:
      "Every workflow action (re-labels, overrides, GL re-codes, tone choices)",
    audit: "Required — disabling stops the cognitive-ledger entirely",
  },
  {
    source: "netsuite",
    enabled: true,
    fields:
      "Page navigation + form-field reads · no PII screenshots, no DOM pixels",
    audit: "OAuth via NetSuite SuiteCloud Platform",
  },
  {
    source: "sap",
    enabled: true,
    fields:
      "T-code launches (FBL3N, F-43, MIRO, etc.) + filter values · no row-level data",
    audit: "Read-only via SAP NetWeaver Gateway",
  },
  {
    source: "oracle",
    enabled: false,
    fields:
      "Oracle Cloud Financials — vendor + AP module navigation · no row data",
    audit: "Off until you connect the Oracle Cloud Identity application",
  },
  {
    source: "coupa",
    enabled: true,
    fields: "PO line edits + supplier portal logins",
    audit: "OAuth via Coupa Open API",
  },
  {
    source: "workday",
    enabled: true,
    fields: "Approval delegation + OOO calendar reads",
    audit: "Workday Studio integration",
  },
  {
    source: "concur",
    enabled: true,
    fields: "Expense re-categorisations + report submission events",
    audit: "SAP Concur API",
  },
  {
    source: "slack",
    enabled: true,
    fields:
      "Public channels + DMs only when actively tagged @neo · no passive DM reads",
    audit: "Slack app permissions — channel:history limited to opt-in channels",
  },
  {
    source: "outlook",
    enabled: true,
    fields:
      "Outbox + escalation forwards · explicitly excludes Inbox + private folders",
    audit: "Microsoft Graph API with restricted scope",
  },
  {
    source: "excel",
    enabled: true,
    fields:
      "Active workbook opens + export-from-Neoflo events · no cell-level reads",
    audit: "Office add-in (locally signed)",
  },
]

function ManageCaptureSourcesDialog({ open, onOpenChange }: ManageProps) {
  const [toggles, setToggles] = React.useState(INITIAL_TOGGLES)

  function handleToggle(source: ObservationSource, enabled: boolean) {
    setToggles((prev) =>
      prev.map((t) => (t.source === source ? { ...t, enabled } : t)),
    )
    toast.success(`${enabled ? "Enabled" : "Disabled"} capture · ${SOURCE_META[source].label}`, {
      description: enabled
        ? "Future events from this source will appear in the ledger."
        : "No new events will be captured until re-enabled. Existing observations are preserved.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gear size={18} weight="regular" className="text-primary" />
            Manage capture sources
          </DialogTitle>
          <DialogDescription>
            Neoflo captures both in-tool actions and (opt-in) external work
            via the desktop agent. Each source can be toggled
            independently. Captures are read-only metadata — never row-level
            data or PII screenshots — unless you explicitly opt in.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto flex flex-col gap-2 -mx-1 px-1">
          {toggles.map((t) => {
            const meta = SOURCE_META[t.source]
            const isInTool = t.source === "in-tool"
            return (
              <div
                key={t.source}
                className="border-border/60 bg-card flex items-start gap-3 rounded-lg border p-3"
              >
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-md text-white text-[11px] font-semibold shadow-sm",
                    meta.logoBg,
                  )}
                >
                  {meta.initials}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-sm font-medium">
                      {meta.label}
                    </span>
                    {isInTool ? (
                      <span className="text-muted-foreground text-[10px]">
                        — in-tool events
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[10px]">
                        — desktop agent
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs leading-snug">
                    <span className="text-foreground/70 font-medium">
                      Captured:
                    </span>{" "}
                    {t.fields}
                  </p>
                  <p className="text-muted-foreground text-[11px] leading-snug">
                    {t.audit}
                  </p>
                </div>
                <Switch
                  checked={t.enabled}
                  onCheckedChange={(checked) => handleToggle(t.source, checked)}
                  disabled={isInTool}
                  aria-label={`Toggle capture for ${meta.label}`}
                />
              </div>
            )
          })}
        </div>

        <Separator />

        <div className="text-muted-foreground flex items-start gap-2 text-[11px] leading-snug">
          <Eye size={12} weight="regular" className="mt-0.5 shrink-0" />
          <div>
            Every observation lists the source it came from, so you can
            always trace a learned pattern back to its origin. You can also
            export the full ledger to your audit team — see Settings →
            Compliance.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Convenience: a tiny inline indicator used elsewhere if needed. Kept for
 * future placements (e.g. inline in audit trail headers).
 */
export function CaptureActiveDot({
  active,
  className,
}: {
  active: boolean
  className?: string
}) {
  return active ? (
    <span className={cn("inline-flex size-2 items-center justify-center", className)}>
      <span className="bg-emerald-500 absolute inline-flex size-2 animate-ping rounded-full opacity-60" />
      <span className="bg-emerald-500 relative inline-flex size-1.5 rounded-full" />
    </span>
  ) : (
    <EyeSlash size={10} className="text-muted-foreground" />
  )
}
